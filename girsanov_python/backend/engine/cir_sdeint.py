"""
CIR paths via sdeint (Euler–Maruyama).

dx = κ(θ − x)dt + σ√x dW

The PyPI QuantLib wheel does not expose CoxIngersollRossProcess; stepping uses
sdeint.itoEuler with fixed Wiener increments so paths align with plotted W.
"""

from __future__ import annotations

import numpy as np

try:
    import sdeint
except ImportError as e:  # pragma: no cover
    sdeint = None  # type: ignore
    _IMPORT_ERROR = e
else:
    _IMPORT_ERROR = None


def require_sdeint() -> None:
    if sdeint is None:
        raise ImportError(
            "sdeint is required for CIR dynamics. Install with: pip install sdeint"
        ) from _IMPORT_ERROR


def path_full(
    kappa: float,
    theta: float,
    sigma: float,
    x0: float,
    d_w: np.ndarray,
    dt: float,
) -> np.ndarray:
    """Full path: sdeint Euler–Maruyama with prescribed ΔW increments."""
    require_sdeint()
    n = int(d_w.shape[0])
    tspan = np.arange(n + 1, dtype=float) * dt
    dW = np.asarray(d_w, dtype=float).reshape(n, 1)

    def f(y, t):
        return np.array([kappa * (theta - float(y[0]))])

    def G(y, t):
        return np.array([[sigma * np.sqrt(max(float(y[0]), 0.0))]])

    y = sdeint.itoEuler(f, G, np.array([float(x0)], dtype=float), tspan, dW=dW)
    return y[:, 0].copy()


def path_drift_only(
    kappa: float, theta: float, x0: float, dt: float, n_steps: int
) -> np.ndarray:
    out = np.empty(n_steps + 1, dtype=float)
    out[0] = float(x0)
    for i in range(n_steps):
        out[i + 1] = out[i] + kappa * (theta - out[i]) * dt
    return out


def path_diffusion_only(sigma: float, x0: float, d_w: np.ndarray, dt: float) -> np.ndarray:
    """Diffusion-only EM: dx = σ√max(x,0) dW (same increments as full path)."""
    n = int(d_w.shape[0])
    out = np.empty(n + 1, dtype=float)
    out[0] = float(x0)
    for i in range(n):
        x = out[i]
        out[i + 1] = x + sigma * np.sqrt(max(x, 0.0)) * float(d_w[i])
    return out


def discrete_wiener_increments(rng: np.random.Generator, n_steps: int, dt: float) -> np.ndarray:
    return rng.standard_normal(n_steps, dtype=float) * np.sqrt(dt)


def discrete_wiener_path(d_w: np.ndarray) -> np.ndarray:
    w = np.empty(len(d_w) + 1, dtype=float)
    w[0] = 0.0
    w[1:] = np.cumsum(d_w)
    return w
