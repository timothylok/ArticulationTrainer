# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Copy this file into any new project and fill in the project-specific sections marked with `[FILL IN]`.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

---

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.
- For exploratory questions ("what could we do about X?"), respond in 2–3 sentences with a recommendation and the main tradeoff. Don't implement until the user agrees.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan before starting:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## 5. Safety & Security

**Never introduce vulnerabilities. Never take irreversible actions silently.**

Code safety:
- Never introduce SQL injection, command injection, XSS, path traversal, or hardcoded secrets.
- Validate only at system boundaries (user input, external APIs). Trust internal code.
- Never commit `.env`, credentials, or API keys. Warn the user if they try to.

Destructive action guard — pause and confirm before any action that is:
- Hard to reverse: `git reset --hard`, force-push, dropping tables, deleting files.
- Visible to others: pushing code, opening/closing PRs, sending messages.
- Affecting shared state: CI/CD changes, infrastructure modifications, shared config.

One user approval does not authorize the same action in all future contexts. Confirm each time unless the user has explicitly pre-authorized it in this file.

## 6. Dependency & File Discipline

**Don't add weight without a reason.**

- Don't add a new package if the standard library or an already-imported dependency covers it.
- When adding a dependency, name it and state why the existing stack doesn't cover it.
- Prefer editing existing files over creating new ones.
- Never create documentation files (`.md`, `README`) or test scaffolding unless explicitly asked.
- Don't create planning or analysis documents — work from conversation context.

## 7. Git Discipline

**Commits are intentional. Branches are sacred.**

- Never commit unless the user explicitly asks.
- Never amend a published commit — create a new one instead.
- Never skip hooks (`--no-verify`) or bypass signing unless the user explicitly instructs it.
- Never force-push to `main`/`master` — warn the user if they request it.
- Commit messages: one line, imperative mood, explain *why* not *what*.

## 8. Response Style

**Terse and precise. No filler.**

- No emoji unless the user asks for them.
- No trailing summaries of what you just did — the user can read the diff.
- One sentence per update while working. Silent is not acceptable; verbose is.
- When referencing code, include `file_path:line_number` so the user can navigate directly.
- End-of-turn: one or two sentences — what changed and what's next. Nothing else.

---

## 9. Project Memory

**Read memory first. Keep it current. Don't let it go stale.**

### Where memory lives

This project's memory file is at:
```
C:\Users\timlo\.claude\projects\D--AI-Articulation\memory\
```

The memory index is at:
```
C:\Users\timlo\.claude\projects\D--AI-Articulation\memory\MEMORY.md
```

### When to read memory

When asked to assess, explain, or verify anything about this project — architecture, pipeline behaviour, scheduling, data flow — **read the memory file first**. Only go to source files if memory is silent or ambiguous.

### When to update memory

At the end of any session where significant changes were made, update the memory file when:
- Architecture changes
- New phases or milestones complete
- Pipeline or scheduler changes
- New canonical file locations are established
- Key decisions are made that aren't obvious from the code

### Project-specific session log

At the end of each session, manually append an entry to `D:\AI\Articulation\SESSIONS.md`:

```
## YYYY-MM-DD
- What was done
- What changed
- What's next
```

No script — this is a manual step. There is no automation that writes entries.

### Source of truth hierarchy

```
Memory file  >  Source code  >  Generated artifacts (HTML, reports, cached output)
```

Never read generated artifacts (HTML, compiled output, cached reports) for project context — they are human-readable outputs, not authoritative state.

---

## 10. Project-Specific Context

**Executive Articulation Training System** — weekday speaking-drill platform targeting CTO-advisor communication skills.

### Stack

- Next.js App Router (TypeScript)
- Tailwind CSS + shadcn/ui
- LLM fallback chain (`lib/llm.ts`): MiniMax M3 → Agnes AI (`agnes-2.0-flash`) → Groq (`llama-3.3-70b-versatile`)
- Groq Whisper (`whisper-large-v3-turbo`) — audio transcription
- Notion API — persistent storage (Speaking Sessions, Career Goals, Weekly Reviews)
- cron-job.org — daily/weekly webhook triggers
- Vercel — hosting + env var management (`https://articulation-trainer.vercel.app`)

### Key files and entry points

