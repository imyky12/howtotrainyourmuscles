# Biceps (elbow flexors) knowledge base — "How to train your muscles" v1

Research date: 25 Oct 2026. Same conventions as `chest-research.md`: every number traces to a
source below; **[DISAGREEMENT]** = sources split; **[COACHING CONSENSUS]** = coaching lore, not
measured; **[OUR THRESHOLD]** = a cut-off we chose for the 3D checker (not from a study).

Angle conventions (single definition for text, overlay, solver and checker):
- **Elbow angle** = degrees of flexion, 0° = arm straight, ~140-145° = fully bent (same convention
  as Pedrosa 2023 and Sato 2021 below).
- **Upper-arm angle** = humerus vs the torso's long axis in the sagittal plane, 0° = hanging by the
  side, positive = in front of the body (shoulder flexion), negative = behind (extension).
- **Forearm rotation**: supinated = palm up/forward, neutral = thumb up, pronated = palm down.
- **Tempo** eccentric-pause-concentric-pause, default 2-0-1-1 (1 s squeeze at the top). Schoenfeld
  2015: 0.5-8 s per rep grows muscle similarly.
- **Beginner default**: 3 x 8-12, 2-3 reps in reserve, 2 sessions/week, add load at 12 clean reps.

---

## 1. Anatomy (short)

| Part | Everyday name | Origin → insertion | What it does | Position that biases it |
|---|---|---|---|---|
| **Biceps brachii, long head** | "Outer biceps" / the peak | Supraglenoid tubercle of the scapula (tendon runs inside the shoulder joint) → radial tuberosity + bicipital aponeurosis | Elbow flexion, forearm **supination**, weak shoulder flexion | Shoulder **extended** (arm behind the torso, e.g. incline curl): long head is lengthened. Its EMG rises with shoulder flexion/abduction while the short head's does not (13-subject shoulder EMG study, PMC4555617). Training it lengthened grew the **proximal** arm more (Kassiano 2025) |
| **Biceps brachii, short head** | "Inner biceps" | Apex of the coracoid process → same tendon | Elbow flexion, supination, shoulder flexion/adduction | Shoulder **flexed** (arm in front, e.g. preacher, concentration curl): long head is slackened so the short head carries more **[COACHING CONSENSUS]** — no head-by-head EMG in curls found |
| **Brachialis** | "Under-biceps" (lies beneath it, lifts it) | Distal half of the anterior humerus + both intermuscular septa → ulnar tuberosity and coronoid process | **Pure elbow flexion**, in any forearm position (it attaches to the ulna, which does not rotate) | Works in every curl. Grew the same in preacher and Bayesian curls (Attarieh 2025). Claims that neutral/pronated grips "target" it are **[COACHING CONSENSUS]** |
| **Brachioradialis** | "Top of the forearm" / the hammer-curl muscle | Upper lateral supracondylar ridge of the humerus → distal radius above the styloid | Elbow flexion; returns the forearm to neutral from either rotation | Its contribution changes significantly only when the hand is **pronated** (Kleiber 2015, n=16, EMG); neutral vs supinated did not differ. Kenhub: strongest "semi-pronated" (beer-mug) |

