
// ---- the other six muscle groups and their plans (from the research files; sets × reps and rest are the researchers')
defGroup('back',{name:'Back',sub:'lats, traps, lower back',line:'Back day. The muscles you can’t see in the mirror but everyone else can.',
  parts:['Lats','Middle back','Upper traps','Lower back'],
  areaOf:{pullup:'Lats',latPulldown:'Lats',dbRow:'Lats',straightArm:'Lats',barRow:'Middle back',cableRow:'Middle back',shrug:'Upper traps',deadlift:'Lower back'},
  plans:[
    {name:'Full back',who:'Intermediate · about 70 min',why:'The deadlift goes first while you’re fresh: the heaviest load for the lower back. Pull-ups and rows cover the lats and the middle back, the straight-arm pulldown isolates the lats, shrugs finish the upper traps. Can’t do 5 pull-ups yet? Swap in the lat pulldown.',
      items:[['deadlift','3 × 5','3 min'],['pullup','2 × as many clean reps as you can, minus 2','2 min'],['barRow','3 × 8','2 min'],['cableRow','2 × 10–12','90 s'],['straightArm','2 × 12–15','60 s'],['shrug','2 × 12–15','60 s']]},
    {name:'No barbell',who:'Any level · about 55 min',why:'Dumbbells, cables and machines only. The lower back only works to hold the hinge here, so it gets less than with deadlifts.',
      items:[['latPulldown','3 × 8–12','2 min'],['dbRow','3 × 10 each side','90 s'],['cableRow','3 × 10–12','90 s'],['straightArm','2 × 12–15','60 s'],['shrug','2 × 12–15','60 s']]}]});
defGroup('shoulders',{name:'Shoulders',sub:'front, side, rear',line:'Shoulder day. Three heads, and we’re training all of them.',
  parts:['Front shoulders','Side shoulders','Rear shoulders'],
  areaOf:{ohp:'Front shoulders',seatPress:'Front shoulders',frontRaise:'Front shoulders',latRaise:'Side shoulders',cableLat:'Side shoulders',revDeck:'Rear shoulders',facePull:'Rear shoulders'},
  plans:[
    {name:'Barbell and raises',who:'Intermediate · about 50 min',why:'The overhead press moves the most weight, so it comes first. Then one raise for each head: side, rear, and the face pull for the rear shoulders and rotator cuff. The front raise is optional: presses already work the front hardest.',
      items:[['ohp','3 × 6–8','2–3 min'],['latRaise','3 × 12–15','60–90 s'],['revDeck','3 × 12–15','60–90 s'],['facePull','2 × 15–20','60 s'],['frontRaise','2 × 12–15 (optional)','60 s']]},
    {name:'No barbell',who:'Any level · about 40 min',why:'The seated dumbbell press is the best front-shoulder exercise in the ACE study; the cable keeps the side shoulder loaded all the way down.',
      items:[['seatPress','3 × 8–12','2 min'],['cableLat','3 × 12–15 each arm','60–90 s'],['revDeck','3 × 12–15','60–90 s'],['facePull','2 × 15–20','60 s']]}]});
defGroup('legs',{name:'Legs',sub:'quads, hamstrings, glutes, calves',line:'Leg day. Nobody skips it on my watch.',
  parts:['Quads','Hamstrings','Glutes','Calves'],
  areaOf:{squat:['Quads','Glutes'],legPress:['Quads','Glutes'],bulgarian:['Quads','Glutes'],legExt:'Quads',rdl:['Hamstrings','Glutes'],legCurl:'Hamstrings',hipThrust:'Glutes',standCalf:'Calves',seatCalf:'Calves'},
  plans:[
    {name:'Full legs',who:'Intermediate · about 60 min',why:'The squat goes first while you’re fresh. The Romanian deadlift adds the hinge for the hamstrings, the split squat trains one leg at a time, the leg extension hits the part of the quads the squat skips, and calves finish.',
      items:[['squat','3 × 6–8','3 min'],['rdl','3 × 8–10','2–3 min'],['bulgarian','2 × 8–10 each leg','90 s'],['legExt','2 × 10–15','90 s'],['legCurl','2 × 10–15','90 s'],['standCalf','3 × 10–15, 1 s stretch','90 s']]},
    {name:'Glutes and machines',who:'Any level · about 60 min',why:'Use it as your second leg day of the week: the hip thrust takes the squat’s place for the glutes, the leg press for the quads, and both calf machines cover the gastrocnemius and the soleus.',
      items:[['hipThrust','3 × 8–12','2 min'],['legPress','3 × 8–12','2–3 min'],['bulgarian','2 × 8–10 each leg','90 s'],['legExt','2 × 12–15','90 s'],['legCurl','2 × 12–15','90 s'],['seatCalf','1 × 15–20','90 s'],['standCalf','1 × 10–15','90 s']]}]});
