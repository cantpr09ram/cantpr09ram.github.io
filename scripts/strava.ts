import * as fs from 'fs';
import * as path from 'path';

interface StravaActivity {
  distance: number;
  type: string;
  start_date_local: string;
}

// 載入 .env 檔案 (本地開發用)
function loadEnvFile(filePath = path.join(process.cwd(), '.env')) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...values] = trimmed.split('=');
    if (!key || values.length === 0) continue;
    const value = values.join('=').trim().replace(/^['"]|['"]$/g, '');
    if (!(key in process.env)) process.env[key.trim()] = value;
  }
}

loadEnvFile();

const getEnv = (k: string) => {
  const v = process.env[k];
  if (!v) throw new Error(`Missing ${k}`);
  return v;
};

const CLIENT_ID = getEnv('STRAVA_CLIENT_ID');
const CLIENT_SECRET = getEnv('STRAVA_CLIENT_SECRET');
const REFRESH_TOKEN = getEnv('STRAVA_REFRESH_TOKEN');

async function getAccessToken(): Promise<string> {
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  if (!res.ok) throw new Error(`Token refresh failed: ${res.statusText}`);
  return (await res.json() as any).access_token;
}

async function getAllActivities(token: string): Promise<StravaActivity[]> {
  const allActivities: StravaActivity[] = [];
  let page = 1;
  const perPage = 200;
  
  const now = new Date();
  const startOfYear = new Date(Date.UTC(now.getFullYear(), 0, 1)).getTime() / 1000;

  while (true) {
    console.log(`Fetching page ${page}...`);
    const res = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?after=${startOfYear}&per_page=${perPage}&page=${page}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) throw new Error(`Fetch failed: ${res.statusText}`);
    
    const data = await res.json() as StravaActivity[];
    if (data.length === 0) break;

    allActivities.push(...data);
    if (data.length < perPage) break; // 如果回傳數量少於 200，表示是最後一頁
    page++;
  }
  
  return allActivities;
}

function calculateStats(activities: StravaActivity[]) {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? 6 : day - 1;
  
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  let yearTotal = 0;
  let monthTotal = 0;
  let weekTotal = 0;

  const runs = activities.filter(a => 
    ['Run', 'TrailRun', 'VirtualRun', 'Treadmill'].includes(a.type)
  );

  console.log({startOfYear},{startOfMonth},{startOfWeek})
  for (const run of runs) {
    const runDate = new Date(run.start_date_local); 
    const distanceKm = run.distance / 1000;
    
    if (runDate >= startOfYear) { 
      yearTotal += distanceKm;
    }
    
    if (runDate >= startOfMonth) {
      monthTotal += distanceKm;
    }

    if (runDate >= startOfWeek) {
      weekTotal += distanceKm;
    }
  }

  return {
    updated_at: now.toISOString().replace('Z', '+08:00'), // 標記為台灣時間
    unit: 'km',
    year: Number(yearTotal.toFixed(2)),
    month: Number(monthTotal.toFixed(2)),
    week: Number(weekTotal.toFixed(2)),
  };
}

(async () => {
  try {
    const token = await getAccessToken();
    const activities = await getAllActivities(token);
    const stats = calculateStats(activities);
    
    console.log('Final Stats:', stats);

    const outputPath = 'src/data/strava.json';
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 寫入檔案
    fs.writeFileSync(outputPath, JSON.stringify(stats, null, 2));
    
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();