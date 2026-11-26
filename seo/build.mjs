// Builds the pages search engines read: one per exercise, one per muscle group, the exercise library, a 404 page,
// sitemap.xml and robots.txt. Everything comes from the same data the 3D app uses (see extract.mjs).
// Run: node seo/build.mjs   (site/build.sh runs it after building app.js)
import {writeFileSync, mkdirSync, rmSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {extract} from './extract.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..'), SITE = join(ROOT, 'site');
const ORIGIN = (process.env.SITE_URL || 'https://trainyourmuscles.site').replace(/\/$/, '');
const BRAND = 'Train Your Muscles';
const {exercises, groups} = extract(join(SITE, 'src'));

// ---------------------------------------------------------------- helpers
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const SMALL = new Set(['a', 'an', 'and', 'the', 'to', 'of', 'on', 'in', 'or', 'for']);
const title = s => s.replace(/[A-Za-z]+/g, (w, i) => i > 0 && SMALL.has(w.toLowerCase()) ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1));
const lc1 = s => s && s[0].toLowerCase() + s.slice(1);
const clip = (s, n) => s.length <= n ? s : s.slice(0, s.lastIndexOf(' ', n - 1)).replace(/[,;:.\s]+$/, '') + '…';
const list = a => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
const exUrl = e => `/exercises/${slug(e.name)}`, grUrl = g => `/muscles/${g.key}`;
const byKey = Object.fromEntries(exercises.map(e => [e.key, e])), grByKey = Object.fromEntries(groups.map(g => [g.key, g]));
const inGroup = g => exercises.filter(e => e.group === g.key);
const live = e => e.kind !== 'hold'; // the camera form check works for every exercise that moves (see 35/36-formcheck)

function page({path, title: t, desc, body, ld = [], crumbs = []}) {
  const url = ORIGIN + path;
  const bc = crumbs.length ? [{'@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: crumbs.map(([name, p], i) =>
    ({'@type': 'ListItem', position: i + 1, name, item: ORIGIN + p}))}] : [];
  const json = [...ld, ...bc].map(o => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(t)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(url)}">
<meta name="theme-color" content="#07090b">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<meta property="og:type" content="article">
<meta property="og:site_name" content="${BRAND}">
<meta property="og:title" content="${esc(t)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(url)}">
<meta name="twitter:card" content="summary">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@800;900&family=Figtree:wght@400;600;700&display=swap">
<link rel="stylesheet" href="/pages.css">
${json}
<!--analytics-->
</head>
<body>
<header class="top"><div class="wrap"><a class="brand" href="/">Train Your <span>Muscles</span></a>
  <nav aria-label="Main"><a href="/exercises">Exercises</a><a class="cta-sm" href="/">Open the 3D gym</a></nav></div></header>
${crumbs.length > 1 ? `<nav class="crumbs wrap" aria-label="Breadcrumb">${crumbs.map(([n, p], i) => i < crumbs.length - 1 ? `<a href="${p}">${esc(n)}</a>` : `<span aria-current="page">${esc(n)}</span>`).join(' <i>/</i> ')}</nav>` : ''}
<main class="wrap">
${body}
</main>
<footer class="foot"><div class="wrap">
  <p class="fbrand">Train Your <span>Muscles</span></p>
  <nav aria-label="Muscle groups">${groups.map(g => `<a href="${grUrl(g)}">${esc(g.name)} exercises</a>`).join('')}</nav>
  <p class="small">General guidance for healthy adults, not medical advice. Stop if something hurts, and see a professional for pain or injury.</p>
</div></footer>
</body>
</html>
`;
}
const cta = (href, label, sub) => `<a class="cta" href="${href}"><b>${label}</b>${sub ? `<span>${sub}</span>` : ''}</a>`;
const exCard = e => `<li><a href="${exUrl(e)}"><b>${esc(e.name)}</b><span>${esc(e.eq)} · ${esc(e.focus)}</span></a></li>`;

// ---------------------------------------------------------------- one exercise
function exercisePage(e) {
  const g = grByKey[e.group], n = e.mistakes.length;
  const main = e.muscles.filter(m => m.main).map(m => m.name), help = e.muscles.filter(m => !m.main).map(m => m.name);
  const name = title(e.name);
  let t = `How to Do the ${name}: Proper Form & ${n} Common Mistake${n === 1 ? '' : 's'}`;
  if ((t + ' | ' + BRAND).length <= 75) t += ' | ' + BRAND;
  const desc = clip(`How to do the ${e.name.toLowerCase()} with proper form, step by step. Works the ${list(main).toLowerCase()}. ` +
    `Avoid ${n} common mistakes: ${list(e.mistakes.map(m => lc1(m.short || m.title)))}.`, 158);
  const plans = groups.flatMap(gr => gr.plans.flatMap(p => p.items.filter(it => it.key === e.key).map(it => ({gr, p, it}))));
  const related = inGroup(g).filter(x => x.key !== e.key);
  const body = `<article class="ex">
