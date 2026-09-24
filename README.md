# Circles

Circles is a React/Vite/Tailwind prototype for an Instagram-like app that helps people organize followed accounts into private viewing circles and quickly browse focused feeds.

## Product goal

Reduce the effort of finding updates from a chosen group of followed accounts while preserving an explicit **ALL** view of every account the user still follows.

## MVP capabilities

- Create up to 10 private custom circles for free, with up to 20 followed accounts per circle.
- Add, remove, and move followed accounts between circles without changing follow relationships.
- Put the same account in multiple circles.
- Filter the feed by one or more circles without duplicate posts.
- Hide or unhide circles from Home while keeping them available for deliberate browsing.
- Use **ALL** as the unfiltered view of followed accounts.
- Keep Circle membership and Unfollow as separate, clearly confirmed actions.
- View private action history and restore circle memberships, deleted circles, or follows when possible.
- Support paid list-slot and member-capacity expansions with transparent pricing and no tier credit.

## Product boundaries

Circles are private viewing filters only. They do not control the audience for posts, stories, reels, or reposts; notify listed accounts; or automatically unfollow anyone. Filtering messages, search, notifications, profiles, and other surfaces is out of scope for the MVP.

## Documentation

- [Product requirements document](docs/3%20After%20Feedback.md)

The README should be updated when major product, architecture, or workflow changes are made.

## Current project status

The repository contains a working front-end prototype built with:

- React 19 and React DOM for the interface and local state.
- Vite 7 for development and production builds.
- Tailwind CSS 4, loaded through `@tailwindcss/vite`, alongside the prototype’s custom CSS in `src/styles.css`.

The main screen is implemented in `src/App.jsx`, mounted from `src/main.jsx`, and styled in `src/styles.css`. Product requirements and reference material remain in `docs/`.

## Run locally

Install dependencies, start the Vite development server, and open the URL it reports:

```bash
npm install
npm run dev
```

### Supabase setup

Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your Supabase project URL and publishable key. `.env.local` is ignored by Git. Never put a Supabase secret/service key in a `VITE_` variable.

Run [`supabase/migrations/20260924000000_initial_schema.sql`](supabase/migrations/20260924000000_initial_schema.sql) in the Supabase Dashboard SQL Editor to create the profile, people, circles, and circle-membership tables with row-level security policies. These policies scope reads and writes to the signed-in user and enforce the 20-person circle limit. In Supabase Authentication URL Configuration, allow `http://127.0.0.1:5173/**` for local email confirmation redirects (also add `http://localhost:5173/**` if you use that hostname). The app includes email sign-up/sign-in and stores people, circles, circle membership, and saved relationship flags in Supabase. New sign-ups may need to confirm their email before signing in.

Create a production build with:

```bash
npm run build
```

## Prototype behavior

The current screen includes Circles, Following, and Followers tabs; tab-scoped selection; search, filters, and sorting; dark/light theme switching; signed-in user data; person and circle creation; saved circle membership; and batch relationship actions. Circle edits display live `members / 20` occupancy, with the limit checked in both the UI and database. The relationship actions only update saved app data; they do not follow or unfollow anyone on Instagram. Post Views and messaging remain local prototype views. The checked-in JPEGs in `public/assets/` are retained as visual design references, not rendered as the application UI.

## Known limitations

This remains a prototype rather than a connected social product:

- People, circles, memberships, and saved relationship flags are private per-user Supabase data. Relationship flags do not reflect or change a real Instagram account.
- Post Views and messaging remain session-only. Real message delivery, feeds, Instagram import/sync, action history, hidden-circle workflows, circle deletion, and paid capacity expansions are not implemented.
- Supabase authentication and database policies require the migration to be applied to the configured project. The hosted database migration has not been applied by this repository.
- The interface has not yet been validated against production accessibility, content, and responsive requirements.

## Repository organization

- `src/` contains the Vite + React application.
- `docs/` contains product requirements and team reference material.
- `docs/references/` contains the teammate HTML reference for the planned integration pass.
- `public/assets/` contains the visual design references used by the prototype.
