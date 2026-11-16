# Note for Muse — external audit corrections (2026-11-15)

Harsh asked Claude to audit both live sites against independent sources. Four
data errors were found and corrected directly on GitHub. Your gates passed
because the errors are also in your research files, so the diff showed no change. Please carry these
corrections into the research files and re-pin `selftest/golden.json` before
your next build, or the self-test will flag the changed data blocks.

Cache names were bumped to `spc-tools-v20-fix1` and `materials-atlas-v63-fix1`
so they don't collide with your planned v20.1 (UNJ) numbering.

## SPC Tools

### 1. AQL Table II-A — 105 of 176 cells were wrong (all AQLs except 0.65)
- Every Table II-A column follows one pattern: Ac 0 at the start row, then ↑,
  then ↓, then Ac 1, 2, 3, 5, 7, 10, 14, 21. The 0.65 override (F 0, G ↑, H ↓)
  was this pattern, but it was only applied to one column.
- AQLs at 0.40 and below also had starting rows one letter too late, which made
  Ac one step too lenient on letters J–R.
- Fix: `AQL_START = {0.065:10, 0.10:9, 0.15:8, 0.25:7, 0.40:6, 0.65:5, 1.0:4,
  1.5:3, 2.5:2, 4.0:1, 6.5:0}` (index = Ac 0 row), `AQL_SPECIAL = {}`, and
  `aqlCell` applies k=0 → 0, k=1 → "U", k=2 → "D", then AQL_ACSEQ[k−2].
- Check examples: K / 0.40 → n 125, Ac 1 Re 2 (was Ac 2); L / 0.25 → n 200,
  Ac 1 (was 2); G / 1.0 → n 50, Ac 1 (was n 32, Ac 0); D / 1.0 → n 13, Ac 0
  (was n 32).
- Reference: AQLSchemes R package (github.com/cran/AQLSchemes, AAZ14Single.R,
  MIL-STD-105E / ANSI/ASQ Z1.4). After fix: 176/176 resolved plans match.

### 2. Table I, General Level I — wrong for lots over 3,200
- Correct: 3,201–10,000 J; 10,001–35,000 K; 35,001–150,000 L;
  150,001–500,000 M; 500,001+ N (was H, J, K, L, M).
- Levels II and III were already correct.

### 3. Hardness converter — HRB column didn't match ASTM E140 Table 2
- Before the fix, HRB 100 → HV 272 / HB 258 / HRC 26; E140 Table 2 gives HV 240.
  HRB 95 → HV 220; E140 gives 210.
- Fix: the HRB values on the existing HV rows were re-derived from E140 Table 2
  (HRB 60–100 ↔ HV 107–240): 110→62, 120→67.5, 130→72, 140→76.5, 150→80,
  160→83.3, 170→86.3, 180→89, 190→91, 200→93, 210→95, 220→96.7, 230→98.3,
  238→99.7. HRB set to null for HV 90/100 (below the HRB 60 end of Table 2) and
  for HV ≥ 248 (above HRB 100).
- Open items for you:
  - Add an HV 240 row so HRB 100 converts. Right now HRB tops out at 99.7.
  - In the HRB range, the HB column is about 0.95 × HV, while E140 Table 2 prints
    HBS = HV (steel ball). Decide which Brinell basis the app means and label it.
    HB was left unchanged.
  - The data comment says E140 provides the tensile column. E140 gives no MPa
    tensile values, so the UTS column needs its real source named.

## Materials Atlas

### 4. ASTM A193 B7 chemistry was too narrow (checker failed compliant certs)
- Correct A193 Table 1: C 0.37–0.49 (0.50 max for bar over 3½ in),
  Mn 0.65–1.10, P ≤0.035, S ≤0.040, Si 0.15–0.35, Cr 0.75–1.20, Mo 0.15–0.25.
  It had been C 0.38–0.48, Mn 0.75–1.00, Cr 0.80–1.10, which are 4140 ranges.
- Updated in CHEMROWS and the three B7 display `chem` strings.

## Flagged, not changed (please verify)
- GB/T 3077 42CrMo annealed hardness shows HB ≤229. Sources indicate ≤217
  (Total Materia 42CrMoA). Check against Table 3.
- The README says the checker applies SAE J409 / ASTM A6 product-analysis
  variations. The code only shows a note and compares against heat ranges.
  Either implement the variations or fix the README wording.
- 2024-T3 "typical" row (290/441 MPa) matches B209 minimums. Published typicals
  are about 345/483.
- 1020 HR HB 137 and CD elongation 24% match the Alro source but look implausible
  next to 1018 CD at 15%.
- UNJ: the 302 staged rows are still yours to ship (v20.1).

## Design tweak (2026-11-15, second commit)
- Form-field borders (input/select/textarea, unfocused) now use `--field:#6e7586`,
  ≥3:1 against bg/panel/panel2 (WCAG 1.4.11). The old `--line` #343947 was
  about 1.2–1.6:1. Added as one rule at the end of the last <style>; all other
  colours unchanged. Cache materials-atlas-v63-fix2.

## Feature (2026-11-15, third commit): ksi in reverse search
- New "strength units" select (MPa / ksi) at the start of the reverse search.
  In ksi mode the filters compare against each row's own published yk/tk values,
  falling back to MPa ÷ 6.894757 only where no ksi value exists, so rows such as
  75 ksi / 517 MPa aren't dropped by rounding. Labels show a live conversion
  (e.g. "100 ksi ≈ 689 MPa"). No data changed. Cache materials-atlas-v63-fix3.

## Round 3 (2026-11-15, ~13:00): remaining audit items
- 2024-T3 "typical" row: now the Aluminum Association typicals, 345/483 MPa
  (50/70 ksi), El 18%, HB 120 (500 kg, 10 mm). The old 290/441 were B209 sheet
  minimums mislabelled as typicals. The source now names AA typicals.
