# Deploying Train Your Muscles

The site is one Node server (`server.mjs`): it serves `site/` and the AI coach, whose API keys must stay on the server.
`sh site/build.sh` builds `site/app.js` and the SEO pages (`site/exercises/`, `site/muscles/`, `sitemap.xml`, `robots.txt`).

## 1. Render (hosting)

1. render.com → sign in with GitHub → **New → Blueprint** → choose `imyky12/howtotrainyourmuscles`.
   It reads `render.yaml` and creates the `train-your-muscles` web service (Starter plan, about $7/month).
2. It asks for the values marked `sync: false`:
   - `CEREBRAS_API_KEY`, `OPENAI_API_KEY`: the same keys as in your local `.env`.
   - `POSTHOG_KEY`, `GA_ID`: from steps 3 and 4 (leave blank for now and add them later under **Environment**; saving redeploys).
3. Wait for the first deploy, then open the `https://train-your-muscles-xxxx.onrender.com` address it gives you.
   (Once the domain works, that address redirects to `trainyourmuscles.site`.)

## 2. GoDaddy (domain)

1. Render → the service → **Settings → Custom Domains** → add `trainyourmuscles.site`, then `www.trainyourmuscles.site`.
2. GoDaddy → **My Products → trainyourmuscles.site → DNS**:
   - Delete GoDaddy's default **A** record for `@` ("Parked") and the **CNAME** for `www` if there is one.
   - Add **A**, name `@`, value: the IP Render shows for the root domain.
   - Add **CNAME**, name `www`, value: `train-your-muscles-xxxx.onrender.com` (your service's address).
3. Back in Render, click **Verify** on both. HTTPS certificates are issued automatically (minutes, up to an hour or so).

## 3. PostHog (visitors, sessions, what people do)

1. posthog.com → sign up → create a project (pick US or EU cloud).
2. **Project settings** → copy the **Project API key** (`phc_...`) → Render env `POSTHOG_KEY`.
   For an EU project, also set `POSTHOG_HOST` to `https://eu.i.posthog.com`.
3. Events the app sends: `walk_in`, `muscle_chosen`, `exercise_opened`, `mistakes_opened`, `steps_opened`,
   `quiz_started`, `coach_asked`, `form_check_started`, `workout_finished` (plus automatic page views and clicks).
   A useful first funnel: `$pageview` → `walk_in` → `exercise_opened` → `workout_finished`.

## 4. Google Analytics 4

1. analytics.google.com → **Admin → Create → Property** "Train Your Muscles" → **Web** data stream for
   `https://trainyourmuscles.site`.
2. Copy the **Measurement ID** (`G-...`) → Render env `GA_ID`.
3. For visitors in the EU/UK it starts with analytics cookies off (Consent Mode), so no cookie banner is needed there.

Both IDs are public by design (they're in every visitor's page); they live in Render's environment so they can change without
a code change. Nothing is sent when you run the site locally, or from pages opened with `?test`.

## 5. Google Search Console (getting indexed)

1. search.google.com/search-console → **Add property → Domain** → `trainyourmuscles.site`.
2. It shows a **TXT** record. GoDaddy DNS → **Add → TXT**, name `@`, paste the value → back in Search Console, **Verify**
   (can take a few minutes to a few hours).
3. **Sitemaps** → submit `https://trainyourmuscles.site/sitemap.xml` (64 pages).
4. **URL inspection** → paste `https://trainyourmuscles.site/exercises` → **Request indexing**. Do the same for the 7
   `/muscles/...` pages and your most important exercises.
5. GA4 **Admin → Search Console links** → link it, so search queries show up in Analytics too.

## 6. After launch

- Check the pages pass: search.google.com/test/rich-results (try an exercise page), pagespeed.web.dev.
- Share it where lifters are: r/fitness, r/bodyweightfitness, r/gym; and as a build: r/webdev, r/threejs, Show HN,
  Product Hunt. Links from other sites are what move a new domain up.
- Every week, Search Console → **Performance**: find queries where you're on page 2 (position 11–20) and improve those
  pages first.
- A new domain usually takes 2–6 months to rank well. Long, specific searches ("lat pulldown mistakes") come first.

## Changing the exercise pages

They're generated: edit the exercise data in `site/src/` (the 3D app's data), then run `sh site/build.sh` and commit.
Don't edit `site/exercises/*.html` or `site/muscles/*.html` by hand. Change the templates in `seo/build.mjs`.
