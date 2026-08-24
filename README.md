# Reps, pilot deploy (Path B)

A minimal, real deployment of the Reps pilot app for a test group. React app on Netlify, plus one serverless function that holds your Anthropic key so the live coach and the scan scoring work for everyone. No accounts, no database, no payments, no push notifications. Progress saves in each tester's own browser.

This is the validation-pilot setup, not the full product. The full stack (Firebase, Mollie, notifications, accounts) is described separately in the deployable build spec, and comes after the loop is proven.

## What's inside

```
index.html, vite.config.js, tailwind.config.js, postcss.config.js
src/App.jsx        the app (adapted from the prototype: localStorage + calls the function)
src/main.jsx       entry point
src/index.css      Tailwind
netlify/functions/anthropic.js   the Claude proxy (keeps your key server-side)
netlify.toml       build + functions config
.env.example       shows the one variable you must set
```

## Run it locally (optional)

You need Node 20+.

```
npm install
npm run dev
```

The coach won't work locally unless you also run the function. The simplest way is the Netlify CLI:

```
npm install -g netlify-cli
netlify env:set ANTHROPIC_API_KEY sk-ant-your-key   # once
netlify dev
```

`netlify dev` serves the app and the function together, so the coach works.

## Deploy to Netlify (the real thing)

1. Put this folder in a Git repo (GitHub, GitLab, or Bitbucket).
2. In Netlify: **Add new site > Import an existing project**, pick the repo.
3. Netlify reads `netlify.toml`, so the build command (`npm run build`), publish folder (`dist`), and functions folder are already set. Leave them as detected.
4. **Site settings > Environment variables > Add a variable:**
   - Key: `ANTHROPIC_API_KEY`
   - Value: your Anthropic API key
   - (Optional) `CLAUDE_MODEL` if you want something other than `claude-sonnet-5`.
5. Deploy. You get a URL like `https://your-site.netlify.app`.
6. Open it, run through the scan and a rep, and confirm the coach replies. Then share that one link with your test group.

No-Git alternative: run `npm install` then `npm run build`, and drag the whole folder onto Netlify's manual deploy. You still set the `ANTHROPIC_API_KEY` variable, then trigger one more deploy so the function picks it up.

## Notes for the pilot

- **Each tester's progress lives in their own browser** (localStorage). Clearing site data or switching device starts them fresh. There's a Reset in the app's settings for repeat testing.
- **No notifications.** You nudge testers yourself (WhatsApp, Slack, email), exactly as in the wizard-of-oz plan. The daily rep and the apply-again spacing are things you prompt by hand for now.
- **Cost.** Each coached rep and each scored scan task is one Claude API call on your key. For a small group it's tiny. Sonnet 5 is the quality default; switch the scorer to Haiku (`claude-haiku-4-5-20251001`) later if you want to trim cost.
- **The model string** is `claude-sonnet-5`. If Anthropic updates models, change `CLAUDE_MODEL` in Netlify, no code change needed. Model strings are worth confirming in Anthropic's docs before a bigger launch.
- **Keep running the measurement side** from the Phase-1 kit: the tracker, the weekly unprompted-use check, and the persistence check a week or two after. The app is the intervention; the tracker is still where the result lives.

## What this is not

No login, so you can't tie a tester's data across devices. No server storage, so if a tester clears their browser their history is gone (fine for a short pilot). No payments. All of that is the production build, and only worth doing once this pilot shows the loop changes behaviour.
