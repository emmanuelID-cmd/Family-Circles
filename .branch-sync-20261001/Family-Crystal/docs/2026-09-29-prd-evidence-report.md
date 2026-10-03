# PRD Revision — Change and Evidence Report

**Audit date:** September 29, 2026
**Repository:** Family-Circles, branch `Family-Manny`
**Audited HEAD:** `e633bcc` (`docs(team-reference): refresh verified branch and push status`), matching `origin/Family-Manny`

## Deliverables and preserved sources

- Revised Circles PRD: [2026-09-29-circles-net-new-build-prd.md](2026-09-29-circles-net-new-build-prd.md)
- Revised Video Time Slider PRD: [2026-09-29-video-time-slider-prd.md](2026-09-29-video-time-slider-prd.md)
- Original Circles PRD preserved: [3 After Feedback.md](3%20After%20Feedback.md)
- Original video source PDF preserved outside the repository at `C:\Users\dejes\Downloads\Family-Circles-Video-Time-Slider-New-Feature-Plain.pdf`.

## Repository state and method

- Worktree is on `Family-Manny`; `HEAD` matches `origin/Family-Manny`. The only status item is the intentionally untracked `Family-Circles.code-workspace`, which was preserved. No branch change, pull, staging, commit, push, database access, or application behavior change was made.
- The source Circles PRD was inspected at `docs/3 After Feedback.md`. The source video PDF remains preserved outside the repository and was not modified; the existing revised Markdown records the source-level decisions and conflicts.
- Code, migrations, tests, README claims, Team Reference, and recent Git history were inspected. README statements were treated as claims and checked against the current files.
- The recorded production build command `npm.cmd run build -- --configLoader runner` passed. The ordinary build command's sandbox access error is treated as an environment restriction, not an application failure. No browser/runtime or live Supabase check was used as evidence.
- GitHub CLI and the web fetch path could not re-check PR #5 in this environment because outbound GitHub access was blocked; its current state and checks therefore remain externally unverified here. PR #6 is represented in the local history as merged into `main`.

## Evidence map

