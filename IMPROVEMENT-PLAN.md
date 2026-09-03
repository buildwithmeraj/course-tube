# Course Tube — Improvement Plan

**Scope:** free hobby project. No paid tier, no billing, no entitlements.
Limits exist to protect shared resources and deter abuse, not to sell upgrades.

**Prepared:** 4 September 2026 · **Source:** `course-tube` @ `6df4f45` + the security remediation of findings 01–27
**Current scale:** 23 courses · 1,011 videos · 28 users · 54 enrolments · 5 categories · ~2.7 MB of data

---

## 1. Recommendation: don't fork. Improve in place.

The case for a fork was almost entirely the case for billing — TypeScript before you
touch money, entitlement isolation, a clean migration for paying users. Drop the paid
tier and that case mostly collapses.

Improve the existing repository on branches instead:

- The security work is already done and sitting in your working tree. Forking means
  re-landing it or carrying it across.
- Your 28 users and their progress stay put. No migration, no cutover.
- Every improvement below is independently shippable. A hobby project that needs three
  weeks of invisible foundation work before anything improves is a hobby project that
  gets abandoned.

The one thing worth borrowing from the fork plan is **TypeScript**, and even that can be
incremental: Next.js supports `.ts`/`.tsx` alongside `.js`/`.jsx` in the same tree. Add
`tsconfig.json`, then convert files as you touch them, starting with `src/lib/`. No
big-bang rewrite.

---

## 2. Already done

Findings 01–27 from the audit are fixed in the working tree (40 files, +566/−724,
uncommitted): the admin backdoor, unauthenticated sync, the client-side YouTube key,
approval enforcement, regex injection, the contact-form relay, the driver return-shape
bug, progress loss on sync, and the medium/low cleanups. `scripts/create-indexes.mjs`
exists but has **not** been applied.

Still outstanding from that work:

- The imgbb key is exposed in the client bundle (`Register.jsx`). Move the upload
  server-side or drop avatar upload — and rotate the key either way.
- Run `npm run create-indexes --apply`.
- Rotate the YouTube key; delete the unreferenced `NEXT_PUBLIC_YOUTUBE_API` from `.env`.
- Purge `demo@admin.com` from the production `users` collection.

---

## 3. Performance

### 3.1 The biggest single win: stop shipping descriptions you don't display

`GET /api/courses/[id]/videos` returns every field of every video, including the full
YouTube description. The UI renders exactly one description at a time — the selected
video's.

Measured against your real data:

| | |
|---|---|
| Descriptions as a share of the `videos` collection | **81%** (2.10 MB of 2.58 MB) |
| Average description | 2,182 characters |
| Your largest course (121 videos) | **~520 KB of text per page load** |
| Next two largest | ~447 KB, ~250 KB |

Two independent fixes, both cheap:

1. **Project descriptions out of the list endpoint.** Return them from a per-video
   endpoint, or include only the selected video's. This alone removes ~500 KB from the
   worst page.
2. **Truncate on ingest.** A 1,000-character cap cuts the stored description bytes by
   **61%** and touches 649 of 1,011 videos; a 500-character cap saves 78%. Descriptions
   are display-only here, and YouTube descriptions past the first paragraph are almost
   always links and boilerplate. I'd cap at 1,000 and keep a "view on YouTube" link.

### 3.2 Rendering strategy

15 components fetch their own data client-side inside `useEffect`; exactly one
(`EnrolledCourses.jsx`) fetches on the server. Consequences: nothing renders until JS
loads and hydrates, `CourseDetails` fires three requests and derives state from all
three, and `/api/courses` explicitly disables caching (`force-dynamic`, `revalidate = 0`,
`no-store`).

Convert the read-heavy public pages to Server Components with sensible `revalidate`
values — course list, course detail, categories. Public course data changes rarely.
Keep client fetching only where it earns its place: the player page.

The skeleton components you already have (`PlaylistCardSkeleton`, `VideoListCardSkeleton`)
are good; wire them into `loading.tsx` at each route instead of into `useState` flags.

### 3.3 Dependencies to shed

- **`styled-components`** is imported by exactly one file (`ThemeSwitcher.jsx`) — a whole
  CSS-in-JS runtime, with its RSC friction, for one toggle. The project already has
  Tailwind 4 and daisyUI. Delete it.
- **`animate.css`** is imported by two files (`Hero.jsx`, `Loading.jsx`) for a couple of
  effects. Replace with Tailwind keyframes.

### 3.4 Indexes and the auth round trip