defGroup('biceps',{name:'Biceps',sub:'long head, short head, forearms',line:'Arm day: biceps. The mirror has been expecting you.',
  parts:['Long head','Short head','Brachialis & forearms'],
  areaOf:{bbCurl:['Long head','Short head'],cableCurl:['Long head','Short head'],inclineCurl:'Long head',preacher:'Short head',concCurl:'Short head',hammer:'Brachialis & forearms'},
  plans:[
    {name:'Peak and stretch',who:'Any level · about 35 min',why:'The barbell curl is the heaviest, so it goes first. The incline curl stretches the long head, the preacher curl works the short head, and the hammer curl brings in the forearms.',
      items:[['bbCurl','3 × 8–10','90 s'],['inclineCurl','3 × 10–12','90 s'],['preacher','3 × 10–12','75 s'],['hammer','2 × 12','60 s']]},
    {name:'Cables and isolation',who:'Any level · about 30 min',why:'The cable keeps tension at the top where a bar goes light. The concentration curl scored the highest biceps activity in the ACE study with the least shoulder help.',
      items:[['cableCurl','3 × 10–12','75 s'],['inclineCurl','3 × 10–12','90 s'],['concCurl','2 × 10–12 each arm','60 s'],['hammer','2 × 12–15','60 s']]}]});
defGroup('triceps',{name:'Triceps',sub:'long head, outer heads',line:'Arm day: triceps. Two-thirds of your arm, finally getting attention.',
  parts:['Long head','Outer heads'],
  areaOf:{cgBench:['Long head','Outer heads'],triDip:['Long head','Outer heads'],ohExt:'Long head',skull:'Long head',kickback:'Long head',pushdown:'Outer heads'},
  plans:[
    {name:'Heavy press, then the long head',who:'Intermediate · about 40 min',why:'The close-grip bench is the heaviest triceps lift, so it goes first. The overhead extension stretches the long head (it grew it most in Maeo 2023), the pushdown finishes the outer heads, dips add bodyweight work.',
      items:[['cgBench','3 × 6–10','2–3 min'],['ohExt','3 × 10–15','90 s'],['pushdown','3 × 12–15','60–75 s'],['triDip','2 × 5–8','90 s']]},
    {name:'Free weights only',who:'Any level · about 35 min',why:'Dips first, then the skull crusher for the long head, kickbacks for the peak squeeze and a pushdown pump to finish.',
      items:[['triDip','3 × 5–8','2 min'],['skull','3 × 10–12','90 s'],['kickback','3 × 12–15 each arm','60 s'],['pushdown','2 × 15','60 s']]}]});
defGroup('core',{name:'Core',sub:'abs, obliques, deep core',line:'Core day. Brace yourself, literally.',
  parts:['Abs','Obliques','Deep core (brace)'],
  areaOf:{abWheel:'Abs',kneeRaise:'Abs',cableCrunch:'Abs',plank:['Abs','Deep core (brace)'],deadBug:'Deep core (brace)',sidePlank:'Obliques',pallof:'Obliques'},
  plans:[
    {name:'All three jobs',who:'Any level · about 25 min, after your main workout',why:'Hardest first: the ab wheel and knee raise curl and resist arching, the Pallof press and side plank resist twisting and side bending, the plank and dead bug teach the brace. Core work goes last so a tired trunk doesn’t make the heavy lifts unsafe.',
      items:[['abWheel','3 × 6–10','90 s'],['kneeRaise','3 × 8–12','90 s'],['pallof','2 × 8–10 each side','60 s'],['sidePlank','2 × 20–40 s each side','45 s'],['plank','1 × 30–45 s','45 s'],['deadBug','1 × 8 each side','—']]},
    {name:'Mat only, back friendly',who:'Any level · about 20 min',why:'No cables and no load on the spine: start with the dead bug, the drill for anyone with a sore back.',
      items:[['deadBug','3 × 8 each side','45 s'],['plank','3 × 20–40 s','45 s'],['sidePlank','2 × 20–30 s each side','45 s'],['abWheel','2 × 6–8 (half roll-out)','90 s'],['kneeRaise','1 × 10–12','—']]}]});
