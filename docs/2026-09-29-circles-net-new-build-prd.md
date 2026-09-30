# Circles
*Product Requirements Document: Net New Build — Revised copy*

**Build name:** Circles for an Instagram-like app
**Owner:** Product team
**Original source:** [3 After Feedback.md](3%20After%20Feedback.md)
**Revision date:** September 29, 2026

> This dated copy preserves the source PRD. Priority describes product importance, not implementation status. Current implementation evidence is summarized in the Appendix and the companion [evidence report](2026-09-29-prd-evidence-report.md).

## 1. PROBLEM

People who follow many accounts struggle to find updates from a few high-priority people in a mixed, algorithm-ranked feed. Familiar accounts can be difficult to recognize after a display-name or username change. When an account or its content is unavailable, users may not know whether there are simply no available posts or the account itself is unavailable. Browsing for updates from chosen people can also be noisy and time-consuming. Users need continuity, truthful availability information, and a private way to focus on selected relationships without accidentally changing whom they follow.

### Supporting Context

- A person can follow accounts across family, friends, work, and other interests, each deserving different attention.
- Private memberships and stable account identity can help users recognize familiar accounts when names change.
- Availability messaging must distinguish an empty content view from an unavailable account and must not invent a reason.
- Whether private lists measurably improve feed relevance and retention remains a product hypothesis to test.
- This application can control only identities and names it owns; it cannot enforce naming policies on Instagram or another external platform.

## 1a. Opportunity

Let users organize followed accounts into private circles and switch between focused views. Stable account IDs, persistent avatar associations, current names, and a brief private indication of a recent name change can help users maintain relationship continuity. Honest availability states and chosen-account filtering can reduce confusion and feed noise.

### Market Opportunity

- This MVP tests a relevance, continuity, and repeat-use opportunity; no market-size estimate is asserted.
- Existing favorites and close-friends tools demonstrate adjacent behaviors, but the proposed product combines user-named follow lists, focused browsing, and account continuity. This positioning requires user research before any competitive claim is made.

## 1b. Users & Needs

**Primary users:** People who follow many accounts but often want a quick view of a small, personally chosen subset, such as close friends, family, or key interests.

**Secondary users:** None for private list management. People represented by a followed account do not participate in the host's circle management. Product and engineering operators support account availability and prototype validation.

### Key User Needs

As a person with a crowded feed, I need to group accounts I follow so I can find updates relevant to the moment.

As a person who wants less noise, I need to hide a list from my default Home view without unfollowing anyone.

As a person who follows many accounts, I need to try useful, small viewing circles before deciding whether larger circles are worth purchasing.

As a person managing a circle, I need to reorganize or unfollow people deliberately and recover mistaken changes.

As a person whose followed accounts may change names, I need to recognize a recent prior name privately so I can maintain continuity without searching a permanent history.

As a person opening an account with no visible content, I need to know whether content is empty or the account is unavailable, without being shown an unconfirmed cause.

## 2. PROPOSED SOLUTION

Circles is a private organization layer for accounts a user follows in an Instagram-like app. Users create named circles, add followed accounts, and select one or more circles to browse a focused feed; overlapping memberships do not duplicate posts. A stable account ID anchors each membership and avatar association while the current display name and username remain visible. When either name field changes, the host privately sees its immediately previous value crossed out for 30 days; both fields share one cooldown, and no historical-name search or permanent name log is created. Account availability is stated only as far as confirmed information permits. Users can hide circles from Home while retaining a deliberate ALL view, and circle changes remain separate from following changes.

## 2a. Value Proposition

People whose feeds mix too many relationships and interests use Circles to find updates from selected accounts and recognize them over time. Private circles, stable identity, and a short-lived private name-change cue help users focus and preserve continuity without changing follow relationships or implying control over external accounts.

## 2b. Top 3 MVP Value Props

**The Vitamin** *(must-have baseline)*: Users can create and manage private lists of followed accounts while retaining an **ALL** view.

**The Painkiller** *(solves the core pain)*: Users can focus browsing on chosen accounts, understand confirmed availability states, and reorganize memberships without unfollowing anyone.

**The Steroid** *(the standout moment to validate)*: Stable account identity, a private 30-day previous-name cue, and union-based circle browsing make a crowded feed feel continuous and intentional.

## 2c. Goals & Non-Goals

### Goals

