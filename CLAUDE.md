@AGENTS.md

# Lake Watch research (already done, do not redo)
All science, API testing, data pulls and decisions for the lake layer are finished and documented. Never re-research, re-fetch, or re-derive them.
- Spec for this build: `BUILDPLAN.md` (this folder). One-shot prompt: `ONESHOT_PROMPT.md`.
- Verdict, numbers, gotchas: `../feasibility/VERDICT.md` (read the "BUILD HANDOFF" and "Gotchas" sections if anything is unclear).
- Data already built: `public/data/lakes.json`, `public/data/ns_reported_bga_all.csv`. Plot: `../feasibility/plots/gate5_bloom_index_timeseries.png`.
- Do NOT call the Copernicus / Sentinel Hub API in this build. No credentials are needed. Satellite values come only from `public/data/lakes.json`.
- Do NOT re-check the ECCC API, quotas, constellation status, lake polygons, licences, or bloom report dates; they are in VERDICT.md.
