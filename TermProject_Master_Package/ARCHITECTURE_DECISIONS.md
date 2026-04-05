# Architecture Decisions Log

This file records all implementation and methodology decisions for the term project deliverables.

## Decision ADR-001: Approval-first operating policy

- **Date:** 2026-03-11
- **Status:** Approved by user
- **Decision:** No package installation, downloads, or internet fetches are allowed unless explicitly approved by the user beforehand.
- **Rationale:** Keep the environment controlled and ensure full transparency over any external dependency or data acquisition.
- **Impact:** The first iteration is built with existing local tools and sources only.

## Decision ADR-002: First deliverable format

- **Date:** 2026-03-11
- **Status:** Approved by user
- **Decision:** Produce a static LaTeX source and compiled PDF as the first iteration.
- **Rationale:** Prioritize conceptual and mathematical rigor before simulation and coding phases.
- **Impact:** Deliverables are `term_project_v1.tex` and `term_project_v1.pdf` in this folder.

## Decision ADR-003: Documentation style and pedagogy

- **Date:** 2026-03-11
- **Status:** Approved by user
- **Decision:** Use instructor-style explanations with clear assumptions, notation, intuition, and rigorous derivations.
- **Rationale:** Align with course expectations and oral defense requirements.
- **Impact:** Each question section includes: assumptions, technical derivation, intuition, and open-ended extensions.

## Decision ADR-004: Model and measure transparency

- **Date:** 2026-03-11
- **Status:** Approved by user
- **Decision:** Explicitly state probability space, filtration, and measure (`\(\mathbb{P}\)` vs `\(\mathbb{Q}\)`) before key derivations.
- **Rationale:** Avoid ambiguity and connect the project directly to measure-theoretic foundations from class.
- **Impact:** Every major formula is contextualized by its measure and conditioning information.

## Decision ADR-005: Libraries, methods, and modeling scope for iteration 1

- **Date:** 2026-03-11
- **Status:** Approved by user
- **Decision:** Use only local LaTeX packages already available in the environment (`geometry`, `amsmath`, `amssymb`, `amsthm`, `mathtools`, `bm`, `hyperref`, `enumitem`, `booktabs`, `tikz`).
- **Rationale:** Produce a rigorous static document with no external downloads while still supporting equations, structure, and static conceptual figures.
- **Methods created/documented:**
  - Risk-neutral pricing identities for zero-coupon bonds.
  - CIR under \(\PP\) and \(\QQ\) derivations (distribution, parameter links, Novikov discussion).
  - Martingale proof for discounted bond prices.
  - Log-affine bond pricing derivation via Feynman-Kac and Riccati equations.
  - Initial curve consistency as a Volterra calibration equation.
  - Swap and swaption pricing structure (including Jamshidian decomposition outline).
- **Modeling choices in scope:**
  - One-factor CIR short-rate framework as the core model.
  - Time-dependent \(\theta_t^{\QQ}\) extension for exact initial curve fitting at \(t=0\).

## Decision ADR-006: Interactive P-vs-Q CIR teaching page

- **Date:** 2026-04-01
- **Status:** Approved by user
- **Decision:** Add a static client-side visualizer page comparing the CIR short-rate model under \(\PP\) and \(\QQ\), with a live display of the CIR-preserving market price of risk \(\lambda_t = \lambda \sqrt{r_t}\) and the induced parameter link \((\kappa^{\PP}, \theta^{\PP}) \mapsto (\kappa^{\QQ}, \theta^{\QQ})\).
- **Rationale:** The user wanted an intuition-first tool for the measure change in Question 4, especially the difference between statistical and pricing drifts and the role of Girsanov's theorem.
- **Impact:** The site now includes `pages/cir-p-vs-q.html` and a homepage entry linking to it. The page uses local JavaScript only, reuses the existing visual style, and keeps the pedagogical focus on the distinction between "same shocks" and "changed drift under \(\QQ\)".

## Decision ADR-007: Girsanov page — ℚ Brownian overlay (same \(\omega\))

- **Date:** 2026-04-03 (updated 2026-04-03)
- **Status:** Superseded by ADR-008 for the pink \(W^{\QQ}\) trace.

## Decision ADR-008: Girsanov page — \(W^{\QQ}\) as independent Wiener (decoupled from \(\sigma\))

- **Date:** 2026-04-03
- **Status:** User-directed correction
- **Decision:** On `pages/girsanov-p.html`, the **plotted** pink \(W^{\QQ}\) path is a **separate** Lévy–Ciesielski Brownian bridge sample (`wBridgeQ`, seed derived from `currentSeed ^ SEED_Q_XOR`), not \(W^{\PP}+\int\gamma\). Extra pink paths in K-mode use independent ℚ bridges per extra seed. The **Girsanov identity** \(dW^{\QQ}=dW^{\PP}+\gamma\,dt\) and \(\tilde W_t:=W^{\PP}_t+\int_0^t\gamma\,ds\) remain in the red formula panel and live formula strip for theory; \(\gamma_t\) along simulated \(X\) still depends on \(\sigma\). Guided walkthrough steps 2–4 were removed; only “Manual” and “Step 1 (\(W^{\PP}\))” remain.
- **Rationale:** User requested standard Brownian under \(\QQ\) in law that does **not** move when the volatility slider moves; the old \(W^{\PP}+\int\gamma\) path is \(\sigma\)-dependent through \(\gamma(X_t)\).
- **Impact:** Pink BM is pedagogically “same Wiener law, different sample” alongside the \(\PP\) driver; same-\(\omega\) Girsanov construction is text-only unless reintroduced as an optional trace later.

