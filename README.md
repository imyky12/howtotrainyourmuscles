# Muscle House

A 3D gym in the browser. You walk in, tell Coach Rana what you're training, and get today's plan. Then you watch every exercise done the right way and the wrong way, with the working muscles lit up.

- 7 muscle groups: chest, back, shoulders, legs, biceps, triceps, core
- 55 exercises, 158 common mistakes, 2 to 4 plans per group that cover every part of the muscle
- The lifter walks between machines, takes the dumbbells from the rack and the bars from their rack, sits down on machines and puts things back
- Every number shown on screen (angles, distances, timings) is measured from the animated body, not typed in

## Run it

```
cd site
python3 -m http.server 8767
```

Open http://localhost:8767. The page loads three.js 0.160 from jsDelivr; the people are embedded in `lifter.js`, `coach.js` and `member.js`.

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
- `tspots.cjs`: every walk-up and coach spot is free and reachable.
- `t1.cjs`: the story from the landing page to the first exercise.

`research/` has the coaching research behind the exercises, mistakes and plans.

People were made with MakeHuman (CC0); clothing by Elvaerwyn, Mindfront and punkduck (CC-BY 4.0).
