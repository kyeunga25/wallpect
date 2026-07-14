import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AdjustmentControls } from "../../src/components/editor-controls/AdjustmentControls";
import { DeviceSelector } from "../../src/components/device-selector/DeviceSelector";
import { OverlayPanel } from "../../src/components/overlays/OverlayPanel";
import { I18nProvider } from "../../src/i18n/i18n";
import { EditorProvider } from "../../src/state/editor-context";

function renderWithEditor(node: React.ReactNode) {
  return render(
    <I18nProvider>
      <EditorProvider>{node}</EditorProvider>
    </I18nProvider>,
  );
}

describe("editor controls", () => {
  it("searches and selects a device profile", async () => {
    const user = userEvent.setup();
    renderWithEditor(<DeviceSelector />);
    await user.type(screen.getByPlaceholderText("搜尋型號、年份或解析度…"), "14 Pro");
    const option = screen.getByRole("option", { name: /iPhone 14 Pro，2022/ });
    await user.click(option);
    expect(option).toHaveAttribute("aria-selected", "true");
  });

  it("filters devices by resolution and clears the search with Escape", async () => {
    const user = userEvent.setup();
    renderWithEditor(<DeviceSelector />);
    const search = screen.getByPlaceholderText("搜尋型號、年份或解析度…");

    await user.type(search, "1290");
    expect(screen.getByText("3 個結果")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /iPhone 15 Pro Max，2023/ })).toBeInTheDocument();

    await user.type(search, "{Escape}");
    expect(search).toHaveValue("");
    expect(screen.getByText("12 個結果")).toBeInTheDocument();
  });

  it("shows the selected device again after browsing another category", async () => {
    const user = userEvent.setup();
    renderWithEditor(<DeviceSelector />);

    await user.click(screen.getByRole("button", { name: "iPad · 5" }));
    expect(screen.getByText("5 個結果")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /目前裝置.*iPhone 15 Pro/ }));

    expect(screen.getByRole("button", { name: "iPhone · 12" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("updates fit, zoom, and background controls", async () => {
    const user = userEvent.setup();
    renderWithEditor(<AdjustmentControls />);
    await user.click(screen.getByRole("button", { name: "完整顯示" }));
    expect(screen.getByRole("button", { name: "完整顯示" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    const zoom = screen.getByRole("slider", { name: /縮放/ });
    fireEvent.change(zoom, { target: { value: "140" } });
    expect(zoom).toHaveValue("140");
    await user.click(screen.getByRole("button", { name: "模糊延伸" }));
    expect(screen.getByText(/柔化的滿版副本/)).toBeInTheDocument();
  });

  it("toggles overlay settings with text labels", async () => {
    const user = userEvent.setup();
    renderWithEditor(<OverlayPanel />);
    const safe = screen.getByRole("checkbox", { name: /安全區域/ });
    expect(safe).toBeChecked();
    await user.click(safe);
    expect(safe).not.toBeChecked();
  });
});