- GB/T 3077 42CrMo annealed hardness: HB ≤229 → ≤217 (Total Materia 42CrMoA
  and ML42CrMo both ≤217). Please confirm against GB/T 3077-2015 Table 3.
- 42CrMo4 (ISO 683-2): the checker no longer scores the Si 0.10 minimum. The
  standard's footnote allows lower Si with alternative deoxidation, so a low-Si
  cert isn't automatically nonconforming. The max stays 0.40; the display string is unchanged.
- README: the product-analysis wording now matches the app. Results are scored on
  heat ranges, with a warning for product analysis; J409/A6 variations are not
  computed in-app.
- Not changed, on purpose:
  - The 1020 HR HB 137 and CD 24% values. They match the cited Alro/MSO source exactly,
    and the HB agrees with the source's own HRB 76.
  - ISO 683-3 Si 0.15–0.40. Confirmed by Ovako and Salzgitter (EN ISO 683-3).
- Cache materials-atlas-v63-fix4.

## Round 4 (2026-11-15, ~13:30): cert reader and Identify
- Cert-paste reader (fillFromText) fixes:
  - "C: 0,41%" (decimal comma) was read as 0 for every element; it's now read as 0.41.
  - In a two-row table (symbols row, values row) the last symbol of the header grabbed the next row's first value: Mo = carbon's 0.41, and everything else blank. Element and value must now be on the same line, and two-row tables are mapped column by column, right-aligned so a left label column like "Heat A" is skipped.
  - ".41" leading-dot decimals and capitalised symbols ("MN", "CR", "SI") are now read.
  - The existing guards still pass: HRC/HB lines aren't read as C/B, "Grade B" isn't read as boron, the B505 "Cu + named" sum line is held, Ni+Co is handled, and "<x" values follow the max-only rule.
- Identify: the "add next element" hint now uses only real candidates (not weak
  matches) and picks the most even split. A 4140 chemistry used to suggest Mg
  (an aluminium weak match); it now suggests P.
- Checked and passing, no change:
  - README anchor: 1018 with Mn 1.20 → Mn FAIL.
  - Compare 4140 ↔ 42CrMo Mn-window note.
  - Alias cross-references (UNS / EN / JIS) and the A572 elongation table.
- Cache materials-atlas-v63-fix5.

## Round 5 (2026-11-15, ~13:45): Learn tab rebuilt (Harsh's request)
- Structure: a search box and topic chips, then six collapsible lessons:
  1. Quick rules (new: ten one-line rules, each linking to its lesson).
  2. Elements.
  3. Heat treatment (tempering table, flame-cut and E355 kept verbatim).
  4. Conditions glossary (the 16 terms, now cards instead of a 3-column table).
  5. Which standard gives a number (table kept).
  6. Reading a cert (the 7 check names plus a button to Check a Cert → Step 3, `#qualStep`).
- Search filters every rule, element card, glossary term, table row and checklist item, and opens the matching lessons.
- Content corrections:
  - DOM: was "an A519 product … typicals". It's ASTM A513 Type 5, which gives minimums, as-drawn or SR — this matches your data rows.
  - As-rolled 4140: HB 187–197 is *annealed* 4140. True as-rolled is harder, so the "can never be as-rolled" claim is removed. The floor check now reads "bar sold as annealed".
  - +SR: removed "stress relief is required for DOM tube unless the buyer waives it", which contradicts your A513 as-drawn rows.
  - HRR: the internal "2026-11-13 mislabel" reference is replaced with a general warning.
  - HRAP: finish designation attributed to ASTM A480.
  - ELEMENTS data (hash-pinned):
    - C: weldability is now judged by CE using the app's own bands, not "0.40% C".
    - Mn: 40Mn2 is 885 MPa min tensile, about 80% of 42CrMo's 1,080 — it was "near-4140-class".
- README "Explainers" bullet replaced with the Learn description. Cache materials-atlas-v63-learn.

## Round 6 (2026-11-15, ~13:30): 42CrMo hardness REVERTED to ≤229
- My round-3 change (≤229 → ≤217) was wrong. GB/T 3077-2015 Table 3 gives
  HBW ≤229 for 42CrMo (annealed or high-temperature-temper supply condition),
  per two reproductions of the 2015 table (Caishuku 42CrMo/A30422, H2ABC). ≤217 is
  the GB/T 3077-1999 value. Your original ≤229 was right. The text now reads
  "HB ≤229 (annealed or high-temper supply condition)". Cache materials-atlas-v63-learn2.

## Round 7 (2026-11-15, ~15:20): polish, Heat treatment lesson rebuilt, PC layout
No data value changed. The fenced 4140 tempering table is byte-identical, so its
golden sha256 still matches.
- Compare: new "Strength at a glance" bars (cmpBarsHTML, before RENDER › COMPARE).
  - One common MPa scale for yield and tensile of both rows.
  - Hatched = TYPICAL/MFR, solid = SPEC MIN.
  - A range string such as "942–1077" plots its lower bound and says "low end of range".
  - Null shows "not specified".
- Reverse search: the MPa/ksi choice is remembered in localStorage key
  'atlas.minUnit' (wrapped in try/catch).
- Check a cert on phones: after a run, the result table pushed the page about
  40 px wider than a 390 px screen, so the whole page scrolled sideways. Fixed with
  a ≤560 px media block (smaller gauge floor, gauge stacked under the verdict,
  spec cells on one line) and a ≤380 px block. No horizontal overflow at
  320–1920 px in any view.
- Check gauge tick: it was the same colour as the filled PASS/FAIL cell and read
  as a gap. It's now dark with a light outline.
