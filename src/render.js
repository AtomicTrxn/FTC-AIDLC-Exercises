/* ============================================================
   render.js — one renderer, two outputs.

   Markdown source files under src/*.md are the SOURCE OF TRUTH.
   This script parses them and emits:
     • .docx  (Word, for printing and handout)
     • .html  (for publishing as an artifact)

   Usage:  node render.js <source.md> [--docx out.docx] [--html out.html]
   ============================================================ */

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
  WidthType, ShadingType, BorderStyle, AlignmentType, VerticalAlign, PageBreak,
} = require("docx");
const fs = require("fs");
const path = require("path");

/* ---------------- design tokens (docx) ---------------- */
const INK = "1F2937", SOFT = "5C6675", RULE = "D5DAE1";
const ACCENT = "1F5D4C", ACCENT_SOFT = "EAF2EE";
const AMBER = "8A5D10", AMBER_SOFT = "FBF2DF";
const TENET = "6B4E1E";
const CODE_BG = "F2F4F6";
const SANS = "Trebuchet MS", BODY = "Georgia", MONO = "Consolas";
const FULL = 9360;

/* ============================================================
   1. PARSER
   ============================================================ */

function parse(src) {
  const lines = src.split(/\r?\n/);
  const meta = {};
  let i = 0;

  if (lines[0].trim() === "---") {
    i = 1;
    while (i < lines.length && lines[i].trim() !== "---") {
      const m = lines[i].match(/^([A-Za-z0-9_]+):\s*(.*)$/);
      if (m) meta[m[1]] = m[2].trim();
      i++;
    }
    i++;
  }

  const nodes = [];
  const cellSplit = (s) => s.split("|").map((x) => x.trim());

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();
    i++;

    if (!line || line.startsWith("//")) continue;
    if (!line.startsWith("@")) continue; // everything must be a directive

    const sp = line.indexOf(" ");
    const tag = (sp === -1 ? line : line.slice(0, sp)).slice(1);
    const rest = sp === -1 ? "" : line.slice(sp + 1).trim();

    const collectUntilEnd = () => {
      const buf = [];
      while (i < lines.length && lines[i].trim() !== "@end") buf.push(lines[i++]);
      i++; // skip @end
      return buf;
    };
    const collectItems = () => {
      const items = [];
      while (i < lines.length) {
        const l = lines[i].trim();
        if (l.startsWith("- ")) { items.push(l.slice(2).trim()); i++; }
        else if (l === "" ) { i++; }
        else break;
      }
      return items;
    };

    switch (tag) {
      case "pagebreak": nodes.push({ t: "pagebreak" }); break;
      case "gap":       nodes.push({ t: "gap", n: parseInt(rest || "160", 10) }); break;

      case "anchor":    nodes.push({ t: "anchor", id: rest }); break;
      case "eyebrow":   nodes.push({ t: "eyebrow", text: rest }); break;
      case "h1":        nodes.push({ t: "h1", text: rest }); break;
      case "h2":        nodes.push({ t: "h2", text: rest }); break;
      case "h3":        nodes.push({ t: "h3", text: rest }); break;
      case "p":         nodes.push({ t: "p", text: rest }); break;
      case "lede":      nodes.push({ t: "lede", text: rest }); break;
      case "note":      nodes.push({ t: "note", text: rest }); break;
      case "prompt":    nodes.push({ t: "prompt", text: rest }); break;
      case "check":     nodes.push({ t: "check", text: rest }); break;
      case "done":      nodes.push({ t: "done", text: rest }); break;
      case "tenettag":  nodes.push({ t: "tenettag", text: rest }); break;

      case "step": {
        const [n, title, metaTxt, opt] = cellSplit(rest);
        nodes.push({ t: "step", n, title, meta: metaTxt || "", optional: opt === "optional" });
        break;
      }
      case "phase": {
        const [n, title, metaTxt] = cellSplit(rest);
        nodes.push({ t: "phase", n, title, meta: metaTxt || "" });
        break;
      }
      case "tenet": {
        const [n, name] = cellSplit(rest);
        const body = collectUntilEnd();
        const lines2 = body
          .map((l) => l.trim())
          .filter((l) => l.startsWith("@tline"))
          .map((l) => {
            const r = l.slice("@tline".length).trim();
            const idx = r.indexOf("|");
            return { label: r.slice(0, idx).trim(), text: r.slice(idx + 1).trim() };
          });
        nodes.push({ t: "tenet", n, name, lines: lines2 });
        break;
      }

      case "dothis":    nodes.push({ t: "list", kind: "dothis", items: collectItems() }); break;
      case "lens":      nodes.push({ t: "list", kind: "lens", items: collectItems() }); break;
      case "questions": nodes.push({ t: "list", kind: "questions", items: collectItems() }); break;
      case "produce":   nodes.push({ t: "list", kind: "produce", items: collectItems() }); break;
      case "bullets":   nodes.push({ t: "list", kind: "bullets", items: collectItems() }); break;

      case "rule":      nodes.push({ t: "callout", variant: "warn",   title: rest, body: collectUntilEnd().join(" ").trim() }); break;
      case "box":       nodes.push({ t: "callout", variant: "accent", title: rest, body: collectUntilEnd().join(" ").trim() }); break;
      case "panel":     nodes.push({ t: "panel", title: rest, items: collectUntilEnd().map((l) => l.trim()).filter((l) => l.startsWith("- ")).map((l) => l.slice(2).trim()) }); break;
      case "code":      nodes.push({ t: "code", label: rest, lines: collectUntilEnd() }); break;

      case "sketch":    nodes.push({ t: "sketch", text: rest }); break;
      case "img": {
        const [p, w, h] = cellSplit(rest);
        nodes.push({ t: "img", src: p, w: parseInt(w, 10), h: parseInt(h, 10) });
        break;
      }

      case "table": {
        const widths = rest ? rest.split(",").map((x) => parseInt(x.trim(), 10)) : null;
        const body = collectUntilEnd();
        let head = null;
        const rows = [];
        for (const bl of body) {
          const l = bl.trim();
          if (l.startsWith("@th ")) head = cellSplit(l.slice(4));
          else if (l.startsWith("@tr ")) rows.push(cellSplit(l.slice(4)));
        }
        nodes.push({ t: "table", widths, head, rows });
        break;
      }

      case "timeline": {
        const body = collectUntilEnd();
        const segs = body.map((l) => l.trim()).filter(Boolean).map((l) => {
          const [grow, time, name, cls] = cellSplit(l.replace(/^@seg\s*/, ""));
          return { grow: parseInt(grow, 10), time, name, cls: cls || "c2" };
        });
        nodes.push({ t: "timeline", segs });
        break;
      }

      case "nav": {
        const body = collectUntilEnd();
        nodes.push({ t: "nav", items: body.map((l) => l.trim()).filter(Boolean).map((l) => {
          const [href, label] = cellSplit(l.replace(/^@item\s*/, ""));
          return { href, label };
        }) });
        break;
      }

      default: break;
    }
  }
  return { meta, nodes };
}

