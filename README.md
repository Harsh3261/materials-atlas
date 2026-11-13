# Materials Atlas

A personal materials reference app for a quality engineer: chemical composition,
yield/tensile strength, elongation and hardness for engineering materials —
always tied to the **standard, product form and condition/heat treatment**,
because a strength without a condition is not a fact.

Live: https://harsh3261.github.io/materials-atlas/

## What it does

- **Browse & Search** — dropdown by standard, family filters, full-text search,
  and reverse search (minimum yield, element content). Every strength is shown
  with its condition and a trust badge (below), plus its named source.
- **Compare** — two grades side by side with differences highlighted, and an
  equivalents panel that shows *where* cross-standard windows differ
  (e.g. 4140 vs GB/T 3077 42CrMo manganese windows) instead of just saying
  "equivalent".
- **Chemistry Checker** — type or paste a mill-cert chemistry (or load a
  .txt/.csv) and get an element-by-element PASS/FAIL against the grade's
  standard range, with heat-analysis vs product-analysis rules applied
  (SAE J409 / ASTM A6 permissible variations). Materials whose standards set
  no chemistry limits (e.g. Dura-Bar cast irons, ASTM A536/A48) correctly
  return "not specified by standard" instead of a fake verdict.
- **CE calculator** — IIW carbon equivalent for weldability.
- **Explainers** — alloying-element effects, heat treatment, flame-cut edge
  effects, and a standards map with editions.
- **Qualify a Cert** — a 7-step mill-cert checklist with red flags folded in.

All processing is client-side: nothing entered or loaded into the app ever
leaves the device. Cert photos/PDFs are intentionally NOT OCR'd in-app
(a misread 0.08 vs 0.008 is the failure that matters) — they are analysed
through chat instead, with every extracted field shown back for confirmation.

## The badges (read this first)

- **SPEC MINIMUM** — the floor the standard guarantees. Below it = rejectable.
- **TYPICAL** — a published average (e.g. Alro mill-lab averages). Orientation
  only; never accept or reject against a typical. SAE bar grades (1018, 4140…)
  are chemistry-only standards (SAE J403/J404), so no spec strength exists —
  typicals are the honest best available.
- **MANUFACTURER** — the maker's own published data for that product
  (Dura-Bar). For A536 grades the name itself encodes the guaranteed minimums.

> Below a spec minimum is a rejection. Below a typical is just a Tuesday.

## Data provenance & verification

Data lives in two verified research files (kept outside this repo, in the
owner's Muse workspace: `research_notes/materials-app/`):

- `starter-data.csv` + `starter-data-round2.csv` — 66 grade-condition rows
  (31 spec-minimum / 30 typical-published / 5 manufacturer).
- `chemistry-ranges.csv` — 193 element ranges across 45 grade–standard
  combinations: 183 verified against two independent sources, 5 flagged
  single-source (E355/EN 10305-1), 5 not-specified (cast irons).

Rules used throughout: every value carries a source and a status; conflicts
between sources are logged (D1–D18 in the research files), never averaged;
anything that could not be verified is withheld, not filled in. Known traps
the data handles explicitly: ASTM A519's property table is headed "typical"
(not guaranteed); EN 10083-2/-3:2006 is withdrawn (Q&T steels now sit in
EN ISO 683-1/-2:2018, so open EN data is legacy-labelled); AR400 is not a
standard grade and is refused rather than listed.

Correction log (in-app values): **D11** — C36000 lead range is 2.5–3.7%
(ASTM B16 Table 1 + CDA), corrected from an initial 2.5–3.0 transcription.

Standard editions carried per row in the research data (examples of current
editions at build time: ASTM A519-24a, A513-25, A572-25, A240-25a, A514-22,
B16-24, B505-23, A36-19; GB/T 3077-2015; CSA G40.21-13 (R2023);
SAE J403 FEB2024 stabilized; EN 10088-1:2023). Where a value could only be
sourced from an older edition, the row says so.

## Files

- `index.html` — the whole app (single file, data embedded in readable tables).
- `manifest.json`, `sw.js`, `icon.svg` — PWA install/offline support.
  Service-worker cache name is versioned (`materials-atlas-v1`); bump it on
  every published change.

## Publish workflow (for whoever maintains this next)

1. Build/edit in Muse; verify against the research CSVs value-by-value.
2. Stage a byte-identical export in the publish folder.
3. Commit with a descriptive message; confirm the GitHub Pages build is green.
4. Verify on the live URL (anchors: 42CrMo 930/1080 MPa; C36000 Pb 2.5–3.7;
   checker test — 1018 with Mn 1.20 must return Mn FAIL).
5. Report repo, commits and live checks to the owner.
