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

Create a production build with:

```bash
npm run build
```

## Prototype behavior

The current screen includes Circles, Following, and Followers tabs; tab-scoped select-all with an adjacent selected count; circle filtering below the search bar; search with a magnifying-glass affordance; a dark single-choice sorting panel; dark/light theme switching; more than 30 synthetic accounts; Suggested Users; local circle membership editing; saved Post Views and Circle Manager dialogs; batch relationship actions; and a reference-style messaging view. When accounts are selected, View, Circle, Follow, Follow Back, and Unfollow target that selection; otherwise they target the clicked account. Successful account actions clear selection, while Cancel and a rejected Circle-capacity save preserve selection and its dialog draft for correction. Circle filters are self-contained and remain separate from selection. Circle editing displays each Circle's live `members / 20` occupancy and rejects an entire change that would exceed the free 20-member capacity. Sorting uses explicit demo relationship dates and applies to the current tab’s filtered/search results. The dialogs center over a blocking backdrop and require Cancel or Save Changes. The checked-in JPEGs in `public/assets/` are retained as visual design references, not rendered as the application UI.

## Known limitations

This is a front-end prototype, not a connected product:

- People, circles, relationships, profile counts, capacity rules, and colors are hard-coded demo data.
- State is held in React memory only and is lost on refresh; there is no backend, authentication, database, or persistence.
- The plus/manage control, action history, hidden-circle workflows, circle creation/deletion, paid capacity expansions, confirmed follow/unfollow persistence, and real message delivery are not implemented.
- Sort dates and relationship flags are demo data; there is no connected account or feed service.
- Selection, Post Views, relationship actions, and messaging are session-only local prototype behavior; they are not connected to a backend or social platform.
- The UI has not yet been integrated with a real social platform or validated against production accessibility, content, and responsive requirements.

## Repository organization

- `src/` contains the Vite + React application.
- `docs/` contains product requirements and team reference material.
- `docs/references/` contains the teammate HTML reference for the planned integration pass.
- `public/assets/` contains the visual design references used by the prototype.
