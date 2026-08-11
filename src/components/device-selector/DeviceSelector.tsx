import {
  Check,
  ChevronDown,
  ChevronUp,
  Monitor,
  Search,
  Smartphone,
  Tablet,
  X,
} from "lucide-react";
import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  getDeviceDiagonalLabel,
  getDeviceReleaseYearLabel,
  getDeviceSearchRank,
  matchesDeviceSearch,
} from "../../data/devices";
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

function groupLabel(group: DeviceGroup) {
  if (group === "iphone") return "iPhone";
  if (group === "ipad") return "iPad";
  return "Mac";
}

function DeviceGlyph({ group }: { group: DeviceGroup }) {
  if (group === "iphone") return <Smartphone />;
  if (group === "ipad") return <Tablet />;
  return <Monitor />;
}

export function DeviceSelector({ collapsible = false }: { collapsible?: boolean }) {
  const { t } = useI18n();
  const {
    profiles,
    profile,
    deviceId,
    setDeviceId,
    orientation,
    setOrientation,
    recentDeviceIds,
    setMobileTab,
  } = useEditor();
  const [browseContext, setBrowseContext] = useState(() => ({
    deviceId,
    group: groupForProfile(profile),
  }));
  const group =
    browseContext.deviceId === deviceId ? browseContext.group : groupForProfile(profile);
  const [query, setQuery] = useState("");
  const [browserOpen, setBrowserOpen] = useState(!collapsible);
  const listRef = useRef<HTMLUListElement>(null);
  const browserId = useId();
  const resultCountId = useId();
  const searchScopeId = useId();
  const isSearching = Boolean(query.trim());
  const groupCounts = useMemo(
    () => ({
      iphone: profiles.filter((item) => belongs(item, "iphone")).length,
      ipad: profiles.filter((item) => belongs(item, "ipad")).length,
      mac: profiles.filter((item) => belongs(item, "mac")).length,
    }),
    [profiles],
  );
  const filtered = useMemo(() => {
    return profiles
      .filter((item) => (isSearching ? matchesDeviceSearch(item, query) : belongs(item, group)))
      .sort((a, b) => {
        if (isSearching) {
          const rankDifference = getDeviceSearchRank(a, query) - getDeviceSearchRank(b, query);
          if (rankDifference) return rankDifference;
        }
        return b.releaseYear - a.releaseYear || a.model.localeCompare(b.model);
      });
  }, [group, isSearching, profiles, query]);
  const recentProfiles = useMemo(
    () =>
      recentDeviceIds
        .map((id) => profiles.find((item) => item.id === id))
        .filter((item): item is DeviceProfile => Boolean(item && belongs(item, group))),
    [group, profiles, recentDeviceIds],
  );

  useLayoutEffect(() => {
    const list = listRef.current;
    const selected = list?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!list || !selected || isSearching) return;
    const selectedTopWithinList = selected.offsetTop - list.offsetTop;
    list.scrollTop = Math.max(0, selectedTopWithinList - 4);
  }, [browserOpen, deviceId, filtered.length, group, isSearching]);

  const selectDevice = (item: DeviceProfile) => {
    setBrowseContext({ deviceId: item.id, group: groupForProfile(item) });
    setDeviceId(item.id);
    setMobileTab("adjust");
    if (collapsible) setBrowserOpen(false);
  };

  return (
    <PanelSection title={t("Device")} className="device-section">
      <button
        type="button"
        className="current-device-summary"
        aria-controls={collapsible ? browserId : undefined}
        aria-expanded={collapsible ? browserOpen : undefined}
        onClick={() => {
          setBrowseContext({ deviceId, group: groupForProfile(profile) });
          setQuery("");
          if (collapsible) setBrowserOpen((current) => !current);
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
        <span className="current-device-action">
          {t(collapsible ? (browserOpen ? "Collapse" : "Change") : "Show")}
          {collapsible ? browserOpen ? <ChevronUp /> : <ChevronDown /> : null}
        </span>
      </button>
      <div id={browserId} className="device-browser" hidden={!browserOpen}>
        <Segmented
          value={group}
          onChange={(next) => {
            setBrowseContext({ deviceId, group: next });
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
            aria-describedby={`${searchScopeId} ${resultCountId}`}
            placeholder={t("Search all Apple devices…")}
          />
          {query ? (
            <button type="button" aria-label={t("Clear search")} onClick={() => setQuery("")}>
              <X size={15} />
            </button>
          ) : null}
        </label>
        <p
          id={searchScopeId}
          className={isSearching ? "device-search-scope is-active" : "device-search-scope"}
        >
          {t(
            isSearching
              ? "Showing matches from all device categories."
              : "Search covers iPhone, iPad, and Mac.",
          )}
        </p>
        {!isSearching && recentProfiles.length ? (
          <div className="recent-devices">
            <span>{t("Recent")}</span>
            {recentProfiles.slice(0, 3).map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={item.id === deviceId}
                onClick={() => selectDevice(item)}
              >
                {item.model.replace(/\s*\([^)]*\)$/, "")}
              </button>
            ))}
          </div>
        ) : null}
        <div className="device-list-heading">
          <strong>{t(isSearching ? "Search results" : "Available configurations")}</strong>
          <span id={resultCountId} aria-live="polite">
            {t(isSearching ? "{count} results across all categories" : "{count} results", {
              count: filtered.length,
            })}
          </span>
        </div>
        <ul
          ref={listRef}
          className="device-list"
          aria-label={isSearching ? t("All device models") : t("{group} models", { group })}
        >
          {filtered.map((item) => {
            const releaseYears = getDeviceReleaseYearLabel(item);
            const itemGroup = groupForProfile(item);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  aria-label={t("{model}, {year}, {width} by {height}", {
                    model: item.model,
                    year: releaseYears,
                    width: item.display.physicalWidthPx,
                    height: item.display.physicalHeightPx,
                  })}
                  aria-pressed={item.id === deviceId}
                  className={item.id === deviceId ? "device-option is-selected" : "device-option"}
                  onClick={() => selectDevice(item)}
                >
                  <span className="device-icon">
                    <DeviceGlyph group={itemGroup} />
                  </span>
                  <span>
                    <strong>{item.model}</strong>
                    <small>
                      {isSearching ? `${groupLabel(itemGroup)} · ` : ""}
                      {releaseYears}
                      {item.compatibleModels.length > 1
                        ? ` · ${t("{count} models", { count: item.compatibleModels.length })}`
                        : ""}
                      {` · ${getDeviceDiagonalLabel(item)} · `}
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
              </li>
            );
          })}
          {!filtered.length ? (
            <li className="empty-list">
              <p>
                {t(
                  isSearching
                    ? "No matching devices across iPhone, iPad, or Mac."
                    : "No matching devices.",
                )}
              </p>
              {isSearching ? (
                <small>{t("Try a model name, year, screen size, or resolution.")}</small>
              ) : null}
              {isSearching ? (
                <button type="button" onClick={() => setQuery("")}>
                  {t("Clear search")}
                </button>
              ) : null}
            </li>
          ) : null}
        </ul>
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
