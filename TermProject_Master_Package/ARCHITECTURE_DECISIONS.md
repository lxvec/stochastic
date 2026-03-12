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
