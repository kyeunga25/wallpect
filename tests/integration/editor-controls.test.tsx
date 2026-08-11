import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../../src/app/App";
import { AdjustmentControls } from "../../src/components/editor-controls/AdjustmentControls";
import { DeviceSelector } from "../../src/components/device-selector/DeviceSelector";
import { ExportPanel } from "../../src/components/export/ExportPanel";
import { MobilePanel } from "../../src/components/mobile/MobilePanel";
import { MobileTabs } from "../../src/components/mobile/MobileTabs";
import { OverlayPanel } from "../../src/components/overlays/OverlayPanel";
import { DevicePreview } from "../../src/components/preview/DevicePreview";
import { I18nProvider } from "../../src/i18n/i18n";
import { EditorProvider, useEditor } from "../../src/state/editor-context";

const previewProps = {
  previewFocused: false,
  onPreviewFocusChange: () => undefined,
};

function renderWithEditor(node: React.ReactNode) {
  return render(
    <I18nProvider>
      <EditorProvider>{node}</EditorProvider>
    </I18nProvider>,
  );
}

async function revealPreciseControls(
  user: ReturnType<typeof userEvent.setup>,
  container: HTMLElement = document.body,
) {
  const details = container.querySelector<HTMLDetailsElement>(".precision-controls");
  expect(details).not.toBeNull();
  expect(details?.open).toBe(false);
  await user.click(within(details!).getByText("精確微調"));
  expect(details?.open).toBe(true);
  return details!;
}

function ReplaceImageHarness() {
  const { setImage } = useEditor();
  return (
    <button
      type="button"
      onClick={() =>
        setImage({
          source: document.createElement("canvas"),
          previewUrl: "data:image/png;base64,",
          width: 2400,
          height: 1600,
          name: "replacement.png",
          size: 1024,
        })
      }
    >
      Replace test image
    </button>
  );
}

function AnnouncementHarness() {
  const { announcement } = useEditor();
  return <output data-testid="announcement">{announcement}</output>;
}

