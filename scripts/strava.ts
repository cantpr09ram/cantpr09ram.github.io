import * as fs from 'fs';
import * as path from 'path';

interface StravaActivity {
  distance: number;          // meters
  type: string;              // e.g. Run
  start_date_local: string;  // ISO string
  name: string;              // activity title
}

// load .env file
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
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: String(CLIENT_ID),
      client_secret: String(CLIENT_SECRET),
      refresh_token: String(REFRESH_TOKEN),
      grant_type: 'refresh_token',
    }),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`Token refresh failed (${res.status}): ${text}`);

  const json = JSON.parse(text) as { access_token: string };
  if (!json.access_token) throw new Error(`Token refresh response missing access_token: ${text}`);
  return json.access_token;
}

async function getAllActivitiesThisYear(token: string): Promise<StravaActivity[]> {
  const allActivities: StravaActivity[] = [];
  let page = 1;
  const perPage = 200;

  const now = new Date();
  const startOfYearUtcSeconds = Date.UTC(now.getFullYear(), 0, 1) / 1000;

  while (true) {
    console.log(`Fetching page ${page}...`);
    const res = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?after=${startOfYearUtcSeconds}&per_page=${perPage}&page=${page}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const text = await res.text();
    if (!res.ok) throw new Error(`Fetch failed (${res.status}): ${text}`);

    const data = JSON.parse(text) as StravaActivity[];
    if (!Array.isArray(data) || data.length === 0) break;

    allActivities.push(...data);
    if (data.length < perPage) break;
    page++;
  }

  return allActivities;
}

function calculateAndPick(activities: StravaActivity[]) {
  const now = new Date();

  const runs = activities.filter(a =>
    ['Run', 'TrailRun', 'VirtualRun', 'Treadmill'].includes(a.type)
  );

  runs.sort(
    (a, b) =>
      new Date(b.start_date_local).getTime() - new Date(a.start_date_local).getTime()
  );

  const totalKm = runs.reduce((sum, a) => sum + a.distance / 1000, 0);

  const last20 = runs.slice(0, 20).map(a => {
    const d = new Date(a.start_date_local);
    const km = a.distance / 1000;
    return {
      date: a.start_date_local,
      date_iso: d.toISOString(),
      distance_km: Number(km.toFixed(2)),
      name: a.name ?? '',
    };
  });

  return {
    updated_at: now.toISOString().replace('Z', '+08:00'),
    unit: 'km',
    total_km: Number(totalKm.toFixed(2)),
    last_20: last20,
  };
}

(async () => {
  try {
    const token = await getAccessToken();
    const activities = await getAllActivitiesThisYear(token);
    const result = calculateAndPick(activities);

    console.log('Output:', result);

    const outputPath = 'src/data/strava.json';
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