- Help users set up useful follow lists and return to them.
- Reduce time spent searching for updates from chosen people.
- Preserve the ability to browse all followed accounts even when some lists are hidden from Home.
- Preserve circle memberships and avatar associations when an app-controlled account changes its display name or username.
- Help users recognize one recent name change without maintaining a searchable history.
- Report account availability without fabricating a cause.
- Test whether list-based browsing improves repeat use and whether users buy more or larger lists after reaching a limit.
- Let users manage circle membership and follow relationships through clearly separate, recoverable actions.

### Non-Goals

- Circle-based audiences for the user's own posts, stories, reels, or reposts. Circles are viewing filters only and never change who can see what the user publishes.
- Automatic unfollowing when a person is removed from a circle; follow relationships change only through an explicit unfollow action.
- Enforcing or reporting changes to names on an external social platform that this app does not control.
- Searchable historical-name archives, old-name search, or a name-history service.
- Claiming that an account is deactivated without confirmation from a reliable source.
- Filtering direct messages, notifications, profile pages, reels, or reposts beyond the explicitly scoped behavior. These remain later surfaces unless separately approved.
- Leaderboards, shared groups, or notifications to people when they are added to or removed from a list.

## 2d. Success Metrics

Targets below are launch hypotheses, not observed results. Compare retention with a contemporaneous control group where available. Add baselines before launch; the name-continuity and availability targets are proposed measurement criteria, not evidence of current product performance.

| Goal | Signal | Metric | Target |
| :---- | :---- | :---- | :---- |
| Setup | Users create a useful list | Share of activated users who create a list with at least five followed accounts within seven days | 35% |
| Focused browsing | Users return to a list view | Share of activated users who open a list-filtered feed on at least two separate days in their first 14 days | 30% |
| Reduced search effort | Users find wanted posts sooner | Median time from opening the feed to opening a post from a chosen list, compared with control | 20% lower |
| Retention | List browsing earns repeat use | Day-7 retention among activated users, compared with control | +5 percentage points |
| Capacity demand | Users need more lists | Share of activated users who attempt to create an eleventh list within 30 days | 10% |
| Member expansion | Users need larger circles | Share of activated users who reach 20 people in a circle and buy a larger member tier within 30 days | 10% |
| Action clarity | Users choose the intended action | Share of surveyed users who correctly identify whether circle removal versus unfollow changes the follow relationship | 90% |
| Name continuity | Users recognize changed accounts | Share of surveyed users who correctly identify a recently renamed account without a name-history search | Establish baseline; set launch target before release |
| Availability accuracy | Users are not shown invented causes | Share of displayed deactivation claims backed by a confirmed status source | 100% |

## 3. REQUIREMENTS

### User Journey 1: Organize accounts I follow

**Context:** A private follow list is the unit of organization. It contains accounts the owner follows; it does not contain followers merely because they follow the owner.

**Sub-journey: Create and manage a list**

- **[P0]** User can create a named, private list of accounts they follow.
- **[P0]** User can add or remove followed accounts from a list without following or unfollowing them.
- **[P0]** User can select several accounts in a circle and remove them from that circle in one action without unfollowing them or changing their membership in other circles.
- **[P0]** User can put the same followed account in multiple circles.
- **[P0]** User can view and edit each circle's name and membership.
- **[P0]** User can see all circles that a selected followed account belongs to in their private circle manager.
- **[P0]** User can see that only they can view membership, listed accounts receive no notification, and circle membership does not change anyone's post audience.
- **[P1]** User can reorder circles for quicker access; order does not change feed ranking or permissions.

**Sub-journey: Manage list capacity**

- **[P0]** User can create up to 10 custom circles for free, with up to 20 followed accounts in each circle.
- **[P0]** User can pay $5.00 to add 10 more circle slots whenever they reach their current list-count limit, with no fixed number of repeat purchases.
- **[P0]** User can make a separate **Expand Circles** purchase that raises the member limit for every custom circle to 30 for $10.00, 50 for $20.00, or 100 for $50.00.
- **[P0]** User can move to a higher member tier by paying that tier's full price without credit for an earlier tier.
- **[P0]** User can see both limits, full upgrade price, resulting capacity, and the absence of tier credit before purchase.
- **[P0]** User can retain purchased slots on the same account and restore the purchase through the platform store.
- **[P0]** User can keep using existing lists when a purchase fails or is canceled.

### User Journey 2: Find updates from chosen accounts

**Context:** The core loop is create a circle, open a focused feed, and return to it when the user wants that group of updates.

