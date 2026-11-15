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