- Wording check: EN 10305-1 gives ReH only for +SR (450) and +N (355) on E355; +C/+LC/+A carry Rm only. The Normalize card says "+N guarantees a lower yield than +SR", not "lowest".
- Learn › 3 Heat treatment rebuilt (Harsh found it odd: one dense paragraph, a
  wrapping table, then unrelated notes):
  - Lead line plus a link to the Conditions glossary.
  - Four schematic thermal-cycle SVGs (anneal, normalize, Q+T, stress relieve)
    against A3/A1 lines, labelled not to scale.
  - Nine process cards (.lgi, so Learn search indexes them), each with a
    condition-code chip, an effect line and "On a cert" guidance. New cards:
    nitride, induction harden, harden (quench) on its own.
  - The fenced tempering table is unchanged. #htBars draws bars FROM that table
    at runtime, so the numbers live in one place.
  - "Heat-treatment traps on certs": the E355 and flame-cut cards (same content
    as before).
- PC layout (≥1024 px):
  - Top sticky tab bar instead of the phone bottom bar.
  - 1200 px max width.
  - Browse results in two columns (an open card spans both).
  - Reverse-search inputs fill their columns.
  - Static Check/Identify run buttons. They used to float over "Read pasted chemistry".
  - Hover states.
  - Keyboard: "/" focuses search; Ctrl/⌘+Enter runs Check/Identify.
- Cache materials-atlas-v63-polish.

## Round 8 (2026-11-15, ~15:50): Material science for QA, trends, search bridge
Harsh asked for a material-science Learn section: "keep it precise, not overwhelming".
How it was checked:
- A research pass collected sources (my tools/ms_facts.md).
- An independent audit pass checked every claim; all 10 findings are applied.

**New lessons 7–13**, after "Reading a cert". They use .lgi cards, so Learn search indexes them. New topic chips sit under "Material science:".
- **7 Inside steel:** a schematic Fe–C diagram plus phase cards.
- **8 Mechanical testing:** a schematic stress–strain curve; E8/E8M 4D vs 5D; E10/E18/E92/E384/E140; E23.
- **9 Hardenability:**
  - Schematic Jominy curves.
  - A REAL fenced data table "mass-effect" (EMJ, ½/1/2/4 in; centre vs half-radius noted).
  - A255, A304 / J1268.
- **10 Welding:**
  - IIW CE with TWI bands (0.40/0.50). The checker's coarser 0.40/0.60 screen is left as is and labelled coarser.
  - Hobart 41xx preheat by thickness.
  - E7018 H4.
- **11 Corrosion & coatings:**
  - Hard chrome: Ovako rod data, B650/AMS 2460/ISO 6158.
  - Hydrogen bake: F1941 39 HRC; ISO 4042 390 HV.
  - Zinc: B633 SC thicknesses.
  - Nitriding: AMS 2759/10 gas, 2759/8 plasma.
- **12 How parts fail:** a schematic S–N curve; the endurance limit is stated for polished specimens.
- **13 NDT:**
  - MT is now E3024 (general industry) / E1444 (aerospace) / E709.
  - The ET standards are marked tubing-only.
  - On phones the table becomes cards.

**Heat treatment (lesson 3):**
- New fenced data "4130 / 4340 tempering trend" (EMJ 1-in round).
- #htBars now groups all three grades from the tables.

**DATA LABEL CORRECTIONS. Please re-pin the golden hash for the 4140 tempering fence; I changed its header only.**
- The 4140 tempering values (311/285/269) are EMJ's **4142** 1-in data. The research found no such table at Alro, and EMJ publishes no 4140 series.
- The fence header now reads "4140-type (EMJ 4142)". The source line under the bars says this.
- The values are unchanged. The DATA rows that credit Alro for 4140 Q&T were NOT changed. Please re-check their source credit.

**Other corrections:**
- E355 +SR row note: "understate by ≈25 %" → "about 21 % below" (355 vs 450).
- Heat card "Anneal": annealed 4140 is now "about HB 187–212" (distributors list CF annealed 197–212), and annealed is "a common supply state", not "the normal" one.

**Browse → Learn bridge:**
- #learnHint under the result count lists the lessons that mention the search term, with an "Open in Learn" button that pre-fills the Learn search.

**Checker:**
- Rows with no chemistry of their own (A311 Class A/B) now offer a jump to the same base grade's chemistry row (chkAltHTML), where one exists (1018, 1045).
- The other A311 grades (1035, 1050, 1541, 11xx) have no J403 chemistry rows yet. They are candidates for a verified data change.

**Tests:**
- No horizontal overflow at 320–1920 px.
- The full click-through test passes with 0 JS errors.

Cache materials-atlas-v64-learn3.

## Round 9 (2026-11-15, ~16:05): cert reader reads PDFs (Harsh's Acuren C95520 report)
- The file box now accepts PDF. pdf.js 3.11.174 is vendored in vendor/ (Apache-2.0, see vendor/PDFJS-LICENSE). It loads only when a PDF is chosen and is cached by the SW fetch handler after first use.
- pdfToText rebuilds lines from item positions, and joins touching pieces by gap. TeX-made reports split "78.6" into "78" "." "6"; a blind join read Al 10.8 as 10 and gave a FALSE FAIL. Caught in testing and fixed before publishing.
- A PDF with no text (a scanned image) gets a plain message to type the values.
- certNamesToSymbols(), run first in fillFromText:
  - Element names map to symbols (Manganese→Mn, Aluminum/Aluminium→Al, Sulfur/Sulphur→S, …).
  - "X plus Y" maps to "X + Y", so "Nickel plus Cobalt" and "Copper plus Sum of Named Elements" reach the existing Ni+Co and sum rules.
  - "wt %" maps to "%".
- Parser guard: a symbol glued to a whole number of 3+ digits is a designation, not a value ("C95520" was read as C = 95520). Values above 100 % are ignored. All t15–t18 cases still pass.
- certGradeHits():
  - If no grade is selected, the grade named on the cert is selected automatically, with a "confirm against PO" note.
  - If a different grade is selected, the user gets a mismatch warning.
