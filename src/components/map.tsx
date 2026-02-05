import { useEffect, useRef, useState } from "react";
// ❌ CSS 請確認已在 index.astro 或 Layout 中引入

type Feature = {
  type: "Feature";
  properties: { 
    id: string; 
    startTime?: string; 
    totalDistanceMeters?: number;
    // 如果你有加 duration 或 elevation，也可以在這裡擴充
  };
  geometry: { type: "LineString"; coordinates: [number, number][] };
};
type FC = { type: "FeatureCollection"; features: Feature[] };

function formatDateTW(iso?: string) {
  if (!iso) return "未知日期";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return new Intl.DateTimeFormat("zh-Hant-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function formatKm(m?: number) {
  if (typeof m !== "number") return "未知距離";
  return `${(m / 1000).toFixed(2)} km`;
}

export default function Map() {
  const mapRef = useRef<any>(null);
  const layersById = useRef<Record<string, any>>({});
  const [routes, setRoutes] = useState<Feature[]>([]);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    if (mapRef.current) return;

    (async () => {
      const Lmod = await import("leaflet");
      const L = (Lmod as any).default ?? Lmod;

      // 初始化地圖
      const map = L.map("map", { 
        center: [25.033, 121.565], 
        zoom: 12,
        zoomControl: false,
        attributionControl: false 
      });
      mapRef.current = map;

      // Dark Matter 圖資
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
      }).addTo(map);

      L.control.attribution({ position: "bottomright" })
        .addAttribution('&copy; <a href="https://carto.com/">CARTO</a>')
        .addTo(map);

      // 讀取資料
      const res = await fetch("/api/routes.json");
      const geojson: FC = await res.json();

      // 依照日期排序 (新的在上面)
      const sortedFeatures = (geojson.features ?? []).sort((a, b) => {
        const tA = new Date(a.properties.startTime || 0).getTime();
        const tB = new Date(b.properties.startTime || 0).getTime();
        return tB - tA;
      });

      setRoutes(sortedFeatures);

      const layer = L.geoJSON({ type: "FeatureCollection", features: sortedFeatures } as any, {
        style: () => ({
          color: "#525252", 
          weight: 2,
          opacity: 0.6,
          className: "transition-all duration-300"
        }),
        onEachFeature: (feature: any, lyr: any) => {
          const id = feature?.properties?.id;
          if (!id) return;

          layersById.current[id] = lyr;

          // 綁定點擊事件，點擊地圖上的線也會觸發列表選取
          lyr.on("click", () => zoomTo(id));

          lyr.on("mouseover", () => {
            lyr.setStyle?.({ color: "#ffffff", weight: 4, opacity: 1 });
            lyr.bringToFront?.();
          });
          
          lyr.on("mouseout", () => {
            // 注意：這裡需要判斷當前是否是被選中的項目，避免 mouseout 把選中的樣式洗掉
            // 這裡為了簡化，交給 zoomTo 統一處理樣式重置
            // 但如果想要更完美的互動，可以檢查 selectedIdRef (需額外實作 Ref)
            if (feature.properties.id !== selectedId) {
               lyr.setStyle?.({ color: "#525252", weight: 2, opacity: 0.6 });
            }
          });
        },
      }).addTo(map);

      // 預設顯示全部範圍
      const bounds = layer.getBounds();
      if (bounds?.isValid?.()) {
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    })();
  }, []); // 依賴項為空，只執行一次

  function zoomTo(id: string) {
    if (id === selectedId) return; // 避免重複點擊
    setSelectedId(id);
    
    const map = mapRef.current;
    const lyr = layersById.current[id];
    
    // 1. 重置所有線條為暗色
    Object.values(layersById.current).forEach((l: any) => {
      l.setStyle({ color: "#525252", weight: 2, opacity: 0.6 });
    });

    if (!map || !lyr) return;

    // 2. 高亮當前線條
    lyr.setStyle({ color: "#ffffff", weight: 4, opacity: 1 });
    lyr.bringToFront();

    // 3. 飛向該區域
    const b = lyr.getBounds?.();
    if (b?.isValid?.()) {
      map.flyToBounds(b, { 
        padding: [50, 50], 
        duration: 1.5 
      });
    }
  }

  return (
    // 使用 Grid 佈局：大螢幕時分為兩欄 (地圖 3 : 列表 1)，高度固定為 75vh
    <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 h-[85vh] w-full">
      
      {/* 左側地圖區塊 (佔 3 份) */}
      <div 
        id="map" 
        className="
          lg:col-span-3 w-full h-[50vh] lg:h-full 
          rounded-xl overflow-hidden bg-[#1a1a1a] 
          shadow-2xl border border-neutral-800
        " 
      />

      <div className="lg:col-span-1 w-full h-full flex flex-col overflow-hidden">
        {/* 列表標題 */}
        <div className="p-4">
          <h2 className="text-neutral-200 font-bold text-lg">
            All Runs
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {routes.length === 0 ? (
            <div className="p-8 text-center text-neutral-500 text-sm">
              Loading or no data available...
            </div>
          ) : (
            <ul className="divide-y">
              {routes.map((f) => {
                const isSelected = selectedId === f.properties.id;
                return (
                  <li 
                    key={f.properties.id}
                    onClick={() => zoomTo(f.properties.id)}
                    className={`cursor-pointer p-4 transition-all duration-200hover:bg-neutral-800
                      ${isSelected 
                        ? "bg-neutral-800 border-l-4 border-white pl-[12px]" // 選中樣式
                        : "border-l-4 border-transparent text-neutral-400"  // 未選中樣式
                      }
                    `}
                  >
                    <div className={`font-medium ${isSelected ? "text-white" : "text-neutral-300"}`}>
                      {f.properties.id}
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm">
                        {formatDateTW(f.properties.startTime)}
                      </span>
                      <span className="text-sm font-mono text-neutral-500">
                        {formatKm(f.properties.totalDistanceMeters)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}