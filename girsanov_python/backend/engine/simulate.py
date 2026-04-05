"""CIR short rate + Brownian driver: one primary path and optional Monte Carlo pool (fans).

Primary simulation (always): under the physical measure P, draw Brownian increments
ΔW^P on an evenly spaced grid, integrate the CIR path X (short rate r_t ≡ X_t), and
compute γ along X. The realized increments and γ define log Z_T via the discrete
Doléans / Girsanov exponential on the same grid.

Pool mode (k_mode and K>0): draw M i.i.d. P-copies of (W^P, X); for each path m compute
Z_T^(m) and normalized weights q_m ∝ Z_T^(m). Return:
  - K indices uniform on {1,…,M} without replacement when K≤M (green fan),
  - K weighted draws ∝ q_m for the pink fan (without replacement when K≤M so paths stay distinct),
  - the q-weighted average of W^P over the full pool (reference curve),
  - opacity_fan: first min(15,M) pool paths with their q_m for a separate static opacity plot.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import numpy as np

from backend.engine import cir_sdeint as ce
from backend.engine.mpr import gamma_along_path


def girsanov_q_brownian_coordinate(
    w_p: np.ndarray | list[float],
    gamma: np.ndarray | list[float],
    dt: float,
) -> list[float]:
    """Teaching coordinate: W̃(t_k) = W^P(t_k) + ∫_0^{t_k} γ_s ds (left-endpoint γ on grid).

    Under dW^Q = dW^P + γ dt one uses W̃ that is BM under ℚ; this is the cumulative shift
    from the *same* ℙ path and γ along X. Plotted W^P alone has no vertical drift from γ.
    """
    wp = np.asarray(w_p, dtype=float)
    g = np.asarray(gamma, dtype=float)
    drift_cum = np.concatenate([[0.0], np.cumsum(g[:-1]) * float(dt)])
    return (wp + drift_cum).tolist()


def log_density_q_vs_p_terminal(
    gamma: np.ndarray,
    d_w_p_increments: np.ndarray,
    dt: float,
) -> float:
    """log Z_T for the Doléans exponential Z_t = ℰ(-∫γ dW^P)_t on the EM grid:

    log Z_T ≈ Σ_i ( -γ_{t_i} ΔW^P_i - ½ γ_{t_i}² Δt ),  γ at left endpoint of each step.
    """
    g = np.asarray(gamma[:-1], dtype=float)
    dw = np.asarray(d_w_p_increments, dtype=float)
    return float(-np.dot(g, dw) - 0.5 * float(dt) * float(np.dot(g, g)))


@dataclass
class PathBundle:
    t: list[float]
    w_p: list[float]
    w_q: list[float]
    w_girsanov: list[float]
    w_q_independent: list[float]
    x_full: list[float]
    x_drift: list[float]
    x_diff: list[float]
    gamma: list[float]
    stats: dict[str, Any]
    extras: dict[str, Any] | None = None


def _cir_mean_terminal(T: float, kappa: float, theta: float, x0: float) -> float:
    if abs(kappa) < 1e-12:
        return x0
    return theta + (x0 - theta) * np.exp(-kappa * T)


def _fan_pool_size(K: int) -> int:
    """How many ℙ paths to simulate before subsampling K for display."""
    return int(max(K + 1, min(500, max(96, K * 8))))


# Fixed paths for the separate “opacity under ℚ” chart (first n paths in pool build order).
_OPACITY_VIZ_PATHS = 60


def simulate(
    *,
    kappa: float,
    theta: float,
    sigma: float,
    kappa_q: float,
    theta_q: float,
    x0: float,
    level: int,
    T: float,
    seed: int,
    k_mode: bool,
    K: int,
) -> PathBundle:
    ce.require_sdeint()
    n = 1 << int(level)
    dt = T / n
    t = (np.arange(n + 1, dtype=float) * dt).tolist()

    rng_p = np.random.default_rng(int(seed) & 0xFFFFFFFF)
    rng_q = np.random.default_rng((int(seed) ^ 0xBADC0FEE) & 0xFFFFFFFF)

    d_w = ce.discrete_wiener_increments(rng_p, n, dt)
    w_p = ce.discrete_wiener_path(d_w).tolist()

    x_full = ce.path_full(kappa, theta, sigma, x0, d_w, dt)
    x_drift = ce.path_drift_only(kappa, theta, x0, dt, n)
    x_diff = ce.path_diffusion_only(sigma, x0, d_w, dt)

    g = gamma_along_path(x_full, kappa, theta, kappa_q, theta_q, sigma)

    # Same realized trajectory as W^P: under ℚ vs ℙ the path ω is fixed; mass moves via Z_T.
    w_q_primary = list(w_p)
    w_girs_primary = girsanov_q_brownian_coordinate(w_p, g, dt)
    w_q_indep = ce.discrete_wiener_path(
        ce.discrete_wiener_increments(rng_q, n, dt)
    ).tolist()

    two_k_theta = 2 * kappa * theta
    sig2 = sigma * sigma
    log_z_p = log_density_q_vs_p_terminal(g, d_w, dt)
    stats = {
        "feller_ok": bool(two_k_theta >= sig2),
        "two_kappa_theta": float(two_k_theta),
        "sigma_sq": float(sig2),
        "cir_mean_T": float(_cir_mean_terminal(T, kappa, theta, x0)),
        "sim_X_T": float(x_full[-1]),
        "W_T": float(w_p[-1]),
        "N": int(n),
        "log_density_Q_vs_P": float(log_z_p),
        "density_Q_vs_P": float(np.exp(log_z_p)),
        "w_q_same_path_as_w_p": True,
    }

    extras_out: dict[str, Any] | None = None
    if k_mode and K > 0:
        M = _fan_pool_size(int(K))
        rng_pool = np.random.default_rng((int(seed) ^ 0xBEEFF00D) & 0xFFFFFFFF)
        rng_ind = np.random.default_rng((int(seed) ^ 0x51A4B00B) & 0xFFFFFFFF)

        pool_w: list[list[float]] = []
        pool_xf: list[list[float]] = []
        pool_xd: list[list[float]] = []
        pool_xx: list[list[float]] = []
        pool_logz: list[float] = []
        pool_w_girs: list[list[float]] = []

        for _ in range(M):
            dwj = ce.discrete_wiener_increments(rng_pool, n, dt)
            wj = ce.discrete_wiener_path(dwj)
            xfj = ce.path_full(kappa, theta, sigma, x0, dwj, dt)
            gj = gamma_along_path(xfj, kappa, theta, kappa_q, theta_q, sigma)
            pool_w.append(wj.tolist())
            pool_w_girs.append(girsanov_q_brownian_coordinate(wj, gj, dt))
            pool_xf.append(xfj.tolist())
            pool_xd.append(ce.path_drift_only(kappa, theta, x0, dt, n).tolist())
            pool_xx.append(ce.path_diffusion_only(sigma, x0, dwj, dt).tolist())
            pool_logz.append(float(log_density_q_vs_p_terminal(gj, dwj, dt)))
        logz = np.asarray(pool_logz, dtype=float)
        wq = np.exp(logz - np.max(logz))
        s = float(np.sum(wq))
        if s <= 0.0 or not np.isfinite(s):
            wq = np.ones(M, dtype=float) / M
        else:
            wq = wq / s

        ess = float(1.0 / float(np.sum(wq * wq)))
        lg_span = float(np.max(logz) - np.min(logz))
        z_ratio = float(np.exp(lg_span))

        # q_m = Z_T^(m) / sum_j Z_T^(j) on the pool (importance weights / discrete tilt).
        # Red curve: sum_m q_m W_t^(m),P — exact pool average of the P-Brownian coordinate under these weights.
        w_mat = np.asarray(pool_w, dtype=float)  # (M, n+1)
        w_p_mean_under_q_weights = np.average(w_mat, axis=0, weights=wq).tolist()

        # Green fan: K distinct indices uniform on {0,…,M−1} (without replacement when K≤M).
        idx_p = rng_ind.choice(M, size=int(K), replace=(int(K) > M))
        # Pink fan: weighted draws ∝ q_m. Without replacement when K≤M so you see K distinct paths
        # (with replacement, duplicate indices stack and look like fewer pink curves). With replacement
        # only when K>M (required). Red curve remains the exact sum_m q_m W^(m) on the full pool.
        idx_q = rng_ind.choice(M, size=int(K), replace=(int(K) > M), p=wq)

        n_op = min(_OPACITY_VIZ_PATHS, M)
        opacity_w = [pool_w[i] for i in range(n_op)]
        opacity_q = [float(wq[i]) for i in range(n_op)]

        extras_out = {
            "w_p": [pool_w[i] for i in idx_p],
            "w_q": [pool_w[i] for i in idx_q],
            "w_q_independent": [
                ce.discrete_wiener_path(
                    ce.discrete_wiener_increments(rng_ind, n, dt)
                ).tolist()
                for _ in range(int(K))
            ],
            "q_log_density": [float(pool_logz[i]) for i in idx_q],
            "w_q_girsanov": [pool_w_girs[i] for i in idx_q],
            "x_full": [pool_xf[i] for i in idx_p],
            "x_drift": [pool_xd[i] for i in idx_p],
            "x_diff": [pool_xx[i] for i in idx_p],
            "K": int(K),
            "pool_size": int(M),
            "p_fan_uniform_subsample": True,
            "q_fan_resampled_by_Z_T": True,
            "q_fan_with_replacement": bool(int(K) > M),
            "pool_log_z_min": float(np.min(logz)),
            "pool_log_z_max": float(np.max(logz)),
            "pool_ess": ess,
            "pool_z_max_over_min": z_ratio,
            "w_p_mean_under_q_weights": w_p_mean_under_q_weights,
            "opacity_fan": {
                "w_p": opacity_w,
                "q": opacity_q,
                "n_paths": int(n_op),
                "description": (
                    "First n_op paths in pool simulation order; q_m is the full-pool weight "
                    "Z_T^(m)/sum_j Z_T^(j). Line opacity is proportional to q_m on the client."
                ),
            },
        }

    return PathBundle(
        t=t,
        w_p=w_p,
        w_q=w_q_primary,
        w_girsanov=w_girs_primary,
        w_q_independent=w_q_indep,
        x_full=x_full.tolist(),
        x_drift=x_drift.tolist(),
        x_diff=x_diff.tolist(),
        gamma=g.tolist(),
        stats=stats,
        extras=extras_out,
    )
