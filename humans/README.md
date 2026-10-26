# Gym humans: lifter, coach, member

Three rigged, textured humans made with **MPFB 2.0.18** (the MakeHuman plugin for Blender) running headless in `bpy` 5.2.3,
using MakeHuman asset packs. Each file is a self-contained GLB with JPEG/PNG textures inside.

| file | size | triangles | height | outfit |
|---|---|---|---|---|
| lifter.glb (v3, current) | 3.1 MB | 30.0k | 1.76 m | ordinary gym-goer who trains a few times a week, about 30 years old: MakeHuman muscle 0.50, weight 0.53, proportions 0.75. No muscle targets and no muscle normal map. Normal shoulders and arms, flat-to-slightly-defined chest, slightly soft waist. Fitted charcoal tank, black shorts, running shoes. Estimated ~75 kg |
| lifter_v2.glb | 3.6 MB | 30.0k | 1.82 m | previous: athletic-lean (muscle 0.65, Aksel muscle normal map) |
| lifter_v1.glb | 4.1 MB | 36.9k | 1.90 m | first version, bodybuilder build (muscle 1.0 plus muscle targets), looser tank; kept for reference |
| coach.glb (v2, current) | 3.3 MB | 29.6k | 1.73 m | ordinary fit man, muscle 0.55, weight 0.50, no muscle normal map. Coral t-shirt smoothed and loosened slightly so no muscles show through, dark trousers, white trainers |
| coach_v1.glb | 3.8 MB | 29.6k | 1.79 m | previous: muscle 0.8, skin-tight tee that showed the pecs and abs |
| member.glb | 4.1 MB | 36.8k | 1.66 m | teal sleeveless crop top, black leggings, white trainers, ponytail; female, muscle 75 % |

Units are metres. Feet are at y=0 (lowest vertex), the figure faces +z and Y is up. The rest pose is a T-pose.

## Skeleton (Mixamo / Xbot layout)
- 52 joints named exactly as three.js shows Xbot's bones: `mixamorigHips, mixamorigSpine, mixamorigSpine1, mixamorigSpine2, mixamorigNeck, mixamorigHead, mixamorigLeft|RightShoulder, …Arm, …ForeArm, …Hand, …HandThumb1-3, …HandIndex1-3, …HandMiddle1-3, …HandRing1-3, …HandPinky1-3, mixamorigLeft|RightUpLeg, …Leg, …Foot, …ToeBase`.
- The structure copies Xbot. An `Armature` node with scale 0.01 holds `mixamorigHips`. Joint translations are in cm, and **every joint's rest rotation is identity, as in Xbot**. The T-pose limb directions were matched to Xbot's, joint by joint, before the rest pose was applied (the feet were left flat).
- Not included (Xbot has them): HeadTop_End, Left/RightEye, finger "4" end bones, Toe_End. three.js only logs "No target node found" warnings for those tracks.
- Meshes are skinned SkinnedMeshes at the scene root.

## Lifter v3 rest measurements (metres, model space: Y up, facing +Z, feet at y=0)
- Hips joint (0.000, 0.989, 0.006); Spine2 joint (0.000, 1.301, -0.008); LeftArm joint (0.212, 1.473, -0.055).
- Chest depth: the front of the shirt at nipple height (y about 1.27, |x| about 0.08) is at z = 0.182, which is **0.19 m in front of the Spine2 joint**. On the midline at the same height it is 0.18 m.

## Hand axes (all characters; checked numerically and with a curl render)
Every joint's rest rotation is identity, so in rest pose each hand's local axes are the model axes (character faces +z, its left side is +x):
- **Fingers:** left hand along **+X**, right hand along **-X**. HandMiddle1 sits exactly ±0.112 m along X from the Hand joint.
- **Thumb:** **+Z** (forward) for both hands. Thumb1 is about 2.5 cm forward of the hand joint.
- **Palm normal:** roughly **-Y** (palms down) for both hands, but tilted about 25-30° toward +Z: the knuckle line index1→pinky1 rises toward the thumb side. A more exact normal is about (0, -0.89, +0.46) for both hands, the same as Xbot's T-pose hand roll.
- **Curl:** rotating the finger bones about local Z by a negative angle on the left hand and a positive angle on the right curls the fingers down, toward the palm. Verified in `renders/lifter-finger-curl-test.jpg` (1.2 rad on Index/Middle/Ring/Pinky 1-3). Because of the palm tilt, the fingertips close slightly behind the palm's centre line. For a tighter grip, curl about the knuckle-line axis, which is about (0, 0.46, 0.89) for both hands (left uses a negative angle, right a positive one), or add a small extra rotation about local X.
- All finger bones are present: Thumb, Index, Middle, Ring and Pinky 1-3 on each hand (30 bones).

