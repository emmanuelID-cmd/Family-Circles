# Circles
*Product Requirements Document: Net New Build*

**Build name:** Circles for an Instagram-like app

**Owner:** Product team

**Date:** September 22, 2026

## 1. PROBLEM

People who follow many accounts struggle to find updates from a few high-priority people in a single mixed feed. The feed does not reflect whom they want to focus on at a given moment, so meaningful updates get buried and browsing feels overwhelming. They also need to distinguish temporary circle changes from intentional changes to whom they follow.

### Supporting Context

- A person can follow accounts across family, friends, work, and other interests, each deserving different attention.
- Users need a way to focus on chosen relationships, with a separate deliberate option to stop following accounts they no longer want in their network.
- Whether private lists measurably improve feed relevance and retention remains a product hypothesis to test.

## 1a. Opportunity

Let users organize the accounts they follow into private lists and switch between focused views of those accounts. If this helps them find wanted updates sooner, the product can earn repeat use and offer paid capacity to people who need more lists or larger lists.

### Market Opportunity

- This MVP tests a relevance and repeat-use opportunity; no market-size estimate is asserted.
- Existing favorites and close-friends tools demonstrate adjacent behaviors, but the proposed product combines user-named follow lists with focused feed browsing. This positioning requires user research before a competitive claim is made.

## 1b. Users & Needs

**Primary users:** People who follow many accounts but usually want a quick view of a small, personally chosen subset, such as close friends, family, or key interests.

**Secondary users:** None in the MVP. The account owner creates and uses the private lists; the people on those lists do not participate in list management.

### Key User Needs

As a person with a crowded feed, I need to group accounts I follow so I can find updates relevant to the moment.

As a person who wants less noise, I need to hide a list from my default Home view without unfollowing anyone.

As a person who follows many accounts, I need to try useful, small viewing circles before deciding whether larger circles are worth purchasing.

As a person managing a circle, I need to reorganize or unfollow people deliberately and recover mistaken changes.

## 2. PROPOSED SOLUTION

Circles is a private organization layer for the accounts a user follows in an Instagram-like app. Users name circles, add followed accounts, and select one or more circles to see a focused feed; activity from an account in multiple selected circles appears once. They can hide a circle from Home while the separate **ALL** view shows every account they still follow. Circle management offers distinct actions for changing private membership and unfollowing people, with a history that supports restoration. A free circle holds 20 followed accounts, with optional paid tiers for larger circles.

## 2a. Value Proposition

People whose feeds mix too many relationships and interests use Circles to find updates from selected followed accounts quickly. Private circles let them focus their Home view and reorganize people without changing follow relationships, while a separate unfollow action remains available when they intend to change their network.

## 2b. Top 3 MVP Value Props

**The Vitamin** *(must-have baseline)*: Users can create and manage private lists of accounts they follow while retaining an **ALL** view.

**The Painkiller** *(solves the core pain)*: Users can filter the feed to one or more lists and hide unwanted lists from Home without unfollowing anyone.

**The Steroid** *(the standout moment to validate)*: A user can turn a crowded feed into a focused view of the people they chose in a few taps, with no duplicate posts when lists overlap.

## 2c. Goals & Non-Goals

### Goals

- Help users set up useful follow lists and return to them.
- Reduce time spent searching the feed for updates from chosen people.
- Preserve the ability to browse all followed accounts even when some lists are hidden from Home.
- Test whether list-based browsing improves repeat use and whether users buy more or larger lists after reaching a limit.
- Let users manage circle membership and follow relationships through clearly separate, recoverable actions.

### Non-Goals

- Circle-based audiences for the user's own posts, stories, reels, or reposts. Circles are viewing filters only and never change who can see what the user publishes.
- Automatic unfollowing when a person is removed from a circle; follow relationships change only through an explicit unfollow action.
- Filtering direct messages, search, notifications, profile pages, reels, or reposts. These are later surfaces after the feed behavior is validated.
- Leaderboards, shared groups, or notifications to people when they are added to or removed from a list.

## 2d. Success Metrics

Targets below are launch hypotheses, not observed results. Compare retention with a contemporaneous control group where available.

