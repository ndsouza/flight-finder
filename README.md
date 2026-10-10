# Flight Finder

A responsive flight search and price tracker prototype. All itineraries and fares are sample data; there is no live flight API, booking, background polling, or email delivery.

## Run

Requires Node.js 22 or newer. No dependency installation is needed.

```sh
npm start
```

The server listens on port 3000 (override with `PORT`). Search by route, dates and passengers, filter by stops and budget, then save a target price. The Price trackers tab lets you simulate 12% fare drops and see alerts when a fare crosses your target. Trackers and alerts persist in this browser's local storage. Browser storage failure falls back to session-only operation.

Airlines, timings and prices are illustrative and are not route-accurate. Fonts use Google Fonts with local sans-serif fallbacks.

## Connecting real data

Live search needs approved access to a flight provider, a server-side API integration, and normalized itinerary results. Real alerts also need a database, scheduled fare checks, a notification provider, and user accounts/consent. Keep API credentials on the server.