## Animation clips
- **`walk` and `idle` are motion capture** (since 26 Oct 2026) from the **100STYLE** dataset: Ian Mason, Sebastian Starke and Taku Komura, *Real-Time Style Modelling of Human Locomotion via Feature-Wise Transformations and Local Motion Phases* (2022), https://www.ianxmason.com/100style/, **CC BY 4.0** (credit it wherever the characters are used; the site credits do).
  - `walk`: one gait cycle (left heel strike to left heel strike, 1.34 s) averaged over the straight-ish cycles (turn < 25 deg/s) of `Proud_FW` (weight 0.6: upright, confident), `Neutral_FW` (0.3) and `SwingShoulders_FW` (0.1: a looser arm swing), each cycle phase-aligned on both heel strikes; the average is loop-closed (end-to-start mismatch spread over the cycle). Retargeted 1:1 (both rest poses are a T-pose with identity joints: BVH Hips, Chest, Chest2, Chest4, Neck, Head, Collar, Shoulder, Elbow, Wrist, Hip, Knee, Ankle, Toe map to Hips, Spine, Spine1, Spine2, Neck, Head, Shoulder, Arm, ForeArm, Hand, UpLeg, Leg, Foot, ToeBase). Forward root motion is removed (the root path is a 0.5 s Gaussian-smoothed hip path); the hip bob, sway and pelvis/shoulder counter-rotation stay in the Hips track. Posture: mean forward pitch of Spine/Spine1/Spine2/Neck/Head set to 4/3/2/4/0 deg (the actor looked at the floor), arms 1.5 deg away from the body. Stance feet are locked by leg IK so the planted foot moves back at a constant speed, and the hips are set so no shoe point goes more than 4 mm under the floor. Each character's clip is time-scaled so it covers **0.916 m per clip second** (`WALK_STRIDE` in the site's 05-motion.js; foot-pass times `WALK_PASS` = 0.438 and 1.094 s). Played at timeScale = speed / 0.916 the planted foot does not slide.
  - `idle`: `Neutral_ID` frames 835-1194 (6 s at 60 fps, sampled at 30 fps), loop-closed, feet planted (they move < 1 mm), same posture fix (Neck 4, Head 0 deg, arms 3 deg out).
  - Fingers: a relaxed curl (more toward the pinky, fingers gathered), with a tiny sway so every key differs (three.js only re-applies a track whose value changes).
  - Pipeline: `work/scripts/mocap/` (numpy only): `python3 go.py "$(cat final.json)" <outdir>` reads `prev_xbotclips/<name>.glb` and the BVH files, writes `<outdir>/<name>.glb` and `info.json` (clip speed, pass times, foot slide per stance); `setconst.py <outdir> [speed]` writes WALK_STRIDE/WALK_PASS into the site, `apply.sh <outdir>` embeds the GLBs and rebuilds. Tests: `twalk.cjs` in the site.
  - `prev_xbotclips/` keeps the GLBs with the Xbot walk and idle.