/* ============================================================
   2. INLINE MARKUP  — `code`  **bold**  _italic_
   ============================================================ */

function splitInline(s) {
  const out = [];
  for (const part of String(s).split(/(`[^`]+`|\*\*[^*]+\*\*|(?<![A-Za-z0-9_])_[^_\n]+_(?![A-Za-z0-9_]))/g)) {
    if (!part) continue;
    if (part.startsWith("`") && part.endsWith("`")) out.push({ k: "code", v: part.slice(1, -1) });
    else if (part.startsWith("**") && part.endsWith("**")) out.push({ k: "bold", v: part.slice(2, -2) });
    else if (part.startsWith("_") && part.endsWith("_")) out.push({ k: "em", v: part.slice(1, -1) });
    else out.push({ k: "text", v: part });
  }
  return out;
}

const BLANK_RE = /^\[blank:(\d+)\]$/;

/* ============================================================
   3. DOCX EMITTER
   ============================================================ */

function toDocx({ meta, nodes }, outPath) {
  let PB = 0;

  const inline = (s, o = {}) =>
    splitInline(s).map((p) => {
      const base = { font: o.font || BODY, size: o.size || 20, color: o.color || INK, italics: !!o.italics };
      if (p.k === "code") return new TextRun({ ...base, text: p.v, font: MONO, size: (o.size || 20) - 2, color: ACCENT });
      if (p.k === "bold") return new TextRun({ ...base, text: p.v, bold: true });
      if (p.k === "em") return new TextRun({ ...base, text: p.v, italics: true });
      return new TextRun({ ...base, text: p.v });
    });

  const noBorder = () => {
    const n = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
    return { top: n, bottom: n, left: n, right: n, insideHorizontal: n, insideVertical: n };
  };
  const borders = (color, size = 4) => {
    const b = { style: BorderStyle.SINGLE, size, color };
    return { top: b, bottom: b, left: b, right: b, insideHorizontal: b, insideVertical: b };
  };
  const sideBar = (color) => ({
    top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    left: { style: BorderStyle.SINGLE, size: 18, color },
  });

  const numberedHeader = (kindLabel, n, title, metaTxt, color) => {
    const numW = 900, txtW = FULL - numW;
    return new Table({
      width: { size: FULL, type: WidthType.DXA },
      columnWidths: [numW, txtW],
      borders: noBorder(),
      rows: [new TableRow({ cantSplit: true, children: [
        new TableCell({
          width: { size: numW, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: color },
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 90, bottom: 90, left: 0, right: 0 },
          children: [
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 },
              children: [new TextRun({ text: kindLabel, font: SANS, bold: true, size: 12, color: "FFFFFF", characterSpacing: 30 })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 },
              children: [new TextRun({ text: String(n), font: SANS, bold: true, size: 40, color: "FFFFFF" })] }),
          ],
        }),
        new TableCell({
          width: { size: txtW, type: WidthType.DXA },
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 90, bottom: 90, left: 200, right: 100 },
          children: [
            new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: title, font: SANS, bold: true, size: 26, color: INK })] }),
            new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: metaTxt, font: SANS, bold: true, size: 16, color, characterSpacing: 16 })] }),
          ],
        }),
      ] })],
    });
  };

  const calloutTable = (title, body, color, bg) => new Table({
    width: { size: FULL, type: WidthType.DXA }, columnWidths: [FULL], borders: noBorder(),
    rows: [new TableRow({ cantSplit: true, children: [new TableCell({
      width: { size: FULL, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: bg },
      margins: { top: 150, bottom: 150, left: 180, right: 180 },
      borders: sideBar(color),
      children: [
        new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: title.toUpperCase(), font: SANS, bold: true, size: 15, color, characterSpacing: 26 })] }),
        new Paragraph({ spacing: { after: 0, line: 272 }, children: inline(body, { size: 19 }) }),
      ],
    })] })],
  });

  const cell = (text, o = {}) => {
    const { header = false, width } = o;
    const bm = String(text).match(BLANK_RE);
    let kids;
    if (header) {
      kids = [new Paragraph({ spacing: { after: 0, line: 256 }, children: [new TextRun({ text, font: SANS, bold: true, size: 16, color: "FFFFFF" })] })];
    } else if (bm) {
      kids = Array.from({ length: parseInt(bm[1], 10) }, () =>
        new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: " ", size: 20 })] }));
    } else {
      kids = String(text).split("\\n").map((ln, idx, arr) => new Paragraph({
        spacing: { after: idx === arr.length - 1 ? 0 : 60, line: 256 },
        children: inline(ln, { size: 18 }),
      }));
    }
    return new TableCell({
      width: width ? { size: width, type: WidthType.DXA } : undefined,
      shading: header ? { type: ShadingType.CLEAR, fill: ACCENT } : undefined,
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 100, bottom: 100, left: 140, right: 140 },
      children: kids,
    });
  };

  const out = [];
  const listLabels = { dothis: "Do this", lens: "How to think about this", questions: "Questions worth arguing about", produce: "What to produce" };
  const listMarkers = { questions: "?", produce: "→", lens: "—", bullets: "•" };

  // ---- title block from frontmatter ----
  if (meta.kicker) out.push(new Paragraph({ spacing: { after: 50 },
    children: [new TextRun({ text: meta.kicker, font: SANS, bold: true, size: 17, color: ACCENT, characterSpacing: 30 })] }));
  if (meta.title) out.push(new Paragraph({ spacing: { after: meta.title2 ? 110 : 200 },
    children: [new TextRun({ text: meta.title, font: SANS, bold: true, size: 42, color: INK })] }));
  if (meta.title2) out.push(new Paragraph({ spacing: { after: 200 },
    children: [new TextRun({ text: meta.title2, font: SANS, bold: true, size: 42, color: INK })] }));

  for (const nd of nodes) {
    switch (nd.t) {
      case "pagebreak": PB++; out.push(new Paragraph({ children: [new PageBreak()] })); break;
      case "gap": out.push(new Paragraph({ spacing: { after: nd.n }, children: [] })); break;
      case "eyebrow": out.push(new Paragraph({ spacing: { before: 0, after: 60 },
        children: [new TextRun({ text: nd.text.toUpperCase(), font: SANS, bold: true, size: 16, color: ACCENT, characterSpacing: 24 })] })); break;
      case "h1": out.push(new Paragraph({ spacing: { before: 40, after: 150 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 6 } },
        children: [new TextRun({ text: nd.text, font: SANS, bold: true, size: 32, color: INK })] })); break;
      case "h2": out.push(new Paragraph({ spacing: { before: 40, after: 120 },
        children: [new TextRun({ text: nd.text, font: SANS, bold: true, size: 26, color: INK })] })); break;
      case "h3": out.push(new Paragraph({ spacing: { before: 160, after: 70 },
        children: [new TextRun({ text: nd.text, font: SANS, bold: true, size: 19, color: ACCENT })] })); break;
      case "p": out.push(new Paragraph({ spacing: { after: 130, line: 276 }, children: inline(nd.text) })); break;
      case "lede": out.push(new Paragraph({ spacing: { after: 150, line: 288 }, children: inline(nd.text, { size: 21, color: SOFT }) })); break;
      case "note": out.push(new Paragraph({ spacing: { after: 130, line: 276 }, children: inline(nd.text, { size: 19, color: SOFT, italics: true }) })); break;

      case "step": out.push(numberedHeader("STEP", nd.n, nd.title, nd.meta, nd.optional ? AMBER : ACCENT)); break;
      case "phase": out.push(numberedHeader("PHASE", nd.n, nd.title, nd.meta, ACCENT)); break;

      case "tenettag": out.push(new Paragraph({ spacing: { before: 60, after: 40 },
        children: [new TextRun({ text: "◆  " + nd.text.toUpperCase(), font: SANS, bold: true, size: 15, color: TENET, characterSpacing: 22 })] })); break;

      case "tenet": out.push(new Table({
        width: { size: FULL, type: WidthType.DXA }, columnWidths: [FULL], borders: borders(RULE, 4),
        rows: [new TableRow({ cantSplit: true, children: [new TableCell({
          width: { size: FULL, type: WidthType.DXA },
          margins: { top: 170, bottom: 170, left: 200, right: 200 },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 4, color: RULE },
            bottom: { style: BorderStyle.SINGLE, size: 4, color: RULE },
            right: { style: BorderStyle.SINGLE, size: 4, color: RULE },
            left: { style: BorderStyle.SINGLE, size: 18, color: TENET },
          },
          children: [
            new Paragraph({ spacing: { after: 90 }, children: [
              new TextRun({ text: "TENET " + nd.n + "   ", font: SANS, bold: true, size: 15, color: TENET, characterSpacing: 22 }),
              new TextRun({ text: nd.name, font: SANS, bold: true, size: 24, color: INK }),
            ] }),
            ...nd.lines.map((l) => new Paragraph({ spacing: { after: 100, line: 270 }, children: [
              new TextRun({ text: l.label + "  ", font: SANS, bold: true, size: 17, color: TENET }),
              ...inline(l.text, { size: 19 }),
            ] })),
          ],
        })] })],
      })); break;

      case "list": {
        if (listLabels[nd.kind]) out.push(new Paragraph({ spacing: { before: 190, after: 90 },
          children: [new TextRun({ text: listLabels[nd.kind].toUpperCase(), font: SANS, bold: true, size: 17, color: INK, characterSpacing: 30 })] }));
        nd.items.forEach((it, idx) => {
          const marker = nd.kind === "dothis" ? `${idx + 1}.  ` : (listMarkers[nd.kind] || "—") + "   ";
          out.push(new Paragraph({ spacing: { after: 88, line: 268 }, indent: { left: 380, hanging: 320 },
            children: [new TextRun({ text: marker, font: SANS, bold: true, size: 19, color: ACCENT }), ...inline(it, { size: 19 })] }));
        });
        break;
      }

      case "check": out.push(new Paragraph({ spacing: { after: 110, line: 268 }, indent: { left: 360, hanging: 360 },
        children: [new TextRun({ text: "☐   ", font: SANS, size: 21, color: ACCENT, bold: true }), ...inline(nd.text, { size: 19 })] })); break;

      case "done": out.push(new Table({
        width: { size: FULL, type: WidthType.DXA }, columnWidths: [FULL], borders: noBorder(),
        rows: [new TableRow({ cantSplit: true, children: [new TableCell({
          width: { size: FULL, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: ACCENT_SOFT },
          margins: { top: 150, bottom: 150, left: 180, right: 180 },
          borders: sideBar(ACCENT),
          children: [
            new Paragraph({ spacing: { after: 50 }, children: [new TextRun({ text: "YOU'RE DONE WHEN", font: SANS, bold: true, size: 16, color: ACCENT, characterSpacing: 26 })] }),
            new Paragraph({ spacing: { after: 0, line: 268 }, children: [new TextRun({ text: "☐   ", font: SANS, size: 22, color: ACCENT, bold: true }), ...inline(nd.text, { size: 19 })] }),
          ],
        })] })],
      })); break;

      case "callout": out.push(nd.variant === "accent"
        ? calloutTable(nd.title, nd.body, ACCENT, ACCENT_SOFT)
        : calloutTable(nd.title, nd.body, AMBER, AMBER_SOFT)); break;

      case "panel": out.push(new Table({
        width: { size: FULL, type: WidthType.DXA }, columnWidths: [FULL], borders: borders(RULE, 4),
        rows: [new TableRow({ cantSplit: true, children: [new TableCell({
          width: { size: FULL, type: WidthType.DXA },
          margins: { top: 170, bottom: 170, left: 200, right: 200 },
          children: [
            new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: nd.title, font: SANS, bold: true, size: 20, color: INK })] }),
            ...nd.items.map((it) => new Paragraph({ spacing: { after: 90, line: 272 }, indent: { left: 340, hanging: 250 },
              children: [new TextRun({ text: "•   ", font: SANS, bold: true, size: 19, color: ACCENT }), ...inline(it, { size: 19 })] })),
          ],
        })] })],
      })); break;

      case "code": {
        const kids = [];
        if (nd.label) kids.push(new Paragraph({ spacing: { after: 80 },
          children: [new TextRun({ text: nd.label, font: SANS, bold: true, size: 14, color: SOFT, characterSpacing: 20 })] }));
        nd.lines.forEach((ln) => kids.push(new Paragraph({ spacing: { after: 0, line: 232 },
          children: [new TextRun({ text: ln === "" ? " " : ln, font: MONO, size: 17, color: ln.trim().startsWith("//") ? SOFT : INK })] })));
        out.push(new Table({
          width: { size: FULL, type: WidthType.DXA }, columnWidths: [FULL], borders: borders(RULE, 4),
          rows: [new TableRow({ cantSplit: nd.lines.length <= 52, children: [new TableCell({
            width: { size: FULL, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: CODE_BG },
            margins: { top: 150, bottom: 150, left: 180, right: 140 },
            children: kids,
          })] })],
        }));
        break;
      }

      case "prompt": out.push(new Paragraph({ spacing: { before: 130, after: 150, line: 268 }, indent: { left: 240 },
        border: { left: { style: BorderStyle.SINGLE, size: 12, color: ACCENT, space: 8 } },
        children: [
          new TextRun({ text: "Prompt:  ", font: SANS, bold: true, size: 18, color: ACCENT }),
          new TextRun({ text: nd.text, font: MONO, size: 17, color: INK }),
        ] })); break;

      case "sketch": out.push(new Table({
        width: { size: FULL, type: WidthType.DXA }, columnWidths: [FULL], borders: borders(RULE, 4),
        rows: [new TableRow({ children: [new TableCell({
          width: { size: FULL, type: WidthType.DXA },
          margins: { top: 160, bottom: 1700, left: 200, right: 200 },
          children: [new Paragraph({ children: [new TextRun({ text: nd.text, italics: true, color: SOFT, size: 18, font: SANS })] })],
        })] })],
      })); break;

      case "img": out.push(new Paragraph({ spacing: { after: 160 },
        children: [new ImageRun({ type: "png", data: fs.readFileSync(nd.src), transformation: { width: nd.w, height: nd.h } })] })); break;

      case "table": {
        const widths = nd.widths || (nd.head ? nd.head.map(() => Math.floor(FULL / nd.head.length)) : [FULL]);
        const rows = [];
        if (nd.head) rows.push(new TableRow({ tableHeader: true, children: nd.head.map((h, k) => cell(h, { header: true, width: widths[k] })) }));
        nd.rows.forEach((r) => rows.push(new TableRow({ children: r.map((c, k) => cell(c, { width: widths[k] })) })));
        out.push(new Table({
          width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
          columnWidths: widths, borders: borders(RULE, 4), rows,
        }));
        break;
      }

      default: break; // timeline / nav are html-only
    }
  }

  const doc = new Document({
    styles: { default: { document: { run: { font: BODY, size: 20, color: INK } } } },
    sections: [{
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, bottom: 1080, left: 1440, right: 1440 } } },
      children: out,
    }],
  });

  return Packer.toBuffer(doc).then((buf) => {
    fs.writeFileSync(outPath, buf);
    console.log(`docx  → ${outPath}  (${PB} page breaks, expect ${PB + 1} pages)`);
  });
}

/* ============================================================
   4. HTML EMITTER
   ============================================================ */

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function htmlInline(s) {
  return splitInline(s).map((p) => {
    if (p.k === "code") return `<code>${esc(p.v)}</code>`;
    if (p.k === "bold") return `<b>${esc(p.v)}</b>`;
    if (p.k === "em") return `<em>${esc(p.v)}</em>`;
    return esc(p.v);
  }).join("");
}

function toHtml({ meta, nodes }, outPath, cssPath) {
  const css = fs.readFileSync(cssPath, "utf8");
  const h = [];
  h.push(`<title>${esc(meta.title + (meta.title2 ? " " + meta.title2 : ""))}</title>`);
  h.push(css);
  h.push(`<article>`);

  h.push(`  <header class="masthead">`);
  if (meta.kicker) h.push(`    <span class="eyebrow">${esc(meta.kicker)}</span>`);
  h.push(`    <h1>${esc(meta.title + (meta.title2 ? " " + meta.title2 : ""))}</h1>`);
  if (meta.dek) h.push(`    <p class="dek">${htmlInline(meta.dek)}</p>`);
  if (meta.chips) {
    h.push(`    <div class="meta-row">`);
    meta.chips.split(";").forEach((c) => {
      const [k, v] = c.split("=");
      h.push(`      <span class="meta-chip">${esc(k.trim())}: <b>${esc((v || "").trim())}</b></span>`);
    });
    h.push(`    </div>`);
  }
  if (meta.pair) h.push(`    <div class="doc-switch"><span class="active">${esc(meta.pairactive || "This document")}</span><span class="inactive">${esc(meta.pair)}</span></div>`);
  h.push(`  </header>`);

  const navNode = nodes.find((n) => n.t === "nav");
  if (navNode) {
    h.push(`  <nav class="quicknav">`);
    navNode.items.forEach((it) => h.push(`    <a href="${esc(it.href)}"><span class="num">00</span>${esc(it.label)}</a>`));
    h.push(`  </nav>`);
  }

  h.push(`  <div class="wrap">`);
  let openSection = false;
  const closeSection = () => { if (openSection) { h.push(`    </section>`); openSection = false; } };

  let pendingId = null;
  let pendingChecks = [];
  const flushChecks = () => {
    if (pendingChecks.length) {
      h.push(`      <ul class="checklist">`);
      pendingChecks.forEach((c) => h.push(`        <li>${htmlInline(c)}</li>`));
      h.push(`      </ul>`);
      pendingChecks = [];
    }
  };

  for (const nd of nodes) {
    if (nd.t !== "check") flushChecks();
    switch (nd.t) {
      case "anchor": pendingId = nd.id; break;
      case "eyebrow":
        closeSection();
        h.push(`    <section${pendingId ? ` id="${esc(pendingId)}"` : ""}>`); openSection = true;
        pendingId = null;
        h.push(`      <span class="eyebrow">${esc(nd.text)}</span>`);
        break;
      case "h1": h.push(`      <h2>${esc(nd.text)}</h2>`); break;
      case "h2": h.push(`      <h2>${esc(nd.text)}</h2>`); break;
      case "h3": h.push(`      <h3>${esc(nd.text)}</h3>`); break;
      case "p": h.push(`      <p>${htmlInline(nd.text)}</p>`); break;
      case "lede": h.push(`      <p class="lede">${htmlInline(nd.text)}</p>`); break;
      case "note": h.push(`      <p style="font-size:14px;color:var(--ink-soft);">${htmlInline(nd.text)}</p>`); break;

      case "step":
      case "phase":
        h.push(`      <h3><span class="phase-no">${esc(nd.n)}</span>${esc(nd.title)}${nd.meta ? ` <span style="font-size:12px;color:var(--ink-soft);letter-spacing:.08em;">· ${esc(nd.meta)}</span>` : ""}</h3>`);
        break;

      case "tenettag": h.push(`      <p class="eyebrow" style="color:#8a6a22;">◆ ${esc(nd.text)}</p>`); break;

      case "tenet":
        h.push(`      <div class="panel">`);
        h.push(`        <h3>Tenet ${esc(nd.n)} · ${esc(nd.name)}</h3>`);
        h.push(`        <ul>`);
        nd.lines.forEach((l) => h.push(`          <li><b>${esc(l.label)}:</b> ${htmlInline(l.text)}</li>`));
        h.push(`        </ul>`);
        h.push(`      </div>`);
        break;

      case "list":
        if (nd.kind !== "bullets") h.push(`      <p class="eyebrow" style="color:var(--ink-soft);">${esc({dothis:"Do this",lens:"How to think about this",questions:"Questions worth arguing about",produce:"What to produce"}[nd.kind] || "")}</p>`);
        h.push(nd.kind === "dothis" ? `      <ol>` : `      <ul>`);
        nd.items.forEach((it) => h.push(`        <li>${htmlInline(it)}</li>`));
        h.push(nd.kind === "dothis" ? `      </ol>` : `      </ul>`);
        break;

      case "check": pendingChecks.push(nd.text); break;

      case "done":
        h.push(`      <div class="callout good"><span class="label">You're done when</span>${htmlInline(nd.text)}</div>`);
        break;

      case "callout":
        h.push(`      <div class="callout${nd.variant === "warn" ? " warn" : ""}"><span class="label">${esc(nd.title)}</span>${htmlInline(nd.body)}</div>`);
        break;

      case "panel":
        h.push(`      <div class="panel">`);
        h.push(`        <h3>${esc(nd.title)}</h3>`);
        h.push(`        <ul>`);
        nd.items.forEach((it) => h.push(`          <li>${htmlInline(it)}</li>`));
        h.push(`        </ul>`);
        h.push(`      </div>`);
        break;

      case "code":
        if (nd.label) h.push(`      <p class="file-tag">${esc(nd.label)}</p>`);
        h.push(`      <pre>${nd.lines.map((l) => esc(l)).join("\n")}</pre>`);
        break;

      case "prompt": h.push(`      <div class="prompt">${esc(nd.text)}</div>`); break;

      case "img": {
        const b64 = fs.readFileSync(nd.src).toString("base64");
        h.push(`      <div class="diagram-frame"><img alt="diagram" style="width:100%;height:auto;" src="data:image/png;base64,${b64}"></div>`);
        break;
      }

      case "timeline":
        h.push(`    </section>`); openSection = false;
        h.push(`    <div class="wide"><div class="timeline">`);
        nd.segs.forEach((s) => h.push(`      <div class="seg ${esc(s.cls)}" style="flex-grow:${s.grow}"><span class="t">${esc(s.time)}</span><span class="n">${esc(s.name)}</span></div>`));
        h.push(`    </div></div>`);
        h.push(`    <section>`); openSection = true;
        break;

      case "table": {
        const skipBlank = (c) => (BLANK_RE.test(c) ? "" : htmlInline(c.replace(/\\n/g, " — ")));
        h.push(`      <div class="table-scroll">`);
        h.push(`      <table class="agenda">`);
        if (nd.head) h.push(`        <tr>${nd.head.map((x) => `<th>${esc(x)}</th>`).join("")}</tr>`);
        nd.rows.forEach((r) => h.push(`        <tr>${r.map((c) => `<td>${skipBlank(c)}</td>`).join("")}</tr>`));
        h.push(`      </table>`);
        h.push(`      </div>`);
        break;
      }
      default: break;
    }
  }
  flushChecks();
  closeSection();
  h.push(`  </div>`);
  if (meta.footer) h.push(`  <footer><hr class="rule" style="margin-bottom:32px;"><p>${htmlInline(meta.footer)}</p></footer>`);
  h.push(`</article>`);

  fs.writeFileSync(outPath, h.join("\n"));
  console.log(`html  → ${outPath}`);
}

/* ============================================================
   5. CLI
   ============================================================ */

const args = process.argv.slice(2);
const srcFile = args[0];
if (!srcFile) { console.error("usage: node render.js <source.md> [--docx out] [--html out] [--css file]"); process.exit(1); }
const getArg = (flag) => { const i = args.indexOf(flag); return i === -1 ? null : args[i + 1]; };

const parsed = parse(fs.readFileSync(srcFile, "utf8"));
const jobs = [];
if (getArg("--docx")) jobs.push(toDocx(parsed, getArg("--docx")));
if (getArg("--html")) toHtml(parsed, getArg("--html"), getArg("--css") || path.join(__dirname, "artifact.css"));
Promise.all(jobs).then(() => console.log("done."));
