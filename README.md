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

Create a local `.env.local` file and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to your Supabase project URL and publishable key. `.env.local` is ignored by Git. `VITE_SUPABASE_ANON_KEY` remains supported for existing local setups. Never put a Supabase secret/service key in a `VITE_` variable.

Run [`supabase/migrations/20260924000000_initial_schema.sql`](supabase/migrations/20260924000000_initial_schema.sql), [`supabase/migrations/20260925033759_expand_prototype_social_state.sql`](supabase/migrations/20260925033759_expand_prototype_social_state.sql), [`supabase/migrations/20260925041408_enforce_free_circle_limit.sql`](supabase/migrations/20260925041408_enforce_free_circle_limit.sql), and [`supabase/migrations/20260927030717_add_profile_identity_fields.sql`](supabase/migrations/20260927030717_add_profile_identity_fields.sql), in that order, in the Supabase Dashboard SQL Editor. Together they create the private profile, people, circle, relationship, synthetic-follow, message, pronoun, and avatar fields with row-level security policies. These policies scope reads and writes to the signed-in user and enforce the 10-circle free-plan and 20-person circle limits. In Supabase Authentication URL Configuration, allow `http://127.0.0.1:5173/**` for local email confirmation redirects (also add `http://localhost:5173/**` if you use that hostname). The app includes email sign-up/sign-in and stores people, circles, memberships, prototype relationship flags, notification preferences, Favorites, and sent messages in Supabase. New sign-ups may need to confirm their email before signing in.

Create a production build with:

```bash
npm run build
```

## Prototype behavior

The current screen includes Circles, Following, and Followers tabs; tab-scoped selection; comma-separated search; circle filters; sorting; dark/light theme switching; saved circles; notification preferences; private follow requests; Favorites and Blocked routes; and persisted prototype messages. Search supports display-name or username terms, exact `@Username` terms, and exact Circle directives using `@Circle:CircleName`; separate terms with commas. For example, `MandyQuin2, JonnaTtye, @Circle:Wisdom` matches either person term within the Wisdom Circle. `#Tag` search is deferred. The host profile is available from a five-item mock bottom navigation. Feed, Reels, Messages, and Search navigation only show an unavailable-in-this-mockup notice; profile posts are not accessible and post creation is disabled. Profile counts reflect the current saved follower/following lists, and supplied pronouns appear next to the display name. Circle controls include `+ Circle` and `− Circle`; deletion requires selecting circles and confirming the destructive action.

Each account receives a private, deterministic 132-person synthetic directory with varied follower/following counts, 46 verified profiles, pending requests, and seeded mutual-follow relationships. The app creates small, deterministic fictional SVG avatars (faces and non-human subjects), stores their data URIs in Supabase, and assigns an avatar to newly created accounts and existing synthetic rows that lack one. Face appearance is selected from a stable synthetic seed, never inferred from the real host’s name. Supabase stores and serves these generated assets; it does not generate artwork itself. Suggested Users shows 10 accounts and opens a paginated See all view that incrementally loads additional suggestions. Follow and Follow Back update the private Following list; adding a Favorite follows that account and puts it in Favorites, while removing it from Favorites does not unfollow it. Circle edits display live `members / 20` occupancy, with the limit checked in both the UI and database. The relationship actions only update saved app data; they do not follow, block, notify, or message anyone on Instagram. The checked-in JPEGs in `public/assets/` are retained as visual design references, not rendered as the application UI.

## Known limitations

This remains a prototype rather than a connected social product:

- People, circles, memberships, and saved relationship flags are private per-user Supabase data. Relationship flags do not reflect or change a real Instagram account.
- Notification preferences and sent prototype messages persist only for the signed-in host’s private demo data. They never deliver notifications or messages to a real account. Real message delivery, feeds, Instagram import/sync, action history, hidden-circle workflows, circle deletion, and paid capacity expansions are not implemented.
- Supabase authentication and database policies require the migration to be applied to the configured project. The hosted database migration has not been applied by this repository.
- Generated avatars are prototype SVG illustrations, not photo-realistic or user-uploaded images; replacing them with a reviewed asset pool in Supabase Storage remains possible later.
- The interface has not yet been validated against production accessibility, content, and responsive requirements.

## Repository organization

- `src/` contains the Vite + React application.
- `docs/` contains product requirements and team reference material.
- `docs/references/` contains the teammate HTML reference for the planned integration pass.
- `public/assets/` contains the visual design references used by the prototype.
