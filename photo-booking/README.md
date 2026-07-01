# Photo Booking

A small, self-hosted booking page for photo session time slots. The photographer creates an "event" (e.g. a company's photo day), generates time slots for it, and gets a shareable link. Clients open that link, pick an open slot, and book themselves in — with an option to add the appointment straight to their phone/calendar as a reminder. The photographer manages events, slots, and bookings from a password-protected admin page.

## Requirements

- Node.js 18+

## Install & run

```bash
cd photo-booking
npm install
cp .env.example .env   # then edit .env and set your own ADMIN_PASSWORD
npm start
```

The server starts on `http://localhost:3000` (change with `PORT` in `.env`).

- Admin page: `http://localhost:3000/admin.html`
- Client booking page for a given event: `http://localhost:3000/?event=<slug>` (the admin page gives you this link with a copy button per event — there's no single "the" booking page, each event has its own link).

Use `npm run dev` instead of `npm start` to auto-restart on file changes while developing.

## Using it

1. Open `/admin.html`, enter the admin password (from `.env`).
2. Create an event (e.g. the client company's name). This generates a shareable booking link for that event.
3. Open the event's management view and generate slots: pick a date, a start time, an end time, and how long each session should take (in minutes) — the system splits that range into back-to-back slots automatically. Repeat for other days as needed.
4. Copy the event's link and send it to clients. They'll see open slots grouped by date, pick one, fill in their name and contact info, and confirm — after booking, they can add the appointment to their calendar (download an .ics file, or add directly to Google Calendar) so they get a reminder. There's also a "מי כבר נרשם" (who already signed up) tab so clients can see who else booked and when — it only shows name/date/time/department, never contact info.
5. Booked slots disappear from the public page automatically. Check the event's bookings table in the admin page to see who booked what, and tick the "הגיע/ה" (attended) checkbox once someone has actually shown up for their session.

## Sharing a public link quickly (no deployment)

If you just need a link to send out for a few days without deploying anywhere:

```bash
npx ngrok http 3000
```

This gives you a temporary public URL that tunnels to your local server. Keep the server and the tunnel running while clients are booking.

## Deploying for a permanent link

For a real hosted URL, deploy `photo-booking/` to a Node-friendly host such as Render or Railway:

- Set the service's root directory to `photo-booking` (since it lives in a subfolder of this repo).
- Set the `ADMIN_PASSWORD` (and optionally `PORT`) environment variable in the host's dashboard.
- **Known limitation**: this app stores data in a local SQLite file (`data/booking.db`). On most hosts, the filesystem is reset on every redeploy unless you attach a persistent disk/volume (Render and Railway both offer this on some plans). Without one, redeploying will wipe existing slots/bookings — for an MVP, the pragmatic fix is to just re-add slots after a redeploy, or attach a persistent volume if you need it to survive deploys.
