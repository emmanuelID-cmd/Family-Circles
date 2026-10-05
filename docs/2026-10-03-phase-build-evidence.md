# Phase build evidence — 2026-10-03

This is a current implementation check against the [Circles PRD](2026-09-29-circles-net-new-build-prd.md) and [Video Time Slider PRD](2026-09-29-video-time-slider-prd.md). The [September 29 audit](2026-09-29-prd-evidence-report.md) remains a historical snapshot, not the current implementation status. Priority (P0/P1/P2) describes importance, not completion.

## Verified repository boundary

- Work is on `feat/complete-remaining-phases`, created from synchronized `main` at `9efd1b6`; `main` had nothing to pull at the start of this work. No team branch, external AGENTS repository, hosted database, or original PRD source was modified.
- The eight checked-in migrations include managed-account name continuity. Their presence is verified locally; this run did not inspect or apply the hosted migration ledger.
- The ten local `public/assets/reel-01.mp4` through `reel-10.mp4` files exist. These are bundled demo clips, not Instagram media or a real Home feed.
- Scoped commits on this branch: `ab6b68a` and `f3bb967` (Phase 2), `875f5ce` (Phase 3), `ae72cdf` (Phase 5 asset check), `00d8168` (Phase 6), `5411b41` (Phase 7), `5e10e40` and `bff88f7` (Phase 9 preparation), plus `d85b613` and `397a514` (evidence).
- Final local verification in this run: 49 Node tests passed sequentially, the production build passed with `--configLoader runner`, and `git diff --check` passed. The Vite bundle-size advisory is non-blocking.

## Requirement status

| Requirement / phase | Status | Evidence and limit |
| :--- | :--- | :--- |
| Stable IDs, previous-name metadata, shared 30-day cooldown (Phases 1–2) | Implemented and helper-verified; UI/runtime partly unverified | `src/lib/nameChange.js`, six helper tests, two component-render tests in `src/components/ManagedAccountNameEditor.test.js`, `src/components/ManagedAccountNameEditor.jsx`, and `20260930160000_add_managed_account_name_continuity.sql`. The editor now shows the next eligible date before an eligible save. No live name-edit or migration execution was performed in this run. |
| Circle membership and avatar continuity; Circle removal without unfollow (Phase 3) | Implemented and test-verified; authenticated runtime unverified | `src/lib/familyData.js` retains missing draft entries instead of clearing memberships; four mocked data-layer tests in `src/lib/familyData.test.js` cover stable IDs/current names/avatar, overlapping circles, targeted edits, and removal without a follow update. |
| Account availability vs. no posts | Approved but not implemented | No reliable availability result or deactivation signal exists. Current profile empty states must not be relabeled “deactivated.” Availability recheck remains a proposal. |
| Synthetic visited-profile Reels (Phase 5) | Implemented and scoped verification complete | `src/lib/profileReels.js` assigns 1–10 unique local clips by stable profile ID; the asset test checks files exist. `src/App.jsx` assigns clips to synthetic visited users and `reels: []` to the host. A bundled clip opened and played in the local browser; authenticated profile navigation was not re-run. |
| Shared P0 slider (Phase 6) | Implemented; standalone runtime verified, profile runtime unverified | `src/components/VideoTimeSlider.jsx` is used by both `src/components/ProfileMediaGrid.jsx` and `src/pages/ReelsTimeframe.jsx`. Focused tests cover timing, invalid metadata, seek clamping, and gesture isolation. In local browser, a clip displayed 0:15, sought to 0:07, and resumed playback from that position. Touch-device and authenticated-profile checks remain open. |
| Synchronized P1 preview (Phase 7) | Implemented; standalone runtime verified, profile runtime unverified | `src/components/VideoScrubPreview.jsx` captures a local video frame during scrubbing, with loading/error fallback and time tests. Browser keyboard scrub displayed the 0:07 frame and matching 0:07 / 0:15 label. Profile Reel, touch, cross-origin-failure, and permission-path runtime checks remain open. |
| Video-area gesture controls (Phase 8) | Existing demo skip/Escape controls runtime-verified; newer hold/frame controls unresolved | In the local browser, a 0:15 clip had no skip buttons; a 1:02 clip showed ±15-second buttons, moved 0:00 → 0:15 → 0:00, and closed with Escape or a backdrop click. Tapping the video itself started and paused playback. Playing right-hold, exact paused frame stepping, and center/area gesture precedence were not added without a product threshold and double-tap rule. Story completion has no operational Story sequence. |
| Precision mode and persistent speed (Phase 9) | In progress / not integrated | Approved speed choices and decision-neutral helpers exist in `src/lib/videoSpeed.js`; a controlled selector with all nine options exists in `src/components/VideoSpeedSelect.jsx`. Neither is wired into playback or a storage key/scope. Stationary-hold timeline, return-marker lifecycle, and frame acceleration also remain unwired. |
| Final verification (Phases 4 and 10) | Partial | Focused Node tests, production build with `--configLoader runner`, local browser Reels seek/play/preview, and whitespace checks pass. Hosted Supabase state, authenticated Circles/profile flows, real touch device, full responsive/accessibility/permissions/error recovery, and Story behavior were not verified. The ordinary Vite dev server failed on sandbox dependency access; the production bundle served successfully via local preview. |

## Decisions still required before remaining behavior can be called complete

1. Resolve double-tap Favorite against rapid pause/resume and repeated one-frame taps, and approve distinct video-area and slider hold thresholds.
2. Specify exact paused-frame stepping source/fps, repeat acceleration, and interval durations/boundary/completion rules, including the five-Story exit behavior.
3. Specify slider precision-window timing/range, dismissal/release behavior, return-marker lifetime, and speed-preference storage scope/failure feedback.
4. Decide whether the source PDF's five-minute maximum remains and which additional media surfaces are actually supported. The local bundled Reels surfaces do not imply an operational Home feed, posts, collages, live, or Stories.
5. Confirm an actual account-availability result boundary before adding availability copy; “no available posts” alone cannot establish deactivation.