## Decision ADR-009: Girsanov page — impose \(\kappa^{\PP}\theta^{\PP}=\kappa^{\QQ}\theta^{\QQ}\) for \(\gamma\)

- **Date:** 2026-04-03
- **Status:** User-directed
- **Decision:** Under the MPR card on `pages/girsanov-p.html`, state the assumption \(\kappa^{\PP}\theta^{\PP}=\kappa^{\QQ}\theta^{\QQ}\) so the level term in \(\gamma_t\) vanishes; the page still displays the full two-term reference formula, then the reduced \(\gamma_t=(\kappa^{\QQ}-\kappa^{\PP})\sqrt{r_t}/\sigma\). Implement `cirGammaAtR` using only that first term (second term omitted).
- **Rationale:** Matches the user’s imposed restriction; keeps the plotted \(\gamma\) consistent with the note.

## Decision ADR-011: Beamer slide deck — handwritten notes conversion

- **Date:** 2026-04-03
- **Status:** Implemented
- **Decision:** Convert handwritten slide notes (`Downloads/Term Project.pdf`, 18 pages OCR'd) into a Beamer presentation in `Term Project output/Term Project.tex`. The slides are organized into two sections — (1) Spot Rate, Forward Rates, and the Zero-Coupon Yield Curve; (2) Risk-Neutral Dynamics Under Q: The CIR Model — matching the note structure exactly.
- **Mathematical rigour:** All formulas cross-referenced against `TermProject_Master_Package/term_project_v1.tex` for correct notation ($\PP$/$\QQ$, $\kappa_\PP$/$\theta_\PP$/$\kappa_\QQ$/$\theta_\QQ$, Feller condition, Novikov condition, Girsanov derivation step-by-step). The Girsanov substitution is shown in full; the Feller and Novikov conditions are stated and verified rigorously.
- **Template:** Frankfurt theme / seahorse colour theme retained from the existing template. TikZ used for the forward/yield curve diagram.
- **Scope:** 18 content slides + section dividers + title page = 21 pages total. Slides follow the pedagogical flow: discrete → continuous discounting → bond price formula → yield curve → forward rates → need for Q → Girsanov → CIR under Q → Feller → Novikov → summary table.

## Decision ADR-010: Girsanov page — K-fan performance (discrete BM extras)

- **Date:** 2026-04-03
- **Status:** User-directed (fix UI freeze at large K)
- **Decision:** Do **not** call `buildBridge` (Lévy–Ciesielski on 32k nodes) for each of the K extra paths. Extras use `discreteBMOnGrid`: \(W_0=0\), \(\Delta W_i\sim\mathcal N(0,\Delta t)\) on the same EM grid, then `buildPathsFromDriver` / `simulateCIR` as before. Extra ℚ paths use the same discrete construction. The primary ℙ path and primary ℚ reference path still use the existing Lévy bridge sampling.
- **Rationale:** Hundreds of full bridges blocked the main thread; discrete BM is \(O(N)\) per path and matches the EM time discretization.

## Decision ADR-012: Python Girsanov/CIR app — multinomial ℚ fan and lecture-note copy

- **Date:** 2026-04-04
- **Status:** Implemented (user-approved overhaul)
- **Decision:** The pink “ℙ→ℚ” fan is generated by **K i.i.d.** draws from `Categorical(q_m)` with **replacement** (`replace=True`, `p=q_m`), where `q_m ∝ Z_T^{(m)}` on the pool. This matches the Monte Carlo interpretation of the red reference curve `Σ_m q_m W_t^{(m),\mathbb P}` as the exact discrete `q`-weighted mean on the same pool. Explanatory text in `girsanov_python/frontend/app.js` and `index.html` is rewritten in the same order as course notes: discrete grid → CIR under ℙ → ℚ / Girsanov density on the EM grid → pool weights → green uniform subsample → red `q`-mean → pink multinomial resampling → remark distinguishing reweighted `W^{\mathbb P}` from a ℚ-Wiener `\(\tilde W\)`.
- **Rationale:** Weighted sampling **without** replacement does not approximate `∑_m q_m \Phi(W^{(m)})` and was inconsistent with the red curve narrative.
- **Impact:** `girsanov_python/backend/engine/simulate.py` (sampling + module docstring), `backend/engine/mpr.py` (docstring aligned with project SDEs), `frontend/app.js`, `frontend/index.html`; `extras` gains `q_fan_with_replacement: true`.

## Decision ADR-013: Pink fan — distinct paths + thinner strokes (2026-04-04 follow-up)

- **Status:** Implemented
- **Decision:** Pink indices use `numpy.random.choice(..., p=q_m, replace=(K>M))` so when `K≤M` the fan shows **K distinct** weighted paths (duplicate multinomial draws were stacking visually). Red pool-mean is a **single** dashed Plotly line (~1.85px); redundant `layout.shapes` polylines were removed. Pink line widths are capped ~1.25px with modest opacity variation.
- **Rationale:** User readability; the red curve `Σ_m q_m W^{(m)}` on the **full** pool is unchanged and remains the exact discrete tilt reference.