Sources: Elsevier long/short head pages (https://www.elsevier.com/resources/anatomy/muscular-system/muscles-of-upper-limb/long-head-of-biceps-brachii/23084 , .../short-head-of-biceps-brachii/17450), StatPearls biceps (https://ncbi.nlm.nih.gov/books/NBK519538), Radiopaedia (https://radiopaedia.org/articles/biceps-brachii), Kenhub brachialis (https://kenhub.com/en/library/anatomy/brachialis-muscle), StatPearls brachialis (https://www.statpearls.com/point-of-care/18501), Kenhub brachioradialis (https://www.kenhub.com/en/library/anatomy/brachioradialis-muscle).

Practical implication: every curl works all four; what shifts is emphasis (shoulder angle → long vs
short head, forearm rotation → biceps vs brachioradialis). Say "bias", never "isolate".

Highlight legend as in chest: **Prime mover** coral, **Helper** amber, **Stabiliser** dim.

---

## 2. Evidence snapshot

| Study | Compared | Finding we rely on |
|---|---|---|
| **Oliveira et al. 2009**, JSSM 8:24, n=22, 40% MVC. https://jssm.org/jssm-08-24.xml-Fulltext | Standing dumbbell curl vs incline curl vs preacher curl, biceps EMG across the ROM | Incline and standing curls kept biceps activation high through the **whole** range; preacher curl was high only early (near extension) and fell as the elbow flexed. Recommends incline/standing for biceps force. |
| **Young, Porcari et al. / ACE 2014**, UW-La Crosse, n=16, 70% 1RM. https://www.acefitness.org/prosourcearticle/4933/ace-study-reveals-best-biceps-exercises | 8 exercises (cable, barbell, concentration, chin-up, EZ wide/narrow, incline, preacher) | **Concentration curl** had significantly higher biceps EMG than every other exercise and less anterior deltoid than most; barbell curl had more anterior deltoid than incline, concentration and chin-up; narrow EZ had more brachioradialis than incline and preacher. Numeric values only in Figure 1 (not quoted). A blog ranking (cable 2nd, chin-up 3rd...) is secondhand — do not print it. |
| **Marcolin et al. 2018**, PeerJ 6:e5165, n=12, 65% 1RM. https://peerj.com/articles/5165 | Dumbbell vs straight bar vs EZ bar curl | EZ > dumbbell for biceps (p<0.05) and brachioradialis (p<0.01); straight bar ≈ EZ ("a matter of comfort"). **[DISAGREEMENT]**: Coratella's group found straight bar > EZ for biceps (cited in Parpa et al.). |
| **Coratella et al. 2023**, Sports 11(3):64, 10 bodybuilders, 8RM. https://www.mdpi.com/2075-4663/11/3/64/html | Bilateral curl: supinated vs neutral vs pronated | Biceps and brachioradialis highest with the **supinated** grip (ascending phase); anterior deltoid higher with pronated/neutral. Note: brachioradialis was NOT higher with neutral grip. |
| **Kleiber, Kunz & Disselhorst-Klug 2015**, Front Physiol, n=16. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4526813/ | Elbow flexion pronated / neutral / supinated | Brachioradialis contribution differed significantly only in the **pronated** position; biceps unchanged across positions. |
| **Pedrosa et al. 2023**, Sports 11(2):39, 19 untrained women, 8 wk, preacher curl. https://pmc.ncbi.nlm.nih.gov/articles/PMC9960616 | Initial ROM (0-68°) vs final ROM (68-135°), one arm each | Initial (stretched) ROM: greater CSA at 70% humerus length (p=0.001, 95% CI 0.18-0.59 cm²), not at 50%; 1RM +42.8% vs +19.0%. |
| **Sato et al. 2021**, Front Physiol, 32 untrained, 5 wk. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8489980/ | Curl in 0-50° vs 80-130° elbow range | Extended range: biceps+brachialis thickness +8.9% vs +3.4% (distal site +12.7% vs +2.1%); strength gains only significant in the extended group. |
| **Kassiano et al. 2025**, Int J Sports Med 46(5):334, 63 untrained women, 8 wk. https://pubmed.ncbi.nlm.nih.gov/39809454/ | Preacher curl group vs incline curl group | Preacher: more **distal** elbow-flexor thickness (+0.10 cm, CI 0.04-0.15); incline: more **proximal** (+0.08 cm, CI 0.02-0.13). Differences ~1 mm; biceps and brachialis not separated. |
| **Attarieh et al. 2025**, Eur J Sport Sci 25(4):e12279, 15 men, 10 wk. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11906226/ | Preacher cable curl (shoulder flexed) vs Bayesian cable curl (shoulder extended), resistance profiles matched | No significant difference in proximal/mid/distal biceps or brachialis thickness (preacher ~6-7%, Bayesian ~9%, n.s.); strength +28% vs +37%, equivalent. **[DISAGREEMENT]** with Kassiano 2025 on regional effects; Attarieh matched the load curve, Kassiano used free weights. |
| **Nunes et al. 2020** (cable vs barbell preacher, 10 wk) | Ascending vs descending resistance | No difference in biceps thickness (single site). |

What we did **not** find: head-by-head (long vs short) EMG in curl variants; any trial showing
hammer curls grow the brachialis more than supinated curls; any EMG of elbow "drift" or torso swing
thresholds. Those are flagged below.

---

## 3. The exercises (6)

### 3.1 `bb_curl` — Standing barbell curl
- **Station:** barbell rack (straight 20 kg bar, or the EZ bar — Marcolin 2018: equivalent).
- **Parts:** Main: biceps long + short head. Helper: brachialis, brachioradialis, forearm flexors
  (grip). Stabiliser: anterior deltoid (higher here than in incline/concentration, ACE 2014), core,
  upper back. Evidence: ACE 2014, Marcolin 2018, Coratella 2023 (supinated = most biceps).
- **Real-world flow:** Walk to the barbell rack. Stand facing it, feet hip-width, hinge 20-30° at
  the hips, knees soft, grip the bar supinated at shoulder width, stand up with the bar hanging at
  the thighs (a deadlift-style pick-up, not a curl). Take 2 steps back from the rack. Set: see
  below. Finish: walk 2 steps forward, hinge, lower the bar into its rack hooks, let go, step back.
- **Animation spec:**
  - Stance hip-width, knees 5-10° bent, torso upright (pitch 0 ± 5°), shoulder blades back.
  - Grip supinated, hands at shoulder width (1.0x biacromial), wrists straight (0°, not bent back).
  - Upper arm fixed at 0° to -5° (hanging, elbows ~2 cm in front of the ribs' side line); allowed
    to drift to +10° only at the very top of the rep.
  - Elbow: start 5-10° (not locked), end 130-140°. Bar path: an arc radius = forearm length,
    centred on the elbow; bar rises from mid-thigh to upper-chest/under-chin height.
  - Tempo 2-0-1-1. Exhale while curling, inhale lowering.
- **Steps:** 1. Stand tall, bar at thighs. 2. Curl to the chest. 3. Squeeze one second.
  4. Lower slowly, arms almost straight.
- **Mistakes:**
  1. *Body swing* — torso pitches back 15-25° and the hips push forward as the bar passes
     horizontal; the bar "falls" up. Metric: **torso pitch range during the rep**: good ≤ 5°, bad
     ≥ 15° **[OUR THRESHOLD]**. Now: lower back and hips do the lift, biceps tension drops. Later:
     load climbs faster than the arms can earn; lumbar strain. Cue: "Elbows still, chest tall."
  2. *Elbows drift forward* — elbows travel 10-15 cm forward/up so the upper arm reaches +30-45°
     at the top (a front raise). Metric: **upper-arm angle at the top**: good ≤ 10°, bad ≥ 30°.
     Now: anterior deltoid takes over at the top, biceps leverage drops. Later: shoulder front
     fatigue, stalled curl progress. Cue: "Pin the elbows to your sides."
  3. *Half reps* — elbow never below 40° at the bottom. Metric: **min elbow angle**: good ≤ 15°,
     bad ≥ 40°. Now: skips the stretched range that drives growth (Sato 2021, Pedrosa 2023).
     Later: less growth per set. Cue: "Straighten the arms every rep."
- **Beginner:** 3 x 8-12, start with the empty bar (20 kg) or a 10 kg fixed bar.
- **Safety:** keep the wrists straight; if they ache, use the EZ bar.

### 3.2 `incline_db_curl` — Incline dumbbell curl
- **Station:** dumbbell rack + incline bench set to **45-60°** (Oliveira 2009 used 45°; the ACE
  study used an incline bench without stating the angle).
- **Parts:** Main: biceps **long head** (shoulder extended → lengthened), short head. Helper:
  brachialis, brachioradialis. Stabiliser: anterior deltoid (low, ACE 2014). Evidence: Oliveira
  2009 (full-range activation = standing curl, > preacher); Kassiano 2025 (more proximal growth
  than preacher); Sato 2021 / Pedrosa 2023 (lengthened range grows more). **[DISAGREEMENT]**:
  Attarieh 2025 found no regional difference when load curves were matched.
- **Real-world flow:** Set the bench back to 45-60°, seat flat. Walk to the dumbbell rack, stand
  facing it, hinge/squat, take one dumbbell in each hand, carry them at the sides to the bench.
  Turn, sit, lean back until the head and upper back touch the pad; let the arms hang straight
  down toward the floor, palms forward. Finish: curl the dumbbells up to the thighs, sit up with
  them resting on the thighs, stand, carry back and set them on the rack at the same slot.
- **Animation spec:**
  - Bench back 45° (option 60°). Head, upper back and buttocks on the bench; feet flat.
  - Upper arm hangs vertical, i.e. **-30° to -45° relative to the inclined torso** (shoulder
    extended). It stays there for the whole rep; the elbow must not move forward.
  - Forearm supinated at the bottom; the dumbbell may start neutral and rotate to supinated
    during the first 30° of the curl (optional "twist").
  - Elbow: 0-5° at the bottom → 120-130° at the top (the dumbbell cannot reach the shoulder
    because the elbow is behind the torso; it finishes level with the front of the shoulder).
  - Tempo 2-1-1-1 (1 s pause at the stretched bottom).
- **Steps:** 1. Lie back, arms hang. 2. Curl without moving elbows. 3. Squeeze at the top.
  4. Lower to a full stretch.
- **Mistakes:**
  1. *Elbows swing forward* — elbows travel 10-20 cm forward to catch up with the hands, upper arm
     reaches 0° to +20° at the top. Metric: **upper-arm angle at the top** vs the torso: good
     ≤ -25°, bad ≥ 0°. Now: the stretch that makes the exercise special is gone; it becomes a
     weak seated curl. Later: same growth as any curl, with a sore front shoulder. Cue: "Elbows
     stay behind you."
  2. *Shoulders roll forward off the pad* — shoulder tips lift 5-8 cm off the bench. Metric:
     **shoulder-to-pad distance**: good ≤ 1 cm, bad ≥ 5 cm. Now: tension leaves the biceps,
     the front delt holds the weight. Later: shoulder-front irritation under load. Cue: "Shoulder
     blades glued to the bench."
  3. *Too heavy, half range* — bottom elbow angle ≥ 30°. Metric: **min elbow angle** good ≤ 10°,
     bad ≥ 30°. Now: skips the stretched third. Later: less growth. Cue: "Lighter, full stretch."
- **Beginner:** 3 x 10-12 with dumbbells 30-40% lighter than the standing-curl weight.
- **Safety:** shoulder impingement history → use 60° and stop short of pain at the bottom.

### 3.3 `preacher_curl` — Preacher curl (EZ bar)
- **Station:** preacher bench (pad ~45° from vertical in the capture; set seat so the armpits sit
  on the top edge). EZ bar from the barbell rack; dumbbell one-arm version is the same spec.
- **Parts:** Main: biceps **short head** bias (shoulder flexed ~45° so the long head is slackened)
  **[COACHING CONSENSUS]**, brachialis. Helper: brachioradialis, forearm flexors. Evidence: Kassiano
  2025 (more **distal** elbow-flexor growth than incline); Oliveira 2009 (biceps EMG highest near
  extension and fell as the elbow flexed — the bottom half is the exercise); Pedrosa 2023 (preacher
  in 0-68° grew more than in 68-135°). **[DISAGREEMENT]**: Attarieh 2025 found no regional
  difference vs a shoulder-extended cable curl.
- **Real-world flow:** Take the EZ bar from the rack with both hands (narrow supinated grip on
  the angled sections), carry it at the thighs to the preacher bench, set it on the bar rest in
  front of the pad. Sit, adjust seat height so the top of the pad is in the armpits, lean the
  chest into the pad, reach down, take the bar from the rest, curl once to the start. Finish:
  lower the bar to the rest under control, let go, stand up, carry the bar back to its rack.
- **Animation spec:**
  - Torso pitched forward 10-15° into the pad; armpits on the pad's top edge; feet flat.
  - Upper arm on the pad = **+45° to +60°** shoulder flexion, fixed by the pad (zero movement).
  - Elbow: top 120-130°, bottom **10-15°** (never a hard lock at 0°: the bottom is loaded).
  - Forearm supinated/semi-supinated on the EZ bar; wrists straight.
  - Bar path: an arc centred on the elbows, finishing 10-15 cm short of the face.
  - Tempo 2-1-1-0; the eccentric is the hard part, lower in 2-3 s.
- **Steps:** 1. Armpits on the pad. 2. Curl up, elbows still. 3. Hold a second.
  4. Lower slowly, almost straight.
- **Mistakes:**
  1. *Elbows lift off the pad* — elbows rise 5-10 cm off the pad at the top, shoulders shrug.
     Metric: **elbow-to-pad distance at the top**: good ≤ 1 cm, bad ≥ 5 cm. Now: the pad no longer
     fixes the shoulder; front delt and traps join in. Later: lighter effective load on the biceps,
     slower progress. Cue: "Elbows welded to the pad."
  2. *Bouncing out of the bottom* — bottom reached at >40 cm/s hand speed with elbow near 0°,
     then reversed with a jerk. Metric: **eccentric duration**: good ≥ 2 s, bad ≤ 0.7 s
     **[OUR THRESHOLD]**. Now: tendon takes the jolt. Later: distal biceps tendon strain (the
     preacher's known risk). Cue: "Lower like it's fragile."
  3. *Bottom cut short* — stops at ≥ 45° flexion. Metric: **min elbow angle** good ≤ 15°, bad ≥ 45°.
     Now: misses the only part of the preacher where biceps EMG is highest (Oliveira 2009). Later:
     less distal growth. Cue: "All the way down, soft lock."
- **Beginner:** 3 x 10-12 with the EZ bar + 2.5-5 kg a side.
- **Safety:** never drop into a locked elbow at the bottom; this is where preacher injuries happen.

### 3.4 `hammer_curl` — Hammer curl (dumbbells, neutral grip)
- **Station:** dumbbell rack; standing beside the rack, or seated on the upright bench.
- **Parts:** Main: biceps (both heads; still highly active — Coratella 2023, Kleiber 2015),
  **brachialis**, **brachioradialis** (the two "forearm-side" flexors). Helper: forearm flexors.
  Evidence: Kleiber 2015 — brachioradialis contribution changed significantly only with a
  **pronated** hand; neutral ≈ supinated. A 2016 student study (n=5) found neutral > supinated
  brachioradialis only at p=0.051. So "hammer curl = brachialis/brachioradialis builder" is
  **[COACHING CONSENSUS]**; what is certain is that the neutral grip lets most people lift ~10-20%
  more and unloads the wrists **[COACHING CONSENSUS]**. The evidence-backed brachioradialis biaser
  is the **reverse (pronated) curl** — it is the swap in the alternative plan.
- **Real-world flow:** Stand facing the dumbbell rack, hinge, take one dumbbell in each hand,
  stand, take 2 steps back from the rack, arms hanging at the sides, thumbs forward. Finish: step
  forward, hinge, place both dumbbells back in their slots.
- **Animation spec:**
  - Standing, feet hip-width, torso pitch 0 ± 5°. Upper arm fixed at 0 to -5°.
  - Forearm **neutral** (thumb up) for the whole rep; dumbbell handles parallel to the sagittal
    plane, 2-3 cm from the thigh at the bottom.
  - Elbow: 5-10° → 130-140°. Hands alternate (left rep, right rep) or move together — pick
    alternating for the 3D person (it reads better from the side).
  - Hand path: vertical arc, the dumbbell finishes just outside the front of the shoulder.
  - Tempo 2-0-1-1.
- **Steps:** 1. Thumbs up, arms hang. 2. Curl to the shoulder. 3. Squeeze briefly.
  4. Lower under control.
- **Mistakes:**
  1. *Swinging* — torso pitches back 15°+ and the knees bounce. Metric: **torso pitch range**:
     good ≤ 5°, bad ≥ 15°. Now: momentum lifts the weight. Later: lumbar strain, no arm growth.
     Cue: "Only the forearm moves."
  2. *Cross-body drift* — hand crosses the body's midline (≥ 10 cm medial of the shoulder at the
     top) and the shoulder internally rotates. Metric: **hand lateral offset from the shoulder at
     the top**: good within ±5 cm, bad ≥ 10 cm inward. Now: fine as a deliberate variant
     ("cross-body hammer"), wrong when unintentional — load shifts to the front delt. Later:
     uneven arms. Cue: "Straight up, outside the shoulder."
  3. *Wrist curling* — wrist flexes 20-30° at the top. Metric: **wrist flexion at the top**:
     good ≤ 10°, bad ≥ 25°. Now: forearm flexors steal the finish. Later: wrist tendon irritation.
     Cue: "Wrist straight like a hammer handle."
- **Beginner:** 3 x 10-12, 1-2 kg heavier than the dumbbell curl weight.
- **Safety:** easiest curl on the wrists; good choice for anyone with elbow pain on supinated curls.

### 3.5 `cable_curl` — Cable curl (straight bar or EZ attachment)
- **Station:** dual cable tower, one pulley at the **lowest** setting, straight bar attachment.
- **Parts:** Main: biceps (both heads). Helper: brachialis, brachioradialis. Stabiliser: anterior
  deltoid, core. Evidence: ACE 2014 tested it (below concentration curl; secondhand rank 2nd);
  Nunes 2020 — cable preacher (ascending resistance) and barbell preacher (descending) grew the
  biceps equally. The cable keeps tension at the top where a barbell loses it (physics, not EMG).
- **Real-world flow:** Set the pulley to the bottom, clip the straight bar on, set the pin
  (beginners: 10-15 kg). Face the tower, hinge, pick up the bar supinated, stand up, take one step
  back so the cable is taut and angled slightly forward. Finish: step in, lower the bar to the
  stack stop, hinge, let go; unclip the bar and hang it on the attachment rack.
- **Animation spec:**
  - Stand 40-60 cm from the pulley, feet hip-width, torso pitch 0-5° forward (leaning into the
    cable's pull), knees soft.
  - Upper arm 0 to +5° (cable pulls the hands forward so elbows sit slightly ahead of the ribs).
  - Elbow: 10-15° at the bottom (cable keeps it loaded) → 130-140° at the top.
  - Forearm supinated, wrists straight; bar path an arc rising to the upper chest.
  - Tempo 2-0-1-1; the stack must not touch down between reps (keep tension).
- **Steps:** 1. Step back, cable taut. 2. Curl to the chest. 3. Squeeze at the top.
  4. Lower, stack never rests.
- **Mistakes:**
  1. *Lean-back pull* — torso pitches back 15-25°, pulling the stack with the back. Metric:
     **torso pitch range**: good ≤ 5°, bad ≥ 15°. Now: lats/lower back take over. Later: lumbar
     strain, arms untrained. Cue: "Lean in, not back."
  2. *Elbows ride up* — upper arm reaches +30° at the top. Metric: **upper-arm angle at the top**:
     good ≤ 10°, bad ≥ 30°. Now: front raise with a cable. Later: front-delt soreness.
     Cue: "Elbows down by the ribs."
  3. *Stack touches down* — plate hits the stop every rep (tension lost for 0.3-0.5 s). Metric:
     **min cable tension / plate-to-stop distance**: good ≥ 2 cm, bad = 0. Now: the biceps rests
     every rep. Later: fewer effective reps per set. Cue: "Stop just before the stack lands."
- **Beginner:** 3 x 10-15; a good first curl because the load never has to be "controlled" at
  the top.
- **Safety:** step in before letting go; a bar released at arm's length snaps back.

### 3.6 `concentration_curl` — Concentration curl
- **Station:** dumbbell rack + flat/upright bench (seat only).
- **Parts:** Main: biceps (ACE 2014: the highest biceps EMG of 8 exercises; **short head** bias
  because the shoulder is flexed and braced **[COACHING CONSENSUS]**). Helper: brachialis,
  brachioradialis. Stabiliser: almost none — anterior deltoid significantly lower than in
  barbell curls (ACE 2014). That isolation is exactly why it scored highest.
- **Real-world flow:** Take one dumbbell from the rack, carry it to the bench, sit on the edge
  with feet wide (60-70 cm apart). Lean forward ~30°, brace the back of the working upper arm
  against the inside of the same-side thigh, just above the knee; let the arm hang toward the
  floor, palm forward; rest the other hand on the other knee. Finish: lower the dumbbell to the
  floor between the feet, swap arms, then carry the dumbbell back to the rack.
- **Animation spec:**
  - Seated, feet wide, torso pitch 30-40° forward, back flat (not rounded).
  - Upper arm braced on the inner thigh: **+20° to +30°** shoulder flexion relative to the torso,
    fixed for the whole set; the arm hangs 10-15° inward of vertical.
  - Elbow: 5-10° at the bottom → 130-140°, the dumbbell finishing 10-15 cm in front of the shoulder
    (it cannot reach it; the thigh is in the way).
  - Forearm supinated; optional extra supination (little finger turns up) in the top 30°.
  - Tempo 2-1-1-1 (1 s squeeze, 1 s at the bottom).
- **Steps:** 1. Elbow against inner thigh. 2. Curl toward the shoulder. 3. Squeeze one second.
  4. Lower all the way down.
- **Mistakes:**
  1. *Elbow leaves the thigh* — the upper arm lifts off the leg and swings 10-15 cm up.
     Metric: **elbow-to-thigh contact distance**: good ≤ 1 cm, bad ≥ 5 cm. Now: the brace is gone;
     front delt and momentum join. Later: the exercise loses its one advantage (ACE: least delt).
     Cue: "Elbow stays on the leg."
  2. *Torso rocks* — torso pitch changes 15°+ during the rep (the body lifts the weight).
     Metric: **torso pitch range**: good ≤ 5°, bad ≥ 15°. Now: the dumbbell is too heavy.
     Later: lower-back fatigue, nothing for the biceps. Cue: "Drop 2 kg, stay still."
  3. *Half rep at the bottom* — min elbow ≥ 40°. Metric: **min elbow angle** good ≤ 15°, bad ≥ 40°.
     Now: skips the stretched range. Later: less growth. Cue: "Straight arm at the bottom."
- **Beginner:** 3 x 10-12 per arm, the lightest dumbbells on the rack (4-8 kg).
- **Safety:** none specific; keep the back flat.

---

## 4. Today's plan (biceps + forearm flexors)

**Plan A — "Peak and under-peak" (11 hard sets)**
| # | Exercise | Sets x reps | Rest | Why (part) |
|---|---|---|---|---|
| 1 | Standing barbell curl | 3 x 8-10 | 90 s | Heaviest supinated load for both biceps heads (Coratella 2023: supinated = most biceps) |
| 2 | Incline dumbbell curl 45° | 3 x 10-12 | 90 s | **Long head** stretched; full-range activation (Oliveira 2009), proximal growth (Kassiano 2025) |
| 3 | Preacher curl, EZ bar | 3 x 10-12 | 75 s | **Short head + brachialis**, distal growth (Kassiano 2025), stretched-range loading (Pedrosa 2023) |
| 4 | Hammer curl | 2 x 12 | 60 s | **Brachioradialis / brachialis** with a neutral grip (bias is coaching consensus; still full biceps work) |
Order: heaviest compound-ish load first, then the stretched exercise, then the shortened one,
finisher last (Simão 2012: exercises done early get the most reps and the best gains).

**Plan B — "Cables and isolation" (10 hard sets)**
| # | Exercise | Sets x reps | Rest | Why |
|---|---|---|---|---|
| 1 | Cable curl | 3 x 10-12 | 75 s | Both heads, tension at the top where bars lose it |
| 2 | Incline dumbbell curl 60° | 3 x 10-12 | 90 s | Long head stretched |
| 3 | Concentration curl | 2 x 10-12 / arm | 60 s | Highest biceps EMG, lowest delt help (ACE 2014); short-head bias |
| 4 | Reverse (pronated) EZ curl | 2 x 12-15 | 60 s | Brachioradialis — the only grip with measured extra contribution (Kleiber 2015) |

Weekly: 10-20 hard sets per muscle per week (Schoenfeld 2016/17; see chest file §4). Chin-ups and
rows already give the biceps several "fractional" sets.

---

## 5. Witty copy (one true line each)
- Barbell curl: "The oldest exercise in the mirror. Still works."
- Incline curl: "Lean back. The stretch is the exercise."
- Preacher curl: "Confess your half reps. The pad knows."
- Hammer curl: "Thumbs up. Your forearms finally get invited."
- Cable curl: "Tension at the top. The bar never had that."
- Concentration curl: "Scored highest in the lab. Needs no spotter."

---

## 6. Changelog and open questions

Changelog (25 Oct 2026, first pass): file created; elbow-angle convention set to 0° = straight
to match Pedrosa 2023 and Sato 2021; hammer-curl brachialis claim downgraded to coaching
consensus after Kleiber 2015 and Coratella 2023; reverse curl added to Plan B as the
evidence-backed brachioradialis option.

Open questions:
1. No head-by-head (long vs short) EMG in curl variants was found; the "incline = long head,
   preacher = short head" mapping rests on muscle-length reasoning plus the regional growth data
   (Kassiano 2025) — and Attarieh 2025 contradicts it when load curves are matched. Site wording:
   "biases the outer/inner head" with a "based on muscle length" footnote.
2. ACE 2014 numeric %MVC values live in Figure 1 / the PDF; not quoted above. Fetch the PDF before
   printing any percentage on the site.
3. All mistake thresholds (5°/15° torso pitch, 10°/30° elbow drift, 15°/40° half rep, 1 cm/5 cm
   contact) are **[OUR THRESHOLD]** for the checker; no study defines them. Tune on real captures.
4. Brachioradialis "strongest in neutral" (Kenhub says semi-pronated) is a textbook claim without
   a primary biomechanics source found.
5. Oliveira 2009 used 45° incline; 60° is extrapolated. If the 3D bench defaults to 60°, say so.