<p class="eyebrow">${esc(g.name)} · ${esc(e.eq)}</p>
<h1>How to do the ${esc(e.name.toLowerCase())}</h1>
<p class="lead">The ${esc(e.name.toLowerCase())} is ${/^[aeiou]/i.test(e.eq) ? 'an' : 'a'} ${esc(e.eq.toLowerCase())} exercise for the ${esc(e.focus.toLowerCase())}.
It mainly works the ${esc(list(main).toLowerCase())}${help.length ? `, with help from the ${esc(list(help).toLowerCase())}` : ''}.${e.quip ? ` <em>${esc(e.quip)}</em>` : ''}</p>
<div class="ctas">${cta(`/?ex=${e.key}`, 'Watch it in 3D →', 'See the right form and every mistake on a 3D body, with the working muscles lit up')}
${live(e) ? cta(`/?form=${e.key}`, 'Check my form →', 'Your phone camera counts your reps and spots these mistakes') : ''}</div>

<section><h2>Muscles worked</h2>
<ul class="mus">${main.map(m => `<li class="m">${esc(m)}<small>main</small></li>`).join('')}${help.map(m => `<li>${esc(m)}<small>helping</small></li>`).join('')}</ul></section>

<section><h2>Step by step</h2>
<ol class="steps">${e.steps.map((s, i) => `<li id="step-${i + 1}"><h3>${esc(s.title)}${s.note ? ` <small>${esc(s.note)}</small>` : ''}</h3><p>${esc(s.text)}</p></li>`).join('\n')}</ol></section>
${e.how.length ? `<section><h2>Setup checklist</h2><ul class="check">${e.how.map(h => `<li>${esc(h)}</li>`).join('')}</ul></section>` : ''}

<section><h2>${n} common ${e.name.toLowerCase()} mistake${n === 1 ? '' : 's'}</h2>
${e.mistakes.map((m, i) => `<div class="mist"><h3><i>${i + 1}</i>${esc(m.title)}</h3>
<p class="wrong">${esc(m.wrong)}</p>
<dl>${m.now ? `<dt>Right away</dt><dd>${esc(m.now)}</dd>` : ''}${m.later ? `<dt>Over time</dt><dd>${esc(m.later)}</dd>` : ''}<dt class="fix">The fix</dt><dd class="fix">${esc(m.fix)}</dd></dl></div>`).join('\n')}
<p class="aside">See each mistake next to the right form on the 3D body: <a href="/?ex=${e.key}">open the ${esc(e.name.toLowerCase())} in 3D</a>.</p></section>

${e.beginner ? `<section><h2>Sets and reps for beginners</h2><p>${esc(e.beginner)}</p></section>` : ''}
${plans.length ? `<section><h2>Workouts with the ${esc(e.name.toLowerCase())}</h2><ul class="plans">${plans.map(({gr, p, it}) =>
  `<li><a href="${grUrl(gr)}#${slug(p.name)}"><b>${esc(gr.name)}: ${esc(p.name)}</b></a> <span>${esc(it.sets)}${it.rest ? `, rest ${esc(it.rest)}` : ''}</span></li>`).join('')}</ul></section>` : ''}

<section><h2>More ${esc(g.name.toLowerCase())} exercises</h2><ul class="cards">${related.map(exCard).join('')}</ul>
<p><a href="${grUrl(g)}">All ${esc(g.name.toLowerCase())} exercises and workout plans →</a></p></section>
</article>`;
  const ld = [{'@context': 'https://schema.org', '@type': 'HowTo', name: `How to do the ${e.name.toLowerCase()}`, description: desc,
    tool: [{'@type': 'HowToTool', name: e.eq}],
    step: e.steps.map((s, i) => ({'@type': 'HowToStep', position: i + 1, name: s.title, text: s.text, url: `${ORIGIN}${exUrl(e)}#step-${i + 1}`}))}];
  return page({path: exUrl(e), title: t, desc, body, ld, crumbs: [['Home', '/'], ['Exercises', '/exercises'], [g.name, grUrl(g)], [e.name, exUrl(e)]]});
}

