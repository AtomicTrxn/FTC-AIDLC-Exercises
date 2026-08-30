/* ============================================================
   site.js — builds the landing page listing every exercise.

   Adding new material is a manifest entry, not a code change:
   edit src/site-manifest.json and rebuild.

   Usage:  node site.js <manifest.json> <out.html> [--css file]
   ============================================================ */
const fs = require("fs");
const path = require("path");

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const manifestPath = process.argv[2];
const outPath = process.argv[3];
const getArg = (f) => { const i = process.argv.indexOf(f); return i === -1 ? null : process.argv[i + 1]; };

const m = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const css = fs.readFileSync(getArg("--css") || path.join(__dirname, "assets", "site.css"), "utf8");

const h = [];
h.push(`<!doctype html>`);
h.push(`<html lang="en"><head>`);
h.push(`<meta charset="utf-8">`);
h.push(`<meta name="viewport" content="width=device-width,initial-scale=1">`);
h.push(`<title>${esc(m.site.title)}</title>`);
h.push(`<meta name="description" content="${esc(m.site.tagline)}">`);
h.push(css);
h.push(`</head><body>`);
h.push(`<main class="site">`);
h.push(`  <header class="site-head">`);
h.push(`    <span class="eyebrow">AI-DLC · working sessions</span>`);
h.push(`    <h1>${esc(m.site.title)}</h1>`);
h.push(`    <p class="tagline">${esc(m.site.tagline)}</p>`);
h.push(`  </header>`);

const ready = m.exercises.filter((e) => e.status !== "planned");
const planned = m.exercises.filter((e) => e.status === "planned");

h.push(`  <ul class="cards">`);
ready.forEach((e) => {
  h.push(`    <li class="card">`);
  if (e.eyebrow) h.push(`      <span class="eyebrow">${esc(e.eyebrow)}</span>`);
  h.push(`      <h2>${esc(e.title)}</h2>`);
  h.push(`      <p class="blurb">${esc(e.blurb)}</p>`);
  if (e.meta && e.meta.length) {
    h.push(`      <p class="meta">${e.meta.map((x) => `<span>${esc(x)}</span>`).join("")}</p>`);
  }
  h.push(`      <div class="links">`);
  (e.links || []).forEach((l) => {
    h.push(`        <a class="btn ${esc(l.kind || "secondary")}" href="${esc(l.href)}">${esc(l.label)}` +
           (l.note ? `<small>${esc(l.note)}</small>` : "") + `</a>`);
  });
  h.push(`      </div>`);
  h.push(`    </li>`);
});
h.push(`  </ul>`);

if (planned.length) {
  h.push(`  <section class="planned">`);
  h.push(`    <h2>In preparation</h2>`);
  h.push(`    <ul>`);
  planned.forEach((e) => h.push(`      <li><b>${esc(e.title)}</b>${e.blurb ? ` — ${esc(e.blurb)}` : ""}</li>`));
  h.push(`    </ul>`);
  h.push(`  </section>`);
}

h.push(`  <footer class="site-foot"><p>${esc(m.site.footer)}</p></footer>`);
h.push(`</main>`);
h.push(`</body></html>`);

fs.writeFileSync(outPath, h.join("\n"));
console.log(`site  → ${outPath}  (${ready.length} exercise${ready.length === 1 ? "" : "s"}${planned.length ? `, ${planned.length} planned` : ""})`);
