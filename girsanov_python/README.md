# Girsanov / CIR visualizer (Python + sdeint)

Python reimplementation of the teaching page `pages/girsanov-p.html`: **FastAPI** backend + static **Plotly** frontend.

## Modelling stack (no hand-rolled integrator)

- **CIR paths** use [sdeint](https://github.com/mattja/sdeint) **`itoEuler`** (Euler–Maruyama) on **dx = κ(θ−x)dt + σ√x dW** with **fixed** Wiener increments **ΔW = √dt·Z** so the plotted **W** matches the shock sequence. The **stepping loop** is the library’s `itoEuler`, not a custom time discretization. Drift-only and diffusion-only overlays are explicit **κ(θ−x)dt** and **σ√max(x,0)ΔW** for teaching overlays (same SDE coefficients).
- **Brownian increments** use **`numpy.random.Generator.standard_normal`**.
- **Market price of risk γ** is the **closed-form** CIR affine expression with **κ<sup>ℙ</sup>θ<sup>ℙ</sup> = κ<sup>ℚ</sup>θ<sup>ℚ</sup>** — see `engine/mpr.py`.
- **Primary path:** **`w_q`** equals **`w_p`**; **stats** give **Z<sub>T</sub>** (discrete Doléans exponential).
- **K-path fan:** build a **pool** of **M** ℙ paths (`extras.pool_size`); **ℙ fan** = **K** uniform subsamples; **ℚ fan** = **K** resamples with **P(i) ∝ Z<sub>T</sub><sup>(i)</sup>** (importance resampling). **`extras.q_log_density`** is **log Z<sub>T</sub>** for each displayed ℚ fan path. **`w_q_independent`** is unrelated BM for contrast.
- **`w_girsanov`:** **W<sup>ℙ</sup>(t)+∫<sub>0</sub><sup>t</sup>γ<sub>s</sub>ds** on the grid (ℚ-Brownian coordinate in the usual construction). **Z<sub>T</sub>** reweighting does **not** vertically shift plotted **W<sup>ℙ</sup>**; use the UI toggle **W+∫γ** to see drift from γ.

**Why not QuantLib?** The PyPI **QuantLib** wheel for macOS/arm64 (and many builds) does **not** expose `CoxIngersollRossProcess`, so this project uses **sdeint** for reproducible paths instead.

## Install (ask before running on your machine)

```bash
cd girsanov_python
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## Run

From the `girsanov_python` directory (activate the venv first, or call its `uvicorn` directly):

```bash
source .venv/bin/activate   # optional if you use the path below
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8765
# or: .venv/bin/uvicorn backend.main:app --reload --host 127.0.0.1 --port 8765
```

Open **http://127.0.0.1:8765/** (API docs at `/docs`).

## API

- `POST /api/simulate` — JSON body matches `SimRequest` in `backend/schemas.py`; returns time series for plotting.

## Note on the original JS page

The static HTML simulator used a Lévy–Ciesielski Brownian bridge for the **primary** ℙ path; this Python port uses **discrete Brownian motion on the EM grid** (same convention as the JS “K-fan” fast path) so shocks stay aligned with **sdeint** steps.
