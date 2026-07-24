import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { Header } from "../../src/components/header/Header";
import { I18nProvider } from "../../src/i18n/i18n";

function renderHeader() {
  return render(
    <I18nProvider>
      <Header onOpenInfo={() => undefined} />
    </I18nProvider>,
  );
}

describe("language interface", () => {
  beforeEach(() => localStorage.clear());

  it("defaults to Traditional Chinese and persists an explicit language preference", async () => {
    const user = userEvent.setup();
    const first = renderHeader();
    const language = screen.getByRole("combobox", { name: "語言" });

    expect(language).toHaveValue("zh-Hant");
    expect(screen.getByRole("button", { name: "關於" })).toBeInTheDocument();
    await waitFor(() => expect(document.documentElement.lang).toBe("zh-Hant"));

    await user.selectOptions(language, "en");
    expect(screen.getByRole("button", { name: "About" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Legal & data" })).toBeInTheDocument();
    expect(localStorage.getItem("wallpect:locale:v1")).toBe("en");
    await waitFor(() => expect(document.documentElement.lang).toBe("en"));

    first.unmount();
    renderHeader();
    const persistedLanguage = screen.getByRole("combobox", { name: "Language" });
    expect(persistedLanguage).toHaveValue("en");

    await user.selectOptions(persistedLanguage, "zh-Hans");
    expect(screen.getByRole("button", { name: "关于" })).toBeInTheDocument();
    await waitFor(() => expect(document.documentElement.lang).toBe("zh-Hans"));
  });
});