- The extracted text is placed in the paste box so the user can see what was read.
- #chkRun / #idRun are no longer sticky on phones. They floated over "Read pasted chemistry" (Harsh's screenshot).
- Verified on the real report (Acuren 984429-26, C95520):
  - 11 elements filled exactly.
  - Cr and Co "< 0.01" counted as 0 against max-only limits.
  - Ni+Co 5.1 applied to Ni.
  - Sum rule 99.98 ≥ 99.5.
  - Verdict: all within B505 C95520.
- Cache materials-atlas-v65-pdfcert.

## Round 10 (2026-11-15, ~16:15): cert reader hardened with 10 test certs
Test set: Harsh's 2 real Acuren reports, plus 8 generated formats in my tools/certs:
- a US mill table with ".41" decimals
- 316L "C: 0.021" lines
- an EU 42CrMo4 with decimal commas and uppercase symbols
- B7 with spelled-out names
- a 6061 table with "Others each/total"
- a ×100 1045
- a CSV
- a TXT
All 10 now read correctly.

Fixes:
- **PDF column tables are paired by POSITION.** A row of ≥3 element symbols is followed by a row of numbers, and each value goes to the symbol with the nearest x-centre, within half the symbol-column pitch. Before this, a two-word header ("Others each") shifted values onto the wrong elements, giving false results.
- **The generic two-row table path is stricter.**
  - Cells are split on column gaps.
  - Header and value counts may differ by at most one, and the dropped cell must be a label, not an element or a value.
  - Otherwise the pair is skipped: a blank field is better than a wrong one.
- **Grade detection:**
  - Only lines naming the material (Specimen / Material / Grade / AISI / ASTM / UNS / steel / alloy …) can select a grade.
  - Bare numbers elsewhere (years "2024", fax "…-6082", lab numbers) are ignored.
  - Short grades such as "B7" are accepted after "Grade" or "Class".
- **×100 / ×1000 notation:** applied when the cert states it. If 2 or more values are about 100× their limits, the reader warns and does NOT change them.
- **Separators:** CSV "C,0.18" and "C;0.18" are read. A glued long whole number is still treated as a designation.
- **Unchecked elements are listed.** Elements on the cert that the grade row has no field for are named in a note ("NOT checked: Fe 0.31, Mn 0.06, Ti 0.03"), never dropped silently.

DATA GAP: the 6061 / ASTM B209 checker row carries only Si, Cu, Mg, Cr and Zn. Fe ≤0.7, Mn ≤0.15, Ti ≤0.15 and the "others" limits are missing. These are candidates for a verified data change.

REAL FINDING on Harsh's cert 935784-24 (3.50 in "AISI 4140" IHCS):
- Mn 0.67 is below the 4140 range of 0.75–1.00.
- Even with the usual product-analysis allowance (0.03 under), it fails.
- The chemistry fits 42CrMo4 / 42CrMo windows.

Cache materials-atlas-v66-certs.

## Round 11 (2026-11-15, ~16:20): no grade known, so test against all grades (Harsh's idea)
- certToIdentify(txt, why) applies when a cert file or pasted text does not name exactly one grade the atlas holds and no grade is selected.
  - It switches to Identify and clears the Identify grid.
  - It fills the grid with fillFromText(txt, {fields, prefix:"id-"}) and runs identify().
  - A note at the top explains why, and says to tap "Verify this grade" on the grade named on the PO. That runs the full check, with the values carried across by the existing R3 hand-off.
- fillFromText gained an optional second argument for the Identify grid. In that mode, "<x" values are not used to identify, and a note says so. Verify behaviour is unchanged.
- "Read pasted chemistry" with no grade selected:
  - If the text names exactly one grade, it auto-selects it.
  - Otherwise it runs the same Identify fallback.
- Tested:
  - The 1018 CSV with no grade identifies 1018.
  - An unnamed bronze identifies C95800, and Verify then passes all 5 entered elements.
  - Certs that name their grade still go straight to Verify.
  - All earlier certs and the t15–t19 tests still pass.
- Cache materials-atlas-v67-autoid.

## Round 12 (2026-11-15, ~16:35): OFFLINE FIX
- **The atlas never worked offline.** sw.js existed but index.html never registered it, and there was no manifest link.
- It now registers sw.js on load and links manifest.json.
- The pdf.js reader in vendor/ is pre-cached in ASSETS, so PDF certs can be read offline.
- Tested: with the network cut after the first visit, the app reloads, reads the Acuren C95520 PDF, and gives the correct verdict.
- Cache materials-atlas-v68-offline2.

## Round 13 (2026-11-15, ~17:00): "Similar grades →" button + search relevance
- **"Similar grades →" button.** Each Browse card has one when the grade has at least 2 ranged elements (250 of 298 rows). findSimilar():
  - Sends the middle of each RANGED limit to Identify. It uses the checker's verified chemistry when present, else the row's own chemistry.
  - Runs identify() and lands on the results.
- **Self-test:** every one of the 188 rows that are in the checker dataset finds ITSELF among its own candidates. The 14 A311 rows have no checker chemistry, so they show the matching base-chemistry grades.
- **TDZ trap.** render() runs before ID_ELS is defined, so similarVals uses a static SIM_ELS regex. Referencing ID_ELS there broke page load; the test caught it before publishing.
- **Search relevance.** While searching, results are ranked:
  1. exact grade
  2. grade starts with the term
  3. OFFICIAL alias token (1.7225 → 42CrMo4)
  4. other alias tokens
  5. text mention
  6. typo match

  The chosen sort applies within each rank (stable sort). The family with the best match is listed first. Before this: "C95520" showed C95500 first, and "42CrMo4" showed 25CrMo4 and 34CrMo4 first.
- certToIdentify and findSimilar now scroll to #idOut (the results), not to the input grid.
- Cache materials-atlas-v69-similar.

