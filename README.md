# SkySafe screens (MUI)

A Vite + React (JavaScript) + Material UI version of the SkySafe **Flight Map** and **Dashboard** screens. Both run on built-in sample data (made-up serials, tracks and counts). Switch screens with the Dashboard / Flight Map links in the top nav.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## What's included

| Area | Component |
| --- | --- |
| Top nav (links, Regions menu, Alerts badge, user menu with Auto/Dark/Light theme) | `TopNav.jsx` |
| Leaflet map with satellite/streets/dark base maps, flight tracks, drone and home markers, scale, right-click to copy coordinates | `FlightMap.jsx` |
| Floating controls: time filter pill, Search, Ruler, Settings, "N Flights" | `MapControls.jsx` |
| Detections list with expanded summary (Details / Focus) and CSV export | `DetectionsPanel.jsx` |
| Filters: time presets, affiliation, manufacturer, model include/exclude, height (MSL/HAT), weight | `FiltersPanel.jsx` |
| Flight Details: toolbar (summary, download, history, watch, playback, altitude, data table) and Identification / Classification / Flight Information / Data & Tracking sections | `FlightDetailsPanel.jsx` |
| Last Update card with deltas | `LastUpdateCard.jsx` |
| Altitude Profile chart (HAT/MSL) with a scrubber | `AltitudeProfile.jsx` |
| Search and Data Points dialogs | `Dialogs.jsx` |

### Dashboard (`src/components/dashboard/`)

| Area | Component |
| --- | --- |
| Region / period / affiliation filters, Export to PDF, generated + time-range header | `DashboardPage.jsx` |
| Total, Suspect, Hostile flights and Alert Zone Triggers, each with change vs the previous period | `StatCard.jsx` |
| Flights per Day, current vs previous, line or bar | `FlightsPerDayChart.jsx` |
| Weekly activity heatmap (weekday x hour) with a sequential legend | `WeeklyHeatmap.jsx` |
| Takeoff hotspots on a satellite map | `HotspotsMap.jsx` |
| Top Flight Tags / Drone Models / Target Affiliations as pie, bar or current-vs-previous, with a table view | `BreakdownCard.jsx` |
| Most Active Drones ranked bar chart | `MostActiveDrones.jsx` |
| Card shell, section headings and the "No data available" state | `Panel.jsx` |

Chart colors come from `palette.series` in the theme — an eight-hue categorical set checked for color-blind separation in both light and dark mode. Breakdowns cap at seven categories plus "Other".

Theme tokens are in `src/theme/theme.js`. Sample data comes from `src/data/flights.js`. To use real data, replace `generateFlights()` with an API call that returns the same shape (`{ model, manufacturer, serial, protocol, affiliation, home, points: [{ t, lat, lng, msl, hat, speed, rssi }], ... }`).

Screens narrower than the `md` breakpoint get a bottom-sheet layout.

### Alerts (`src/components/alerts/`)

| Area | Component |
| --- | --- |
| Section shell with the Recent Activity / Triggers / Watched Drones sidebar and the admin Notifications Center | `AlertsPage.jsx` |
| Alert feed with Trigger/Watch chips, affiliation dot, source and model, filters and Refresh | `RecentActivityPage.jsx` |
| Searchable, paginated trigger list | `TriggersPage.jsx` |
| Trigger detail: zone map plus the Historical Alerts table | `TriggerDetailPage.jsx` |
| Watched drones table with per-row Email/SMS switches, status and row actions | `WatchedDronesPage.jsx` |
| Notifications Center: Overview KPIs and charts, Activity Log, Subscribers | `NotificationsCenterPage.jsx` |
| Shared chips, affiliation dot and page heading | `AlertsCommon.jsx` |

Mock data lives in `src/data/alerts.js` — alerts, triggers, watched drones, delivery
statistics and subscribers are all generated locally; subscriber names, emails and
phone numbers are invented.