Apply the nine missing indexes. Separately, the NextAuth `jwt` callback re-reads the user
from the database on every token refresh to refresh the role. Without billing this is
less critical, but it is still a database round trip per authenticated request — give it
a 30–60 second TTL cache.

---

## 4. Video player

### 4.1 There is a real bug to fix first

`YouTubePlayer.jsx` runs its setup effect with dependencies `[video, onEnd]` and destroys
the player in cleanup. `onEnd` is `handleVideoEnd` from `CourseVideos.jsx:148`, which is
**not** wrapped in `useCallback` — it gets a new identity on every render. So every
re-render of the parent tears down the YouTube player and builds a new one. A toast, the
enrolment check resolving, or the router updating `?video=` can restart playback.

Fix by inverting the lifecycle: create the player **once**, hold callbacks in a ref, and
change videos with `player.loadVideoById()` rather than destroy/recreate.

### 4.2 Features, in the order I'd build them

1. **Resume at timestamp.** The most-missed thing in the current app. Poll
   `getCurrentTime()` every ~5s, persist throttled, restore on load. Requires §5.
2. **Accurate completion.** Today a video only completes on the `ENDED` event, so anyone
   who skips the outro never completes it. Mark complete at ~90% watched.
3. **Chapters from the description.** YouTube descriptions are full of `12:34 Topic`
   lines. `VideoDescription.jsx` already parses URLs out of descriptions — extend it to
   timestamps and render a clickable chapter list. Cheap, high perceived value. (Do this
   before truncating descriptions, or parse chapters at ingest and store them
   structurally — which is better anyway, and makes §3.1 free.)
4. **Autoplay-next with a cancellable countdown**, replacing the current immediate jump.
5. **Persistent playback rate and volume** across videos and sessions.
6. **Keyboard shortcuts** (`j`/`k`/`l`, arrows, space, `f`), checked against the embedded
   player's own handling.

### 4.3 What not to build

Even as a free hobby project, the YouTube API Terms still apply: use the embedded player,
don't obscure or replace its controls or branding, don't strip ads, don't download or
proxy video. Staying free removes the monetisation question entirely — which is a genuine
simplification — but not these.

---

## 5. The one data-model change worth making

Progress today is a single high-water pointer:

```
{ _id, courseId, userEmail, finishedVideo }
```

This cannot express resume-at-timestamp, out-of-order completion, or per-video timestamps
— so it blocks §4.2 items 1 and 2, which are the two best player improvements available.
Replace it with one document per (user, video):

```js
{
  userEmail, courseId, videoId,
  completedAt,        // null until complete
  positionSeconds,    // resume point
  updatedAt,
}
```

Keep a rollup on the enrolment row (`completedCount`, `lastVideoId`, `lastActiveAt`) so
the course list doesn't need to aggregate on every render.

You have **12 progress documents**. This migration will never be cheaper. The two other
model issues from the fork plan — email-as-identity and missing course ownership — matter
much less without billing, but **course ownership (`ownerEmail` on the course document)
is now a prerequisite for the per-user limits in §7**, so add that field too.

---

## 6. Security: what's left

The audit items are done. Two gaps remain that matter for a public free app:

- **Sign-in has no rate limit.** Registration and the contact form now do, but the
  credentials `authorize()` path is unthrottled — that's an open door for credential
  stuffing against your 28 accounts. Reuse `rateLimit.js`, keyed on IP *and* on the
  attempted email.
- **No security headers.** `next.config.mjs` sets none. Add CSP, HSTS,
  `X-Content-Type-Options`, `Referrer-Policy`, and a frame policy. The CSP must allow
  `youtube.com` / `ytimg.com` frames and images.

Worth adding while you're there: account deletion (a free app still gets that request),
and an admin action log so "who approved or deleted this" has an answer.

---

## 7. Limits

Since nothing is being sold, limits have exactly three jobs: **protect the YouTube API
quota, protect your storage, and protect your own attention as the sole moderator.** Set
them so a genuine enthusiast never notices them and a script hits a wall immediately.

### 7.1 What's actually scarce

| Resource | Ceiling | Reality at your scale |
|---|---|---|
| YouTube API quota | 10,000 units/day | Adding/syncing a course costs `1 + 2·ceil(N/50)` units — 3 for your average 44-video course, 9 for a 200-video one. Room for ~1,100–3,300 course operations a day. **This is the constraint that actually bites.** |
| MongoDB Atlas free tier | 512 MB | You're using ~2.7 MB. At 2.6 KB per video document that's headroom for roughly 190,000 videos — about 4,300 more courses. **Not the binding constraint**, and §3.1's truncation buys another 61%. |
| Admin approval queue | one human | Arguably your real limiter. Nothing technical protects it today. |
| Gmail sending | ~500/day | Contact form only, already rate-limited. |