- `app/page.tsx` — main daily drill page (prompt, recorder, feedback)
- `app/history/page.tsx` — past sessions list
- `app/weekly/page.tsx` — weekly summaries
- `app/settings/page.tsx` — career goals and mode config
- `app/api/prompt/route.ts` — GET: generate/fetch today's prompt
- `app/api/transcribe/route.ts` — POST: audio blob → transcript
- `app/api/analyze/route.ts` — POST: transcript → rubric scores + feedback
- `app/api/notion/log/route.ts` — POST: store session in Notion
- `app/api/weekly-review/route.ts` — POST: aggregate + summarize week
- `app/api/webhook/daily/route.ts` — cron trigger (daily)
- `app/api/webhook/weekly/route.ts` — cron trigger (weekly/Friday)
- `lib/llm.ts` — cloud LLM fallback chain (MiniMax → Agnes → Groq)
- `lib/prompts.ts` — system prompts (generation + analysis rubric + weekly summary)
- `lib/notion.ts` — Notion client + typed helpers (logSession, fetchSessions, logWeeklyReview, fetchWeeklyReviews)
- `lib/scoring.ts` — WPM, filler count, derived metrics
- `lib/config.ts` — constants, rubric weights, mode rotation
- `lib/getPrompt.ts` — server-side prompt generation (called directly, not via HTTP, to bypass auth proxy)
- `proxy.ts` — password-based route protection (Next.js 16 uses proxy.ts, not middleware.ts)
- `PERSONA.md` — CTO-advisor persona details used in prompt generation

### Environment variables

- `MINIMAX_API_KEY` — MiniMax M3 (primary LLM; not yet confirmed working)
- `AGNES_API_KEY` — Agnes AI `agnes-2.0-flash` (current effective primary LLM)
- `TRANSCRIBE_API_KEY` — Groq key; dual-use: Whisper transcription + Groq LLM fallback
- `NOTION_API_KEY` — Notion integration token
- `NOTION_DB_SESSIONS` — Notion database ID for Speaking Sessions
- `NOTION_DB_GOALS` — Notion database ID for Career Goals
- `NOTION_DB_WEEKLY` — Notion database ID for Weekly Reviews
- `APP_PASSWORD` — single shared password for auth cookie
- `CRON_SECRET` — shared secret to authenticate cron-job.org webhook calls
- `NEXT_PUBLIC_BASE_URL` — set to Vercel URL in production (`https://articulation-trainer.vercel.app`)

### Architecture / data flow

cron-job.org (or user) hits `/api/webhook/daily` → calls `getPrompt()` directly to pre-generate scenario via LLM chain (pulling Career Goals from Notion). User opens app → server component calls `getPrompt()` directly → records audio via `MediaRecorder` → POST to `/api/transcribe` (Groq Whisper) → POST transcript to `/api/analyze` (LLM rubric scoring) → POST structured result to `/api/notion/log` → feedback displayed. Friday: cron hits `/api/webhook/weekly` → `/api/weekly-review` fetches last 5 sessions from Notion → LLM generates summary → stored in Weekly Reviews.

### Pre-authorized destructive actions

None — confirm all destructive/shared-state actions per session.

---

## 11. Lessons Learned

Generalized patterns from past mistakes — apply these proactively.

| Lesson | Pattern | How to avoid |
|--------|---------|--------------|
| Memory before files | Inspected source before checking memory; found contradictory state | Always read memory file first for context on established architecture |
| Stop hooks don't write entries | Assumed automation handled session log; log went stale | Manually add log entries before running any regeneration script |
| Confirmation scope | User approved an action once; assumed blanket approval | Re-confirm destructive or shared-state actions each session unless pre-authorized in this file |
| Speculative error handling | Added validation for states that can't occur internally | Only validate at true system boundaries; trust internal invariants |
| Silent interpretation | Picked one of two interpretations and implemented without asking | Surface ambiguity before touching code |
| Notion property name exactness | `Business alignment ` (trailing space) silently broke all session saves | Always verify Notion property names via API with `JSON.stringify(key)` before wiring writes |
| Fire-and-forget must still log | `.catch(() => {})` hid Notion errors for the entire session | Use `.then(r => { if (!r.ok) console.error(...) }).catch(err => console.error(...))` |
| MediaRecorder timeslice unreliable | `recorder.start(250)` only delivered final chunk in some browsers | Use `recorder.start()` with no timeslice — all audio arrives in one event on stop |
| Groq models decommission | `llama-3.1-70b-versatile` caused runtime error after decommission | Verify model names against Groq docs before hardcoding; current: `llama-3.3-70b-versatile` |
| App Router useSearchParams | `useSearchParams()` in a client component crashes the Vercel build | Wrap the component using `useSearchParams` in `<Suspense>` at the page level |
| proxy.ts not middleware.ts | Next.js 16 changed middleware convention; never import `@/lib/*` inside proxy.ts (Edge runtime) | File must be `proxy.ts`, export `default function proxy(...)`, inline any constants needed |

