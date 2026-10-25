import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bell, Cloud, CloudFog, CloudLightning, CloudRain, CloudSun, Droplets, Heart, Loader2,
  MapPin, Moon, Plus, Search, Snowflake, Sun, Thermometer, Wind, WifiOff, X, AlertTriangle,
} from "lucide-react";
import sky from "@/assets/sky.jpg";
import {
  cacheWeather, describe, fetchWeather, readCache, searchCities, toUnit,
  type City, type Kind, type Weather,
} from "@/lib/weather";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WeatherBoard — Premium weather, beautifully told" },
      { name: "description", content: "Live conditions, five-day forecast and favourite cities in an immersive weather experience." },
      { property: "og:title", content: "WeatherBoard" },
      { property: "og:description", content: "Live conditions, five-day forecast and favourite cities." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const DEFAULT: City = { id: 2643743, name: "London", country: "United Kingdom", lat: 51.5085, lon: -0.1257 };
const FAV_KEY = "wb:favs";
const MAX_FAVS = 5;

function WIcon({ kind, isDay = true, className }: { kind: Kind; isDay?: boolean; className?: string | undefined }) {
  const map = {
    clear: isDay ? Sun : Moon, partly: CloudSun, cloudy: Cloud, fog: CloudFog,
    rain: CloudRain, snow: Snowflake, storm: CloudLightning,
  } as const;
  const I = map[kind];
  const tone = kind === "clear" && isDay ? "text-sun" : kind === "partly" ? "text-sun" : "text-cyan";
  return <I className={`${tone} ${className ?? ""}`} strokeWidth={1.5} aria-hidden />;
}

function Index() {
  const [unit, setUnit] = useState<"C" | "F">("C");
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [fromCache, setFromCache] = useState(false);
  const [favs, setFavs] = useState<City[]>([]);
  const [storageError, setStorageError] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  const reqId = useRef(0);
  const lastCity = useRef<City>(DEFAULT);
  const load = useCallback(async (city: City) => {
    const id = ++reqId.current;
    lastCity.current = city;
    setLoading(true);
    setError(null);
    try {
      const w = await fetchWeather(city);
      if (id !== reqId.current) return; // a newer request won
      setWeather(w);
      setFromCache(false);
      cacheWeather(w);
    } catch (e) {
      if (id !== reqId.current) return;
      const c = readCache();
      if (c && c.city.id === city.id) {
        setWeather(c);
        setFromCache(true);
      }
      setError(errorMessage(e));
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30000);
    setOffline(!navigator.onLine);
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    try {
      setFavs(JSON.parse(localStorage.getItem(FAV_KEY) ?? "[]"));
    } catch {
      setStorageError(true);
    }
    const cached = readCache();
    if (cached) setWeather(cached), setFromCache(true);
    load(cached?.city ?? DEFAULT);
    return () => {
      clearInterval(t);
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, [load]);

  const saveFavs = (next: City[]) => {
    setFavs(next);
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify(next));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  };

  const isFav = weather ? favs.some((f) => f.id === weather.city.id) : false;
  const d = weather ? describe(weather.current.code) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-5 sm:px-6 lg:px-8">
      {offline && (
        <div role="status" className="glass mb-4 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm">
          <WifiOff className="size-4 text-sun" />
          You're offline — showing the last weather we saved{weather ? ` for ${weather.city.name}` : ""}.
        </div>
      )}

      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="grid size-10 place-items-center rounded-xl bg-primary/15 shadow-glow">
              <CloudSun className="size-5 text-primary" strokeWidth={1.75} />
            </div>
            <span className="text-lg font-semibold tracking-tight">WeatherBoard</span>
          </div>
          <UnitToggle unit={unit} setUnit={setUnit} className="md:hidden" />
        </div>
        <CitySearch onSelect={load} />
        <div className="hidden items-center gap-5 md:flex">
          {now && (
            <div className="text-right text-sm leading-tight">
              <div className="font-medium">{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
              <div className="text-muted-foreground">{now.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}</div>
            </div>
          )}
          <UnitToggle unit={unit} setUnit={setUnit} />
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {/* HERO */}
          <section className="relative isolate min-h-[440px] overflow-hidden rounded-[2rem] border border-border shadow-glow">
            <img src={sky} alt="" width={1600} height={912} className="animate-drift absolute inset-0 -z-10 size-full object-cover" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-midnight via-midnight/40 to-transparent" />
            {error && !weather ? (
              <div className="flex min-h-[440px] flex-col items-center justify-center gap-4 p-8 text-center">
                <AlertTriangle className="size-10 text-sun" />
                <p className="max-w-sm text-muted-foreground">{error}</p>
                <button onClick={() => load(DEFAULT)} className="min-h-11 rounded-full bg-primary px-6 font-medium text-primary-foreground">Try again</button>
              </div>
            ) : !weather ? (
              <div className="flex min-h-[440px] flex-col justify-end gap-4 p-8">
                <div className="h-28 w-56 animate-pulse rounded-2xl bg-glass-strong" />
                <div className="h-6 w-40 animate-pulse rounded-lg bg-glass-strong" />
              </div>
            ) : (
              <div className="flex min-h-[440px] flex-col justify-between gap-8 p-6 sm:p-10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="size-4" /> {weather.city.admin ? `${weather.city.admin}, ` : ""}{weather.city.country}
                    </div>
                    <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{weather.city.name}</h1>
                  </div>
                  <button
                    aria-label={isFav ? "Saved to favourites" : "Add to favourites"}
                    disabled={!isFav && favs.length >= MAX_FAVS}
                    onClick={() => !isFav && saveFavs([...favs, weather.city])}
                    className="glass grid size-11 place-items-center rounded-full transition hover:scale-105 disabled:opacity-40"
                  >
                    <Heart className={`size-5 ${isFav ? "fill-sun text-sun" : ""}`} />
                  </button>
                </div>
                <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="text-[96px] font-extralight leading-none tracking-tighter sm:text-[136px]">
                      {toUnit(weather.current.temp, unit)}°
                    </div>
                    <div className="mt-2 text-2xl font-medium">{d!.label}</div>
                    <div className="text-muted-foreground">Feels like {toUnit(weather.current.feels, unit)}°</div>
                  </div>
                  <WIcon kind={d!.kind} isDay={weather.current.isDay} className="animate-floaty size-28 drop-shadow-2xl sm:size-36" />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {loading ? <Loader2 className="size-3 animate-spin" /> : <span className={`size-1.5 rounded-full ${fromCache ? "bg-sun" : "bg-primary"}`} />}
                  {fromCache ? "Saved data" : "Live"} · updated {new Date(weather.fetchedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · Open-Meteo
                </div>
              </div>
            )}
          </section>

          {/* DETAILS */}
          {weather && (
            <section className="grid gap-3 sm:grid-cols-3">
              <Metric icon={Droplets} label="Humidity" value={`${weather.current.humidity}%`} bar={weather.current.humidity} />
              <Metric icon={Wind} label="Wind" value={`${Math.round(weather.current.wind)} km/h`} bar={Math.min(100, weather.current.wind * 2)} />
              <Metric icon={Thermometer} label="Feels like" value={`${toUnit(weather.current.feels, unit)}°${unit}`} bar={Math.min(100, Math.max(0, (weather.current.feels + 10) * 2))} />
            </section>
          )}

          {/* FORECAST */}
          {weather && (
            <section className="glass rounded-3xl p-5">
              <h2 className="mb-4 text-sm font-medium text-muted-foreground">Next 5 days</h2>
              <div className="grid grid-cols-5 gap-2">
                {weather.daily.map((day) => {
                  const k = describe(day.code);
                  return (
                    <div key={day.date} className="lift flex flex-col items-center gap-3 rounded-2xl px-1 py-4 text-center" title={k.label}>
                      <span className="text-sm font-medium">
                        {new Date(day.date + "T12:00").toLocaleDateString([], { weekday: "short" })}
                      </span>
                      <WIcon kind={k.kind} className="size-8" />
                      <div className="leading-tight">
                        <div className="text-lg font-medium">{toUnit(day.max, unit)}°</div>
                        <div className="text-sm text-muted-foreground">{toUnit(day.min, unit)}°</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-5">
          <Favourites
            favs={favs}
            activeId={weather?.city.id}
            storageError={storageError}
            onPick={load}
            onAdd={() => weather && !isFav && favs.length < MAX_FAVS && saveFavs([...favs, weather.city])}
            canAdd={!!weather && !isFav && favs.length < MAX_FAVS}
            onRemove={(id) => saveFavs(favs.filter((f) => f.id !== id))}
          />
          <Reminders />
        </aside>
      </div>
    </div>
  );
}

function UnitToggle({ unit, setUnit, className }: { unit: "C" | "F"; setUnit: (u: "C" | "F") => void; className?: string | undefined }) {
  return (
    <div className={`glass flex rounded-full p-1 ${className ?? ""}`} role="group" aria-label="Temperature unit">
      {(["C", "F"] as const).map((u) => (
        <button
          key={u}
          onClick={() => setUnit(u)}
          aria-pressed={unit === u}
          className={`size-9 rounded-full text-sm font-medium transition ${unit === u ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          °{u}
        </button>
      ))}
    </div>
  );
}

function Metric({ icon: I, label, value, bar }: { icon: typeof Wind; label: string; value: string; bar: number }) {
  return (
    <div className="glass lift rounded-3xl p-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <I className="size-4 text-cyan" /> {label}
      </div>
      <div className="mt-3 text-3xl font-light tracking-tight">{value}</div>
      <div className="mt-4 h-1 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-gradient-to-r from-primary to-cyan transition-all duration-500" style={{ width: `${bar}%` }} />
      </div>
    </div>
  );
}

function CitySearch({ onSelect }: { onSelect: (c: City) => void }) {
  const [q, setQ] = useState("");
  const [res, setRes] = useState<City[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "error" | "done">("idle");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const ctrl = useRef<AbortController | null>(null);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setRes([]);
      setState("idle");
      return;
    }
    const t = setTimeout(async () => {
      ctrl.current?.abort();
      ctrl.current = new AbortController();
      setState("loading");
      try {
        const r = await searchCities(term, ctrl.current.signal);
        setRes(r);
        setActive(0);
        setState("done");
      } catch (e) {
        if ((e as Error).name !== "AbortError") setState("error");
      }
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const pick = (c: City) => {
    onSelect(c);
    setQ("");
    setOpen(false);
    setHint(null);
  };

  const validate = () => {
    const t = q.trim();
    if (t && t.length < 2) setHint("Type at least 2 letters.");
    else if (t && /[^\p{L}\s'.-]/u.test(t)) setHint("City names use letters only.");
    else setHint(null);
  };

  return (
    <form
      className="relative w-full md:max-w-md"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        validate();
        if (res[active]) pick(res[active]);
        else if (q.trim().length >= 2 && state === "done") setHint("No matching city — try another spelling.");
      }}
    >
      <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={q}
        onChange={(e) => (setQ(e.target.value), setOpen(true), setHint(null))}
        onFocus={() => setOpen(true)}
        onBlur={() => (setTimeout(() => setOpen(false), 150), validate())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") e.preventDefault(), setActive((a) => Math.min(a + 1, res.length - 1));
          if (e.key === "ArrowUp") e.preventDefault(), setActive((a) => Math.max(a - 1, 0));
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder="Search a city…"
        aria-label="Search city"
        aria-invalid={!!hint}
        role="combobox"
        aria-expanded={open && res.length > 0}
        aria-controls="city-list"
        className="glass h-12 w-full rounded-full pl-11 pr-10 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/60 focus:ring-4 focus:ring-primary/15"
      />
      {state === "loading" && <Loader2 className="absolute right-4 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
      {hint && <p className="mt-1.5 pl-4 text-xs text-destructive">{hint}</p>}
      {open && q.trim().length >= 2 && state !== "loading" && state !== "idle" && (
        <ul id="city-list" role="listbox" className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-popover p-1.5 shadow-glow">
          {state === "error" && <li className="px-4 py-3 text-sm text-muted-foreground">Search is unavailable right now.</li>}
          {state === "done" && res.length === 0 && <li className="px-4 py-3 text-sm text-muted-foreground">No cities found.</li>}
          {res.map((c, i) => (
            <li key={c.id} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(c)}
                className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm transition ${i === active ? "bg-accent" : "hover:bg-muted"}`}
              >
                <MapPin className="size-4 text-primary" />
                <span className="font-medium">{c.name}</span>
                <span className="truncate text-muted-foreground">{[c.admin, c.country].filter(Boolean).join(", ")}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}

function Favourites(p: {
  favs: City[]; activeId?: number | string | undefined; storageError: boolean; canAdd: boolean;
  onPick: (c: City) => void; onAdd: () => void; onRemove: (id: number | string) => void;
}) {
  const [confirm, setConfirm] = useState<number | string | null>(null);
  return (
    <section className="glass rounded-3xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-medium">Favourite cities</h2>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">{p.favs.length}/{MAX_FAVS}</span>
      </div>
      {p.storageError && <p className="mb-3 text-xs text-destructive">Favourites can't be saved on this device.</p>}
      {p.favs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          <Heart className="mx-auto mb-2 size-6" /> Save up to five cities for quick switching.
        </div>
      ) : (
        <ul className="space-y-2">
          {p.favs.map((c) => (
            <li key={c.id} className={`flex items-center gap-2 rounded-2xl border p-1.5 transition ${p.activeId === c.id ? "border-primary/50 bg-primary/10" : "border-transparent bg-muted"}`}>
              {confirm === c.id ? (
                <div className="flex w-full items-center justify-between gap-2 pl-3 text-sm">
                  Remove {c.name}?
                  <div className="flex gap-1">
                    <button onClick={() => setConfirm(null)} className="min-h-11 rounded-xl px-3 hover:bg-accent">Keep</button>
                    <button onClick={() => (p.onRemove(c.id), setConfirm(null))} className="min-h-11 rounded-xl bg-destructive/20 px-3 text-destructive">Remove</button>
                  </div>
                </div>
              ) : (
                <>
                  <button onClick={() => p.onPick(c)} className="flex min-h-11 flex-1 flex-col justify-center rounded-xl px-3 text-left">
                    <span className="text-sm font-medium">{c.name}</span>
                    <span className="text-xs text-muted-foreground">{c.country}</span>
                  </button>
                  <button aria-label={`Remove ${c.name}`} onClick={() => setConfirm(c.id)} className="grid size-11 place-items-center rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground">
                    <X className="size-4" />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      <button onClick={p.onAdd} disabled={!p.canAdd} className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-border text-sm transition hover:bg-accent disabled:opacity-40">
        <Plus className="size-4" /> {p.favs.length >= MAX_FAVS ? "Maximum of five reached" : "Add current city"}
      </button>
    </section>
  );
}

function Reminders() {
  const [support, setSupport] = useState<"unknown" | "unsupported" | NotificationPermission>("unknown");
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState("07:30");

  useEffect(() => {
    setSupport("Notification" in window ? Notification.permission : "unsupported");
    try {
      const s = JSON.parse(localStorage.getItem("wb:remind") ?? "null");
      if (s) setEnabled(s.enabled), setTime(s.time);
    } catch {}
  }, []);

  const persist = (e: boolean, t: string) => {
    try { localStorage.setItem("wb:remind", JSON.stringify({ enabled: e, time: t })); } catch {}
  };

  const toggle = async () => {
    if (!enabled && support === "default") {
      const r = await Notification.requestPermission();
      setSupport(r);
      if (r !== "granted") return;
    }
    if (!enabled && support === "denied") return;
    setEnabled(!enabled);
    persist(!enabled, time);
  };

  return (
    <section className="glass rounded-3xl p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-sun/15"><Bell className="size-5 text-sun" /></div>
          <div>
            <h2 className="font-medium">Morning reminder</h2>
            <p className="text-xs text-muted-foreground">A nudge to check the day's weather</p>
          </div>
        </div>
        <button
          role="switch"
          aria-checked={enabled}
          aria-label="Enable morning reminder"
          disabled={support === "unsupported" || support === "denied"}
          onClick={toggle}
          className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:opacity-40 ${enabled ? "bg-primary" : "bg-accent"}`}
        >
          <span className={`absolute top-1 size-5 rounded-full bg-foreground transition-all ${enabled ? "left-6" : "left-1"}`} />
        </button>
      </div>
      <label className="mt-4 flex items-center justify-between rounded-2xl bg-muted px-4 py-2 text-sm">
        Reminder time
        <input type="time" value={time} disabled={!enabled} onChange={(e) => (setTime(e.target.value), persist(enabled, e.target.value))} className="min-h-9 rounded-lg bg-transparent text-right outline-none [color-scheme:dark] disabled:opacity-50" />
      </label>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        {support === "unsupported" && "This browser doesn't support notifications."}
        {support === "denied" && "Notifications are blocked. Allow them in your browser settings to turn this on."}
        {(support === "default" || support === "granted" || support === "unknown") &&
          "Reminders appear while WeatherBoard is open in a tab. Daily delivery when the app is closed isn't guaranteed."}
      </p>
    </section>
  );
}