| Topic | Repository evidence | Requirement impact / verified boundary |
| :---- | :---- | :---- |
| Authentication and page entry | `src/App.jsx` — `AuthForm`, session restoration, and the `if (!session) return <AuthForm />` gate (approximately lines 8–40, 47–80, 160–170) | Signed-in app entry is coded. This audit did not execute an auth session or penetration test. |
| Managed profiles | `src/App.jsx` — `loadManagedAccounts`, selected profile from local storage, account switch/add flows; `src/Dashboard.jsx` — account menu; migration `20260927091156_account_scoped_profiles.sql` | Multiple app-managed profiles exist under one Supabase Auth owner. They are not multiple independent auth identities or linked Instagram accounts. Runtime behavior not verified here. |
| Per-profile social state and owner isolation | `src/lib/familyData.js` — `loadFamilyData`, account-specific `account_people`, circles, memberships, messages; account-scoped migration and RLS policies | Relationships, circles, memberships, and prototype messages are selected by managed-profile ID beneath the signed-in owner. The synthetic people directory is owner-scoped/shared, not cloned per profile. Database state was not queried. |
| Synthetic directory and avatars | `src/lib/familyData.js` — `syntheticPeople`, `fictionalAvatar`, `ensureSyntheticPeople`, `toPerson` | Client code initializes 132 deterministic fictional directory rows, generated SVG data-URI avatars, count bands, 46 verification flags, 12 seeded pending requests, and mutual-follow edges. They are synthetic directory records, not real authenticated users, and initialization is not a SQL seed migration. |
| Relationships, circles, capacities | `src/Dashboard.jsx` — separate Following/Followers lists, circle editor, 10-circle and 20-member UI checks; `src/lib/familyData.js` — relationship/member functions; migrations `20260925041408_enforce_free_circle_limit.sql`, `20260924000000_initial_schema.sql`, and `20260927091156_account_scoped_profiles.sql` | Local prototype state supports follow/follow-back, favorites, block, private circles, and capacity enforcement in code/schema. These actions do not change any external social-platform relationship. Runtime/database enforcement was not exercised. |
| Name fields and profile editing | `src/Dashboard.jsx` — profile editor only saves pronouns; `src/lib/familyData.js` — `updateProfile`; managed-account migration fields | Approved name-change cue, previous-value fields, shared 30-day cooldown, and temporary metadata are absent. No app-controlled display-name/username editing workflow was found. |
| Availability | Search of `src/`, migrations, and current UI found no confirmed deactivation/availability model | The approved neutral availability behavior is not implemented; no reliable external status source is integrated. |
| Search and sort | `src/lib/search.js` — comma terms and `@Circle:Name`; `src/Dashboard.jsx` — matching and current-tab date sort; `src/lib/familyData.js` — suggestion search construction | Current code supports plain name/username, exact handles, circle directives, and sorting. `#Tag` remains deferred. Search behavior was not browser-tested. |
| Selection and bulk behavior | `src/Dashboard.jsx` — `selected`, select-all, row toggles, target resolution, clear-selection on navigation/actions | Selection UI and selected-target actions are coded. This audit did not run end-to-end interaction checks; not every selection affordance implies every bulk action exists. |
| Suggestions and requests | `src/Dashboard.jsx` — first-ten preview, See all route, sentinel/observer; `src/lib/familyData.js` — paged `loadSuggestionsPage`; request list and Confirm/Delete handlers | Pagination and local request/follow actions are coded. The page and database flow were not runtime-verified. |
| Favorites, Blocked, notifications | `src/Dashboard.jsx` action/dialog handlers; `src/lib/familyData.js` `setFavorites`, `blockPeople`, account preference updates; migration social-state fields | Private prototype state is coded. Notification settings are not delivered externally; favorite/block actions are not applied to Instagram. Runtime not verified. |
| Messaging | `src/Dashboard.jsx` composer and history; `src/lib/familyData.js` `loadMessages` / `sendMessage`; messages table and account-scoping migration | Text messages can be written/read in the host's private prototype data if the backend accepts the call. No recipient account, inbox delivery, or real messaging transport exists. UI/backend behavior was not exercised here. |
| Multi-name Circle creation | Present in code; runtime-unverified: `src/Dashboard.jsx`, `src/lib/circleNames.js`, `src/lib/circleNames.test.js`, and `src/lib/familyData.js` `createCircles` | The implementation accepts comma-separated names and validates blanks, length, duplicate names, existing names, and available slots. Full UI/database behavior was not runtime-verified. |
| Feed, stories, and video | `src/Dashboard.jsx` mock navigation/Story placeholder; `src/App.jsx`; source scan for media elements, duration/playback APIs; Git history search | No real feed, post viewer, Story media, video player, slider, preview, or playback controls were found. The video PRD is approved future scope, not implemented functionality. |
| README claims | `README.md`, checked against the above source and migration locations | Useful orientation only. Its claims about hosted migrations and behavior were not independently verified against Supabase or Vercel. |

## Status definitions used in the revised PRDs

1. **Implemented and verified:** a specifically scoped behavior passed a direct automated check or was verified by inspection; this does not claim broader acceptance.
2. **Present in code but runtime-unverified:** implementation is visible, but this audit did not execute it in a browser or hosted environment.
3. **In-progress uncommitted:** current local changes are not in the branch baseline and remain unfinished until full behavior is verified.
4. **Approved but not implemented:** explicitly approved product requirements with no corresponding implementation found.
5. **Proposal or unresolved decision:** not approved, conflicting, or missing a product decision; not treated as a requirement to implement yet.

No product-level UI, auth, database, or video behavior was runtime-verified in this audit. The only test execution was the seven-case circle-name validator unit test. Priority labels in the PRDs are importance labels and do not indicate delivery status.

## Video-source reconciliation

The original PDF specifies hover-only reveal, a five-minute maximum, a long-press slide-down/slide-up speed gesture, duration-based intervals, a five-Story exit sequence, an optional Reel-thumbnail duration, and permission/metadata/error/keyboard expectations. The newer approved requirements make touch seeking mandatory and replace slide-direction speed gestures with a playing-state right-hold temporary 2.00× behavior. They do not explicitly settle the five-minute cap or the original Story/interval semantics. Double-tap Favorite also conflicts with rapid pause/resume and frame taps; the suggested 300 ms threshold was never approved. These contradictions and unresolved timing details are listed in the revised Video PRD rather than silently decided.

## PDF output limitation

No PDF renderer/visual-verification utility was available in this environment, so the Video PRD is delivered as editable Markdown only; no unverified PDF was generated.

## Out of scope for this audit

- Application code, README, migrations, database contents, deployment, branch history, remote state, or existing local changes were not modified.
- No claims were made about current hosted Supabase migration state or production deployment.
- No historical-name search, account-availability recheck, media viewer, or gesture threshold was invented or added beyond the user's explicit approvals.
