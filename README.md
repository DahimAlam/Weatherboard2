# WeatherBoard

A premium, cinematic weather experience built as a frontend hiring challenge.

Live conditions, a five-day forecast, favourite cities, PWA install, and morning reminders — all wrapped in an immersive glassmorphism interface.

---

## Features

| Feature | Detail |
|---|---|
| 🌤 Live weather | Temperature, feels-like, humidity, wind speed + condition |
| 📅 5-day forecast | Daily high/low with WMO-mapped weather icons |
| 🔍 City autocomplete | GeoDB Cities (primary) or Open-Meteo Geocoding (fallback), 300 ms debounce |
| ❤️ Favourite cities | Up to 5 cities persisted in localStorage, confirm-before-remove |
| 📲 PWA | Installable, app-shell offline cache, SW runtime cache for weather APIs |
| 🔔 Morning reminder | Configurable time, fires while the tab is open |
| 🌡 °C / °F toggle | Instant conversion, no reload |
| 📡 Offline mode | Banner + cached last-viewed city shown when network is lost |

---

## Tech Stack

- **React 19** + **TypeScript 5**
- **TanStack Start** (SSR-capable file-based routing via TanStack Router)
- **Vite 8** with `@lovable.dev/vite-tanstack-config`
- **Tailwind CSS v4** — custom design tokens, glassmorphism utilities
- **shadcn/ui** (Radix primitives) + **Lucide** icons
- **Vitest** for unit tests

---

## Quick Start

```sh
# Clone the repo
git clone <repository-url>
cd Weatherboard2

# Install dependencies (project uses bun.lock; bun or npm both work)
bun install        # preferred
# or: npm install

# Start dev server
bun run dev
# or: npm run dev
```

Open `http://localhost:3000`.

---

## Environment Variables

Create a `.env.local` file in the project root (this file is git-ignored — **never commit it**):

```env
VITE_OPENWEATHER_API_KEY=your_owm_key_here
VITE_GEODB_API_KEY=your_geodb_rapidapi_key_here
```

> **Security note:** `VITE_` variables are bundled into the browser bundle and are visible to anyone. Use restricted free-tier keys only, never server-side secrets.

Both variables are optional — the app runs entirely on free, keyless APIs if neither is set:

| Variable | Provider | Used for |
|---|---|---|
| `VITE_OPENWEATHER_API_KEY` | [OpenWeatherMap](https://openweathermap.org/api) | Primary weather + forecast |
| `VITE_GEODB_API_KEY` | [GeoDB Cities via RapidAPI](https://rapidapi.com/wirefreethought/api/geodb-cities) | Primary city autocomplete |

---

## API Providers & Fallback Logic

### Weather

1. **OpenWeatherMap** — used when `VITE_OPENWEATHER_API_KEY` is set. Fetches `/data/2.5/weather` (current) and `/data/2.5/forecast` (3-hourly, aggregated to daily).
2. **Open-Meteo** — free, no key required. Automatically used when the OWM key is absent, OWM returns HTTP 429 (rate-limited), or OWM is otherwise unavailable.

The active provider and last update time are shown at the bottom of the weather hero.

### City Search

1. **GeoDB Cities** (`wft-geo-db.p.rapidapi.com`) — used when `VITE_GEODB_API_KEY` is set. Returns population-sorted results.
2. **Open-Meteo Geocoding** — free fallback. Automatically used when the GeoDB key is absent.

Searches are debounced at 300 ms. Stale in-flight requests are cancelled via `AbortController`.

---

## PWA

WeatherBoard is installable as a Progressive Web App.

- **Manifest:** `/manifest.json` — `display: standalone`, theme `#071525`
- **Icons:** `/icon-192.svg` (192×192), `/icon-512.svg` (512×512) — CloudSun branding on midnight navy
- **Service Worker:** `/sw.js` — hand-written Workbox-style SW
  - App shell cached on install (HTML, manifest, icons, favicon)
  - Weather API responses cached with NetworkFirst (1 h TTL via cache size rotation)
  - Google Fonts cached with StaleWhileRevalidate
  - Navigation requests fall back to cached `/` for offline use

To install: open the app in Chrome or Edge and click the install icon in the address bar.

---

## Notifications

WeatherBoard includes a morning reminder feature:

- Tap the toggle in the **Morning reminder** card to enable. The browser will prompt for notification permission on first enable.
- Pick a reminder time with the time picker.
- **While the tab is open**, a browser notification fires at the configured time.
- **When the tab is closed**, notifications cannot be delivered — the app has no push server. This limitation is disclosed in the UI.

Permission states handled: `unsupported`, `default` (prompt), `granted`, `denied` (with instructions to re-enable in browser settings).

---

## Architecture

```
src/
├── lib/
│   ├── weather.ts          # All API logic: OWM, Open-Meteo, GeoDB, caching, error types
│   └── weather.test.ts     # Unit tests: fallback logic, unit conversion, OWM→WMO mapping
├── routes/
│   ├── __root.tsx          # HTML shell, SW registration, manifest link, error boundary
│   └── index.tsx           # Main page: CitySearch, weather hero, forecast, Favourites, Reminders
├── styles.css              # Tailwind v4 tokens, glass/glow/lift utilities, keyframe animations
└── assets/
    └── sky.jpg             # Hero background image
public/
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── icon-192.svg            # PWA icon 192×192
├── icon-512.svg            # PWA icon 512×512
└── favicon.ico             # Browser tab icon
```

---

## Known Limitations

- **OWM free forecast is 3-hourly**: daily min/max are aggregated by iterating the 40 three-hourly slots and taking the local-timezone date boundary. Edge timezone cases may cause ±1 day drift.
- **GeoDB free tier rate-limit**: ~1 request/second. Rapid typing is debounced (300 ms) and stale requests are aborted to stay within limits.
- **Notifications are tab-only**: There is no push server or Service Worker push event. Reminders only fire while WeatherBoard is open in a browser tab.
- **SW cache invalidation**: The hand-written SW uses named cache buckets (`wb-shell-v1`, `wb-api-v1`). Increment the version string in `public/sw.js` on each deploy that changes static assets.

---

## Scripts

```sh
bun run dev          # Start development server
bun run build        # Production build
bun run preview      # Preview production build locally
bun run test         # Run Vitest unit tests
bun run lint         # ESLint
bun run format       # Prettier
```

---

## Deployment

The project uses TanStack Start with a Nitro server adapter (Cloudflare by default via `@lovable.dev/vite-tanstack-config`). Deploy by running `bun run build` and serving the output, or connect the repository to [Lovable](https://lovable.dev) for one-click deployment.
