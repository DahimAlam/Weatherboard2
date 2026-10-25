# Prompt history

## 1. Phase 1 — Premium weather experience

# PROJECT: WEATHERBOARD — PREMIUM WEATHER EXPERIENCE

You are an elite product designer, award-winning UI/UX specialist, and senior React frontend engineer.

Build a visually extraordinary, production-quality weather application called **WeatherBoard** for a frontend developer hiring challenge.

This must NOT look like a generic SaaS dashboard, admin panel, beginner React project, or basic weather tutorial.

The design must feel like a premium consumer product created by a world-class design team.

## 1. DESIGN PHILOSOPHY — EXTREMELY IMPORTANT

Create a cinematic, immersive, visually memorable weather experience.

Design inspiration:
- Apple Weather — atmospheric immersion and beautiful weather presentation
- Linear — precision, typography, spacing, and polished interactions
- Vercel — modern visual sophistication
- Premium glassmorphism and editorial interface design
- Award-winning weather app concepts from Behance and Dribbble

Do not directly copy these products.

The interface should immediately impress a technical interviewer within the first 3 seconds.

Prioritize exceptional visual hierarchy, thoughtful composition, and sophisticated aesthetics.

## 2. VISUAL IDENTITY

Create a cohesive premium design system.

Color palette:
- Deep midnight navy: #071525
- Atmospheric blue: #123C69
- Electric sky blue: #59C3FF
- Soft cyan: #A7E8FF
- Warm sunlight gold: #FFD58A
- Frosted white: rgba(255,255,255,0.12)

Use rich atmospheric gradients, layered lighting, subtle glow effects, and tasteful translucent surfaces.

The overall interface should feel cinematic and alive, without becoming cluttered.

Typography:
- Use a modern font such as Inter, Geist, or Plus Jakarta Sans.
- Oversized temperature typography.
- Beautifully balanced headings.
- Precise spacing and consistent visual rhythm.
- Excellent readability and contrast.

## 3. LAYOUT — NOT A TRADITIONAL DASHBOARD

Create a distinctive, asymmetric, immersive layout.

Desktop composition:

HEADER:
- Minimal WeatherBoard logo with refined weather symbol
- Elegant city search with integrated search icon
- Current date and local time
- Compact unit and settings controls where appropriate

MAIN WEATHER HERO:
- Occupies the dominant visual area
- Large atmospheric gradient background
- Oversized temperature display (100–140px)
- Beautiful condition illustration or icon
- City and country displayed prominently
- Weather description and feels-like temperature
- Soft ambient lighting, atmospheric depth and subtle animation
- Premium rounded container with refined shadows

WEATHER DETAILS:
- Beautiful humidity, wind speed, and feels-like indicators
- Frosted glass surfaces
- Carefully designed icons
- Visually balanced layouts
- Avoid repetitive generic cards

FIVE-DAY FORECAST:
- Elegant horizontal forecast composition
- Distinct day labels
- Weather condition icons
- Minimum and maximum temperatures
- Refined interactive states
- Mobile-friendly presentation

FAVOURITE CITIES:
- Premium compact city cards
- Beautiful visual hierarchy
- Quick city switching
- Add/remove controls
- Empty state and maximum-five indicator

NOTIFICATION SETTINGS:
- Elegant settings interface
- Reminder enable control
- Morning reminder time selector
- Clear permission and support states

OFFLINE MODE:
- Refined offline banner
- Clear cached-weather indication

## 4. MOBILE EXPERIENCE

Mobile must feel like a beautiful native weather application, not a compressed desktop dashboard.

At 375px:
- Immersive vertical weather hero
- Large readable temperature
- Beautiful compact forecast layout
- Smooth spacing and touch interactions
- Accessible 44×44px minimum touch targets
- No horizontal page overflow

Also optimize at 768px and 1280px.

## 5. MICRO-INTERACTIONS

Use polished, lightweight interactions:
- Smooth 200–350ms transitions
- Subtle card elevation
- Beautiful search focus states
- Gentle weather atmosphere animation
- Refined loading skeletons
- Elegant error and empty states
- Smooth favourites interactions
- Respect prefers-reduced-motion

Avoid distracting animations and unnecessary heavy dependencies.

