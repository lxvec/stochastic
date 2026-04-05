"""
Market price of risk for a CIR short rate under an equivalent change of measure.

Let, under the physical measure P,
    d r_t = κ^P (θ^P − r_t) dt + σ √r_t dW_t^P,
and under Q,
    d r_t = κ^Q (θ^Q − r_t) dt + σ √r_t dW_t^Q,
with dW_t^Q = dW_t^P + γ_t dt.

With κ^P θ^P = κ^Q θ^Q (matched long-run level in product form), the affine formula reduces to
    γ_t = (κ^Q − κ^P) √r_t / σ.
If that product constraint is relaxed, add (κ^P θ^P − κ^Q θ^Q)/(σ √r_t).
"""

from __future__ import annotations

import numpy as np


def gamma_along_path(
    x: np.ndarray,
    kappa_p: float,
    theta_p: float,
    kappa_q: float,
    theta_q: float,
    sigma: float,
    *,
    impose_kappa_theta_product_equal: bool = True,
) -> np.ndarray:
    """γ evaluated along path x (short-rate / CIR state)."""
    sigma = max(float(sigma), 1e-12)
    r = np.maximum(np.asarray(x, dtype=float), 1e-10)
    sr = np.sqrt(r)
    term1 = (kappa_q - kappa_p) * sr / sigma
    if impose_kappa_theta_product_equal:
        return term1
    term2 = (kappa_p * theta_p - kappa_q * theta_q) / (sigma * sr)
    return term1 + term2


def gamma_at_x0(
    x0: float,
    kappa_p: float,
    theta_p: float,
    kappa_q: float,
    theta_q: float,
    sigma: float,
) -> float:
    return float(
        gamma_along_path(
            np.array([x0]),
            kappa_p,
            theta_p,
            kappa_q,
            theta_q,
            sigma,
        )[0]
    )
