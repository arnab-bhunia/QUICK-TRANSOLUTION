MERN Recreation

A single-page recreation of sugamgroup.com built on the MERN stack (MongoDB,
Express, React, Node), with the company branding and color theme fully
separated from the code so either can be changed without touching a single
component.

## Structure

```
client/   React frontend (Vite)
server/   Express + MongoDB backend
```

## Rebranding: change the company name or colors

Everything brand-specific lives in two files:

- **`client/src/config/site.js`** — company name, tagline, contact info,
  nav links, hero copy, services, testimonials, sectors, footer links.
  Change the company name once here and it updates everywhere (nav, footer,
  newsletter copy, etc).
- **`client/src/config/theme.js`** — every color and font as a named
  token (`primary`, `accent`, `signal`, fonts, radii, shadows). Edit a hex
  value here and the whole site re-themes, since every component reads
  colors through CSS variables (`var(--color-primary)`) rather than
  hard-coded hex values.

No component file needs to change for a rebrand.

## Frontend (`client/`)

Built with React + Vite, plain CSS (no framework) for full control over the
distinctive visual direction: a freight-navy / amber palette, Barlow
Condensed display type, and an animated route-map in the hero that draws
itself in on load and pulses along the India–Nepal–Bhutan–Bangladesh
network — tying the visual language directly to the business.

```bash
cd client
npm install
cp .env.example .env      # point at your backend if not localhost:5000
npm run dev                # http://localhost:5173
npm run build               # production build to client/dist
```

Sections included on the single page: top utility bar, sticky nav with
mobile menu, hero, animated stats strip, services grid, an interactive
"Why Choose Us" tabbed panel, testimonials carousel, key sectors, a
newsletter signup wired to the API, footer, a floating contact rail, and a
"Get a Quote" modal wired to the API.

## Backend (`server/`)

Express + Mongoose, with `/api/quotes` (POST to submit a quote request, GET
to list them) and `/api/newsletter` (POST to subscribe).

```bash
cd server
npm install
cp .env.example .env       # set MONGODB_URI to your MongoDB instance
npm run dev                 # http://localhost:5000, auto-restarts on change
npm start                   # production
```

The server starts accepting requests immediately and connects to MongoDB in
the background, so a slow or temporarily unreachable database doesn't block
the whole API — requests that touch the database will simply error until
the connection is up.

### Endpoints

| Method | Path              | Body                                                                 |
|--------|-------------------|-----------------------------------------------------------------------|
| GET    | `/api/health`     | —                                                                     |
| POST   | `/api/quotes`     | `{ name, company, contact, email, origin, destination, weight }`     |
| GET    | `/api/quotes`     | — (latest 200)                                                        |
| POST   | `/api/newsletter` | `{ name, email, mobile }`                                             |

## Notes on what's implemented vs. simplified from the source site

This first pass focused on making the frontend polished and complete, as
requested. A few things from the original WordPress site were intentionally
simplified for a cleaner MERN single-page rebuild:

- The many separate sub-pages (About, each service, each industry, careers,
  CSR, etc.) are not recreated as separate routes — this is a single page.
  If you want some of them as real routes later, adding React Router is a
  small follow-up.
- The half-dozen popup forms on the original (feedback survey, brochure
  download, complaint form, etc.) are consolidated into one "Get a Quote"
  modal and the newsletter box, both wired to the backend. More forms can be
  added the same way if you need them.
- Testimonial/client photos and logos are left as text-only cards rather
  than pulling third-party images.

Happy to add more pages, wire up MongoDB for you, or adjust the visual
direction — just say what you'd like next.