describe("editor controls", () => {
  beforeEach(() => localStorage.clear());

  it("searches and selects a device profile", async () => {
    const user = userEvent.setup();
    renderWithEditor(<DeviceSelector />);
    await user.type(screen.getByPlaceholderText("搜尋所有 Apple 裝置…"), "14 Pro");
    const option = screen.getByRole("button", {
      name: /^iPhone 14 Pro \/ 15 \/ 15 Pro \/ 16，2022–2024/,
    });
    await user.click(option);
    expect(option).toHaveAttribute("aria-pressed", "true");
  });

  it("keeps the desktop device browser compact until it is needed", async () => {
    const user = userEvent.setup();
    renderWithEditor(<DeviceSelector collapsible />);
    const summary = screen.getByRole("button", {
      name: /目前裝置.*iPhone 14 Pro \/ 15 \/ 15 Pro \/ 16.*更換/,
    });

    expect(summary).toHaveAttribute("aria-expanded", "false");
    const search = screen.getByPlaceholderText("搜尋所有 Apple 裝置…");
    expect(search).not.toBeVisible();
    expect(screen.getByRole("button", { name: "橫向" })).toBeInTheDocument();

    await user.click(summary);
    expect(summary).toHaveAttribute("aria-expanded", "true");
    expect(search).toBeVisible();
    await user.type(search, "Studio Display");
    await user.click(screen.getByRole("button", { name: /iMac 27-inch 5K.*2014–2026/ }));

    expect(search).not.toBeVisible();
    expect(screen.getByRole("button", { name: /目前裝置.*iMac 27-inch 5K.*更換/ })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("exposes an accessible mobile panel size control", async () => {
    const user = userEvent.setup();
    const onExpandedChange = vi.fn();
    renderWithEditor(<MobilePanel expanded={false} onExpandedChange={onExpandedChange} />);

    const panel = screen.getByRole("region", { name: "調整" });
    const sizeControl = screen.getByRole("button", { name: "更多控制" });
    expect(panel).toHaveAttribute("data-panel-size", "balanced");
    expect(sizeControl).toHaveAttribute("aria-expanded", "false");
    expect(sizeControl).toHaveAttribute("aria-controls");

    await user.click(sizeControl);
    expect(onExpandedChange).toHaveBeenCalledWith(true);
  });

  it("returns the mobile workflow to adjustment after choosing a device", async () => {
    const user = userEvent.setup();
    renderWithEditor(
      <>
        <MobileTabs />
        <DeviceSelector />
      </>,
    );

    const adjustTab = screen.getByRole("button", { name: "調整" });
    const deviceTab = screen.getByRole("button", { name: "裝置" });
    expect(adjustTab).toHaveAttribute("aria-current", "page");

    await user.click(deviceTab);
    expect(deviceTab).toHaveAttribute("aria-current", "page");
    await user.type(screen.getByPlaceholderText("搜尋所有 Apple 裝置…"), "MacBook Neo");
    await user.click(screen.getByRole("button", { name: /MacBook Neo，2026/ }));

    expect(adjustTab).toHaveAttribute("aria-current", "page");
  });

  it("keeps common export output and download ahead of optional settings", async () => {
    const user = userEvent.setup();
    const naturalWidth = vi
      .spyOn(globalThis.HTMLImageElement.prototype, "naturalWidth", "get")
      .mockReturnValue(852);
    const naturalHeight = vi
      .spyOn(globalThis.HTMLImageElement.prototype, "naturalHeight", "get")
      .mockReturnValue(1846);
    try {
      const { container } = renderWithEditor(<ExportPanel />);
      const options = container.querySelector<HTMLDetailsElement>(".export-options");

      expect(options).not.toBeNull();
      expect(options?.open).toBe(false);
      expect(screen.getByText("精確輸出")).toBeInTheDocument();
      const download = screen.getByRole("button", { name: "下載桌布" });
      expect(download).toBeInTheDocument();
      expect(screen.queryByRole("group", { name: "匯出格式" })).not.toBeVisible();

      await user.click(screen.getByText("匯出設定"));
      expect(options?.open).toBe(true);
      expect(screen.getByRole("group", { name: "匯出格式" })).toBeVisible();
      await user.click(screen.getByRole("button", { name: "JPEG" }));
      const quality = screen.getByRole("slider", { name: "品質" });
      expect(quality).toHaveAttribute("aria-valuetext", "92%");
      expect(quality.getAttribute("style")).toContain("86.67%");
      await waitFor(() => expect(download).toBeEnabled());
    } finally {
      naturalWidth.mockRestore();
      naturalHeight.mockRestore();
    }
  });

  it("filters devices by resolution and clears the search with Escape", async () => {
    const user = userEvent.setup();
    renderWithEditor(<DeviceSelector />);
    const search = screen.getByPlaceholderText("搜尋所有 Apple 裝置…");

    await user.type(search, "1290");
    expect(screen.getByText("1 個跨分類結果")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /iPhone 14 Pro Max.*2022–2024/ }),
    ).toBeInTheDocument();

    await user.type(search, "{Escape}");
    expect(search).toHaveValue("");
    expect(screen.getByText("19 個結果")).toBeInTheDocument();
  });

  it("searches every device category and aligns browsing to the selected result", async () => {
    const user = userEvent.setup();
    renderWithEditor(<DeviceSelector />);
    const search = screen.getByPlaceholderText("搜尋所有 Apple 裝置…");

    expect(screen.getByRole("button", { name: "iPhone · 19" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await user.type(search, "Studio Display");
    const display = screen.getByRole("button", {
      name: /iMac 27-inch 5K.*2014–2026.*5120.*2880/,
    });
    expect(display).toBeInTheDocument();
    expect(screen.getByText("1 個跨分類結果")).toBeInTheDocument();

    await user.click(display);
    expect(screen.getByRole("button", { name: "Mac · 17" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(display).toHaveAttribute("aria-pressed", "true");
  });

  it("matches pasted resolutions and unordered search terms", async () => {
    const user = userEvent.setup();
    renderWithEditor(<DeviceSelector />);
    const search = screen.getByPlaceholderText("搜尋所有 Apple 裝置…");

    await user.type(search, "5120×2880");
    expect(screen.getByRole("button", { name: /iMac 27-inch 5K.*5120.*2880/ })).toBeInTheDocument();

    await user.clear(search);
    await user.type(search, "2026 neo mac");
    expect(screen.getByRole("button", { name: /MacBook Neo，2026/ })).toBeInTheDocument();
  });

  it("keeps parallel desktop and mobile selectors on the selected device family", async () => {
    const user = userEvent.setup();
    renderWithEditor(
      <>
        <DeviceSelector />
        <DeviceSelector />
      </>,
    );

    await user.type(screen.getAllByPlaceholderText("搜尋所有 Apple 裝置…")[0], "MacBook Neo");
    await user.click(screen.getAllByRole("button", { name: /MacBook Neo，2026/ })[0]);

    expect(screen.getAllByRole("button", { name: "Mac · 17" })).toHaveLength(2);
    for (const macGroup of screen.getAllByRole("button", { name: "Mac · 17" })) {
      expect(macGroup).toHaveAttribute("aria-pressed", "true");
    }
  });

  it("shows the selected device again after browsing another category", async () => {
    const user = userEvent.setup();
    renderWithEditor(<DeviceSelector />);

    await user.click(screen.getByRole("button", { name: "iPad · 11" }));
    expect(screen.getByText("11 個結果")).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: /目前裝置.*iPhone 14 Pro \/ 15 \/ 15 Pro \/ 16/ }),
    );

    expect(screen.getByRole("button", { name: "iPhone · 19" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("migrates recent-device aliases to one consolidated profile ID", () => {
    localStorage.setItem(
      "wallpect:recent-devices:v1",
      JSON.stringify(["apple-iphone-14-pro", "apple-iphone-15-pro"]),
    );

    renderWithEditor(<DeviceSelector />);

    expect(JSON.parse(localStorage.getItem("wallpect:recent-devices:v1") ?? "null")).toEqual([
      "apple-iphone-15-pro",
    ]);
  });

  it("renders MacBooks as laptops instead of desktop displays", async () => {
    const user = userEvent.setup();
    const { container } = renderWithEditor(
      <>
        <DeviceSelector />
        <DevicePreview {...previewProps} />
      </>,
    );

    await user.click(screen.getByRole("button", { name: "Mac · 17" }));
    await user.click(screen.getByRole("button", { name: /MacBook Neo，2026/ }));

    expect(container.querySelector(".laptop-base")).toBeInTheDocument();
    expect(container.querySelector(".computer-stand")).not.toBeInTheDocument();
  });

  it("switches orientation directly from the preview without leaving the current workflow", async () => {
    const user = userEvent.setup();
    const { container } = renderWithEditor(
      <>
        <MobileTabs />
        <DevicePreview {...previewProps} />
      </>,
    );

    const adjustTab = screen.getByRole("button", { name: "調整" });
    expect(adjustTab).toHaveAttribute("aria-current", "page");
    expect(container.querySelector(".device-scaler")).toHaveClass("is-portrait");

    await user.click(screen.getByRole("button", { name: "將預覽切換至橫向" }));

    expect(adjustTab).toHaveAttribute("aria-current", "page");
    expect(container.querySelector(".device-scaler")).toHaveClass("is-landscape");
    expect(screen.getByRole("button", { name: "將預覽切換至直向" })).toBeInTheDocument();
  });

  it("updates fit, zoom, and background controls", async () => {
    const user = userEvent.setup();
    const { container } = renderWithEditor(<AdjustmentControls />);
    const fitControls = screen.getByRole("group", { name: "桌布填合模式" });
    const backgroundControls = screen.getByRole("group", { name: "背景" });
    const quickControls = screen.getByRole("group", { name: "快速定位" });
    const historyControls = screen.getByRole("group", { name: "構圖歷史" });
    const zoom = screen.getByRole("slider", { name: /縮放/ });
    const reset = screen.getByRole("button", { name: "重設" });
    const preciseControls = container.querySelector<HTMLDetailsElement>(".precision-controls");
    expect(
      fitControls.compareDocumentPosition(backgroundControls) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(
      backgroundControls.compareDocumentPosition(quickControls) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(quickControls.compareDocumentPosition(zoom) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(zoom.compareDocumentPosition(reset) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(reset.compareDocumentPosition(historyControls) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(
      historyControls.compareDocumentPosition(preciseControls!) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    await user.click(screen.getByRole("button", { name: "完整顯示" }));
    expect(screen.getByRole("button", { name: "完整顯示" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await revealPreciseControls(user, container);
    const rotation = screen.getByRole("slider", { name: /旋轉/ });
    expect(zoom).toHaveAttribute("aria-valuetext", "100%");
    expect(zoom.getAttribute("style")).toContain("20%");
    expect(rotation).toHaveAttribute("aria-valuetext", "0°");
    expect(rotation.getAttribute("style")).toContain("50%");
    fireEvent.change(zoom, { target: { value: "140" } });
    expect(zoom).toHaveValue("140");
    expect(zoom).toHaveAttribute("aria-valuetext", "140%");
    expect(zoom.getAttribute("style")).toContain("30.67%");
    await user.click(screen.getByRole("button", { name: "模糊延伸" }));
    expect(screen.getByText(/柔化的滿版副本/)).toBeInTheDocument();
  });

  it("keeps precise values visible while advanced controls stay folded until requested", async () => {
    const user = userEvent.setup();
    const { container } = renderWithEditor(<AdjustmentControls />);
    const details = container.querySelector<HTMLDetailsElement>(".precision-controls");
    const values = screen.getByLabelText("目前精確數值");

    expect(details?.open).toBe(false);
    expect(values).toHaveTextContent("X 0 · Y 0 · 0°");
    expect(screen.getByRole("spinbutton", { name: "X px" })).not.toBeVisible();
    expect(screen.getByRole("slider", { name: /旋轉/ })).not.toBeVisible();

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "將圖片向右移動 10%" })).toBeEnabled(),
    );
    await user.click(screen.getByRole("button", { name: "將圖片向右移動 10%" }));
    expect(values).toHaveTextContent("X 118 · Y 0 · 0°");

    await revealPreciseControls(user, container);
    expect(screen.getByRole("spinbutton", { name: "X px" })).toBeVisible();
    expect(screen.getByRole("slider", { name: /旋轉/ })).toBeVisible();

    await user.click(screen.getByText("精確微調"));
    expect(details?.open).toBe(false);
    expect(values).toBeVisible();
    expect(values).toHaveTextContent("X 118 · Y 0 · 0°");
  });

  it("explains the active composition beside the fit controls", async () => {
    const user = userEvent.setup();
    const naturalWidth = vi
      .spyOn(globalThis.HTMLImageElement.prototype, "naturalWidth", "get")
      .mockReturnValue(852);
    const naturalHeight = vi
      .spyOn(globalThis.HTMLImageElement.prototype, "naturalHeight", "get")
      .mockReturnValue(1846);
    try {
      renderWithEditor(
        <>
          <DeviceSelector />
          <AdjustmentControls />
        </>,
      );
      const feedback = await screen.findByRole("region", { name: "構圖概況" });

      await waitFor(() => expect(feedback).toHaveTextContent("完整保留"));
      expect(feedback).toHaveTextContent("已放大");
      expect(screen.getByLabelText("預估放大")).toHaveTextContent("1.4×");
      await user.click(screen.getByRole("button", { name: "橫向" }));
      await waitFor(() => expect(feedback).toHaveTextContent("大量裁切"));
      expect(screen.getByLabelText("預估裁切")).toHaveTextContent("78.7%");
      expect(feedback).toHaveTextContent("大幅放大");
      expect(screen.getByLabelText("預估放大")).toHaveTextContent("3.0×");
      expect(feedback).toHaveTextContent("會重設縮放、位置及旋轉；你仍可復原");

      const verticalPosition = screen.getByRole("group", { name: "垂直內容位置" });
      const preciseValues = screen.getByLabelText("目前精確數值");
      expect(screen.queryByRole("group", { name: "水平內容位置" })).not.toBeInTheDocument();
      expect(within(verticalPosition).getByRole("button", { name: "中央" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      await user.click(within(verticalPosition).getByRole("button", { name: "上方" }));
      expect(preciseValues).toHaveTextContent("X 0 · Y 2180 · 0°");
      await user.click(screen.getByRole("button", { name: "將圖片向上移動 10%" }));
      expect(preciseValues).toHaveTextContent("X 0 · Y 2062 · 0°");
      await user.click(screen.getByRole("button", { name: "復原上一次構圖變更" }));
      expect(preciseValues).toHaveTextContent("X 0 · Y 2180 · 0°");
      await user.click(within(verticalPosition).getByRole("button", { name: "下方" }));
      expect(preciseValues).toHaveTextContent("X 0 · Y -2179 · 0°");
      await user.click(within(verticalPosition).getByRole("button", { name: "中央" }));
      expect(preciseValues).toHaveTextContent("X 0 · Y 0 · 0°");

      const showWholeImage = screen.getByRole("button", { name: "顯示整張圖片" });
      await user.click(showWholeImage);
      expect(screen.getByRole("button", { name: "完整顯示" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      expect(feedback).toHaveTextContent("完整保留");
      expect(feedback).toHaveTextContent("0.0%");
      expect(feedback).toHaveTextContent("請在下方選擇純色、透明或模糊延伸來處理未覆蓋區域");
      expect(feedback).toHaveTextContent("原圖像素足夠");
      expect(screen.getByLabelText("預估放大")).toHaveTextContent("無需放大");
      expect(showWholeImage).not.toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "復原上一次構圖變更" }));
      expect(feedback).toHaveTextContent("大量裁切");
      expect(screen.getByRole("button", { name: "顯示整張圖片" })).toBeInTheDocument();
    } finally {
      naturalWidth.mockRestore();
      naturalHeight.mockRestore();
    }
  });

  it("groups continuous edits, supports history, and offers one-pixel nudging", async () => {
    const user = userEvent.setup();
    const { container } = renderWithEditor(<AdjustmentControls />);
    await revealPreciseControls(user, container);
    const undo = screen.getByRole("button", { name: "復原上一次構圖變更" });
    const redo = screen.getByRole("button", { name: "重做上一次構圖變更" });
    const zoom = screen.getByRole("slider", { name: /縮放/ });
    const xPosition = screen.getByRole("spinbutton", { name: "X px" });

    expect(undo).toBeDisabled();
    expect(redo).toBeDisabled();
    fireEvent.pointerDown(zoom);
    fireEvent.change(zoom, { target: { value: "120" } });
    fireEvent.change(zoom, { target: { value: "140" } });
    fireEvent.pointerUp(zoom);
    expect(zoom).toHaveValue("140");

    await user.click(undo);
    expect(zoom).toHaveValue("100");
    expect(redo).toBeEnabled();
    await user.click(redo);
    expect(zoom).toHaveValue("140");

    await user.click(screen.getByRole("button", { name: "向右移動 1 px" }));
    expect(xPosition).toHaveValue(1);
    await user.click(undo);
    expect(xPosition).toHaveValue(0);
  });

  it("offers coarse positioning without requiring numeric fields", async () => {
    const user = userEvent.setup();
    renderWithEditor(<AdjustmentControls />);
    const preciseValues = screen.getByLabelText("目前精確數值");

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "將圖片向右移動 10%" })).toBeEnabled(),
    );
    await user.click(screen.getByRole("button", { name: "將圖片向右移動 10%" }));
    await user.click(screen.getByRole("button", { name: "將圖片向上移動 10%" }));
    expect(preciseValues).toHaveTextContent("X 118 · Y -256 · 0°");

    await user.click(screen.getByRole("button", { name: "置中圖片" }));
    expect(preciseValues).toHaveTextContent("X 0 · Y 0 · 0°");
    expect(screen.getByRole("button", { name: "復原上一次構圖變更" })).toBeEnabled();
  });

  it("starts every device and orientation from a fresh composition after replacement", async () => {
    const user = userEvent.setup();
    const { container } = renderWithEditor(
      <>
        <DeviceSelector />
        <AdjustmentControls />
        <ReplaceImageHarness />
      </>,
    );
    await revealPreciseControls(user, container);
    const xPosition = screen.getByRole("spinbutton", { name: "X px" });
    const yPosition = screen.getByRole("spinbutton", { name: "Y px" });
    const undo = screen.getByRole("button", { name: "復原上一次構圖變更" });

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "將圖片向右移動 10%" })).toBeEnabled(),
    );
    await user.click(screen.getByRole("button", { name: "將圖片向右移動 10%" }));
    expect(xPosition).toHaveValue(118);
    await user.click(screen.getByRole("button", { name: "橫向" }));
    await user.click(screen.getByRole("button", { name: "將圖片向下移動 10%" }));
    expect(yPosition).toHaveValue(118);

    await user.click(screen.getByRole("button", { name: "Replace test image" }));
    expect(xPosition).toHaveValue(0);
    expect(yPosition).toHaveValue(0);
    expect(undo).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "直向" }));
    expect(xPosition).toHaveValue(0);
    expect(undo).toBeDisabled();
  });

  it("compares the original composition without replacing edited values", async () => {
    const user = userEvent.setup();
    const { container } = renderWithEditor(
      <>
        <DevicePreview {...previewProps} />
        <AdjustmentControls />
      </>,
    );
    await revealPreciseControls(user, container);
    const compare = screen.getByRole("button", { name: "比較原始構圖" });
    const moveRight = screen.getByRole("button", { name: "向右移動 1 px" });
    const xPosition = screen.getByRole("spinbutton", { name: "X px" });

    await waitFor(() => expect(compare).toBeEnabled());
    await user.click(moveRight);
    expect(xPosition).toHaveValue(1);

    await user.click(compare);
    expect(compare).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelector(".wallpaper-canvas-wrap")).toHaveAttribute(
      "data-composition-view",
      "original",
    );
    expect(screen.getByText("原始構圖")).toBeInTheDocument();
    expect(xPosition).toHaveValue(1);

    await user.click(moveRight);
    expect(compare).toHaveAttribute("aria-pressed", "false");
    expect(container.querySelector(".wallpaper-canvas-wrap")).toHaveAttribute(
      "data-composition-view",
      "edited",
    );
    expect(xPosition).toHaveValue(2);
  });

  it("focuses the preview without changing composition and restores the editor with Escape", async () => {
    const user = userEvent.setup();
    const naturalWidth = vi
      .spyOn(globalThis.HTMLImageElement.prototype, "naturalWidth", "get")
      .mockReturnValue(852);
    const naturalHeight = vi
      .spyOn(globalThis.HTMLImageElement.prototype, "naturalHeight", "get")
      .mockReturnValue(1846);
    try {
      const { container } = render(
        <I18nProvider>
          <App />
        </I18nProvider>,
      );
      const leftRail = container.querySelector<HTMLElement>(".left-rail");
      expect(leftRail).not.toBeNull();
      await revealPreciseControls(user, leftRail!);
      const desktopControls = within(leftRail!);
      const moveRight = desktopControls.getByRole("button", { name: "向右移動 1 px" });
      const xPosition = desktopControls.getByRole("spinbutton", { name: "X px" });

      await user.click(moveRight);
      expect(xPosition).toHaveValue(1);
      await user.click(screen.getByRole("button", { name: "專注預覽" }));

      expect(container.querySelector(".app-shell")).toHaveClass("is-preview-focused");
      expect(screen.getByRole("button", { name: "返回編輯" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      expect(xPosition).toHaveValue(1);

      fireEvent.keyDown(window, { key: "Escape" });
      expect(container.querySelector(".app-shell")).not.toHaveClass("is-preview-focused");
      expect(screen.getByRole("button", { name: "專注預覽" })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
      expect(xPosition).toHaveValue(1);
    } finally {
      naturalWidth.mockRestore();
      naturalHeight.mockRestore();
    }
  });

  it("supports global history shortcuts without taking over number-field editing", async () => {
    const user = userEvent.setup();
    const { container } = renderWithEditor(<AdjustmentControls />);
    await revealPreciseControls(user, container);
    const moveRight = screen.getByRole("button", { name: "向右移動 1 px" });
    const xPosition = screen.getByRole("spinbutton", { name: "X px" });

    await user.click(moveRight);
    expect(xPosition).toHaveValue(1);
    fireEvent.keyDown(window, { key: "z", ctrlKey: true });
    expect(xPosition).toHaveValue(0);
    fireEvent.keyDown(window, { key: "z", ctrlKey: true, shiftKey: true });
    expect(xPosition).toHaveValue(1);

    await user.click(xPosition);
    fireEvent.keyDown(xPosition, { key: "z", ctrlKey: true });
    expect(xPosition).toHaveValue(1);
  });

  it("keeps real editor history independent for portrait and landscape", async () => {
    const user = userEvent.setup();
    renderWithEditor(
      <>
        <DeviceSelector />
        <AdjustmentControls />
      </>,
    );
    const zoom = screen.getByRole("slider", { name: /縮放/ });
    const undo = screen.getByRole("button", { name: "復原上一次構圖變更" });

    fireEvent.change(zoom, { target: { value: "130" } });
    await user.click(screen.getByRole("button", { name: "橫向" }));
    expect(zoom).toHaveValue("100");
    fireEvent.change(zoom, { target: { value: "160" } });
    await user.click(undo);
    expect(zoom).toHaveValue("100");

    await user.click(screen.getByRole("button", { name: "直向" }));
    expect(zoom).toHaveValue("130");
    await user.click(undo);
    expect(zoom).toHaveValue("100");
  });

  it("opens the matching preview mode when a mode-specific guide changes", async () => {
    const user = userEvent.setup();
    const { container } = renderWithEditor(
      <>
        <DeviceSelector />
        <DevicePreview {...previewProps} />
        <OverlayPanel />
        <AnnouncementHarness />
      </>,
    );
    const clean = screen.getByRole("button", { name: "純桌布" });
    const lockScreen = screen.getByRole("button", { name: "鎖定畫面" });
    const safePreview = screen.getByRole("button", { name: "安全區域" });
    const clock = screen.getByRole("checkbox", { name: /時鐘/ });
    const safe = screen.getByRole("checkbox", { name: /安全區域/ });
    const cutout = screen.getByRole("checkbox", { name: /開孔/ });
    const grid = screen.getByRole("checkbox", { name: /構圖格線/ });

    await user.click(clean);
    await user.click(clock);
    expect(clock).not.toBeChecked();
    expect(lockScreen).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelector(".lock-overlay")).toBeInTheDocument();
    expect(container.querySelector(".lock-clock")).not.toBeInTheDocument();
    expect(screen.getByTestId("announcement")).toHaveTextContent(
      "已開啟「鎖定畫面」預覽，讓這項輔助線變更立即可見。",
    );

    await user.click(clean);
    await user.click(clock);
    expect(clock).toBeChecked();
    expect(lockScreen).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelector(".lock-clock")).toBeInTheDocument();

    await user.click(clean);
    expect(safe).toBeChecked();
    await user.click(safe);
    expect(safe).not.toBeChecked();
    expect(safePreview).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelector(".safe-area-overlay")).not.toBeInTheDocument();

    await user.click(clean);
    await user.click(safe);
    expect(safe).toBeChecked();
    expect(safePreview).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelector(".safe-area-overlay")).toBeInTheDocument();

    await user.click(clean);
    await user.click(grid);
    expect(grid).toBeChecked();
    expect(clean).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelector(".grid-overlay")).toBeInTheDocument();

    await user.click(cutout);
    expect(cutout).not.toBeChecked();
    expect(clean).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelector(".device-cutout")).not.toBeInTheDocument();
    await user.click(cutout);
    expect(cutout).toBeChecked();
    expect(clean).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelector(".device-cutout")).toBeInTheDocument();
    expect(screen.getByText(/調整輔助線時會自動開啟相應的預覽模式/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Mac · 17" }));
    await user.click(screen.getByRole("button", { name: /MacBook Neo，2026/ }));
    const desktop = screen.getByRole("button", { name: "桌面" });
    const menuBar = screen.getByRole("checkbox", {
      name: "選單列概略的 macOS 選單列",
    });
    await user.click(clean);
    await user.click(menuBar);
    expect(menuBar).not.toBeChecked();
    expect(desktop).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelector(".mac-overlay")).toBeInTheDocument();
    expect(container.querySelector(".menu-bar")).not.toBeInTheDocument();
  });
});