## Round 14 (2026-11-15, ~16:50): Verify result → "Find grades matching these values →"
- Harsh asked for this. A new #chkMatchAll button next to Copy check result / Copy check summary. It copies the numeric in-* values into the Identify grid, runs identify(), adds a note saying where the values came from, and lands on #idOut.
- Tested on Harsh's cert 935784-24 ("4140", Mn 0.67): candidates are 42CrMo4, 41Cr4, B7, 2H, 42CrMo, 40Cr and 1040. 4140 is correctly not among them.
- Cache materials-atlas-v70-matchall.

## Round 15 (2026-11-15, ~17:05): cert straight into Identify + code-token guard
- Identify mode gained #idFile (PDF/txt/csv) and #idPaste with #idParse. idFromCertText() runs certToIdentify(). If the cert names grades the atlas holds, it adds "Verify against <grade> →" buttons (data-verify = g|s, handled by the existing R3 hand-off).
- **BUG FOUND (Identify reads every element).** Lab postal codes were read as chemistry: "N1R 7W4" gave N=1 and W=4; "N5C 3J7" was also at risk. In all three parser regexes (the main pair regex, the "<" regex and the extras list):
  - a symbol right after a digit is not a match;
  - a value followed directly by a letter or digit is not a match.
  The "wt%" → "%" replacement no longer needs a word boundary ("0.6wt%").
- **BUG FOUND:** the Ni+Co rule read chkEnt.els with no grade selected (Identify path). It now uses F.Ni in Identify mode.
- **Retested:**
  - Both Acuren certs and all 8 generated certs, in Verify and in Identify.
  - Parser tests t15–t18 unchanged.
  - Full click-through: 0 JS errors.
- Cache materials-atlas-v71-idcert.

## Round 16 (2026-11-15, ~17:55): scrambled PDF text layers (Spectrum Machine C86300 cert)
- **Cause:** the cert was printed to PDF (PScript5 → Distiller). Calibri is embedded as a CID font with Identity-H encoding, no ToUnicode and no cmap, so the text layer holds GLYPH NUMBERS. "62.6000" extracts as "ϲϮ͘ϲϬϬϬ". pdf.js does keep the raw glyph numbers, including the control-range ones (A=4, C=18, E=28 …).
- **Fix, in pdfToText:**
  - A font is treated as glyph-coded if any of its items has codes ≥ 256 or control codes. Only those fonts are decoded; the cert's Arial date stamp stays ASCII.
  - Decoding uses CALIBRI_GID: digits 0–9 = 1004–1013, "." = 856, plus letters and punctuation, each confirmed against this cert's rendered text.
  - Unmapped glyphs become "?" and can never be read as a number.
  - A visible notice tells the user the text was decoded and to check the values.
- Symbols with footnote asterisks ("Cu*", "Ni**") are now read by all three regexes.
- **Result:** Cu 62.6, Sn 0.0172, Pb 0.0492, Zn 25.87, Fe 2.32, Ni 0.0326, Al 5.44, Mn 3.51. All match the printed cert.
- **DATA GAP:** C86300 (ASTM B505) is not in the atlas, so Identify finds no candidate. The cert prints Cu 60–66, Zn 22–28, Al 5–7.5, Mn 2.5–5, Fe 2–4, Sn/Pb ≤ 0.2, Ni ≤ 1.0. It needs a verified data change against B505 itself before it is added.
- Cache materials-atlas-v72-gid.

## Round 17 (2026-11-15, ~20:05): DATA CHANGE, 3 B505 bronzes added + grouped selectors
**Added** in all six tables (DATA, EDITIONS, ALIASES OFFICIAL, CHEMROWS, CHEMSTD and SUMMIN 99.0):
- **C86300** (SAE 430B), 110/62/14:
  - Concast B505-23 sheet, NBM sheet, copper.org UNS table and Total Materia agree.
  - National Bronze's C86300 page was REJECTED: it shows C83600 chemistry and wrong units.
- **C86200** (SAE 430A), 90/45/18: Concast B505-23, ICAST B505 and copper.org agree.
- **C93700** (80-10-10), 35/20/6: Concast B505-23 and ICAST B505 agree on every element, including P ≤1.5 and Sb ≤0.50.
  - Concast's LINE CARD prints CDA values (P 0.10, Sb 0.70), the same CDA-vs-B505 trap as TB-D1 for C83600. Do not "correct" to the line card.

**SUMMIN 99.0** for all three. Sources: a copy of B505's "Copper plus named elements" table (scribd, -11 era) and copper.org footnote (17); for C86300 also NBM.

**Counts:** DATAREV is now R8, 301 rows, 1023 chemistry limits (996 + 27). Please re-pin the golden hashes for the DATA, CHEMROWS, ALIASES, EDITIONS, CHEMSTD and SUMMIN fences.

**NOT added** (only one B505 source found this session): C92300, C93400, C93800, C84400.

**Spectrum C86300 cert:** all 8 elements pass, and the sum rule is 99.84 ≥ 99.0.

**Grade and compare selectors** are now grouped in <optgroup> by material family, with a count in each label. Option text and values are unchanged.

Cache materials-atlas-v73-bronze.

## Round 18 (2026-11-16, ~01:30 UTC): DATA CHANGE, 4 more B505 bronzes
**Added** in DATA, EDITIONS, ALIASES (OFFICIAL), CHEMROWS and CHEMSTD: **C84400** (30/15/16), **C92300** (40/19/16, SAE 621), **C93400** (34/20/8), **C93800** (25/16/5, SAE 67). Each has 11 chemistry limits.
- **Source 1:** the ASTM B505/B505M-23 standard itself (iTeh preview, Table 9 mechanicals and Table 10 chemistry).
  - The preview's trailing chemistry columns were garbled, so I read each row in column order (Cu, Sn, Pb, Zn, Fe, Ni, Al, Mn, Sb, S, P, Si).
  - Every value then matched source 2 element by element.
