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

- [Circles — Net New Build PRD](docs/2026-09-29-circles-net-new-build-prd.md)
- [Video Time Slider — New Feature PRD](docs/2026-09-29-video-time-slider-prd.md)
- [Current phase implementation evidence](docs/2026-10-03-phase-build-evidence.md)
- [Original Circles source](docs/3%20After%20Feedback.md) (preserved for reference)

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

Install the [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started), then apply checked-in migrations in order with `supabase db push --project-ref <project-ref>`. The eight checked-in migrations define the private profile, people, circle, synthetic-follow, message, and managed-account tables with row-level security. The account-grouping work is in [`20260927091156_account_scoped_profiles.sql`](supabase/migrations/20260927091156_account_scoped_profiles.sql), [`20260927092011_secure_account_scope_indexes.sql`](supabase/migrations/20260927092011_secure_account_scope_indexes.sql), and [`20260927092615_provision_default_managed_profiles.sql`](supabase/migrations/20260927092615_provision_default_managed_profiles.sql). The later `20260930160000_add_managed_account_name_continuity.sql` migration adds temporary prior-name metadata and a shared 30-day cooldown. Verify the target project's migration ledger before applying migrations; hosted state is not verified by this README. `managed_accounts` and `account_people` provide multiple profiles under one Supabase login; existing profile, relationship, Circle, membership, and message data is backfilled into each owner's default profile. New profiles do not inherit another profile's follow, follower, favorite, block, or notification state. Circles and messages are account-scoped in the database, and Circle capacity is enforced per profile. Existing profiles already above the 10-Circle limit are retained; creating additional Circles stays blocked until they are brought within the limit. The Profile page now supports switching among these managed profiles and adding another independent profile under the same login. In Supabase Authentication URL Configuration, allow `http://127.0.0.1:5173/**` for local email confirmation redirects (also add `http://localhost:5173/**` if you use that hostname). The app includes email sign-up/sign-in and stores people, circles, memberships, prototype relationship flags, notification preferences, Favorites, and sent messages in Supabase. New sign-ups may need to confirm their email before signing in.

Create a production build with:

```bash
npm run build
```

## Prototype behavior

The current screen includes Circles, Following, and Followers tabs; tab-scoped selection; comma-separated search; circle filters; sorting; dark/light theme switching; saved circles; notification preferences; private follow requests; Favorites and Blocked routes; and persisted prototype messages. Search supports display-name or username terms, exact `@Username` terms, and exact Circle directives using `@Circle:CircleName`; separate terms with commas. For example, `MandyQuin2, JonnaTtye, @Circle:Wisdom` matches either person term within the Wisdom Circle. `#Tag` search is deferred. The host profile is available from a five-item mock bottom navigation. The standalone Reels route opens ten bundled local MP4 demos with a seekable timeline; synthetic visited profiles also receive local clips. Home feed, Story playback, and global Search remain unavailable mock screens. Prototype messages persist only in the app; profile Posts/Reposts/Tagged views do not fetch real content and post creation is disabled. Profile counts reflect the current saved follower/following lists, and supplied pronouns appear next to the display name. Circle controls include `+ Circle` and `− Circle`; deletion requires selecting circles and confirming the destructive action.

Each account receives a private, deterministic 132-person synthetic directory with varied follower/following counts, 46 verified profiles, pending requests, and seeded mutual-follow relationships. The app creates small, deterministic fictional SVG avatars (faces and non-human subjects), stores their data URIs in Supabase, and assigns an avatar to newly created accounts and existing synthetic rows that lack one. Face appearance is selected from a stable synthetic seed, never inferred from the real host’s name. Supabase stores and serves these generated assets; it does not generate artwork itself. Suggested Users shows 10 accounts and opens a paginated See all view that incrementally loads additional suggestions. Follow and Follow Back update the private Following list; adding a Favorite follows that account and puts it in Favorites, while removing it from Favorites does not unfollow it. Circle edits display live `members / 20` occupancy, with the limit checked in both the UI and database. The relationship actions only update saved app data; they do not follow, block, notify, or message anyone on Instagram. The standalone Reels demo and synthetic-user profile Reels use bundled local MP4 clips, a shared time slider, and local frame previews while scrubbing; they do not stream, import, or control external social-platform video. Other checked-in JPEGs in `public/assets/` remain visual design references.

## Known limitations

This remains a prototype rather than a connected social product:

- People, circles, memberships, and saved relationship flags are private per-user Supabase data. Relationship flags do not reflect or change a real Instagram account.
- Notification preferences and sent prototype messages persist only for the signed-in host’s private demo data. They never deliver notifications or messages to a real account. Real message delivery, social feed synchronization, Instagram import/sync, action history, hidden-circle workflows, circle deletion, and paid capacity expansions are not implemented.
- Supabase policies restrict data to the signed-in owner; the application also filters profile-specific relationships, circles, memberships, and messages by the selected managed-profile ID. Managed profiles share one login and a synthetic people directory, but keep their own relationship state and private app data.
- Synthetic-directory avatars are prototype SVG illustrations; the host can upload and crop a profile avatar in the app. Neither source is an external social-platform avatar feed.
- The interface has not yet been validated against production accessibility, content, and responsive requirements.

## Repository organization

- `src/` contains the Vite + React application.
- `docs/` contains product requirements and team reference material.
- `docs/references/` contains the teammate HTML reference for the planned integration pass.
- `public/assets/` contains UI reference captures and ten bundled local MP4 clips for the synthetic Reels demo.