The honest summary: **storage is not your problem, quota and moderation attention are.**
Size the limits accordingly rather than inventing scarcity where there is none.

### 7.2 Proposed values

Generous on purpose — your entire catalogue is 23 courses, so a 50-course per-user cap is
more than double the whole site's current content.

**Per user**

| Limit | Value | Why |
|---|---|---|
| Courses owned | 50 | Twice the entire current catalogue. Only a script reaches this. |
| Courses added per day | 10 | ~30–90 quota units/day per user. Caps the blast radius of one bad actor. |
| Videos per course | 300 | Your largest course is 121. |
| Manual syncs per day | 5 | Across all courses; the 7-day per-course interval stays as it is. |
| Pending (unapproved) submissions | 5 | Protects the moderation queue, not the database. |

**Per IP, unauthenticated**

| Limit | Value | Why |
|---|---|---|
| Sign-in attempts | 20 / 15 min | Currently unlimited — see §6. |
| Registration | 10 / hour | Already implemented. |
| Contact form | 5 / hour | Already implemented. |
| Search | 60 / min | Currently unlimited, and each query is a regex scan. |

**Global circuit breakers**

| Limit | Value | Why |
|---|---|---|
| Daily YouTube quota budget | stop ingestion at 8,000 units | The most valuable limit on this list. Track units consumed per day and refuse new ingestion above the threshold, leaving headroom so browsing still works. Without this, one busy day silently breaks course-adding for everyone until midnight Pacific. |
| Total pending queue | 200 courses | Refuse new submissions when the backlog is that deep. |

### 7.3 Implementation

`src/lib/rateLimit.js` already does fixed-window limiting in Mongo, survives serverless
instance churn, and is tested (verified: allows 5, blocks the 6th, resets on expiry).
Every per-IP limit above is a call to it.

The per-user limits are counting queries, not rate limits — `countDocuments({ ownerEmail })`
against the cap, which is why §5's ownership field is a prerequisite.

The quota budget is a single counter document keyed by date, incremented by the unit cost
inside `youtubeApi.js` where the calls already are. Put the check in one place —
`requireQuota(units)` at the top of `fetchPlaylistVideos` — so it can't be bypassed by a
new caller.

Return **429 with a plain, human message** for every one of these. A hobby project that
silently fails is worse than one that says "you can add 10 courses a day, try again
tomorrow."

---

## 8. UI

The current UI is daisyUI defaults with `rounded-3xl` and `backdrop-blur` applied fairly
uniformly. Competent, but it reads as a template.

- Pick a real type pairing and a palette that is yours. Cheapest credibility available,
  and for a hobby project it's the part that makes it feel like *yours*.
- Spend the design effort on the player page. That's where the time is spent; the
  marketing pages matter far less.
- Make progress tangible — a streak, a weekly heatmap, "3 videos left". This is the
  emotional core of a study tracker and it's what brings people back.
- Mobile-first for the player page specifically.

---

## 9. Order of work

Each phase ships something visible. No invisible foundation phases.

1. **Land what exists.** Commit the remediation, apply the indexes, rotate the keys, purge
   the demo admin, fix the imgbb key. *(hours)*
2. **Player lifecycle bug + description projection.** Two contained fixes, both immediately
   felt — playback stops restarting, and the biggest page drops ~500 KB. *(a day)*
3. **Progress model + resume-at-timestamp + accurate completion.** The migration and the
   two features it unlocks, together. *(a weekend)*
4. **Limits.** Ownership field, per-user caps, sign-in throttle, quota circuit breaker.
   *(a weekend)*
5. **Server Components for the public pages**, drop `styled-components` and `animate.css`,
   security headers. *(a weekend)*
6. **Chapters, autoplay countdown, playback-rate persistence, keyboard shortcuts.**
   *(incremental)*
7. **UI identity pass.** *(as long as you enjoy it)*

TypeScript rides along from step 2 onward: convert each file as you touch it.

---

## 10. Open decisions

1. **Description truncation cap** — 1,000 chars saves 61%, 500 saves 78%. Parse chapters
   at ingest first if you want §4.2's chapter list, then truncation costs you nothing.
2. **Keep the admin approval workflow?** It doesn't scale past a few hundred courses with
   one moderator. Alternatives: auto-approve with a report button, or keep submissions
   private by default and curate a small public catalogue.
3. **Whether limits apply to you.** Give the admin role an exemption, or you'll trip your
   own quota breaker while testing.