- **Source 2:** the Wieland Concast B505-23 sheets for each alloy. All chemistry and all mechanical minimums agree.
- **SUMMIN:** loaded only for **C93800** at 99.0, from Concast and Finkelstein Metals.
  - NOT loaded for C92300 (Concast 99.3, only one source), C93400 (Concast 99.0, only one source) or C84400 (Finkelstein 99.3, and Concast prints no floor).
  - The preview omits Table 11. Please add these floors once a second source turns up.
- **Hardness** is "—" for all four. B505 sets no minimum, and the Concast "typical BHN" figures have only one source.
- **Pb in C92300** has a minimum (0.3) as well as a maximum.
- **B505 Cu + Ni footnote:** C84400, C92300 and C93400 carry it, and their notes say so (same as C86300).

**Counts:** DATAREV is now R9, 305 rows, 1067 chemistry limits (1023 + 44). Please re-pin the golden hashes for the DATA, CHEMROWS, ALIASES, EDITIONS, CHEMSTD and SUMMIN fences.

**Tests:**
- smoke, t15–t19 and fulltest: 0 JS errors.
- Cert batch: unchanged, and the Spectrum C86300 cert still passes all 8 elements.
- Synthetic in-spec certs for all four new grades read and pass.

Cache materials-atlas-v74-bronze2.

## Round 19 (2026-11-16): DATA CHANGE, wave 1 (11 new grades + 27 chemistry-only grades made selectable)
**New grades** (in DATA, EDITIONS and CHEMROWS; CHEMSTD = the standard name; ALIASES only where a UNS or EN number was two-source confirmed):
- **S355J2** (EN 10025-2:2019, ≤16 mm): ReH 355, Rm 470–630, A 22 %, Charpy-V 27 J at −20 °C.
  - **P/S NOT loaded:** mills quote 0.025 or 0.030.
  - CEV is in the note only.
- **2205 / S32205** (A479-23, not A276): 65/95 ksi, 25 %, HBW ≤290.
- **15-5 PH H1025** (A564-19a): 145/155 ksi, 12 %, HBW ≥331 / HRC ≥35, RA 45 %.
- **A105:** 36/70 ksi, HBW ≤187.
  - CHKRULES (new) score three rules: Mn C-dependent max (1.05 + 0.06 per 0.01 C below 0.35, capped at 1.35), Cu+Ni+Cr+Mo+V ≤1.00 and Cr+Mo ≤0.32.
  - That is why the CHEMROWS Mn row has a min only.
  - Limits come from the A105-05 text, and current-edition secondary sources agree. A newer-edition hardness minimum (137 HB) is NOT loaded because only one source gives it.
- **Nitralloy 135M** (AMS 6470): chemistry only. Mechanicals are null because sources disagree.
- **SAE J524:** yield null, because the sources conflict.
- **SAE J525:** 25/45 ksi, 35 %, HRB ≤65. The second mechanical source is weak but agrees exactly.
- **S45C and S35C** (JIS G4051): chemistry only, from 2009-edition mill tables. The current edition is 2023. Ni+Cr ≤0.35 is not scored because its scope is disputed.
- **SS400** (JIS G3101): P/S plus 245 / 400–510 MPa at ≤16 mm.
- **Q235B** (GB/T 700-2006, ≤16 mm).

**Promoted:** 27 existing SAE J403/J404 CHEMROWS keys had no DATA row, so they could not be picked in Check, Browse or Compare: 1010 1015 1022 1025 1030 1035 1040 1050 1117 1144 1215 4142 4150 4320 4620 5120 5130 5140 5150 5160 6150 8617 8622 8640 8720 8822 9260.
- They now have chemistry-only DATA rows (mechanicals null, note says so).
- Their chemistry is unchanged.

**Held back** (disagreeing sources or only one): SCM440, SCM435 (Mn 0.60–0.90 vs 0.60–0.85), GB 45, Q355B.

**Scope note from Harsh:** North America first. Further worldwide (JIS/GB/EN) research only where needed, and always verified.

**Counts:** DATAREV is now R10, 343 rows, 1140 chemistry limits. Please re-pin all golden hashes, including CHKRULES.

**Tests:** smoke, t15–t19 and fulltest pass with 0 JS errors. The cert batch is unchanged. Synthetic pass/fail certs for all new grades behave as expected (A105 fail case trips all three rules).

Cache materials-atlas-v75-wave1.

## Round 20 (2026-11-16): full audit of data, sources and functions
**Audit tooling** (in /home/claude/tools, not in the repo): audit.js checks every DATA row against CHEMROWS/EDITIONS/CHEMSTD/SUMMIN/CHKRULES; e2e.js runs 61 function checks on phone (390 px) and desktop (1440 px) plus an offline reload. Result: 61/61 pass, 0 JS errors.

