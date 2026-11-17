# Deploy the Stage 8 app to Vercel

This folder is ready to deploy. It is a static site (`index.html` plus scripts) with one serverless function, `api/complete.js`, which powers the AI features.

## Option A: drag and drop (easiest)
1. Download and unzip this folder.
2. Go to https://vercel.com/new and sign in.
3. Choose **"Deploy"** with no framework, and upload the folder.
   - Or install the CLI (`npm i -g vercel`), open a terminal in this folder and run `vercel`, then `vercel --prod`.
4. Framework preset: **Other**. Leave the build command empty and the output directory as the root (`.`).

## Option B: GitHub
1. Put this folder in a new GitHub repository.
2. In Vercel: **Add New → Project → Import** the repository → Framework **Other** → Deploy.
3. Every push to the repository redeploys the site automatically.

## Turn on the AI features
The study buddy, writing feedback, French conversations, "explain it another way" and past-paper report cards need an AI key:
1. Vercel → your project → **Settings → Environment Variables**.
2. Add **one** of these:
   - `OPENAI_API_KEY` (optionally `OPENAI_MODEL`, default `gpt-4o-mini`)
   - `ANTHROPIC_API_KEY` (optionally `ANTHROPIC_MODEL`)
3. **Redeploy.**

Without a key, the app still works fully. The AI parts fall back to automatic feedback.

## Important to know
- **Progress is saved in each browser.** Students on the same device each have their own profile, but progress does not sync between devices (use *Profile → Back up my progress* to move it). Real online accounts need a database (for example Vercel Postgres or Supabase) and are the next development step.
- The page compiles its scripts in the browser, so the **first load takes a few seconds**. For a faster production build, convert the app into a bundled React project (see the developer handoff package).
- **Offline:** after the first visit, the app also opens without internet.
- The AI function allows 20 requests per minute per visitor to protect your API costs.
