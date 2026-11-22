# Working rules for this repo (Materials Atlas (material and coating property data, cert checking))

Owner: Harsh (QA engineer, hydraulic cylinders). Reviews come through Satureday (= Muse, his AI workspace).
These rules are standing. They apply to every session and override convenience.

## Data rules
1. **Two independent sources per value.** If a value can't be paired, leave the cell blank and list it in GAPS.md as a
   named gap with the reason. Never guess, interpolate or "fill from pattern" without saying so.
2. **The latest edition governs.** Label every row with the edition it comes from. If the current edition can't be read,
   say which older edition the values come from.
3. **The standard governs over secondary sources** (handbooks, catalogues, gauge-maker charts). If they conflict, the
   standard wins, and the conflict is recorded.
4. **No company data, ever.** Nothing from Harsh's employer (drawings, part numbers, certs, supplier names, internal
   procedures) goes into the repo, the commit messages or memory. Licensed standards he attaches are read for values
   only; their text is not copied in.
5. **Out of scope:** Ford ES30014 / ES20014; DIN 405 (dropped permanently, its cells stay blank); generic bolt-torque
   charts. No commercial detours.
6. Hydraulic-work relevance decides priority after an explicit request.

## Change routine (every data or feature change)
1. Get the sources and pair them value by value; note any disagreement.
2. Make the change, with a source comment at the data block (standard, edition, table, date verified).
3. Open the page headless and check there are no page errors; re-check every changed row against its sources.
4. Load the page headless (Playwright: /opt/npm-tools/node_modules/playwright, Chrome /usr/bin/google-chrome,
   `python3 -m http.server 8765`) and confirm there are no page errors. Watch for apostrophes inside single-quoted JS strings.
5. Bump the cache name in sw.js on every publish. Bump DATAREV when DATA rows change.
6. Prepend an entry to MUSE-NOTE.md: what changed, sources, the values, named gaps, and flags for Satureday.
7. Update GAPS.md (close filled gaps; add new ones).
8. Commit and push: `git -c push.negotiate=true push origin HEAD:main`.

## Flags to raise rather than decide
- A source that contradicts a reading already recorded (e.g. thread masters carry no wear limits).
- New scope (a standard or table not already in the app): propose it in MUSE-NOTE, don't add it.
