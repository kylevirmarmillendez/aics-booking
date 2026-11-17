# DSWD AICS Appointment Booking

Standalone Next.js app for the public DSWD Assistance to Individuals in Crisis Situations appointment booking flow.

## Features

- Select a DSWD office and review capacity information.
- Four-language data privacy notice (English, Filipino, Bisaya, Ilonggo), with acknowledgment required before continuing.
- Choose an assistance type and a date/time based on live booking rules, holidays, and office availability.
- Review assistance-type requirements, enter applicant details, and optionally scan supported National ID QR codes to prefill the name.
- Create a booking and download its confirmation image.
- Look up an existing booking by reference code and mobile number, and cancel eligible bookings.
- Responsive, accessible UI styled with DSWD colors and logo.

## Run locally

Requires Node.js 20+ and the AICS booking API running locally on port 8001.

1. Copy `.env.example` to `.env.local` if your API runs at a different address; set `BACKEND_API_URL` to the API origin.
2. Install dependencies with `npm install`.
3. Start the development server with `npm run dev` and open http://localhost:3000.
4. For production, run `npm run build`, then `npm start`.

The app proxies `/backend-api/*` to `${BACKEND_API_URL}/api/*`; browser requests use same-origin cookies and the API's CSRF token endpoint.

## Run with the API Compose stack

The API repository's `docker-compose.yml` includes this app as the `booking` service. From `aics-booking-api`, run `docker compose up --build -d` to start the API, database, staff client, and public booking app together. The booking app is available at http://localhost:3003 and uses the internal API service URL automatically. `API_PORT` and `BOOKING_PORT` can be overridden in the API `.env` file when their default host ports are already in use.

## Run this app in its own container

Start the API separately so it is reachable on host port 8011, then run `docker compose up --build -d` from this directory. The standalone app is published at http://localhost:3004 by default. It connects through `host.docker.internal`; set `BACKEND_API_URL` in `.env` to another API origin if needed, or change `BOOKING_PORT` to use a different local port.
