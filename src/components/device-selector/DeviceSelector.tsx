import { Check, Monitor, Search, Smartphone, Tablet, X } from "lucide-react";
import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useEditor } from "../../state/editor-context";
import { useI18n } from "../../i18n/i18n";
import type { DeviceProfile } from "../../types/device";
import { PanelSection, Segmented } from "../ui";

type DeviceGroup = "iphone" | "ipad" | "mac";

const DEVICE_GROUPS: DeviceGroup[] = ["iphone", "ipad", "mac"];

function belongs(profile: DeviceProfile, group: DeviceGroup) {
  if (group === "mac") return ["macbook", "imac", "display"].includes(profile.category);
  return profile.category === group;
}

function groupForProfile(profile: DeviceProfile): DeviceGroup {
  if (profile.category === "iphone") return "iphone";
  if (profile.category === "ipad") return "ipad";
  return "mac";
}

function searchableDeviceText(profile: DeviceProfile) {
  const { display } = profile;
  return [
    profile.model,
    profile.releaseYear,
    display.physicalWidthPx,
    display.physicalHeightPx,
    display.logicalWidthPt,
    display.logicalHeightPt,
    profile.chassis.screenDiagonalInches,
  ]
    .join(" ")
    .toLowerCase();
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
  const initialGroup = groupForProfile(profile);
  const [group, setGroup] = useState<DeviceGroup>(initialGroup);
  const [query, setQuery] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const resultCountId = useId();
  const groupCounts = useMemo(
    () => ({
      iphone: profiles.filter((item) => belongs(item, "iphone")).length,
      ipad: profiles.filter((item) => belongs(item, "ipad")).length,
      mac: profiles.filter((item) => belongs(item, "mac")).length,
    }),
    [profiles],
  );
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return profiles
      .filter(
        (item) =>
          belongs(item, group) &&
          (!normalizedQuery || searchableDeviceText(item).includes(normalizedQuery)),
      )
      .sort((a, b) => b.releaseYear - a.releaseYear);
  }, [group, profiles, query]);
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
      <button
        type="button"
        className="current-device-summary"
        onClick={() => {
          setGroup(groupForProfile(profile));
          setQuery("");
        }}
      >
        <span className="device-icon">
          <DeviceGlyph group={groupForProfile(profile)} />
        </span>
        <span>
          <small>{t("Current device")}</small>
          <strong>{profile.model}</strong>
          <em>
            {profile.display.physicalWidthPx} × {profile.display.physicalHeightPx} px
          </em>
        </span>
        <span className="current-device-action">{t("Show")}</span>
      </button>
      <Segmented
        value={group}
        onChange={(next) => {
          setGroup(next);
          setQuery("");
        }}
        label={t("Device category")}
        options={DEVICE_GROUPS.map((value) => ({
          value,
          label: `${value === "iphone" ? "iPhone" : value === "ipad" ? "iPad" : "Mac"} · ${groupCounts[value]}`,
        }))}
      />
      <label className="search-field">
        <Search size={16} />
        <span className="visually-hidden">{t("Search devices")}</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setQuery("");
          }}
          aria-describedby={resultCountId}
          placeholder={t("Search by model, year, or resolution…")}
        />
        {query ? (
          <button type="button" aria-label={t("Clear search")} onClick={() => setQuery("")}>
            <X size={15} />
          </button>
        ) : null}
      </label>
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
      <div className="device-list-heading">
        <strong>{t("Available models")}</strong>
        <span id={resultCountId} aria-live="polite">
          {t("{count} results", { count: filtered.length })}
        </span>
      </div>
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
                {item.releaseYear} · {item.chassis.screenDiagonalInches}″ ·{" "}
                {item.display.physicalWidthPx} × {item.display.physicalHeightPx}
              </small>
            </span>
            {item.id === deviceId ? (
              <Check className="selected-check" aria-hidden="true" />
            ) : (
              <em className={`accuracy-badge ${item.metadata.accuracy}`}>
                {t(item.metadata.accuracy[0].toUpperCase() + item.metadata.accuracy.slice(1))}
              </em>
            )}
          </button>
        ))}
        {!filtered.length ? (
          <div className="empty-list">
            <p>{t("No matching devices.")}</p>
            {query ? (
              <button type="button" onClick={() => setQuery("")}>
                {t("Clear search")}
              </button>
            ) : null}
          </div>
        ) : null}
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
