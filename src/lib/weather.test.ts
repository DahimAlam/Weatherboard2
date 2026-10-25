import { describe as d, it, expect, vi, afterEach } from "vitest";
import { toUnit, owmToWmo, fetchWeather } from "./weather";

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

d("weather rules", () => {
  it("converts 0°C to 32°F", () => expect(toUnit(0, "F")).toBe(32));
  it("maps OWM thunderstorm to storm code", () => expect(owmToWmo(211)).toBe(95));
  it("falls back to Open-Meteo when no OpenWeatherMap key", async () => {
    vi.stubEnv("VITE_OPENWEATHER_API_KEY", "");
    const f = vi.fn(async () => new Response(JSON.stringify({
      current: { temperature_2m: 10, apparent_temperature: 8, relative_humidity_2m: 50, wind_speed_10m: 5, weather_code: 0, is_day: 1 },
      daily: { time: ["a","b","c","d","e","f"], weather_code: [0,0,0,0,0,0], temperature_2m_max: [1,2,3,4,5,6], temperature_2m_min: [0,0,0,0,0,0] },
    })));
    vi.stubGlobal("fetch", f);
    const w = await fetchWeather({ id: 1, name: "X", country: "Y", lat: 1, lon: 2 });
    expect(w.provider).toBe("Open-Meteo");
    expect(w.daily).toHaveLength(5);
  });
  it("falls back to Open-Meteo when OpenWeatherMap rate-limits", async () => {
    vi.stubEnv("VITE_OPENWEATHER_API_KEY", "k");
    const f = vi.fn(async (u: string) => u.includes("openweathermap") ? new Response("", { status: 429 }) : new Response(JSON.stringify({
      current: { temperature_2m: 10, apparent_temperature: 8, relative_humidity_2m: 50, wind_speed_10m: 5, weather_code: 0, is_day: 1 },
      daily: { time: ["a","b","c","d","e","f"], weather_code: [0,0,0,0,0,0], temperature_2m_max: [1,2,3,4,5,6], temperature_2m_min: [0,0,0,0,0,0] },
    })));
    vi.stubGlobal("fetch", f);
    expect((await fetchWeather({ id: 1, name: "X", country: "Y", lat: 1, lon: 2 })).provider).toBe("Open-Meteo");
  });
});