| Goal | Signal | Metric | Target |
| :---- | :---- | :---- | :---- |
| Setup | Users create a useful list | Share of activated users who create a list with at least five followed accounts within seven days | 35% |
| Focused browsing | Users return to a list view | Share of activated users who open a list-filtered feed on at least two separate days in their first 14 days | 30% |
| Reduced search effort | Users find wanted posts sooner | Median time from opening the feed to opening a post from a chosen list, compared with control | 20% lower |
| Retention | List browsing earns repeat use | Day-7 retention among activated users, compared with control | +5 percentage points |
| Capacity demand | Users need more lists | Share of activated users who attempt to create an eleventh list within 30 days | 10% |
| Member expansion | Users need larger circles | Share of activated users who reach 20 people in a circle and buy a larger member tier within 30 days | 10% |
| Action clarity | Users choose the intended action | Share of surveyed users who correctly identify whether circle removal versus unfollow changes the follow relationship | 90% |

## 3. REQUIREMENTS

### User Journey 1: Organize accounts I follow

**Context:** A private follow list is the unit of organization. It contains accounts the owner follows; it does not contain followers merely because they follow the owner.

**Sub-journey: Create and manage a list**

- **[P0]** User can create a named, private list of accounts they follow.
- **[P0]** User can add or remove followed accounts from a list without following or unfollowing them.
- **[P0]** User can select several accounts in a circle and remove them from that circle in one action without unfollowing them or changing their membership in other circles.
- **[P0]** User can put the same followed account in multiple lists.
- **[P0]** User can view and edit each list's name and membership.
- **[P0]** User can see all circles that a selected followed account belongs to in their private circle manager.
- **[P0]** User can see that only they can view list membership, listed accounts receive no notification, and circle membership does not change the audience for anyone's posts.
- **[P1]** User can reorder their lists for quicker access; list order does not change feed ranking or access permissions.

**Sub-journey: Manage list capacity**

- **[P0]** User can create up to 10 custom circles for free, with up to 20 followed accounts in each circle.
- **[P0]** User can pay $5.00 to add 10 more list slots whenever they reach their current list-count limit, with no fixed number of repeat purchases.
- **[P0]** User can make a separate **Expand Circles** purchase that raises the member limit for every custom circle to 30 for $10.00, 50 for $20.00, or 100 for $50.00.
- **[P0]** User can move to a higher member tier by paying that tier's full price without credit for an earlier tier; for example, moving from 50 to 100 costs $50.00.
- **[P0]** User can see both limits, the full upgrade price, the resulting capacity, and the absence of tier credit before purchase.
- **[P0]** User can see the full price and resulting list-count limit before buying, retain purchased slots on the same account, and restore the purchase through the platform store.
- **[P0]** User can keep using existing lists when a purchase fails or is canceled.

### User Journey 2: Find updates from chosen accounts

**Context:** The core loop is create a list, open a focused feed, and return to it when the user wants that group of updates.

**Sub-journey: Browse focused and complete views**

- **[P0]** User can select one or more lists to filter the feed to posts from accounts in any selected list.
- **[P0]** User can see each eligible post once even when its creator belongs to multiple selected lists.
- **[P0]** User can see labels for every circle an account belongs to on that account's row in **ALL**, a single-circle view, or a multi-circle view, without changing which accounts the active filter includes.
- **[P0]** User can see each account once in a combined **ALL** or multi-circle people list; the account can appear in each circle when those circles are opened separately.
- **[P0]** User can switch to **ALL** to see the unfiltered feed of all accounts they follow.
- **[P0]** User can see which lists are active and clear the selection without changing list membership.
- **[P0]** User can see a useful empty state when a selected list has no available posts.

**Sub-journey: Keep Home manageable**

- **[P0]** User can hide or unhide a list from the default Home feed without changing whom they follow.
- **[P0]** User can still open a hidden list deliberately and see its available posts.
- **[P0]** User can see that **ALL** always includes posts from followed accounts in hidden lists; **ALL** is an explicit unfiltered view, while Home respects hidden-list settings.
- **[P0]** User can see a post once in Home when its creator belongs to multiple visible lists; if the creator also belongs to a hidden list, the hidden setting takes precedence in Home.

### User Journey 3: Manage people and recover changes

**Context:** User A owns the circles and selects User B, a followed account. Changing User B's circle membership does not alter the follow relationship; unfollowing User B does.

**Sub-journey: Select people and choose an action**

