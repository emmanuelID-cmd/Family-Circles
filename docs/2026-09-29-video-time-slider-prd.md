# Family Circles In-View Video Time Slider
*Product Requirements Document: New Feature — Revised copy*

**Feature name:** In-View Video Time Slider, Preview, and Precision Controls
**Owner:** Family Circles product team
**Source:** Family-Circles-Video-Time-Slider-New-Feature-Plain.pdf (provided local PDF)
**Revision date:** September 29, 2026

> This dated Markdown copy preserves the source PRD structure and adds approved decisions. Priority indicates importance, not delivery status. No operational video player or slider was found in the audited repository; see the [evidence report](2026-09-29-prd-evidence-report.md). A revised PDF is not included because this environment cannot render and visually verify one.

## 1. PROBLEM

Family Circles members need an easier way to find moments in supported Reels, Stories, collage posts, highlights, and other videos. Existing playback alone can make a desired moment slow to reach. A timeline should work for touch users as well as pointer users, provide useful visual previews, and avoid accidental video gestures. Clear interval and end-of-content behavior is also needed so users are not forced into an unnecessary final press or left unsure whether a Story sequence has ended.

### 1a. Background & Dependencies

- Reuse existing Family Circles media surfaces and content permissions when those surfaces exist; this repository audit did not find an operational media viewer.
- The timeline is attached to the open video viewing area, not its thumbnail. Touch operation is required and must not depend on hover.
- Valid duration metadata and previewable frames are dependencies. Missing or invalid metadata must not be presented as accurate timing.
- Existing media access permission, playback, error, keyboard accessibility, and focus requirements remain applicable.
- A Reel thumbnail may separately display total duration at the far bottom-left if that presentation is retained.
- Exact interval boundaries, playback gestures, supported media surfaces, and the maximum video duration require product decisions listed below.

### 1b. Target Use Cases

As a Family Circles member, I want to scrub a video with touch or a pointer and inspect a synchronized preview so that I can find a moment without watching from the beginning.

As a Family Circles member, I want playback controls that distinguish taps and holds from timeline gestures so that I can pause, skip, or temporarily change speed without accidental actions.

As a Family Circles member, I want frame-by-frame movement while paused so that I can inspect a precise moment.

As a member browsing Reels, I may want total duration shown on a Reel thumbnail so that I can gauge its length before opening it.

### 1c. Current User Journey

1. A member opens a supported video surface they are already authorized to view.
2. The member wants to find a moment, inspect a preview, move by an interval, or control playback speed.
3. The member uses a touch- or pointer-operable timeline and distinct video-area controls.
4. The selected position and any preview reflect valid media timing; playback can resume at the selected position.
5. If timing metadata or preview frames are unavailable, the member can still use supported normal playback and receives a truthful fallback.

**Current implementation note:** The audited branch has no operational video player, Story media, video timing, or slider, so this is a proposed journey, not a description of current product behavior.

## 2. PROPOSED SOLUTION

Add a time slider to the active viewing area for every supported video surface. Users can drag it with touch or a pointer, see the selected timestamp and total duration, inspect a synchronized preview, and play from the selected position. Separate controls in the video area support interval skips, pause/resume, temporary speed, and—while paused—precision frame movement. A saved playback-speed preference is distinct from the temporary 2.00× hold. A short-range timeline mode and a return marker provide finer navigation. All previews remain subject to the media's existing permissions; invalid metadata or failed previews fall back without blocking normal playback.

**Interaction priority:** Core slider, playback, permission, and fallback behavior is P0. Synchronized previews are P1. Frame-step acceleration, expanded short-range timeline, return marker, and persistent speed preference are P2 unless reprioritized through product approval.

### 2a. Value Proposition

Family Circles members who want to find moments in supported video use an in-view timeline with synchronized previews and precise playback controls. Unlike a hover-only timeline or coarse playback alone, the control works for touch and pointer users, keeps seeking distinct from video-area gestures, and retains existing content permissions.

### 2b. Goals & Out-of-Scope

#### Goals

- Reduce effort required to locate a moment in supported video.
- Make timestamp previews and duration information synchronized and accurate when valid metadata exists.
- Make tap, hold, frame, and slider gestures predictable across supported devices.
- Preserve media permissions and provide usable fallbacks when previews or timing fail.
- Allow users to retain a preferred playback speed across supported videos and sessions.

#### Out-of-Scope

- Replacing the full video player or creating editing/trimming tools.
- Starting audio unexpectedly.
- Exposing media beyond existing audience permissions.
- Using hover as the only way to reveal or operate the timeline.
- Defining longer-than-five-minute support until the existing five-minute cap conflict is resolved.
- Any claims that the prototype currently streams, previews, or controls Instagram media.

