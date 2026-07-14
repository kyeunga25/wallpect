import { Check, Monitor, Search, Smartphone, Tablet, X } from "lucide-react";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useEditor } from "../../state/editor-context";
import { useI18n } from "../../i18n/i18n";
import type { DeviceProfile } from "../../types/device";
import { PanelSection, Segmented } from "../ui";

type DeviceGroup = "iphone" | "ipad" | "mac";

function belongs(profile: DeviceProfile, group: DeviceGroup) {
  if (group === "mac") return ["macbook", "imac", "display"].includes(profile.category);
  return profile.category === group;
}

function DeviceGlyph({ group }: { group: DeviceGroup }) {
  if (group === "iphone") return <Smartphone />;
  if (group === "ipad") return <Tablet />;
  return <Monitor />;
}

export function DeviceSelector() {
  const { t } = useI18n();
  const { profiles, profile, deviceId, setDeviceId, orientation, setOrientation, recentDeviceIds } =
    useEditor();
  const initialGroup: DeviceGroup =
    profile.category === "iphone" ? "iphone" : profile.category === "ipad" ? "ipad" : "mac";
  const [group, setGroup] = useState<DeviceGroup>(initialGroup);
  const [query, setQuery] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const filtered = useMemo(
    () =>
      profiles.filter(
        (item) =>
          belongs(item, group) &&
          `${item.model} ${item.releaseYear}`.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [group, profiles, query],
  );
  const recentProfiles = useMemo(
    () =>
      recentDeviceIds
        .map((id) => profiles.find((item) => item.id === id))
        .filter((item): item is DeviceProfile => Boolean(item && belongs(item, group))),
    [group, profiles, recentDeviceIds],
  );

  useLayoutEffect(() => {
    const list = listRef.current;
    const selected = list?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!list || !selected || query) return;
    const selectedTopWithinList = selected.offsetTop - list.offsetTop;
    list.scrollTop = Math.max(0, selectedTopWithinList - 4);
  }, [deviceId, filtered.length, group, query]);

  return (
    <PanelSection title={t("Device")} className="device-section">
      <label className="search-field">
        <Search size={16} />
        <span className="visually-hidden">{t("Search devices")}</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("Search devices…")}
        />
        {query ? (
          <button type="button" aria-label={t("Clear search")} onClick={() => setQuery("")}>
            <X size={15} />
          </button>
        ) : null}
      </label>
      <Segmented
        value={group}
        onChange={(next) => {
          setGroup(next);
          setQuery("");
        }}
        label={t("Device category")}
        options={[
          { value: "iphone", label: "iPhone" },
          { value: "ipad", label: "iPad" },
          { value: "mac", label: "Mac" },
        ]}
      />
      {!query && recentProfiles.length ? (
        <div className="recent-devices">
          <span>{t("Recent")}</span>
          {recentProfiles.slice(0, 3).map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={item.id === deviceId}
              onClick={() => setDeviceId(item.id)}
            >
              {item.model.replace(/\s*\([^)]*\)$/, "")}
            </button>
          ))}
        </div>
      ) : null}
      <div
        ref={listRef}
        className="device-list"
        role="listbox"
        aria-label={t("{group} models", { group })}
      >
        {filtered.map((item) => (
          <button
            key={item.id}
            type="button"
            role="option"
            aria-label={t("{model}, {year}, {width} by {height}", {
              model: item.model,
              year: item.releaseYear,
              width: item.display.physicalWidthPx,
              height: item.display.physicalHeightPx,
            })}
            aria-selected={item.id === deviceId}
            className={item.id === deviceId ? "device-option is-selected" : "device-option"}
            onClick={() => setDeviceId(item.id)}
          >
            <span className="device-icon">
              <DeviceGlyph group={group} />
            </span>
            <span>
              <strong>{item.model}</strong>
              <small>
                {item.releaseYear} · {item.display.physicalWidthPx} ×{" "}
                {item.display.physicalHeightPx}
              </small>
            </span>
            {item.id === deviceId ? (
              <Check className="selected-check" />
            ) : (
              <em>
                {t(item.metadata.accuracy[0].toUpperCase() + item.metadata.accuracy.slice(1))}
              </em>
            )}
          </button>
        ))}
        {!filtered.length ? <p className="empty-list">{t("No matching devices.")}</p> : null}
      </div>
      {profile.supportedOrientations.length > 1 ? (
        <div className="orientation-row">
          <span>{t("Orientation")}</span>
          <Segmented
            value={orientation}
            onChange={setOrientation}
            label={t("Screen orientation")}
            options={[
              { value: "portrait", label: t("Portrait") },
              { value: "landscape", label: t("Landscape") },
            ]}
          />
        </div>
      ) : null}
    </PanelSection>
  );
}