---

**These guidelines are working if:** diffs contain fewer unnecessary changes, rewrites due to overcomplication decrease, and clarifying questions arrive before mistakes rather than after.

## 12. Project: Executive Articulation Training System  
**Purpose:** Build a weekday articulation‑training platform that turns a Senior Technical PM into a **trusted delivery advisor to CTOs** through daily speaking drills, transcription, LLM analysis, and Notion‑based progress tracking.

---

# 1. High‑Level Architecture

**Pattern:**  
Next.js (App Router) → API Routes → Claude (LLM) + Whisper (transcription) → Notion (storage) → cron-job.org (scheduling)

**Core loops:**

- **Daily (Mon–Fri):**  
  Generate leadership prompt → Record audio → Transcribe → Analyze → Store → Display feedback

- **Weekly (Fri):**  
  Aggregate week → Claude summary → Store → Display

---

# 2. Tech Stack Overview

### Frontend
- Next.js App Router (TypeScript)
- React + Tailwind or shadcn/ui
- Browser `MediaRecorder` for audio capture
- Server Components for data fetching
- Simple password auth via middleware

### Backend
- Next.js API routes (`app/api/*`)
- Claude API (Sonnet/Haiku) for:
  - Prompt generation  
  - Speech analysis  
  - Weekly summaries  
- Whisper‑compatible transcription API (e.g., Groq Whisper)
- Emotion/sentiment classifier API (text‑based)

### Data Layer
- Notion databases:
  - `Speaking Sessions`
  - `Career Goals`
  - `Weekly Reviews`

### Scheduling
- cron-job.org hitting:
  - `/api/webhook/daily`
  - `/api/webhook/weekly`

### Secrets
- Stored in Vercel env vars:
  - `ANTHROPIC_API_KEY`
  - `TRANSCRIBE_API_KEY`
  - `NOTION_API_KEY`
  - `NOTION_DB_SESSIONS`
  - `NOTION_DB_GOALS`
  - `NOTION_DB_WEEKLY`
  - `APP_PASSWORD`
  - `CRON_SECRET`

---

# 3. Folder Structure (Claude Code should scaffold this)

```
/app
  /page.tsx                 // Today’s prompt, recorder, feedback
  /history/page.tsx         // Past sessions
  /weekly/page.tsx          // Weekly summaries
  /settings/page.tsx        // Career goals, modes

/app/api
  /prompt/route.ts          // GET: generate/fetch today’s prompt
  /transcribe/route.ts      // POST: audio -> transcript
  /analyze/route.ts         // POST: transcript -> scores + feedback
  /notion/log/route.ts      // POST: store session in Notion
  /weekly-review/route.ts   // POST: build weekly summary
  /webhook/daily/route.ts   // POST: cron daily trigger
  /webhook/weekly/route.ts  // POST: cron weekly trigger

/lib
  /llm.ts                   // Claude client + helpers
  /prompts.ts               // System prompts (generation + analysis)
  /notion.ts                // Notion client + typed helpers
  /scoring.ts               // WPM, filler count, metrics
  /audio.ts                 // Audio helpers
  /auth.ts                  // Password/token middleware
  /config.ts                // Constants, durations, rubric weights

/middleware.ts              // Protect UI with password
```

---

# 4. Notion Schema

