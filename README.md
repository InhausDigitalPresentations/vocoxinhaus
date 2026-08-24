# The Hotel Reveal — Creative Film Proposal

An interactive cinematic treatment for the **voco × Thara × Sharjah** hero film.

voco is the hotel. Thara is the business district in Sharjah it sits inside.

> **Two ways to get there. One place to be.**

Static site. No build step, no framework, no backend. Open `index.html` or push the
folder to any static host.

---

## Run it

```bash
# any static server works
python3 -m http.server 8080
# → http://localhost:8080
```

Opening `index.html` directly from the filesystem also works.

## Publish to GitHub Pages

```bash
git init
git add .
git commit -m "The Hotel Reveal — creative film proposal"
git branch -M main
git remote add origin git@github.com:<you>/<repo>.git
git push -u origin main
```

Then **Settings → Pages → Source: Deploy from a branch → `main` / `root`**.
`.nojekyll` is included so the `assets/` folder is served untouched.

---

## Structure

```
.
├── index.html                 all copy and markup, one file, commented by section
├── css/main.css               design system + layout, numbered sections
├── js/main.js                 reveals, section tracking, horizontal storyboard, parallax
├── assets/
│   ├── storyboard/            the seven narrative beats  ← swap these
│   ├── stills/                derived crops used in the vertical sections
│   └── brand/                 INHAUS lockups (+ slot for the voco wordmark)
├── .nojekyll
└── README.md
```

---

## Replacing storyboard images

Drop a new file over the old one, **same filename**. Nothing else to change.

| File                                    | Beat              | Content                                          |
| --------------------------------------- | ----------------- | ------------------------------------------------ |
| `assets/storyboard/storyboard-01-two-worlds.jpg`      | 01 Two worlds      | Cycling / dinner, both phones, same notification |
| `assets/storyboard/storyboard-02-the-journey.jpg`     | 02 The journey     | Travel montage, match cuts, landing              |
| `assets/storyboard/storyboard-03-arrival.jpg`         | 03 Arrival         | voco welcome, check-in, four hours               |
| `assets/storyboard/storyboard-04-two-experiences.jpg` | 04 Two experiences | Sharjah discovery / voco hospitality             |
| `assets/storyboard/storyboard-05-convergence.jpg`     | 05 Convergence     | Both moving toward Thara, doors open             |
| `assets/storyboard/storyboard-06-the-meeting.jpg`     | 06 The meeting     | Presentation, tension, handshake                 |
| `assets/storyboard/storyboard-07-the-payoff.jpg`      | 07 The payoff      | Dinner, then the bed match cut                   |

**Recommended:** 16:9, 1920×1080 or larger, JPEG quality ~84, under ~400 KB each.
Frames are `object-fit: cover`, so a different ratio crops rather than distorts.

Stills used in the vertical sections live in `assets/stills/` and follow the same rule —
overwrite in place:

`cover.jpg` (16:9) · `story-band.jpg` (wide) · `character-creative-director.jpg` (4:5) ·
`character-accounts-director.jpg` (4:5) · `idea-convergence.jpg` (wide) ·
`language-grid.jpg` (16:9)

To add or remove a storyboard beat, duplicate an `<article class="panel rv">` block in
`index.html` and add or remove one `<i></i>` inside `.sb__segs`. Everything else —
track width, section height, progress, counters — is measured at runtime.

---

## Branding

**voco fronts the deck.** The fixed lockup at top-left reads `voco | SHARJAH`. The
wordmark there is currently **typeset, not the trademark**. To use the official artwork:

1. Save the voco wordmark as **white artwork on a transparent background** to
   `assets/brand/voco.png`.
2. In `index.html`, add the class `has-logo` to `.brand__logo`:
   `<span class="brand__logo has-logo" role="img" aria-label="voco">voco</span>`

It is applied as a CSS mask tinted with `currentColor`, so it inverts correctly on the
paper-toned sections without a second file.

**Thara stays the destination**, not a hotel. It appears as the payoff lockup in section 08
(mark + `THARA` + `ثرا`) and as the graphic system throughout.

