"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import type { Office } from "@/lib/site-data";
import { ArtPicture } from "./picture";

type Status = "static" | "loading" | "ready" | "failed";

const tileUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const zoom = 14;

const subscribeNothing = () => () => {};
/** True only after hydration, so the load button never renders as a dead control. */
const useHydrated = () => useSyncExternalStore(subscribeNothing, () => true, () => false);

/**
 * The office's static map image, swapped for an interactive OpenStreetMap
 * map only when the visitor asks. Tiles come from OpenStreetMap's servers,
 * which see the visitor's IP address, so nothing loads from them before the
 * click. Leaflet itself is bundled with the site.
 */
export function OfficeMap({ office, priority }: { office: Office; priority: boolean }) {
  const hydrated = useHydrated();
  const [requested, setRequested] = useState(false);
  const [status, setStatus] = useState<Status>("static");
  const mapNode = useRef<HTMLDivElement>(null);
  const loadButton = useRef<HTMLButtonElement>(null);
  const noteId = useId();
  const { lat, lng, area } = office.position;
  const label = `${office.office}, ${area}`;

  useEffect(() => {
    if (!requested) return;
    let map: import("leaflet").Map | undefined;
    let cancelled = false;
    void (async () => {
      try {
        const { default: L } = await import("leaflet");
        if (cancelled || !mapNode.current) return;
        map = L.map(mapNode.current, { scrollWheelZoom: false, dragging: !L.Browser.mobile }).setView([lat, lng], zoom);
        L.tileLayer(tileUrl, {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);
        L.circleMarker([lat, lng], { radius: 10, color: "#a74631", weight: 3, fillColor: "#e7816b", fillOpacity: 0.9 })
          .bindTooltip(label)
          .addTo(map);
        setStatus("ready");
        mapNode.current.focus();
      } catch {
        if (cancelled) return;
        setRequested(false);
        setStatus("failed");
      }
    })();
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [requested, lat, lng, label]);

  useEffect(() => {
    if (status === "failed") loadButton.current?.focus();
  }, [status]);

  return (
    <div className="office__media">
      {requested ? (
        <div
          ref={mapNode}
          className="office__map office__map--live"
          role="region"
          aria-label={`Interactive map of the ${office.country} office`}
          aria-busy={status === "loading"}
        />
      ) : (
        <ArtPicture className="office__map" sources={office.map} alt={office.map.alt} width={375} height={320} priority={priority} />
      )}
      {status === "loading" ? <p className="office__map-status" role="status">Loading map…</p> : null}
      {requested ? null : (
        <div className="office__map-actions">
          {hydrated ? (
            <button ref={loadButton} type="button" className="office__map-load" aria-describedby={noteId} onClick={() => { setStatus("loading"); setRequested(true); }}>
              Load interactive map<span className="sr-only"> of the {office.country} office</span>
            </button>
          ) : null}
          <a className="office__map-link" href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`}>
            {office.country} on OpenStreetMap
          </a>
          <p id={noteId} className="office__map-note" role={status === "failed" ? "alert" : undefined}>
            {status === "failed"
              ? "The map didn’t load. Try again, or use the OpenStreetMap link."
              : "Loading it sends your IP address to OpenStreetMap."}
          </p>
        </div>
      )}
    </div>
  );
}
