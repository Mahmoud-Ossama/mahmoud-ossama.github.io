# osama.engineer

The site served at **https://osama.engineer/** — GitHub Pages, `main` branch, root.

This repo is `Mahmoud-Ossama/mahmoud-ossama.github.io`. Because a custom domain on a
user site is inherited by every project page on the account, `CNAME` here controls
the apex for the whole account. **Don't delete it.**

## Routes

| Path | What it is |
|---|---|
| `/` | Osama Engineering — AI & automation, bilingual EN/AR |
| `/portfolio` | earlier portfolio page, kept as its own route |

## Run it locally

Must be served over HTTP, not opened as a file. The hero sculpture is an ES module
behind an import map and the embedded animations are framed documents — the browser
blocks both under `file://`.

```
python -m http.server 8777
```

Then <http://127.0.0.1:8777/>.

## Layout

```
index.html          the homepage
css/site.css        tokens, components, motion
js/site.js          language, calculator, reveal, lazy + suspendable canvases
js/intelligence-machine.js  <intelligence-machine> — the hero sculpture
js/machine-geometry.js      its geometry, materials and dock/idle arrangements
assets/             the 6 animation bundles
vendor/three/       three.js 0.184.0, vendored — no CDN at runtime
portfolio/          self-contained earlier portfolio page
CNAME               osama.engineer — controls the apex for the whole account
.nojekyll           stop Pages preprocessing the files
```

Only Google Fonts is fetched from the network. Everything else is local.

## Design

Locked: **Petrol** palette · **Light** theme · **Cairo** for display and Arabic with
**Source Sans 3** for Latin body · bilingual with a full RTL flip driven entirely by
logical properties, so there is no second stylesheet.

The hero is two columns: the copy on one side, a live kinetic sculpture on the other.
The sculpture's canvas is transparent and sits directly on the page ground — no stage,
no card, no visible rectangle. Below it, four sections alternate in a zig-zag:

| Row | Left | Right |
|---|---|---|
| Opportunity | text | Automation Flow |
| Services | Engineering Process Loop | text |
| Benchmarks | text + bar chart | Benchmark Visualization |
| Calculator | Capacity Flow | text + calculator |

`.zig-rev` swaps columns with grid `order`, so DOM order never changes and RTL mirrors
for free. Below 1000px every row collapses to one column, text first, reversed rows
included.

The benchmark and capacity animations swap files with the language toggle. The other
two carry no text, so one file serves both languages.

## Performance

- **Nothing renders off-screen.** The hero sculpture parks its own render loop when it
  leaves the viewport or the tab is hidden. The four framed animations drive themselves from
  `requestAnimationFrame` *inside their own documents*, and Chrome keeps servicing rAF
  in a same-origin iframe that has scrolled away — so `setFramePaused()` swaps each
  frame's own `requestAnimationFrame` for a queue while it is off-screen and flushes
  the parked callbacks on the way back in. One parked callback per suspended frame, no
  queue growth, and the animation resumes mid-loop rather than restarting.
- **Frames mount at 300px out and pause at 120px out** — mount early, pause late, so
  nothing is blank when it scrolls into view.
- **No layout shift.** Every canvas box is reserved by `aspect-ratio` at the artwork's
  native size (1920×1080 for the two flow pieces, 1200×900 and 1000×750 for the
  charts) before anything loads.

Above the fold is roughly 410KB gzipped, nearly all of it three.js (three.module.js
126KB + three.core.js 274KB). The hero used to be a 2MB GLB plus `model-viewer`, which
shipped a second copy of three — about 720KB gzipped, so this is ~310KB lighter. The
sculpture is generated geometry, so there is no model to download at all. Each embedded
animation is about 1.1MB and only loads when you scroll near it.

If the hero ever needs to be lighter, the lever is a tree-shaken three build: the
component touches a small fraction of `three.core.js`, but an unbundled ES module
import has to ship the whole file.

## Accessibility

- Every text sample measured against its real computed background passes WCAG AA.
  `--p-ink-3` was `#67766F`, which failed at 4.39:1 on `--p-surface`; it is `#5C6B64`
  at 5.17:1.
- Control borders clear the 3:1 non-text minimum on the surfaces they actually sit on.
  `--p-rule-strong` is `#6F7D76` — 3.64:1 on `--p-surface-2`. `--p-rule-2` is used only
  for dividers that carry no meaning alone.
- Hover, active and `:focus-visible` on every link, button, tab, card and input. Cards
  respond to `:focus-within` so keyboard users get the same affordance as mouse users.
- The calculator result panel is `role="status" aria-live="polite"`.
- Each animation frame is `role="img"` with a descriptive `aria-label` and
  `tabindex="-1"`, so a screen reader gets the description instead of walking into the
  frame. The hero sculpture is `role="img"` with an `aria-label` describing what the
  machine is doing, and its canvas is `pointer-events:none`, so it never traps a
  pointer or a tab stop.
- Scrollspy sets `aria-current`. Reduced motion disables reveals, the turntable and the
  count-up.

## The embedded animation bundles

Each is a complete HTML document carrying its own React, ReactDOM and Babel — hence
~1.1MB each, and why they are framed rather than inlined.

Each also renders its artwork on a dark `#0a0a0a` studio stage, under a drop shadow,
above a transport bar with a scrubber and timecodes. `js/site.js` injects a stylesheet
into each frame after load to strip that. The bundle replaces its own `documentElement`
while unpacking, which throws the stylesheet away, so injection repeats until it
survives four checks.

`assets/Engineering Process Loop.html` is the one bundle that was edited: its
`TWEAK_DEFAULTS` had `grid`, `feedback` and `motionEditor` set to `true`, drawing a dev
grid over the artwork. All three are now `false`.

## History

The previous homepage is tagged **`pre-ai-agency`**. To restore it:

```
git checkout pre-ai-agency -- index.html css js
```

Note that `/portfolio` referenced `images/` relative to itself, so its five PNGs were
404ing in production. They were moved to `portfolio/images/` to match the markup; they
were referenced by nothing at the root.

## Still open

- The audit has no duration or price — §16 of the build plan still lists the pilot
  offer as an open input.
- Benchmark figures are placeholders and labelled as such in the interface.
- The Arabic is a draft awaiting review.
- The founder photograph is a placeholder (§16).
- `Book a discovery call` points at `wa.me/201003169833`; the footer items (WhatsApp,
  GitHub, LinkedIn, Privacy, Terms) are still plain text, not links.