## 6. TECH STACK

Use:
- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui where useful
- Lucide icons
- Reusable functional components
- Clean React hooks

Client-side only.

Do not add Supabase, authentication, a database, or an unnecessary backend.

## 7. CORE FUNCTIONAL REQUIREMENTS

This project must ultimately support:

CITY SEARCH:
- GeoDB Cities API autocomplete
- Search suggestions within 300ms after typing pauses
- Loading, no-results, and error states
- Accessible keyboard interactions
- Validation on blur and submit

WEATHER:
- OpenWeatherMap primary API
- Open-Meteo fallback
- Real current temperature, humidity, wind speed, condition and icons
- Real five-day forecast
- Loading and actionable error states
- Never display fabricated data as live weather

FAVOURITES:
- Save up to five cities
- Persist using localStorage
- Confirmation before removing
- Graceful storage failure handling

PWA:
- Installable app
- Valid manifest
- 192px and 512px icons
- Service worker
- Cached app shell
- Last-viewed city weather available offline
- Visible offline mode banner

NOTIFICATIONS:
- Graceful notification permission explanation
- User-selected reminder time
- Clear unsupported and denied states
- Do not claim guaranteed daily notifications while the app is closed unless a real background scheduling and push delivery mechanism exists

## 8. IMPLEMENTATION PRIORITIES

IMPORTANT: Build in a disciplined sequence.

FIRST:
Create an exceptional visual foundation with fully responsive layout, reusable components, and premium interactions.

SECOND:
Implement real weather API integration and city autocomplete.

THIRD:
Implement favourites, validation and persistence.

FOURTH:
Implement PWA and notification functionality as technically feasible.

Do not sacrifice design quality by rushing to add every feature at once.

If credentials are unavailable, create clearly identified integration points and explain what is needed. Never silently replace real API requirements with hardcoded responses.

## 9. PROJECT STRUCTURE

Organize the application cleanly:

src/
- components/
- components/weather/
- components/search/
- components/favourites/
- components/settings/
- hooks/
- services/
- types/
- utils/

Keep components reusable and TypeScript types clear.

## 10. DOCUMENTATION

Create:
- README.md with setup, architecture, APIs, limitations and deployment instructions
- PROMPTS.md for the complete actual Lovable prompt history in chronological order

Record this master prompt as Prompt 1 in PROMPTS.md.

Do not invent later prompts.

## 11. STRICT QUALITY RULES

- No generic admin-dashboard layout
- No plain rectangular card grid as the entire design
- No boring white background with random blue cards
- No cluttered or inconsistent styling
- No fake weather presented as real
- No broken responsiveness
- No unnecessary dependencies
- No console errors
- No TypeScript build errors
- No horizontal overflow
- No misleading claims about background notifications

## 12. FINAL DESIGN STANDARD

Imagine this application is being reviewed by a senior product designer at Apple and a senior frontend engineer at Linear.

The design must feel deliberate, distinctive, elegant, and exceptionally polished.

Use cinematic atmospheric visuals, beautiful typography, sophisticated glass surfaces, and an immersive composition.

Make the user feel like they are experiencing the weather, not reading data from a spreadsheet.

**Your first priority is to deliver a visually extraordinary, fully responsive WeatherBoard interface with a maintainable React foundation.**

Start building now. Do not ask unnecessary questions. Make thoughtful design decisions and implement them confidently.

## 2. Phase 2 — Real weather API integration & city search

# PHASE 2 — REAL WEATHER API INTEGRATION & CITY SEARCH

You are a senior React and TypeScript engineer working on the EXISTING WeatherBoard project.

The premium UI has already been designed and approved. Your task is to make the application fully functional using real weather APIs.

**CRITICAL: Preserve the existing design exactly. Do not redesign the layout, colors, typography, hero, sidebar, weather cards, or animations.**

## 1. Inspect existing functionality first

Before writing code:
- Inspect the existing API services, React hooks, components, and TypeScript types.
- Determine whether Open-Meteo, OpenWeatherMap, or GeoDB are already integrated.
- Reuse working implementations instead of replacing them.
- Identify any hardcoded or mock weather values.
- Keep existing working functionality intact.

## 2. Weather API integration