// ---------------------------------------------------------------- one muscle group
function groupPage(g) {
  const ex = inGroup(g);
  const t = `${g.name} Exercises: ${ex.length} Best Moves, Proper Form & Workout Plans | ${BRAND}`;
  const desc = clip(`The ${ex.length} best ${g.name.toLowerCase()} exercises (${g.sub}) with step-by-step form, the common mistakes, ` +
    `and ready-made ${g.name.toLowerCase()} workouts with sets, reps and rest: ${list(ex.slice(0, 4).map(e => e.name.toLowerCase()))} and more.`, 158);
  const area = e => [].concat(g.areaOf[e.key] || e.part);
  const parts = g.parts.length ? g.parts : [...new Set(ex.flatMap(area))];
  const byPart = parts.map(p => [p, ex.filter(e => area(e).includes(p))]).filter(([, a]) => a.length);
  const body = `<article>
<p class="eyebrow">Muscle group</p>
<h1>${esc(g.name)} exercises</h1>
<p class="lead">${esc(g.line)} Here are the ${ex.length} best ${esc(g.name.toLowerCase())} exercises, covering the ${esc(g.sub)}, each with step-by-step form and the mistakes to avoid.</p>
<div class="ctas">${cta(`/?muscle=${g.key}`, `Start ${esc(g.name.toLowerCase())} day in 3D →`, 'The coach walks you through today’s plan, exercise by exercise')}</div>
${byPart.map(([p, a]) => `<section><h2>${esc(p)}</h2><ul class="cards">${a.map(exCard).join('')}</ul></section>`).join('\n')}
<section><h2>${esc(g.name)} workout plans</h2>
${g.plans.map(p => `<div class="plan" id="${slug(p.name)}"><h3>${esc(p.name)} <small>${esc(p.who)}</small></h3><p>${esc(p.why)}</p>
<table><thead><tr><th>Exercise</th><th>Sets × reps</th><th>Rest</th></tr></thead><tbody>${p.items.filter(it => byKey[it.key]).map(it =>
  `<tr><td><a href="${exUrl(byKey[it.key])}">${esc(byKey[it.key].name)}</a></td><td>${esc(it.sets)}</td><td>${esc(it.rest)}</td></tr>`).join('')}</tbody></table></div>`).join('\n')}
</section>
<section><h2>Other muscle groups</h2><ul class="chips">${groups.filter(x => x !== g).map(x => `<li><a href="${grUrl(x)}">${esc(x.name)}</a></li>`).join('')}</ul></section>
</article>`;
  const ld = [{'@context': 'https://schema.org', '@type': 'ItemList', name: `${g.name} exercises`,
    itemListElement: ex.map((e, i) => ({'@type': 'ListItem', position: i + 1, name: e.name, url: ORIGIN + exUrl(e)}))}];
  return page({path: grUrl(g), title: t, desc, body, ld, crumbs: [['Home', '/'], ['Exercises', '/exercises'], [g.name, grUrl(g)]]});
}

// ---------------------------------------------------------------- the library
function libraryPage() {
  const t = `Gym Exercise Library: How to Do ${exercises.length} Exercises With Proper Form | ${BRAND}`;
  const desc = `Step-by-step guides to ${exercises.length} gym exercises for ${list(groups.map(g => g.name.toLowerCase()))}: proper form, the common mistakes and how to fix them, with every move shown in 3D.`;
  const body = `<article>
<p class="eyebrow">Exercise library</p>
<h1>How to do every exercise in the gym</h1>
<p class="lead">${exercises.length} exercises across ${groups.length} muscle groups. Each guide covers the right form step by step, the muscles it works, and the mistakes people make, with what each one costs you and how to fix it.</p>
<div class="ctas">${cta('/', 'Walk into the 3D gym →', 'Pick a muscle, and the coach builds today’s plan')}</div>
${groups.map(g => `<section><h2><a href="${grUrl(g)}">${esc(g.name)}</a> <small>${esc(g.sub)}</small></h2><ul class="cards">${inGroup(g).map(exCard).join('')}</ul></section>`).join('\n')}
</article>`;
  return page({path: '/exercises', title: t, desc, body, crumbs: [['Home', '/'], ['Exercises', '/exercises']]});
}

function notFoundPage() {
  return page({path: '/404', title: `Page not found | ${BRAND}`, desc: 'This page does not exist.', body: `<article>
<h1>That page skipped leg day</h1><p class="lead">It isn’t here. Try the exercise library, or walk into the 3D gym.</p>
<div class="ctas">${cta('/exercises', 'All exercises →')}${cta('/', 'Open the 3D gym →')}</div>
<section><h2>Muscle groups</h2><ul class="chips">${groups.map(x => `<li><a href="${grUrl(x)}">${esc(x.name)}</a></li>`).join('')}</ul></section></article>`})
    .replace(/<link rel="canonical"[^>]*>\n/, '<meta name="robots" content="noindex">\n');
}

// ---------------------------------------------------------------- write it all
const out = (p, s) => { const f = join(SITE, p); mkdirSync(dirname(f), {recursive: true}); writeFileSync(f, s); };
rmSync(join(SITE, 'exercises'), {recursive: true, force: true}); rmSync(join(SITE, 'muscles'), {recursive: true, force: true});
const slugs = new Set();
for (const e of exercises) { const s = slug(e.name); if (slugs.has(s)) throw new Error('duplicate slug ' + s); slugs.add(s); out(`exercises/${s}.html`, exercisePage(e)); }
for (const g of groups) out(`muscles/${g.key}.html`, groupPage(g));
out('exercises.html', libraryPage());
out('404.html', notFoundPage());
const urls = ['/', '/exercises', ...groups.map(grUrl), ...exercises.map(exUrl)];
out('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${ORIGIN}${u}</loc></url>`).join('\n')}\n</urlset>\n`);
out('robots.txt', `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${ORIGIN}/sitemap.xml\n`);
console.log(`seo: ${exercises.length} exercise pages, ${groups.length} muscle pages, library, 404, sitemap (${urls.length} URLs), robots.txt`);
