from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class SimRequest(BaseModel):
    kappa: float = Field(1.5, description="κ^P")
    theta: float = Field(0.12, description="θ^P")
    sigma: float = Field(0.14, description="σ")
    kappa_q: float = Field(2.2, description="κ^Q")
    theta_q: float = Field((1.5 * 0.12) / 2.2, description="θ^Q (defaults to κ^Pθ^P/κ^Q for affine γ)")
    x0: float = Field(0.12, description="X_0")
    level: int = Field(8, ge=1, le=15, description="N = 2^level EM steps")
    T: float = Field(5.0, gt=0)
    seed: int = Field(42)
    k_mode: bool = Field(False, description="show K extra paths")
    K: int = Field(10, ge=0, le=50)


class SimResponse(BaseModel):
    t: list[float]
    w_p: list[float]
    w_q: list[float]
    w_girsanov: list[float]
    w_q_independent: list[float]
    x_full: list[float]
    x_drift: list[float]
    x_diff: list[float]
    gamma: list[float]
    stats: Dict[str, Any]
    extras: Optional[Dict[str, Any]] = None