**Sub-journey: Browse focused and complete views**

- **[P0]** User can select one or more circles to filter the feed to posts from accounts in any selected circle.
- **[P0]** User can see each eligible post once when its creator belongs to multiple selected circles.
- **[P0]** User can see every circle label for an account in **ALL**, a single-circle view, or a multi-circle view without changing filter membership.
- **[P0]** User can see each account once in **ALL** or a combined circle view; the account may appear in separately opened circles.
- **[P0]** User can switch to **ALL** to see the unfiltered feed of all accounts they follow.
- **[P0]** User can see active filters and clear selection without changing membership.
- **[P0]** User can see a useful empty state when a selected circle has no available posts.

**Sub-journey: Keep Home manageable**

- **[P0]** User can hide or unhide a circle from the default Home feed without changing whom they follow.
- **[P0]** User can deliberately open a hidden circle and see its available posts.
- **[P0]** User can see that **ALL** always includes eligible posts from followed accounts in hidden circles; **ALL** is unfiltered while Home respects hidden-circle settings.
- **[P0]** User can see an account's post once in Home when it belongs to multiple visible circles; a hidden membership takes precedence in Home.

### User Journey 3: Maintain account continuity and understand availability

**Context:** A stable account identity anchors private memberships and avatar association. Display name and username are current labels that may change. A temporary private cue helps the host recognize the most recent change without creating a permanent name archive.

**Sub-journey: Recognize a name change**

- **[P0]** User can retain memberships and avatar association by stable account ID when an app-controlled account's display name or username changes.
- **[P0]** User can see the account's current **Display name** and **Username**.
- **[P1]** When a field changes, host can see that field's immediately previous value crossed out beside the changed field; the cue is private to that host.
- **[P1]** User can see the cue for 30 days from the accepted name change; after 30 days the cue and temporary previous-value metadata expire.
- **[P1]** User sees only the immediately previous value for each field; the product does not retain or expose a searchable historical-name log.
- **[P1]** Changing display name, username, or both in one save starts one shared 30-day cooldown affecting both fields.
- **[P1]** Saving without an actual name change does not start or extend the cooldown.
- **[P1]** Before saving, user can see the shared cooldown rule and next eligible date for another change.
- **[P1]** New accounts start with empty `temp_user_name`, `temp_screen_name`, and no `name_changed_at` timestamp.
- **[P1]** Product can derive cue expiry and eligibility from `name_changed_at`; lazy cleanup on account access is sufficient for the prototype, with no separate history service.
- **[P0]** Product applies these rules only to names it controls and makes no claim about enforcing an external platform's naming policies.

**Sub-journey: Understand account availability**

- **[P0]** User can distinguish “no available posts” from an account being unavailable.
- **[P0]** Product can display “deactivated” only when deactivation is confirmed by a reliable source.
- **[P0]** Otherwise, user sees a neutral unavailable or unknown status; product does not infer or invent a cause.
- **[P1]** User can continue browsing when availability information is missing or cannot be refreshed; no unsupported recheck workflow is required by this scope.

### User Journey 4: Manage people and recover changes

**Context:** User A owns the circles and selects User B, a followed account. Changing User B's circle membership does not alter the follow relationship; unfollowing User B does.

**Sub-journey: Select people and choose an action**

- **[P0]** User can check one, several, or all accounts shown in a circle or **ALL**, then use **Circle** and **Unfollow** actions for the selected accounts.
- **[P0]** User can see a selection checkbox beside each account and selection actions in a consistent location.
- **[P0]** User can open the **Circle** dialog for one row or all checked accounts.
- **[P0]** User can see every circle in the dialog with checked, unchecked, or mixed membership state across selected accounts.
- **[P0]** User can add or remove the selected accounts from explicitly checked circles without changing untouched memberships.
- **[P0]** User can review a move's destination and source memberships before saving.
- **[P0]** User can unfollow one row or selected accounts with an explicit confirmation in either case.
- **[P0]** User can see which selected accounts will disappear from **ALL** after unfollow and that no unchecked account is affected.

**Sub-journey: Restore circle membership and follows**

