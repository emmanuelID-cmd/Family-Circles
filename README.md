# Circles

Circles is an MVP for an Instagram-like app that helps people organize followed accounts into private viewing circles and quickly browse focused feeds.

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

This repository has been initialized from the Circles PRD. Application implementation, technology selection, and deployment configuration have not yet been added.

## Illustrative demo

The repository now includes a dependency-free browser mockup in `index.html`, `styles.css`, and `app.js`. It implements the PRD’s core demo states: Home, ALL, individual circles, hidden circles, membership labels, Circle management, separate Unfollow actions, and an action-history affordance. The checked-in JPEG is retained as the visual reference for the Instagram-inspired composition; the interface itself is recreated as live HTML/CSS rather than displayed as an image.

Open `index.html` directly in a browser to preview the mockup.

- Updated the demo to start in dark mode with a light/dark toggle, remove the duplicate sidebar, align identity and circle metadata in one row, and support ALL or multi-circle filtering. Search is intentionally excluded for later team integration.

- Circle row editing now persists add/remove membership changes and immediately re-renders labels and active-filter results.

- Added a host-only View action and Post Views modal for selected people, without changing post audience permissions.