### 2c. Measurable Outcomes

Targets below retain the source PRD's hypotheses; validate the denominator and instrumentation before launch.

| Metric | How it's measured | Baseline | Target |
| :---- | :---- | :---- | :---- |
| Slider adoption | Eligible video-view sessions with at least one time-slider interaction | 0% before launch; feature not yet available | At least 20% within 30 days |
| Preview reliability and responsiveness | Successful timestamp previews; median pointer/touch-to-preview update time | Not measured; establish in release testing | At least 95% success; median under 300 ms |
| Interval completion | Supported video and Story sequences reaching intended completion without an extra last-second press | Not applicable before launch; verify in acceptance tests | At least 95% successful completion |
| Control accuracy | Gestures producing the intended action in device and accessibility testing | Not measured | Establish a pass threshold before implementation sign-off |
| Saved-speed persistence | Valid preference retained across supported videos and sessions | Not applicable before launch | 100% of tested save/reload cases |

## 3. REQUIREMENTS

### User Journey 1: Member previews and navigates media while watching

**Context:** A member is watching eligible media and wants to find a moment or move through the item without losing their place.

**Sub-journey: Scrub and preview a timestamp**

- **[P0]** User can drag the slider left or right with touch or a pointer to seek backward or forward within every supported video surface.
- **[P0]** User can see the selected timestamp and total duration while scrubbing.
- **[P0]** User can start or resume playback from the selected position.
- **[P0]** User can use slider gestures without triggering the video-area tap or hold controls.
- **[P0]** User sees previews only for media they are already authorized to view.
- **[P0]** User can continue normal playback and navigation if preview frames fail to load.
- **[P0]** User sees accurate duration only when valid metadata exists; missing or invalid duration is treated as unavailable.
- **[P1]** User sees a synchronized frame preview and timestamp while scrubbing without needing to play the full video.
- **[P1]** User can move the pointer away and return the viewing area to its normal playback presentation; keyboard focus changes must not discard a confirmed seek unexpectedly.
- **[P1]** User receives a clear fallback when previews or duration metadata are unavailable.
- **[P2]** User may see total Reel duration at the far bottom-left of its thumbnail when metadata is valid and the optional label is enabled.

**Sub-journey: Use touch, keyboard, and existing permissions**

- **[P0]** Touch-only users can operate the timeline and existing player controls without hover.
- **[P0]** Preview and playback obey the existing media permission and audience checks.
- **[P1]** User can operate the slider by keyboard and identify it with an accessible name, current value, total duration, and visible focus.
- **[P1]** Loading and preview errors are announced accessibly without trapping focus or blocking normal playback.

### User Journey 2: Member uses video-area playback controls

**Context:** The member acts on the video itself; these gestures remain distinct from dragging the timeline.

**Sub-journey: Control playback while playing**

- **[P0]** A left-area tap skips backward by the configured interval.
- **[P0]** A right-area tap skips forward by the configured interval.
- **[P0]** A center tap pauses playback.
- **[P0]** Holding the center produces no action.
- **[P0]** Holding the right area temporarily sets playback to 2.00×; release restores the saved playback speed without changing the saved preference.
- **[P0]** User can advance through duration-based video intervals without a separate press solely for the final second; for a two-minute video using 30-second intervals, the third press lands at 1:29 and no extra press at 1:59 is required.
- **[P1]** User receives visible, transient feedback for interval skips and temporary speed.

**Sub-journey: Advance through and finish a Story sequence**

- **[P0]** User can advance once per Story; in a five-Story sequence, the fifth press completes the sequence and exits.
- **[P1]** User can tell which interval or Story is active while the interval control is available.

**Sub-journey: Control playback while paused**

- **[P0]** A left or right tap moves exactly one frame backward or forward and remains paused.
- **[P0]** A center tap resumes playback.
- **[P2]** Holding left or right repeats frame steps and accelerates according to hold duration.
- **[P2]** Releasing the control stops frame stepping and leaves playback paused.
- **[P2]** A right hold while paused accelerates frame stepping; it does not activate temporary 2.00× playback.

### User Journey 3: Member uses precision timeline features

**Context:** The member wants finer control than the full-duration timeline provides.

**Sub-journey: Expand a shorter time range**

- **[P2]** Holding the slider stationary reveals a shorter time range around the selected moment for finer navigation.
- **[P2]** The expanded slider's timing, dismissal, and release behavior are consistent with the committed selection and do not accidentally invoke a video-area hold.

