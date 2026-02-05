import fs from "node:fs";
import FitParser from "fit-file-parser";

// 定義回傳的 GeoJSON 結構
export type LineFeature = {
  type: "Feature";
  properties: {
    id: string;
    startTime?: string;
    totalDistanceMeters?: number;
    durationSeconds?: number;
    avgPower?: number;
    elevationGain?: number;
  };
  geometry: {
    type: "LineString";
    coordinates: [number, number][]; // GeoJSON 標準: [經度, 緯度]
  };
};

export async function fitFileToLineFeature(filePath: string, id: string): Promise<LineFeature | null> {
  try {
    // 1. 讀取檔案並轉為 ArrayBuffer
    const nodeBuffer = fs.readFileSync(filePath);
    const arrayBuffer = nodeBuffer.buffer.slice(
      nodeBuffer.byteOffset,
      nodeBuffer.byteOffset + nodeBuffer.length
    );

    // 2. 初始化 Parser
    const fitParser = new FitParser({
      force: true,
      speedUnit: "m/s",
      lengthUnit: "m",
      temperatureUnit: "celsius",
      elapsedRecordField: true,
      mode: "list",
    });

    // 3. 包裝成 Promise 處理
    return new Promise((resolve) => {
      fitParser.parse(arrayBuffer, (error: Error | null, data: any) => {
        if (error) {
          console.error(`❌ [${id}] Error parsing FIT file:`, error);
          resolve(null);
          return;
        }

        const records = data.records || [];
        const coordinates: [number, number][] = [];
        
        // 這些變數可以用來計算統計數據 (如果 session 區塊遺失的話)
        let totalPower = 0;
        let powerCount = 0;
        let maxAltitude = 0;
        let minAltitude = Number.POSITIVE_INFINITY;

        // 4. 提取軌跡點
        records.forEach((record: any) => {
          // fit-file-parser 自動將半圓轉為度數，所以直接用
          if (typeof record.position_lat === "number" && typeof record.position_long === "number") {
            // ⚠️ 重要：GeoJSON 格式必須是 [經度 (Long), 緯度 (Lat)]
            coordinates.push([record.position_long, record.position_lat]);
          }

          // 收集額外數據 (Power, Altitude)
          if (record.power) {
            totalPower += record.power;
            powerCount++;
          }
          if (record.altitude) {
            maxAltitude = Math.max(maxAltitude, record.altitude);
            minAltitude = Math.min(minAltitude, record.altitude);
          }
        });

        if (coordinates.length < 2) {
          console.warn(`⚠️ [${id}] Not enough coordinates found.`);
          resolve(null);
          return;
        }

        // 5. 提取摘要數據 (Session)
        const session = data.sessions?.[0] || {};
        const activity = data.activity || {};
        
        // 優先使用 Session 的距離，如果沒有則嘗試計算 (這裡簡化處理)
        const totalDistance = session.total_distance; 
        const startTime = session.start_time ? new Date(session.start_time).toISOString() : undefined;

        console.log(`✅ [${id}] Parsed successfully. Points: ${coordinates.length}`);

        // 6. 回傳 Feature
        resolve({
          type: "Feature",
          properties: {
            id,
            startTime,
            totalDistanceMeters: totalDistance,
            durationSeconds: session.total_elapsed_time || session.total_timer_time,
            avgPower: powerCount > 0 ? Math.round(totalPower / powerCount) : undefined,
            elevationGain: minAltitude !== Number.POSITIVE_INFINITY ? Math.round(maxAltitude - minAltitude) : undefined,
          },
          geometry: {
            type: "LineString",
            coordinates,
          },
        });
      });
    });
  } catch (error) {
    console.error(`🔥 [${id}] System error reading file:`, error);
    return null;
  }
}