- **[P0]** User can view a private history of circle removals, deleted circles, and unfollows, including affected people, prior memberships, and time.
- **[P0]** User can restore a removed account to its previous circle or leave it removed and add it later.
- **[P0]** User can restore a deleted circle with its name, order, hidden state, and prior memberships, subject to current capacity.
- **[P0]** User can re-follow an unfollowed account from history; a private account requires the normal follow request and pending state.
- **[P0]** User can choose former circle memberships to restore when re-following or restore the last saved state when the follow is active.
- **[P0]** User can see when restoration cannot complete because an account is unavailable, a private request is pending, or a circle is at capacity.
- **[P0]** User can retain private action history and see a notice that a large history may affect storage or performance.
- **[P1]** User can clear their own history after confirming that restoration from cleared entries will no longer be possible.

## 4. APPENDIX

### Relationship and visibility model

- **Following:** Accounts the selected app profile follows. Circles contain these accounts and control only the host's viewing organization.
- **Followers:** Accounts that follow the selected profile. They are not automatically circle members. Circle membership does not affect post visibility.
- **Post visibility:** A viewing circle filters only posts already available to the host; it neither exposes a private post nor restricts the host's posts.
- **Stable identity:** Membership and avatar references attach to an immutable internal account ID, not a mutable display name or username.
- **Temporary name metadata:** `temp_user_name`, `temp_screen_name`, and `name_changed_at` store only the immediately prior changed values and the shared change time. Expiration is derived; no old-name search or permanent history is created.
- **Home:** Default feed, which respects hidden-circle settings.
- **ALL:** Always-available, unfiltered view of all followed accounts' eligible feed posts; it is not a deletable circle and is not limited by paid capacity.
- **Overlapping lists:** Multiple selected circles form a union without duplicate people or posts. A hidden membership suppresses the account from Home even when it also belongs to a visible circle; explicitly opened circles or **ALL** still show eligible content.
- **Membership labels:** Labels provide context and do not themselves change filter membership.

### Implementation status (as audited September 29, 2026)

Status is independent from priority. “Verified” below means verified by a focused automated test or direct source inspection for that specific fact; it does not imply complete product acceptance or live integration.

| Area | Evidence-based status | Boundary |
| :---- | :---- | :---- |
| Authentication gate and account data loading | Present in code; runtime-unverified in this audit | Supabase session gates `Dashboard`; no auth flow was exercised here. |
| Managed profiles and switching | Present in code and migrations; runtime-unverified | One Supabase login owns multiple profiles. Profile-specific relationship, circle, membership, and message data are separated; the synthetic directory is shared under the owner. |
| Synthetic directory and avatars | Present in code; runtime-unverified | Client initializes 132 deterministic synthetic rows per owner, generated SVG avatars, seeded counts, 46 verification flags, pending requests, and synthetic mutual-follow edges. Not real platform accounts or SQL seed records. |
| Circle membership, limits, search, sorting, selection, suggestions, notifications, Favorites, Blocked, and sent prototype messages | Present in code/migrations; runtime-unverified | Actions write private Supabase prototype state only; no social-platform follow, block, notification, message delivery, or feed integration. |
| Multi-name circle creation | Present in code; runtime-unverified | `src/lib/circleNames.js` and its tests provide comma-separated validation; the dialog and Supabase create path are present. This audit does not treat source inspection as runtime verification. |
| Name-change recognition and 30-day cooldown | Approved, not implemented | Current schema and profile editor do not provide the specified prior-name fields, shared cooldown, privacy cue, or expiry. |
| Account-availability states | Approved, not implemented | No verified external availability source or corresponding UI state is present. |
| Feed, Home filtering, hidden circles, recovery history, paid tiers | Required in the original PRD; not implemented as operational product flows | Home/navigation surfaces are mock notices; no operational media/feed or history workflow was found. |
| Video playback/time slider | Not part of this build's verified implementation | No video player, media surface, playback state, slider, or related test was found in the inspected branch. |

### Later New Feature PRD candidates

- **Pricing tradeoff:** The 20-person free cap may limit broad organization; measure failed add attempts, upgrade conversion, and abandonment. Pricing and purchases are product requirements, not implemented payment behavior.
- **Additional surfaces:** Stories, reels, reposts, search, notifications, messages, and profile activity should be evaluated as distinct surfaces; mock navigation does not establish operational feeds or media.
- **Circle notifications:** A later feature may filter in-app notifications by circles, with union behavior and no duplicates.
- **Relationship recovery:** Circle removal, circle deletion, and unfollow are different events; recovery must not silently re-follow anyone or bypass private-account approval.
- **Availability recheck:** A recheck workflow is only a proposal; it is not approved by this PRD.