Use OpenWeatherMap as the primary weather provider when a valid API key is configured.

Use Open-Meteo as the fallback if:
- No OpenWeatherMap key is configured.
- OpenWeatherMap rate-limits the request.
- The primary provider fails or is unavailable.

Requirements:
- Real current temperature.
- Real weather conditions and weather icon.
- Real feels-like temperature.
- Real humidity.
- Real wind speed.
- Real five-day forecast with daily minimum and maximum temperatures.
- Correct city name and country.
- Display the actual weather provider and last successful update time.

Use latitude and longitude for weather requests whenever possible.

Normalize provider responses into a shared TypeScript WeatherData interface.

Never mix temperatures or forecasts from different cities.

Never display hardcoded or fabricated weather values as live data.

## 3. City autocomplete — GeoDB Cities API

Integrate GeoDB Cities through RapidAPI when credentials are available.

Requirements:
- Trigger search after 300ms of typing inactivity.
- Display a dropdown with matching cities.
- Show city name, region, and country to distinguish duplicate names.
- Support mouse and keyboard selection.
- Arrow Up / Arrow Down to navigate.
- Enter to select.
- Escape to close.
- Accessible combobox/listbox behavior.
- Show loading feedback.
- Show clear no-results feedback.
- Show useful errors when the API fails.

Prevent stale requests from overwriting newer results using AbortController or an equivalent mechanism.

If GeoDB credentials are unavailable, do not pretend GeoDB is working. Clearly document the missing integration and optionally use a real, clearly identified fallback city-search provider.

## 4. Form validation

Validate on blur and submit.

Handle:
- Empty city input.
- Whitespace-only input.
- No matching city.
- Invalid city selection.
- Weather API failure.
- Network disconnection.
- Rate limiting.

Show specific, user-friendly inline error messages.

Examples:
- "Enter a city name to search."
- "No matching cities found. Try a different spelling."
- "Weather data is temporarily unavailable. Please retry."
- "You're offline. Showing the last saved weather, if available."

Avoid generic "Something went wrong" messages.

## 5. Async state management

Every API request must support:
- Loading
- Success
- Empty
- Error

Use clean reusable hooks and service functions.

Prevent duplicate requests and unnecessary rerenders.

Preserve the last successfully loaded weather when a refresh fails, while clearly showing that the displayed data may be outdated.

Do not show a successful "Live" status for stale or cached data.

## 6. Weather UI binding

Connect real weather data to the existing UI:
- Hero temperature.
- City and country.
- Condition description.
- Weather icon.
- Feels-like temperature.
- Humidity.
- Wind speed.
- Five-day forecast.

Keep the existing atmospheric visual design.

If weather-specific backgrounds already exist, ensure they match the actual weather condition rather than a hardcoded city.

Ensure the Celsius/Fahrenheit toggle converts displayed temperature values correctly without requiring a page reload.

## 7. Security

- Do not hardcode API keys.
- Use Vite environment variables for public client-side API configuration.
- Explain that VITE_ variables are exposed in the browser and are not suitable for secrets.
- Do not add a backend unless explicitly requested.
- Do not commit .env.local.

## 8. Testing

Test these scenarios:
1. Search for London.
2. Search for Karachi.
3. Search for Tokyo.
4. Search for a nonexistent city.
5. Submit an empty input.
6. Simulate API failure.
7. Rapidly change search queries.
8. Switch Celsius and Fahrenheit.
9. Check the five-day forecast.
10. Verify responsive layouts remain unchanged.

Run the available TypeScript, lint, and build checks.

Fix all introduced errors.

## 9. Documentation

Append this Phase 2 prompt to PROMPTS.md in chronological order.

Do not overwrite the previous Lovable prompt history.

Update README.md with:
- API providers.
- Required configuration.
- Fallback behavior.
- Known limitations.

## 10. Final deliverables

At the end, report:
- Which APIs are actually working.
- Whether OpenWeatherMap and GeoDB credentials are configured.
- Which features are complete.
- Which features require credentials.
- Files modified.
- Test results.
- Remaining issues.

**Implement Phase 2 only. Do not start PWA, notifications, or additional redesign work.**

Begin by auditing the existing implementation, then implement and verify the missing functionality.