- **[P0]** User can check one, several, or all accounts shown in a circle or in **ALL**, then use the **Circle** and **Unfollow** actions above the selected accounts.
- **[P0]** User can see a selection checkbox beside each account name, with **Circle** and **Unfollow** shortcuts to the right of the name on each account row.
- **[P0]** User can open the **Circle** pop-up for one row when nothing is selected, or for all checked accounts when a selection is active.
- **[P0]** User can see every circle in the **Circle** pop-up, with a check mark when all selected accounts belong to it, no check mark when none belong, and a mixed state when only some belong.
- **[P0]** User can check a circle to add every selected account to it or clear a check to remove every selected account from it, without changing memberships in unchecked or untouched circles.
- **[P0]** User can choose Move to check destination circles and clear source circles in one reviewed action.
- **[P0]** User can use **Unfollow** on one row when nothing is selected, or on all checked accounts when a selection is active, subject to the same confirmation in either case.
- **[P0]** User can add selected accounts to one or more checked circles while retaining their memberships in other circles.
- **[P0]** User can remove selected accounts from one or more checked circles without unfollowing them or changing membership in unchecked circles.
- **[P0]** User can move selected accounts to checked destination circles and remove them from the checked source circles only after seeing the resulting memberships.
- **[P0]** User can unfollow the checked accounts, including all accounts in the current circle when Select all is checked, through a confirmation that lists the distinct affected accounts and explains that they will disappear from **ALL** unless followed again.
- **[P0]** User can see that Unfollow selected changes the follow relationship for every checked account, including people who also belong to other circles, but does not unfollow unchecked accounts or delete any circle.

**Sub-journey: Restore circle membership and follows**

- **[P0]** User can view a private history of circle removals, deleted circles, and unfollows, including the affected people, prior circle memberships, and time of each action.
- **[P0]** User can restore a removed account immediately to its previous circle or leave it removed and re-add it later from that circle's settings.
- **[P0]** User can restore a deleted circle with its saved name, order, hidden state, and prior memberships, subject to current circle and member capacity; formerly included accounts that are no longer followed require a separate re-follow action.
- **[P0]** User can re-follow an unfollowed account from history; for a private account, this sends a follow request and shows a pending state until accepted.
- **[P0]** User can choose which former circle memberships to restore when re-following, or skip the choices to restore the last saved state when the follow relationship is active.
- **[P0]** User can see when restoration cannot complete because the account is unavailable, a private follow request is pending, or a circle is at capacity.
- **[P0]** User can keep the private action history indefinitely and see a notice that a large history may affect storage or app performance.
- **[P1]** User can clear their own action history after confirming that cleared entries can no longer support restoration.

## 4. APPENDIX

### Relationship and visibility model

- **Following:** Accounts the user follows. MVP lists contain these accounts and control only what the owner sees.
- **Followers:** Accounts that follow the user. They are not automatically members of a viewing circle. Whether they can see the owner's posts follows the owner's existing account and post privacy settings, regardless of the owner's circles.
- **Post visibility:** A viewing circle only filters posts already available to the owner under each poster's privacy settings; it neither exposes a private post nor restricts access to the owner's posts.
- **User A and User B:** User A is the account owner selecting and filtering; User B is an account User A follows or previously followed. User B can belong to several of User A's private circles. Circle actions never notify User B, while a new follow request follows the platform's normal behavior.
- **Home:** The default feed, which respects hidden-list settings.
- **ALL:** An always-available, unfiltered view of every followed account's eligible feed posts; it is not a deletable circle and is not limited by paid capacity. The 20-person free cap applies only to custom circles, so users can still browse every followed account.
- **Overlapping lists:** Selecting several lists shows the union of eligible posts without duplicates. Hiding a list suppresses its members from Home even if they also belong to a visible list; opening a chosen list or **ALL** still shows eligible posts.
- **Membership labels:** Every account row may show all of that account's circle memberships, including circles outside the currently selected filter. These labels provide context only; they do not add accounts to or remove accounts from the filtered result.
- **Combined people lists:** One account appears once in **ALL** or a combined circle selection. The same account may appear in multiple separately opened circles because those are different views.

### Later New Feature PRD candidates

- **Pricing tradeoff:** The 20-person free cap intentionally lets users try focused circles while charging for larger ones. This may limit how well free circles serve users who want to organize hundreds of accounts into broad groups; measure failed add attempts, upgrade conversion, and abandonment at the cap. The one-time member tiers apply to all custom circles; the separate $5.00 purchase adds 10 circle slots and may be repeated.
- **Additional surfaces:** Stories, reels, reposts, search, notifications, messages, and profile activity can be evaluated after feed filtering proves useful.
- **Circle notifications:** A later feature may let the owner filter the in-app notification list by one or more circles. One event should appear once in a combined view, carry all applicable circle labels, and produce no duplicate push alerts merely because its sender belongs to several circles.
- **Relationship recovery:** Circle removal, circle deletion, and unfollowing are different events in the private history. Restoring circle membership never silently re-follows an account; restoring a follow never bypasses private-account approval.
