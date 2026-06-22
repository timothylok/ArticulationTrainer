## 2026-06-22
- Completed Phase 5: Notion integration — `logSession`, `fetchSessions`, `/api/notion/log`, `/history` page
- Completed Phase 6: Weekly review + cron — `logWeeklyReview`, `fetchWeeklyReviews`, `/api/weekly-review`, `/weekly` page, webhook routes wired
- Replaced local Ollama with cloud LLM fallback chain: MiniMax M3 → Agnes AI → Groq Llama 3.3
  - Agnes endpoint: `https://apihub.agnes-ai.com/v1`, model: `agnes-2.0-flash`
  - Groq model updated to `llama-3.3-70b-versatile` (3.1-70b decommissioned)
  - MiniMax key added but not yet verified working (sk-cp- format, 401 on api.minimax.chat)
- Deployed to Vercel; fixed login page crash (`useSearchParams` requires Suspense boundary in App Router)
- Fixed audio recording: `recorder.start()` without timeslice — timesliced recording lost intermediate chunks in some browsers
- Fixed Notion save: `Business alignment` had trailing space in Notion property name (user renamed it); surfaced silent errors in fire-and-forget log call
- Verified all three Notion databases; fixed `Micro challenge` property name (was `Micro-challenge` in code)
- Pushed to https://github.com/timothylok/ArticulationTrainer.git

## What's next
- Verify MiniMax key works (wrong URL or key format — need correct base URL for sk-cp- prefixed key)
- Set up cron-job.org webhooks pointing at Vercel URL with CRON_SECRET header
- Add career goals to Notion Goals DB so prompts are personalised
- Test full end-to-end drill on production Vercel deployment
