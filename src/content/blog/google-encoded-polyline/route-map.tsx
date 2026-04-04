import { useEffect, useRef } from "react";

export function RouteMap({ polyline }: { polyline: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const coords = decodePolyline(polyline);
    if (coords.length === 0) return;

    let map: import("leaflet").Map;

    Promise.all([
      import("leaflet"),
      import("leaflet/dist/leaflet.css"),
    ]).then(([L]) => {
      map = L.map(containerRef.current!, {
        zoomControl: false,
        attributionControl: false,
      });
      mapRef.current = map;

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          subdomains: "abcd",
          maxZoom: 19,
        },
      ).addTo(map);

      const polylineLayer = L.polyline(coords, {
        color: "#111111",
        weight: 2.5,
        opacity: 0.9,
      }).addTo(map);
      map.fitBounds(polylineLayer.getBounds(), { padding: [16, 16] });
    });

    return () => {
      map?.remove();
      mapRef.current = null;
    };
  }, [polyline]);

  return (
    <div
      ref={containerRef}
      className="w-full h-52 rounded-md overflow-hidden"
    />
  );
}

export function decodePolyline(encoded: string): [number, number][] {
  const coords: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  while (index < encoded.length) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    coords.push([lat / 1e5, lng / 1e5]);
  }
  return coords;
}
