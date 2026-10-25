# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## WeatherBoard — data providers

| Purpose | Primary | Fallback |
|---|---|---|
| Weather (current + 5-day) | OpenWeatherMap (`VITE_OPENWEATHER_API_KEY`) | Open-Meteo (no key) |
| City autocomplete | GeoDB Cities via RapidAPI (`VITE_GEODB_API_KEY`) | Open-Meteo Geocoding (no key) |

Configure in `.env.local` (git-ignored, never commit):

```
VITE_OPENWEATHER_API_KEY=...
VITE_GEODB_API_KEY=...
```

`VITE_` variables are bundled into the browser and visible to anyone — they are not secrets. Use restricted/free-tier keys only.

**Fallback:** weather uses OpenWeatherMap when a key exists and falls back to Open-Meteo when the key is missing, the request fails, or it is rate-limited (429). The provider and last update time are shown in the hero. The last successful result is cached locally and shown, marked "Saved data — may be outdated", when a refresh fails or you're offline.

**Known limitations:** OpenWeatherMap's free forecast is 3-hourly, so daily min/max are aggregated from it. GeoDB's free tier allows ~1 request/second; rapid typing is debounced (300 ms) and stale requests are aborted. Without keys, the app runs fully on Open-Meteo.
