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
    await user.type(screen.getByPlaceholderText("搜尋裝置…"), "14 Pro");
    const option = screen.getByRole("option", { name: /iPhone 14 Pro，2022/ });
    await user.click(option);
    expect(option).toHaveAttribute("aria-selected", "true");
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
