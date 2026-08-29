# Source of truth

Everything in the parent folder is **generated**. Edit the markdown here, then run
`./build.sh`. Do not hand-edit the `.docx` or `.html` — the next build overwrites it.

| File | What it is |
|---|---|
| `student-worksheet.md` | The 16-step student handout. Source for the worksheet `.docx`. |
| `teachers-guide.md` | The teacher's guide. Source for the guide `.docx` **and** the published web version. |
| `codebase-review.md` | The Into The Deep review — findings against the exercise. Reference; not part of the session materials. |
| `render.js` | The generator. Parses the markdown, emits `.docx` and `.html`. |
| `artifact.css` | Styling for the web version only. The `.docx` styling lives in `render.js`. |
| `build.sh` | Regenerates everything. |

Requires Node with the `docx` package available on `NODE_PATH`. `build.sh` reads
`npm root -g`, so a global install is enough:

```
npm install -g docx
```

---

## Markup

Every line is a directive starting with `@`. Anything else is ignored, so `//` works
as a comment. Frontmatter at the top sets the title block and, for the guide, the
web masthead.

### Inline

Works inside any text: `` `code` ``, `**bold**`, `_italic_`.

**These do not nest and do not stack.** `` **`code` in bold** `` renders the backticks
literally, and `***both***` renders the asterisks. Use one marker per span. Headings
(`@h1`–`@h3`) and callout titles are emitted raw — no inline markup at all.

### Structure

| Directive | Effect |
|---|---|
| `@pagebreak` | Forces a new page in the `.docx`. |
| `@gap 160` | Vertical space, in twentieths of a point. |
| `@anchor id` | Sets the HTML `id` on the next section. Web only — `@nav` links to these. |
| `@eyebrow text` | Small caps label. Also opens a new section in HTML. |
| `@h1` / `@h2` / `@h3` | Headings. `@h1` gets a rule beneath it. |
| `@p text` | Body paragraph. |
| `@lede text` | Larger, softer intro paragraph. |
| `@note text` | Small italic aside. |

### Blocks

| Directive | Effect |
|---|---|
| `@step N \| Title \| Meta` | Numbered step header. Add ` \| optional` for the amber variant. |
| `@phase N \| Title \| Meta` | Same, labelled PHASE. |
| `@tenet N \| Name` … `@end` | Tenet card. Body is `@tline Label \| Text` lines. |
| `@tenettag text` | The ◆ marker naming which tenet a step exercises. |
| `@dothis` / `@lens` / `@questions` / `@produce` / `@bullets` | A labelled list. Follow with `- item` lines; ends at the first non-item line. |
| `@check text` | Checkbox line. |
| `@done text` | The "You're done when" box that closes a step. |
| `@rule Title` … `@end` | Amber callout — constraints, warnings, gotchas. |
| `@box Title` … `@end` | Green callout — context and asides. |
| `@panel Title` … `@end` | Bordered panel. Body is `- item` lines. |
| `@code Label` … `@end` | Monospace block. Label is optional. |
| `@prompt text` | An example AI prompt. |
| `@sketch text` | Empty bordered box for hand-drawing. |
| `@img path \| w \| h` | Image, sized in pixels. |

### Tables

```
@table 2700,6660
@th Step and purpose | Prompt
@tr **Step 5** — build the vocabulary.\n_Listen for: a list._ | `Prompt text here`
@tr Another question | [blank:2]
@end
```

Widths are DXA (twentieths of a point) and must total 9360 to fill the text column.
`[blank:N]` makes a fill-in cell N lines tall. `\n` inside a cell breaks the line.

### Web-only

| Directive | Effect |
|---|---|
| `@nav` … `@end` | Quick-nav bar. Body is `@item #anchor \| Label`. |
| `@timeline` … `@end` | Proportional session timeline. Body is `@seg grow \| time \| name \| colourclass`. |

---

## Invariants worth re-checking after an edit

The build prints the expected page count. Convert to PDF and confirm:

- **The worksheet has no blank pages, and every page from 7 on starts with a step header** — with the two capture-sheet pages (9 and 10) the only exception. No step may span a page break — that is the whole point of the format. If a step overflows, trim a `@gap` or split it into two steps.
- **The codebase walkthrough is presenter-led**, so the worksheet carries a capture sheet rather than reading steps. Anything the capture sheet stops collecting breaks a later step: the vocabulary feeds Steps 4 and 9, the “missing” loop-time row feeds Step 14, the log levels feed Step 12.
- **The guide has no blank pages.** A blank page usually means content exactly filled the previous page and an `@pagebreak` then added an empty one — remove that break or trim above it.
- **Code listings fit on one page** where possible. `render.js` keeps a listing together automatically at 52 lines or fewer.