- **Other embedded clips:** `run`, `agree`, `headShake`, `sad_pose`, `sneak_pose`. These are Xbot's rotation tracks copied unchanged. The hips translation is scaled to each character's hip height (lifter about 0.95, coach about 0.93, member 0.88 of Xbot's). Other translation tracks and all scale tracks were dropped.
- **Xbot's own clips also play correctly.** Use them with `clip.tracks = clip.tracks.filter(t => !t.name.endsWith('.scale') && (!t.name.endsWith('.position') || t.name.startsWith('mixamorigHips')))`.
- If the unfiltered Xbot clips are played, they still animate correctly. Their per-bone position tracks, however, force Xbot's bone lengths onto the character, so the member looks a little taller and stretched (see `renders/*-walkraw-34.png`). Use the embedded clips or the filter above.
- Viewer note: do not call `skeleton.pose()` on these (or on Xbot). With the 0.01-scale Armature parent, three.js's pose() applies that scale twice. To reset, save each bone's position, quaternion and scale after loading and restore them.

## Materials (one per mesh, metallic-roughness)
| mesh / material | what it is |
|---|---|
| `Body` / `Body_skin` | **body skin**: diffuse 2K (MakeHuman skin, tinted to a South Asian tone) and a 2K normal map (current lifter and coach: no normal map, skin desaturated 15-20 %, roughness 0.7; older versions used the Aksel muscle normal map) |
| `Eyes` / `Eyes` | eyeballs (brown iris; the cornea shell was removed) |
| `Eyebrows`, `Eyelashes` | alpha-blended cards |
| `Hair` / `Hair` | alpha-clipped hair cards (PNG with alpha) |
| `Cloth_<asset>` / `Cloth_<asset>` | clothes and shoes. The colour is a texture multiplied by a base colour factor, so you can recolour it with `material.color` |

Runtime look (the site's 02-rig.js `charMat`, applied when a character is cloned): skin roughness 0.52, specular 0.45 tinted warm, red sheen 0.35 (rim light standing in for subsurface scattering); clothes roughness >= 0.9 with a knit sheen; hair cards alpha-tested at 0.42 instead of blended; eyes roughness 0.12. `inflateCloth` pushes tops 5 mm (coach's tee 9 mm) along their normals so skin does not poke through; `footBlobs` draws a soft contact shadow under each planted foot.

## Licences of every asset used (all allow use and redistribution in a public website)
The generated mesh and targets (MakeHuman base mesh hm08, MPFB targets and the mixamo rig/weights) are CC0. MPFB's code is GPL, but its outputs are CC0 (https://static.makehumancommunity.org/mpfb.html, https://extensions.blender.org/add-ons/mpfb/).

MakeHuman system assets, CC0 (https://files.makehumancommunity.org/asset_packs/makehuman_system_assets/makehuman_system_assets_cc0.zip):
skins `young_asian_male` (lifter), `young_caucasian_male` (coach), `young_asian_female` (member); hair `short02`, `short04`, `ponytail01`; eyebrows `eyebrow001`, `eyebrow006`, `eyebrow011`; eyelashes `eyelashes01`, `eyelashes02`; eyes `high-poly` with the `brown` material.

Community packs (list: https://static.makehumancommunity.org/assets/assetpacks.html):
| asset | used by | author | licence | pack |
|---|---|---|---|---|
| mindfront_aksel_skin (normal map only) | lifter_v1, lifter_v2, coach_v1 only | Mindfront | CC0 | skins02_cc0.zip |
| elvs_crude_t-shirt_male | coach | Elvaerwyn | CC0 | shirts01_cc0.zip |
| mindfront_tank_top_01 (greyscaled to charcoal) | lifter (v2) | Mindfront | **CC-BY** | shirts03_ccby.zip |
| elvs_male_athletic_tank1 | lifter_v1 only | Elvaerwyn | **CC-BY** | shirts03_ccby.zip |
| punkduck_sleeveless_crop_top | member | punkduck | **CC-BY** | shirts03_ccby.zip |
| mindfront_male_swimming_trunks_01 (used as gym shorts, recoloured) | lifter | Mindfront | **CC-BY** | pants03_ccby.zip |
| mindfront_male_trousers_1 (recoloured black) | coach | Mindfront | **CC-BY** | pants02_ccby.zip |
| elvs_disco_pants_skinny (as leggings) | member | Elvaerwyn | **CC-BY** | pants02_ccby.zip |
| punkduck_running_shoes_01 | lifter | punkduck | **CC-BY** | shoes02_ccby.zip |
| punkduck_tennis_shoes | coach, member | punkduck | **CC-BY** | shoes02_ccby.zip |

Pack URLs follow the pattern `https://files.makehumancommunity.org/asset_packs/<pack>/<pack>_<cc0|ccby>.zip`.
**Attribution needed (CC-BY 4.0):** "3D clothing by Elvaerwyn, Mindfront and punkduck (MakeHuman community assets, CC-BY 4.0); characters made with MakeHuman/MPFB (CC0)." Put it in the site credits, together with the 100STYLE motion capture credit (CC BY 4.0).

## Caveats
- Realism is MakeHuman level: a real face (eyes, brows, lashes, hair cards) and real proportions and muscle shapes, but not a photoscan. Skin uses plain PBR (no SSS). Light it warmly with an environment map.
- The coach's trousers are a black trouser mesh with belt loops (no CC0/CC-BY jogger exists in the packs). From a distance they read as training pants.
- lifter_v1 only: its tank was decimated from 112k to 6.7k triangles. It has some soft folds and a small chest logo from the original texture.
- Skinning is linear blend, as MPFB exports it. Shoulders pinch a little in extreme poses, which is normal for Mixamo-style rigs.
- No face blendshapes or expressions are included (morphs were not exported).
- The eyes have no cornea or specular shell. Add an environment map to get catchlights.

## Rebuild
`work/` holds the pipeline. `scripts/build.py cfg/<name>.json` is MPFB build → T-pose → materials → GLB, `scripts/post.py` is the Xbot skeleton layout plus clips, `scripts/shots.cjs` makes the Playwright renders, and `cfg/*.json` holds the character settings. MPFB extension: https://extensions.blender.org/add-ons/mpfb/ (v2.0.18).
