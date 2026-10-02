# Phase 5 — Synthetic Profile Reels Harness

## Scope

Integrate the existing local MP4 demo clips into synthetic users' Reels sections on the shared visited-profile page, so Phase 6 can demonstrate the Video Time-Slider against real video media.

## Work

- Place the existing local MP4 clips in each eligible synthetic user's profile; never assign these clips to the host user's profile.
- Resolve every synthetic user's name, username, and avatar links to that same user's visited profile.
- Assign a deterministic subset of one to ten available local clips by stable synthetic account ID, so the same profile retains its assignment across renders.
- Use the existing shared visited-profile page as the canonical profile surface; do not merge the standalone branch wholesale.
- Keep the demo local to this application; do not integrate with a real social platform.

## Acceptance criteria

- Each synthetic profile displays only its assigned local MP4 clips in Reels and can play them with current browser controls.
- Assignments are stable per account ID, unique within a profile, and reference existing local assets.
- Navigating from different synthetic users opens their individual profile identity, not a shared universal profile.
- Host-user profile remains free of these synthetic demo clips.

## Out of scope

- Home-feed construction, still-image video simulation, posts, collages, live, and Stories.
- Real feed synchronization, external media, and real social-platform integration.

## Validation

- Verify profile identity and per-user clip assignment, all local media URLs, playback, mobile layout, and the no-clips fallback. Confirm the host profile does not receive synthetic clips.

## Implementation progress — 2026-10-01

- The standalone `#/reels` demo uses bundled MP4 files and remains available separately from visited user profiles.
- Visited synthetic profiles receive a stable, deterministic subset of local MP4 clips based on profile ID. The host profile is not assigned these clips.
- This is app-local demo content; it does not connect to a real social platform or external media feed.
