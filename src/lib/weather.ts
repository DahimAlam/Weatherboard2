// Weather + city search services. Client-side only.
// VITE_ variables are bundled into the browser and are NOT secret.
export type City = {
  id: number | string;
  name: string;
  country: string;
  admin?: string | undefined;
  lat: number;
  lon: number;
};

export type Provider = "OpenWeatherMap" | "Open-Meteo";

export type WeatherData = {
  city: City;
  provider: Provider;
  fetchedAt: number;
  current: { temp: number; feels: number; humidity: number; wind: number; code: number; isDay: boolean };
  daily: { date: string; code: number; max: number; min: number }[];
};
export type Weather = WeatherData;

export class ApiError extends Error {
  constructor(public kind: "offline" | "rate-limit" | "unavailable", msg: string) {
    super(msg);
  }
}

const env = (k: string): string | undefined => {
  const v = (import.meta.env as Record<string, string | undefined>)[k];
  return v && v.trim() ? v.trim() : undefined;
};
export const config = {
  owmKey: () => env("VITE_OPENWEATHER_API_KEY"),
  geodbKey: () => env("VITE_GEODB_API_KEY"),
};
export const searchProvider = () => (config.geodbKey() ? "GeoDB Cities" : "Open-Meteo Geocoding");

async function get(url: string, init?: RequestInit) {
  if (typeof navigator !== "undefined" && !navigator.onLine) throw new ApiError("offline", "offline");
  const r = await fetch(url, init);
  if (r.status === 429) throw new ApiError("rate-limit", "rate limited");
  if (!r.ok) throw new ApiError("unavailable", `HTTP ${r.status}`);
  return r.json();
}

// ---------- City search ----------
export async function searchCities(q: string, signal?: AbortSignal | undefined): Promise<City[]> {
  const key = config.geodbKey();
  const opts: RequestInit = signal ? { signal } : {};
  if (key) {
    const j = await get(
      `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${encodeURIComponent(q)}&limit=8&sort=-population&types=CITY`,
      { ...opts, headers: { "X-RapidAPI-Key": key, "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com" } },
    );
    return (j.data ?? []).map((c: any) => ({
      id: `g${c.id}`, name: c.name, country: c.country ?? "", admin: c.region, lat: c.latitude, lon: c.longitude,
    }));
  }
  const j = await get(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=8&language=en&format=json`,
    opts,
  );
  return (j.results ?? []).map((c: any) => ({
    id: c.id, name: c.name, country: c.country ?? "", admin: c.admin1, lat: c.latitude, lon: c.longitude,
  }));
}

// ---------- Weather ----------
// OWM condition id -> WMO-like code used by describe()
export function owmToWmo(id: number): number {
  if (id >= 200 && id < 300) return 95;
  if (id >= 300 && id < 600) return 61;
  if (id >= 600 && id < 700) return 71;
  if (id >= 700 && id < 800) return 45;
  if (id === 800) return 0;
  if (id <= 802) return 2;
  return 3;
}

async function fromOWM(city: City, key: string): Promise<WeatherData> {
  const q = `lat=${city.lat}&lon=${city.lon}&units=metric&appid=${key}`;
  const [c, f] = await Promise.all([
    get(`https://api.openweathermap.org/data/2.5/weather?${q}`),
    get(`https://api.openweathermap.org/data/2.5/forecast?${q}`),
  ]);
  const shift = (f.city?.timezone ?? 0) * 1000;
  const days = new Map<string, { max: number; min: number; codes: number[] }>();
  for (const it of f.list as any[]) {
    const date = new Date(it.dt * 1000 + shift).toISOString().slice(0, 10);
    const d = days.get(date) ?? { max: -Infinity, min: Infinity, codes: [] };
    d.max = Math.max(d.max, it.main.temp_max);
    d.min = Math.min(d.min, it.main.temp_min);
    d.codes.push(owmToWmo(it.weather[0].id));
    days.set(date, d);
  }
  const today = new Date(Date.now() + shift).toISOString().slice(0, 10);
  const daily = [...days.entries()]
    .filter(([d]) => d > today)
    .slice(0, 5)
    .map(([date, d]) => ({ date, max: d.max, min: d.min, code: d.codes[Math.floor(d.codes.length / 2)] ?? 3 }));
  const now = Date.now() / 1000;
  return {
    city,
    provider: "OpenWeatherMap",
    fetchedAt: Date.now(),
    current: {
      temp: c.main.temp,
      feels: c.main.feels_like,
      humidity: c.main.humidity,
      wind: c.wind.speed * 3.6,
      code: owmToWmo(c.weather[0].id),
      isDay: now > c.sys.sunrise && now < c.sys.sunset,
    },
    daily,
  };
}

async function fromOpenMeteo(city: City): Promise<WeatherData> {
  const j = await get(
    `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=6&timezone=auto`,
  );
  const c = j.current;
  return {
    city,
    provider: "Open-Meteo",
    fetchedAt: Date.now(),
    current: {
      temp: c.temperature_2m, feels: c.apparent_temperature, humidity: c.relative_humidity_2m,
      wind: c.wind_speed_10m, code: c.weather_code, isDay: c.is_day === 1,
    },
    daily: j.daily.time.slice(1, 6).map((d: string, i: number) => ({
      date: d, code: j.daily.weather_code[i + 1], max: j.daily.temperature_2m_max[i + 1], min: j.daily.temperature_2m_min[i + 1],
    })),
  };
}

/** OpenWeatherMap when a key exists, Open-Meteo on missing key / failure / rate limit. */
export async function fetchWeather(city: City): Promise<WeatherData> {
  const key = config.owmKey();
  if (key) {
    try {
      return await fromOWM(city, key);
    } catch (e) {
      if (e instanceof ApiError && e.kind === "offline") throw e;
    }
  }
  return fromOpenMeteo(city);
}

export function errorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.kind === "offline") return "You're offline. Showing the last saved weather, if available.";
    if (e.kind === "rate-limit") return "Too many requests right now. Please wait a moment and retry.";
  }
  return "Weather data is temporarily unavailable. Please retry.";
}

export type Kind = "clear" | "partly" | "cloudy" | "fog" | "rain" | "snow" | "storm";

export function describe(code: number): { label: string; kind: Kind } {
  if (code === 0) return { label: "Clear sky", kind: "clear" };
  if (code <= 2) return { label: "Partly cloudy", kind: "partly" };
  if (code === 3) return { label: "Overcast", kind: "cloudy" };
  if (code <= 48) return { label: "Fog", kind: "fog" };
  if (code <= 67 || (code >= 80 && code <= 82)) return { label: "Rain", kind: "rain" };
  if (code <= 77 || code === 85 || code === 86) return { label: "Snow", kind: "snow" };
  return { label: "Thunderstorm", kind: "storm" };
}

export const toUnit = (c: number, u: "C" | "F") => Math.round(u === "C" ? c : c * 1.8 + 32);

const CACHE = "wb:last";
export function cacheWeather(w: WeatherData) {
  try { localStorage.setItem(CACHE, JSON.stringify(w)); } catch {}
}
export function readCache(): WeatherData | null {
  try {
    const s = localStorage.getItem(CACHE);
    const w = s ? JSON.parse(s) : null;
    return w && w.provider ? w : null; // ignore pre-phase-2 cache shape
  } catch {
    return null;
  }
}