**Fixes:**
- **A572 Grade 65 (checker accuracy):** both thickness rows share one CHEMROWS key, which carries C ≤0.26 with Mn ≤1.65. That pairing is not allowed by either row. New CHKRULES entry passes only (C ≤0.26 and Mn ≤1.35) or (C ≤0.23 and Mn ≤1.65). Plate ≤½ in with Mn >1.35 needs C ≤0.21; the rule text says to hand check that case.
- **Display chemistry now lists every element the checker scores:** 17-4 PH (Si, P, S), C95520 (Pb, Sn, Zn, Si, Cr, Co), 303 and 416 (Mo), A519 4140 (P, S, Si). Values copied from CHEMROWS; no limit changed.
- **42CrMo4 Si:** display said 0.10–0.40, CHEMROWS says ≤0.40. Sources disagree (Swiss Steel and Metinvest print 0.10 min citing EN ISO 683-2:2018; Kipp, steeldata and others print max only). Display now reads "Si ≤0.40 (some mill sheets print 0.10 min)". CHEMROWS unchanged. **Please settle this against the standard text.**
- **Seven ISO 898-1 rows** had eq:"" and now show "—".
- **Fonts are self-hosted** (vendor/fonts.css + vendor/fonts/*.woff2, SIL OFL, from @fontsource). The Google Fonts link is removed, so there is no third-party request and the offline app looks identical. Latin files are pre-cached by sw.js.
- **.nojekyll** added so Pages serves files as-is.

**Known, unchanged (flag only):**
- A36 checker uses C ≤0.25 for all thicknesses (conservative for plate over 1½ in).
- A311, A434 rows have no CHEMROWS; the checker says so.
- ALIASES for 20Mn2, 40Mn2 and 44W (300W) are empty arrays.
- Single-source rows remain flagged in their src text (A311 Table 2 band, A434 band, E355, several EN 10084 +A caps).

**Counts unchanged:** R10, 343 rows, 1140 limits. Please re-pin DATA and CHKRULES hashes.

Cache materials-atlas-v76-audit.

## Round 21 (2026-11-16): design polish (layout only, no data or behaviour change)
- **Find-by-strength row:** the five filter fields are now full-width grid cells (5 across on desktop, 3 on tablet, 2 on phone). Before, the inputs were squeezed and their text was cut off.
- **Family chips** now use the site font (they were falling back to the browser's default button font).
- **Chemistry-only rows** (SAE J403/J404 promotions, S45C, S35C, Nitralloy 135M): the card summary shows the chemistry limits line and a CHEMISTRY ONLY badge, in place of four empty strength fields and a SPEC MIN badge.
- **Footer** row count corrected from 301 to 343.
- **Phone:** the One Rule box is slightly smaller.
- Tests: e2e 61/61, regression suite 0 errors. Cache materials-atlas-v77-polish.

## Round 22 (2026-11-16): second verification pass + footer credit
**Footer:** "with Satureday" removed from the Atlas and SPC Tools footers and from the page comments, at Harsh's request.

**Deep consistency checks over all 343 rows** (tools/deep.py):
- YS ≤ TS on every row.
- Hardness agrees with tensile (TS ≈ 3.45×HB, all steel typicals within 0.80–1.02).
- Elongation is plausible on every row.
- The SAE number matches the carbon range.
- UNS G-numbers match SAE grades.
- Same SAE grade has identical chemistry across J403/J404/A519/A311.
- No sum of minimums exceeds 100 %, and no element appears twice with different limits.
- Strength never rises with section size, except EN 755-2 6082 T6 (5–25 mm wall is higher than ≤5 mm). That is what the standard prints, so it is left as is.

**Fixed:** A514 Grades E, P and Q each had two rows with the same condition text ("Quenched and tempered") and different values. The condition now names the thickness band: t ≤2½ in is 100/110–130 ksi with 18 %; over 2½–6 in is 90/100–130 ksi with 16 %. Values unchanged.

**Independent re-check of a sample (about 40 rows across 15 standards)** against fresh sources and the standard texts. All agree:
- B7 (three size bands), B8M Class 1 and Class 2 (four bands), 2H, A574 (HRC 39–44 / 37–44; A574-17 and later match the row, while A574-00 printed 45 as the upper limit).
- ISO 898-1 8.8 (both bands), 10.9 and 12.9.
- 304, 304L, 316L and 410 (A240 and A276).
- 17-4 H900 and H1150.
- 42CrMo4 +QT (all five bands).
- 40Cr; A36; A572 Gr 50; 350W; A513 DOM 1026 (as drawn and SR).
- E355 +SR and +N.
- 6061 (B209 and B221); 7075-T6 0.040–0.125 (78/68/9, confirmed against the B209 table reproduction).
- C95400 (as cast and HT), C90500, A356.0-T6.
- 1020 HR/CD Alro typicals: 55/30/25/HB 137 and 64/54/24/HB 126 match the published dataset. HB 137 is high for 55 ksi, but it is what the source prints, and the row is labeled TYPICAL.

Tests: e2e 61/61. Cache materials-atlas-v79-verify.

## Round 23 (2026-11-16): Compare search + cert reader fixes from a real 80-55-06 cert
**Compare tab:** each slot (A, B) now has a search box above its list. It uses the Browse matcher (grade, UNS, EN number, JIS, standard, alias, typo-tolerant) and the Browse ranking (exact grade first, then starts-with, then OFFICIAL alias, then other alias, text and fuzzy). The best match is auto-selected, and a count line says how many matched or what to try when nothing does. "+ Compare" from Browse clears an active compare search first, so the chosen row always exists in the list.

**Cert reader** (prompted by Sino Industries cert 24050501, 80-55-06, JD300117):
1. **Value row up to 5 rows below the header.** Spreadsheet-style certs put a "%" units row and printed "min./max." rows between the C/Si/Mn header and the values. Rows starting "min"/"max" are never paired, and pairing stops at the next symbol header.
2. **Strength headers** (YIELD, TENSILE, ELONGATION, REDUCTION, HARDNESS, IMPACT) are paired by x-position the same way.
3. **"Scrambled PDF" false alarm fixed.** Only codes 256–0x1FFF or control codes mark a glyph-coded font, so fullwidth "（PC）" no longer trips it. Do not add an "ASCII present" test: it broke the Spectrum C86300 Calibri cert in testing, and I reverted it.
4. **New certMechHTML:** strength on the cert is compared with the selected row's minimums.
   - SPEC rows only; TYP/MFR rows are shown for reference.
   - Units come from the cert ((MPa), N/mm², ksi, psi). With no unit printed, nothing is scored.
   - Hardness is reported, not scored.
   - A ±0.5 rounding allowance covers certs that print 380 for a 379 MPa minimum.
   - The block appears on file load, after a chemistry check, and for chemistry-not-specified grades.
5. **ASTM A536 grades** are scored from the grade name (Table 1: tensile-yield-elongation in ksi-ksi-%), because the A536 rows' other data is Dura-Bar MFR. The basis line says so.
6. **For grades with no chemistry spec (A536 etc.),** the message now says the standard sets no chemistry and lists what the cert reported, for the record.

**Result on the real cert:** C 3.68 / Si 2.61 / Mn 0.32 / P 0.026 / S 0.011 read correctly. Yield 392 ≥ 379, tensile 586 ≥ 552 and elongation 11 ≥ 6 all PASS. HB 185 is reported (Dura-Bar typical range 187–255; A536 sets none).

**Tests:** e2e 61/61, the cert batch is unchanged, and the Spectrum C86300 cert still reads and passes all 8 elements. Cache materials-atlas-v81-mechcheck.

## Round 24 (2026-11-16): update-on-first-reload
- Harsh's phone kept showing the old Compare tab after round 23 because the cache-first service worker served the old index.html.
- sw.js: the page (navigation, index.html, manifest) is now NETWORK-FIRST with cache:'no-store'. Online, an update shows on the first reload. The cached copy is used only offline. pdf.js, fonts and icons stay cache-first.
- Tested: a changed index.html shows after one reload; offline reload still loads 343 rows. e2e 61/61.
- Cache materials-atlas-v82-netfirst.

## Round 25 (2026-11-16): final release check + smoothness
**Release check, all green:**
- e2e 61/61 (phone and desktop, every tab, offline). smoke, t15–t19 and fulltest: 0 errors.
- Cert batch: 8/8 verdicts unchanged, plus the Spectrum C86300 cert. The 80-55-06 Sino cert reads and passes its strength check.
- deep.py: only the known, explained items. audit.js: no min>max, no unit mismatch, no YS>TS.
- SPC: AQL 176/176, converters (t6), tools (t13), thread tables (t14), sheet import (xltest), GRR reference. Offline works for both sites.

**Smoothness:** on a 4× throttled phone, the first keystroke in Browse took about 320 ms. The cause was 343 cards × full detail = about 20,000 DOM nodes and 700 KB of HTML.
- **Fix:** card detail (chemistry table, notes, buttons) is generated as a string but only inserted when the card first opens (lazyDetail/fillDetail, DETAIL map). It fills on summary click before open, and on the toggle event for keyboard/scripted opens.
- **Card buttons** (Copy, + Compare, Similar) are now one delegated listener on #results.
- **Result:** about 6,800 nodes; first keystroke about 75–180 ms, clearing the search about 65 ms.
- **Tried and dropped:** content-visibility:auto (hid card text from innerText and is risky on older Safari).
- No data or behaviour change. Cache materials-atlas-v83-smooth.

## Round 26 (2026-11-16): photographed certs (on-device OCR)
**What:** Check and Identify now accept a photo of a cert (input accept adds image/*; on iPhone the picker offers Take Photo or Photo Library).

**Engine:** tesseract.js 7.0.0 + tesseract.js-core 7.0.0 (LSTM builds: SIMD and non-SIMD; chosen by WebAssembly.validate) + English model 4.0.0_best_int. All Apache-2.0, vendored in vendor/ocr/ with licences and a README.
- About 7 MB downloads on first use only. NOT pre-cached in sw.js; the runtime cache keeps it, and an offline second use was tested and works.

**Pipeline** (photoToText → rowsToLines → normal fill):
1. EXIF-correct draw (via <img>), capped at 3600 px.
2. Grayscale, long side scaled to about 3000 px.
3. Deskew by projection profile (±8°, 0.2° steps).
4. Grid-line erase, ONLY when ≥3 horizontal AND ≥3 vertical long ink runs are present (boxed Excel certs). On plain certs it cost readings in testing, so it is gated.
5. Tesseract PSM 6. Words with boxes → the same rowsToLines column pairing as PDFs. rowsToLines was refactored out of pdfToText; PDF behaviour is unchanged and the cert batch is identical.
6. fixDots: Tesseract's word box keeps a "." or "," it fails to output (".41" → "41", "0,42" → "042"). Glyphs are split by blank columns; a small glyph on the baseline is a point. It is reinserted only if the other glyphs match the digits one-for-one. Result: 150/150 decimal tokens on 18 test photos, 0 false points.
7. canonEls: "SI", "MN", "p" → Si, Mn, P when a number follows.

**Binarisation (Sauvola) was tested and REJECTED:** it dropped decimal points on blurred photos.

**Safety: nothing is scored automatically from a photo.**
- A banner says "Read from a photo… check every value against the cert", with a collapsible view of the photo itself.
- A field is marked (amber outline plus tooltip, cleared when edited) when:
  - the word confidence is below 88, or
  - its decimal point was restored by fixDots, or
  - it has no decimal point at all ("may be .36 or 3.6"), or
  - it is outside the grade's limit ("check the reading before rejecting").

**Measured on 24 synthetic phone photos** (8 test certs × good/ok/messy, made by tools in /home/claude/ocr: 300-dpi render, tilt 1–5.5°, keystone, lighting gradient, noise, blur, JPEG 60–88):
- 147 chemistry values: 123 correct, 6 wrong but flagged, **0 wrong and unflagged**, 18 not read (left blank, so "not entered").
- The 80-55-06 Sino cert read fully from the "good" photo (chemistry for the record plus all three strength values, PASS).
- Its "ok" and "messy" photos (tilted boxed grid) read nothing, and the result says to check by hand. Known limit: tilted boxed tables.
- About 3–6 s per photo on desktop Chrome and about 8 s with 4× CPU throttling (first use, including the download).

**Pending:** Harsh's real phone photos. Please re-measure when he sends them.

**Tests:** e2e 61/61, regression 0 errors, cert batch unchanged, offline works for both pages and for photos (second use). Cache materials-atlas-v84-photo.