**INHAUS** appears twice, at both ends of the deck:

| File | Used on | Size |
| ---- | ------- | ---- |
| `assets/brand/inhaus-mark.png` | Cover — house mark only | ~36px |
| `assets/brand/inhaus.png`      | Close — full lockup     | ~84px |

The mark alone is used on the cover because the "content & social agency" line turns to
mush below roughly 70px. Both are white artwork on transparency; a CSS filter darkens
them automatically if either is ever moved onto a paper-toned section.

The rights line — *All creative concepts remain the property of INHAUS Digital LLC FZ.* —
sits beside each, on the cover and again at the close. Edit both instances of `.rights`
in `index.html` to change the wording.

## Scroll behaviour

Sections 01–06 scroll vertically. Section 07 pins to the viewport and translates the
storyboard track sideways in step with real scroll position; once the last frame passes,
vertical scrolling resumes into section 08.

Scroll is **never hijacked**. The horizontal run is a `position: sticky` viewport driven
by native scroll offset, so the mouse wheel, Mac and PC trackpads, keyboard (space,
arrows, page keys, home/end) and touch all behave normally, and the browser's own scroll
position, back button and deep links keep working.

Graceful degradation:

- **No JavaScript** — the storyboard ships with the `sb--static` class and stays a clean
  vertical sequence. The script removes that class only once it can drive the horizontal run.
- **Viewport ≤ 900px** — the storyboard stacks vertically; sticky horizontal scroll on
  small touch devices is not worth the jank.
- **`prefers-reduced-motion`** — reveals, parallax, drifts and easing are all disabled;
  content renders immediately.

---

## Design system

Grounded in the two real brand worlds rather than an invented one.

| Token         | Value     | Source                                                   |
| ------------- | --------- | -------------------------------------------------------- |
| `--ink`       | `#0C0A09` | voco brand — Cod Gray                                     |
| `--whiskey`   | `#D49963` | voco brand — Whiskey (primary accent)                     |
| `--gold`      | `#CA8A04` | voco brand — Pirate Gold (held in reserve)                |
| `--petrol`    | `#052926` | Thara brand — sampled from the official mark              |
| `--paper`     | `#EFEBE4` | warm paper ground for the two light sections              |

The **graphic system is the Thara mark itself** — three modules stepping down into two,
then into one. It is a convergence symbol, which is also the idea of the film, so it is
reused as the section rail, the journey separators, the trait dividers and the animated
device in section 04. Rebuilt as inline SVG on a 5 × 3 module grid (`viewBox="0 0 15 15"`,
modules 3 × 5), so it stays crisp at any size and inherits `currentColor`.

Typography is a single grotesque used at extremes — very large and light for display,
very small and widely letterspaced for labels — echoing the official bilingual wordmark.
Inter Tight and Inter, with IBM Plex Sans Arabic for ثرا. All loaded from Google
Fonts with a system-sans fallback stack; swap the `<link>` in `index.html` for self-hosted
files if the client needs zero third-party requests.

Tone rhythm across the deck is deliberate: dark · dark · **paper** · dark · petrol ·
**paper** · dark · dark. The fixed chrome inverts automatically per section.

---

## Presenting live

- Full-screen the browser (`F11`, or `⌃⌘F` on macOS).
- `Space` / `Shift+Space` advance and reverse by a screen — including through the
  storyboard.
- `Home` returns to the cover, `End` jumps to the close.
- The right-edge rail shows position in the deck; the bottom rail shows position in the
  storyboard.
- Runs entirely offline once loaded, apart from the webfonts. Load it once on the
  presenting machine before you walk in.

Runtime is roughly 3–5 minutes read at a natural pace.

---

## Source

Content is grounded in the client Scope of Work — *Thara Hotel Reveal – voco Hotel* —
though the deck itself never says "Thara Hotel": voco is the hotel, Thara is the
business district. The line is
quoted in section 02, and the brief's own duration range (45 sec – 1 min 10) appears in
section 03.
