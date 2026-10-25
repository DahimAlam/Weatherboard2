export type City = {
  id: number;
  name: string;
  country: string;
  admin?: string;
  lat: number;
  lon: number;
};

export type Weather = {
  city: City;
  fetchedAt: number;
  current: {
    temp: number;
    feels: number;
    humidity: number;
    wind: number;
    code: number;
    isDay: boolean;
  };
  daily: { date: string; code: number; max: number; min: number }[];
};

export async function searchCities(q: string, signal?: AbortSignal | undefined): Promise<City[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=en&format=json`;
  const r = await fetch(url, signal ? { signal } : {});
  if (!r.ok) throw new Error("City search failed");
  const j = await r.json();
  return (j.results ?? []).map((c: any) => ({
    id: c.id,
    name: c.name,
    country: c.country ?? "",
    admin: c.admin1,
    lat: c.latitude,
    lon: c.longitude,
  }));
}

export async function fetchWeather(city: City): Promise<Weather> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=6&timezone=auto`;
  const r = await fetch(url);
  if (!r.ok) throw new Error("Weather service unavailable");
  const j = await r.json();
  const c = j.current;
  return {
    city,
    fetchedAt: Date.now(),
    current: {
      temp: c.temperature_2m,
      feels: c.apparent_temperature,
      humidity: c.relative_humidity_2m,
      wind: c.wind_speed_10m,
      code: c.weather_code,
      isDay: c.is_day === 1,
    },
    daily: j.daily.time.slice(1, 6).map((d: string, i: number) => ({
      date: d,
      code: j.daily.weather_code[i + 1],
      max: j.daily.temperature_2m_max[i + 1],
      min: j.daily.temperature_2m_min[i + 1],
    })),
  };
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
export function cacheWeather(w: Weather) {
  try {
    localStorage.setItem(CACHE, JSON.stringify(w));
  } catch {}
}
export function readCache(): Weather | null {
  try {
    const s = localStorage.getItem(CACHE);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}
