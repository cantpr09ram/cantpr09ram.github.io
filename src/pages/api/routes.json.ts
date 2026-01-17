import fg from "fast-glob";
import path from "node:path";
import { fitFileToLineFeature } from "../../lib/fit2geojson"; // 確保路徑正確

export const prerender = true;

export async function GET() {
  const baseDir = path.resolve("src/activities");
  const files = await fg("*.fit", { cwd: baseDir, absolute: true });

  const features = [];
  for (const file of files) {
    console.log("Processing file:", file);
    const id = path.basename(file, path.extname(file));
    
    // ✅ 這裡必須加上 await
    const feature = await fitFileToLineFeature(file, id);
    
    if (feature) features.push(feature);
  }

  const geojson = {
    type: "FeatureCollection",
    features,
  };

  return new Response(JSON.stringify(geojson), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}