**Sub-journey: Return to the original position**

- **[P2]** User can see a marker at the position where the current scrubbing session began and return to it.
- **[P2]** Marker is distinguishable by shape or label and not color alone; red remains a candidate, not a finalized color.
- **[P2]** Marker lifetime and clearing behavior are defined before implementation.

### User Journey 4: Member sets playback speed

**Context:** A persistent preference is separate from a temporary in-progress speed gesture.

**Sub-journey: Save and restore a preferred speed**

- **[P2]** User can choose from 0.25×, 0.50×, 0.75×, 1.00×, 1.25×, 1.50×, 1.75×, 2.00×, and 3.00×.
- **[P2]** Playback defaults to 1.00× and the selected preference persists across supported videos and sessions.
- **[P2]** User can see the active speed.
- **[P2]** Changing speed while paused does not resume playback.
- **[P2]** While playing, right-hold temporarily selects 2.00× even if the saved preference is 3.00×; release restores the saved preference without changing it.
- **[P2]** While paused, right-hold accelerates frame stepping instead of changing playback speed.

### 4. APPENDIX

#### Design Decisions and Superseded Source Requirements

- **Touch and pointer:** The source PRD reveals the slider on hover. The approved requirement expands operation to touch; hover may remain an optional pointer affordance but cannot be the only access path.
- **Speed gesture:** The source PRD proposes long-press plus slide down/up for speed. The approved behavior replaces that with a fixed right-area hold at 2.00× while playing; release restores the saved preference. Right-hold while paused is frame stepping.
- **Five-minute maximum:** The source PRD limits supported video to five minutes. The newer request discusses longer videos but does not explicitly remove the limit. Keep this as an unresolved product decision; do not claim long-video support until resolved.
- **Reel thumbnail duration:** The source's optional bottom-left duration cue is not contradicted; retain as optional P2 when valid metadata is available.
- **Stories and intervals:** Preserve the source's requirement to complete a five-Story sequence on its fifth press and avoid an unnecessary final interval press unless an approved behavior supersedes it. Exact durations, sequence semantics, and completion timing remain unresolved.
- **Gesture collision:** Double-tap means Favorite, but rapid pause/resume and repeated single-frame taps may be misrecognized as a double-tap. A 300 ms recognition window was suggested but never finalized. Do not select a threshold or precedence rule without product approval.

#### Open Questions

Resolve before implementation sign-off:

1. Does the five-minute maximum remain, or should videos longer than five minutes be supported?
2. Which media surfaces are supported in the first release, and what constitutes a Story item/sequence?
3. What are the interval durations and boundary rules by video length, including the final interval and exact Story completion behavior?
4. How should double-tap Favorite coexist with center-tap pause/resume and rapid frame taps? Is any recognition window appropriate, and what is its measured threshold?
5. What long-press thresholds distinguish timeline expansion, video-area temporary speed, and paused frame-repeat?
6. What frame-step acceleration rates and limits apply as hold duration increases?
7. How long does the return marker remain visible, and what event clears it?
8. How is expanded-slider mode dismissed, and does releasing the slider seek, resume, or preserve pause state?
9. Which preview source and media pipeline provide seekable frames and duration metadata, and what fallback appears on processing failure?
10. Which playback-speed settings are persisted per user/profile, and how are storage failures surfaced?
11. What gesture feedback and accessibility announcements are required without obscuring video or causing unexpected audio?

#### Implementation Status (audited September 29, 2026)

| Status | Evidence |
| :---- | :---- |
| Approved, not implemented | No video player, `<video>` surface, playback state, seeking, frame preview, speed control, or video-specific test was found in the inspected source, migrations, or available Git history. |
| Source requirements retained with conflict | Hover-only reveal, five-minute cap, slide-down/up speed, interval advancement, five-item Story completion, optional Reel duration, permissions, metadata failure, and keyboard access are documented in the original four-page PDF. The newer approved touch, right-hold, preview, frame, and persistent-speed requirements update or extend these; unresolved contradictions are listed above. |
| Proposals or unresolved | Any unapproved 300 ms gesture threshold, five-minute-cap resolution, exact intervals, timing thresholds, acceleration rates, marker lifecycle, and exact supported surfaces remain undecided. |

#### Other links

- Original source PDF: `C:\Users\dejes\Downloads\Family-Circles-Video-Time-Slider-New-Feature-Plain.pdf` (preserved unchanged outside the repository).
- Companion repository evidence: [2026-09-29 PRD evidence report](2026-09-29-prd-evidence-report.md).
