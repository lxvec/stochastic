from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from backend.schemas import SimRequest, SimResponse
from backend.engine.simulate import simulate

ROOT = Path(__file__).resolve().parent.parent
FRONTEND = ROOT / "frontend"

app = FastAPI(title="Girsanov CIR (sdeint backend)", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=str(FRONTEND)), name="static")


@app.post("/api/simulate", response_model=SimResponse)
def api_simulate(body: SimRequest) -> SimResponse:
    try:
        bundle = simulate(
            kappa=body.kappa,
            theta=body.theta,
            sigma=body.sigma,
            kappa_q=body.kappa_q,
            theta_q=body.theta_q,
            x0=body.x0,
            level=body.level,
            T=body.T,
            seed=body.seed,
            k_mode=body.k_mode,
            K=body.K,
        )
    except ImportError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
    return SimResponse(
        t=bundle.t,
        w_p=bundle.w_p,
        w_q=bundle.w_q,
        w_girsanov=bundle.w_girsanov,
        w_q_independent=bundle.w_q_independent,
        x_full=bundle.x_full,
        x_drift=bundle.x_drift,
        x_diff=bundle.x_diff,
        gamma=bundle.gamma,
        stats=bundle.stats,
        extras=bundle.extras,
    )


@app.get("/")
def index():
    index_path = FRONTEND / "index.html"
    if not index_path.is_file():
        raise HTTPException(status_code=404, detail="frontend/index.html missing")
    return FileResponse(index_path)