## Database: **Speaking Sessions**
| Field | Type |
|-------|------|
| Date | date |
| Prompt | rich text |
| Transcript | rich text |
| Duration (sec) | number |
| Clarity | number (1–10) |
| Conciseness | number (1–10) |
| Structure | number (1–10) |
| Leadership tone | number (1–10) |
| Executive presence | number (1–10) |
| Delivery thinking | number (1–10) |
| Technical translation | number (1–10) |
| Business alignment | number (1–10) |
| Fillers per minute | number |
| Emotion summary | text |
| Key wins | text |
| Key improvements | text |
| Concise rewrite | text |
| Micro‑challenge | text |
| Mode | select (`SteerCo`, `Team`, `Status`, `CTO Advisor`) |

---

## Database: **Career Goals**
| Field | Type |
|-------|------|
| Goal | text |
| Priority | select (`Now`, `Next`, `Later`) |
| Theme | select (`Delivery leadership`, `Exec visibility`, etc.) |

---

## Database: **Weekly Reviews**
| Field | Type |
|-------|------|
| Week start | date |
| Summary | rich text |
| Focus next week | text |
| Avg scores | numbers (optional) |

---

# 5. API Route Responsibilities

### `/api/prompt` (GET)
- Pull active career goals from Notion
- Rotate mode: SteerCo → Team → Status → CTO‑Advisor
- Generate 1–2 sentence scenario using Claude
- Return JSON: `{ prompt, mode, date }`

### `/api/transcribe` (POST)
- Accept audio blob
- Send to Whisper API
- Return `{ transcript, durationSec }`

### `/api/analyze` (POST)
- Inputs: transcript, prompt, duration, filler count, WPM
- Claude performs:
  - Rubric scoring
  - 3 wins, 3 improvements
  - Concise rewrite
  - Micro‑challenge
- Return structured JSON

### `/api/notion/log` (POST)
- Store session in Notion `Speaking Sessions`

### `/api/weekly-review` (POST)
- Fetch last 5 sessions
- Claude generates weekly summary + next‑week focus
- Store in Notion `Weekly Reviews`

### `/api/webhook/daily` (POST)
- Triggered by cron-job.org
- Pre‑generate prompt (optional)

### `/api/webhook/weekly` (POST)
- Triggered by cron-job.org
- Generate weekly review

---

# 6. System Prompts (Claude)

## Prompt Generation (CTO Advisor Edition)
Claude should generate scenarios like:

- “Explain a technical dependency risk to the CTO in 90 seconds.”  
- “Present a delivery delay caused by architecture constraints.”  
- “Frame a tradeoff between speed and technical debt.”  
- “Respond calmly when the CTO challenges your timeline.”

Details refer to PERSONA.md file.
---

## Analysis Prompt (Rubric)
Claude evaluates using:

- Clarity  
- Conciseness  
- Structure  
- Leadership tone  
- Executive presence  
- Delivery thinking  
- Technical translation  
- Business alignment  

And returns:

- 3 wins  
- 3 improvements  
- Concise rewrite  
- Micro‑challenge  

---

# 7. Daily Workflow (5–10 minutes)

1. Fetch daily prompt  
2. Record 60–120s audio  
3. Transcribe  
4. Analyze with Claude  
5. Store in Notion  
6. Display feedback + rewrite + micro‑challenge  

---

# 8. Weekly Workflow (Friday)

1. Fetch last 5 sessions  
2. Claude generates:
   - Summary  
   - Patterns  
   - Next‑week focus  
3. Store in Notion  
4. Display in `/weekly` page  

---

# 9. Implementation Phases (Claude Code should follow)

### Phase 1 — Scaffold project
- Create folder structure
- Add pages + API routes
- Add middleware auth

### Phase 2 — Prompt engine
- Implement `/api/prompt`
- Add UI to display prompt

### Phase 3 — Audio recording + transcription
- Add recorder component
- Implement `/api/transcribe`

### Phase 4 — Analysis engine
- Implement `/api/analyze`
- Add feedback UI

### Phase 5 — Notion integration
- Implement `/api/notion/log`
- Build `/history` page

### Phase 6 — Weekly review + cron
- Implement `/api/weekly-review`
- Build `/weekly` page

---

# 10. Success Criteria

You should be able to:

- Open the app each weekday  
- Get a CTO‑calibrated leadership scenario  
- Record a short answer  
- Receive structured feedback  
- Track progress in Notion  
- Review weekly summaries  

This system trains you to become a **trusted delivery advisor to CTOs**.

---

# END OF FILE
