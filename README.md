# Muscle House

A 3D gym in the browser. You walk in, tell Coach Rana what you're training, and get today's plan. Then you watch every exercise done the right way and the wrong way, with the working muscles lit up.

- 7 muscle groups: chest, back, shoulders, legs, biceps, triceps, core
- 55 exercises, 158 common mistakes, 2 to 4 plans per group that cover every part of the muscle
- The lifter walks between machines, takes the dumbbells from the rack and the bars from their rack, sits down on machines and puts things back
- Every number shown on screen (angles, distances, timings) is measured from the animated body, not typed in

## Run it

```
cp .env.example .env      # put your CEREBRAS_API_KEY in it (OPENAI_API_KEY is optional)
node server.mjs
```

Open http://localhost:8767. The page loads three.js 0.160 from jsDelivr; the people are embedded in `lifter.js`, `coach.js` and `member.js`.
Without a key (or with any plain static server, e.g. `cd site && python3 -m http.server 8767`) the site works as before, without the AI coach.

## The AI coach

- **Plan from a sentence:** at "What are we training today?", type or say "legs, sore knee, 30 minutes". Cerebras builds the plan from the 55 exercises (strict JSON, so only exercises the gym can show) and it opens as the "For you" tab.
- **Ask the coach at the station:** "Ask coach" in the exercise tools. "My knees hurt on this" → the matching mistake plays next to the right way, with the measured numbers, the fix, and a swap if you need one. Red flags (sharp pain, numbness, swelling) get "stop and see a physio".
- **Who does what:** Cerebras (`gpt-oss-120b`) writes everything the coach says; the speed line under each answer shows its time and tokens/s. OpenAI Decisions (`gpt-6-luna`, optional) makes the bounded calls: which mistake matches, red-flag probability, body area; its probabilities show as "The coach’s read". Without an OpenAI key, Cerebras makes those calls too.
- **Memory:** sessions and what you told the coach stay in the browser (localStorage); the coach greets you with them and plans around them. "Coach’s memory" shows and forgets it.
- **Code:** `server.mjs` (keys, prompts, schemas; no dependencies), `site/src/33-coach-ai.js` (UI, voice, memory).

## Change it

The code is in `site/src/*.js`. `site/build.sh` joins them, in file-name order, into `site/app.js`. Run it after every change.

| File | What it holds |
| --- | --- |
| `00-core.js`, `01-world.js` | renderer, materials, the street, the building, the room |
| `02-rig.js` | the body: IK, poses, muscle painting |
| `03`–`04` | stations and walking paths |
| `05-motion.js`, `06-bodies.js` | walking, carrying, lying, sitting, standing |
| `07`–`09` | exercise framework, measurements, getting on and off equipment |
| `10`–`19b` | the exercises, group by group |
| `20`–`21` | where every machine stands |
| `30`–`32` | story flow, camera, plan and exercise screens |
| `40-main.js` | the loop and test helpers |

## Tests

The tests drive the page in headless Chromium through `index.html?test` (rendering only when asked). Serve `site/` on port 8767 and run them from a folder that has an `out/` directory.

- `t3.cjs`: every exercise and mistake; prints the right-way and mistake readings. `NOSHOT=1` skips screenshots, `EXS=squat,ohp` limits the list.
- `t6.cjs`: a whole plan clicked through like a user (`G=legs PLAN=1`); reports people walking through equipment and cameras inside walls.
- `t7.cjs`: the animation probe (`G=legs`): plays every exercise of a group through fetching props, walking, getting on, reps, getting off and putting things back, frame by frame, and lists any body part inside equipment, below the floor, snapping between frames, or any dumbbell/bar jumping. `probeall.sh` runs all seven groups.
- `tspots.cjs`: every walk-up and coach spot is free and reachable.
- `t1.cjs`: the story from the landing page to the first exercise.

`research/` has the coaching research behind the exercises, mistakes and plans.

People were made with MakeHuman (CC0); clothing by Elvaerwyn, Mindfront and punkduck (CC-BY 4.0).
