'use strict';

const PC = { responsive: true, displayModeBar: false };
const CHART_H = 460;
const CHART_MARGINS = { t: 12, r: 20, b: 110, l: 65 };
const OPACITY_CHART_H = 400;
const OPACITY_MARGINS = { t: 10, r: 16, b: 52, l: 58 };

let lastData = null;
let kMode = false;
let seed = (Date.now() & 0x7fffffff) >>> 0;
let uiWired = false;

/* Defaults: Feller 2κθ > σ²; κ^Pθ^P = κ^Qθ^Q so γ = (κ^Q−κ^P)√r/σ only (no 1/√r term).
   Moderate |κ^Q−κ^P| and T so pool-weighted 𝔼[W^P] curve sits clearly away from 0. */
const p = {
  kappa: 1.5,
  theta: 0.12,
  sigma: 0.14,
  x0: 0.12,
  kappa_q: 2.2,
  theta_q: (1.5 * 0.12) / 2.2,
  level: 8,
  T: 5,
  K: 10,
};

function minMaxFinite(values) {
  let mn = Infinity;
  let mx = -Infinity;
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (Number.isFinite(v)) {
      if (v < mn) mn = v;
      if (v > mx) mx = v;
    }
  }
  return { mn, mx };
}

/** Time grid for plotting: API `t` must match W length (some parsers oddities avoided). */
function timeAxisForW(d, wP, T) {
  const t = d.t;
  if (Array.isArray(t) && t.length === wP.length) return t;
  const n = wP.length;
  if (n <= 1) return [0];
  return Array.from({ length: n }, (_, i) => (i / (n - 1)) * T);
}

function multiLineTrace(xs, yArrays) {
  const x = [];
  const y = [];
  const m = xs.length;
  for (let j = 0; j < yArrays.length; j++) {
    const row = yArrays[j];
    for (let i = 0; i < m; i++) {
      x.push(xs[i]);
      y.push(row[i]);
    }
    x.push(null);
    y.push(null);
  }
  return { x, y };
}

/** Slight emphasis: larger Z_T on the drawn path → a bit more opaque; keep strokes thin. */
function qFanStylesFromLogZ(logZ) {
  let mx = -Infinity;
  for (let i = 0; i < logZ.length; i++) if (logZ[i] > mx) mx = logZ[i];
  const rel = logZ.map((lz) => Math.exp(lz - mx));
  let s = 0;
  for (let i = 0; i < rel.length; i++) s += rel[i];
  const n = rel.length;
  const norm = rel.map((r) => (r / s) * n);
  const alphas = norm.map((t) =>
    Math.max(0.22, Math.min(0.72, 0.22 + 0.48 * Math.sqrt(Math.max(t, 0.04))))
  );
  const widths = norm.map((t) =>
    Math.max(0.55, Math.min(1.25, 0.55 + 0.65 * Math.sqrt(Math.max(t, 0.04))))
  );
  return { alphas, widths };
}

function updateSamplingExplain() {
  const el = document.getElementById('sampling-explain');
  if (!el) return;
  const wp2q = document.getElementById('chk-wp-to-q')?.checked;
  const fan = kMode;
  const core =
    `<p class="mb-2"><strong>1. Discrete grid.</strong> Fix horizon <em>T</em> &gt; 0 and <em>N</em> = 2<sup>level</sup>. Set Δ<em>t</em> = <em>T</em>/<em>N</em> and grid times <em>t</em><sub>k</sub> = <em>k</em>Δ<em>t</em>, <em>k</em> = 0,…,<em>N</em>.</p>` +
    `<p class="mb-2"><strong>2. Physical measure ℙ.</strong> Let (<em>W</em><sub>t</sub><sup>ℙ</sup>)<sub>0 ≤ t ≤ T</sub> denote the (piecewise-linear) Brownian path built from i.i.d. increments Δ<em>W</em><sup>ℙ</sup> ~ <strong>N</strong>(0, Δ<em>t</em>) on that grid. The short rate (<em>r</em><sub>t</sub>) follows the CIR model under ℙ,<br/>
    d<em>r</em><sub>t</sub> = κ<sup>ℙ</sup>(θ<sup>ℙ</sup> − <em>r</em><sub>t</sub>) d<em>t</em> + σ√<em>r</em><sub>t</sub> d<em>W</em><sub>t</sub><sup>ℙ</sup>, &nbsp; <em>r</em><sub>0</sub> = <em>X</em><sub>0</sub>,<br/>
    simulated with the <em>same</em> Brownian increments (Euler–Maruyama pathwise construction in the backend).</p>` +
    `<p class="mb-2"><strong>3. Equivalent measure ℚ and density.</strong> Under ℚ one writes the CIR dynamics with parameters (κ<sup>ℚ</sup>, θ<sup>ℚ</sup>, σ) and a ℚ-Brownian motion (<em>W</em><sub>t</sub><sup>ℚ</sup>) related to (<em>W</em><sub>t</sub><sup>ℙ</sup>) by d<em>W</em><sub>t</sub><sup>ℚ</sup> = d<em>W</em><sub>t</sub><sup>ℙ</sup> + γ<sub>t</sub> d<em>t</em>. Along each simulated path, γ<sub>t</sub> is the affine market price of risk in the project statement (here κ<sup>ℙ</sup>θ<sup>ℙ</sup> = κ<sup>ℚ</sup>θ<sup>ℚ</sup>, so γ<sub>t</sub> = (κ<sup>ℚ</sup> − κ<sup>ℙ</sup>)√<em>r</em><sub>t</sub>/σ). The Doléans exponential gives<br/>
    <em>Z</em><sub>T</sub> = ℰ(−∫<sub>0</sub><sup>T</sup> γ<sub>s</sub> d<em>W</em><sub>s</sub><sup>ℙ</sup>)<sub>T</sub>.<br/>
    On the discrete grid, with γ taken left-continuous on each step,<br/>
    log <em>Z</em><sub>T</sub> ≈ Σ<sub>i</sub> (−γ<sub>i</sub> Δ<em>W</em><sub>i</sub><sup>ℙ</sup> − ½ γ<sub>i</sub>² Δ<em>t</em>).</p>`;

  const poolBlock =
    `<p class="mb-2"><strong>4. Monte Carlo pool.</strong> Independently simulate <em>M</em> trajectories under ℙ, <em>m</em> = 1,…,<em>M</em>. Each yields a Brownian coordinate <em>W</em><sup>(m),ℙ</sup> and a scalar <em>Z</em><sub>T</sub><sup>(m)</sup>. Define normalized weights<br/>
    <em>q</em><sub>m</sub> = <em>Z</em><sub>T</sub><sup>(m)</sup> / Σ<sub>j=1</sub><sup>M</sup> <em>Z</em><sub>T</sub><sup>(j)</sup> &nbsp;(stable normalization in code via log-weights).</p>` +
    `<p class="mb-2"><strong>5. Green fan (empirical ℙ on the pool).</strong> Display <em>K</em> paths by sampling <em>K</em> <strong>distinct</strong> indices uniformly from {1,…,<em>M</em>} (without replacement when <em>K</em> ≤ <em>M</em>). For the driver, 𝔼<sup>ℙ</sup>[<em>W</em><sub>t</sub><sup>ℙ</sup>] = 0; the empirical average over the pool fluctuates around 0.</p>` +
    `<p class="mb-2"><strong>6. Red dashed curve (discrete ℚ-tilt on the pool).</strong> Plot <span style="color:#b91c1c;">Σ<sub>m=1</sub><sup>M</sup> <em>q</em><sub>m</sub> <em>W</em><sub>t</sub><sup>(m),ℙ</sup></span>, the <em>exact</em> <strong>q</strong>-weighted mean of the <em>same</em> ℙ-Brownian trajectories. For bounded path functionals Φ on the grid, Σ<sub>m</sub> <em>q</em><sub>m</sub> Φ(<em>W</em><sup>(m),ℙ</sup>) approximates 𝔼<sup>ℚ</sup>[Φ(<em>W</em><sup>ℙ</sup>)] = 𝔼<sup>ℙ</sup>[<em>Z</em><sub>T</sub> Φ(<em>W</em><sup>ℙ</sup>)] when <em>M</em> is large and discretization bias is small.</p>`;

  const pinkBlock =
    `<p class="mb-2"><strong>7. Pink fan (ℚ-weighted sample).</strong> Draw <em>K</em> indices with probabilities ∝ <em>q</em><sub>m</sub>. When <em>K</em> ≤ <em>M</em> we use <strong>sampling without replacement</strong> so you always see <em>K</em> <strong>distinct</strong> paths (duplicates from with-replacement draws would stack and look like fewer lines). When <em>K</em> &gt; <em>M</em>, replacement is forced. Stroke opacity still reflects the drawn path’s <em>Z</em><sub>T</sub>; line width stays modest for readability.</p>` +
    `<p class="mb-0"><strong>Remark.</strong> This illustrates <em>reweighting the law of</em> <em>W</em><sup>ℙ</sup> by <em>Z</em><sub>T</sub> on a finite pool. It is not the same object as an independent Brownian motion under ℚ: a ℚ-Wiener can be written as <em>W̃</em><sub>t</sub> = <em>W</em><sub>t</sub><sup>ℙ</sup> + ∫<sub>0</sub><sup>t</sup> γ<sub>s</sub> d<em>s</em> (Riemann sum with left endpoints on the grid in auxiliary backend output).</p>`;

  let html = core;
  if (fan) {
    html += poolBlock;
    if (wp2q) html += pinkBlock;
  }
  if (wp2q && !fan) {
    html += `<p class="mb-0 mt-2 text-warning small"><strong>Note.</strong> Turn on <strong>Show K paths</strong> to build the pool of size <em>M</em>; the pink overlay is defined only after that pool is simulated.</p>`;
  }
  const poolNoMean =
    fan &&
    lastData?.extras &&
    !Array.isArray(lastData.extras.w_p_mean_under_q_weights);
  if (poolNoMean) {
    html += `<p class="mb-0 mt-2 text-warning small"><strong>Missing red curve?</strong> Restart <code>uvicorn</code> from this repo so the API includes <code>w_p_mean_under_q_weights</code>, then hard-refresh the page.</p>`;
  }
  el.innerHTML = html;
}

function buildSliders() {
  ['sliders-p', 'sliders-q', 'sliders-sim'].forEach((sid) => {
    const el = document.getElementById(sid);
    if (!el) return;
    el.innerHTML = '';
    el.className = 'card-body py-2 px-3';
  });
  const mk = (id, label, key, min, max, step, dec, parent) => {
    const wrap = document.createElement('div');
    wrap.className = 'mb-2';
    wrap.innerHTML = `
      <div class="slider-row mb-1">
        <label>${label}</label>
        <span class="badge bg-primary param-badge" id="lbl-${id}"></span>
      </div>
      <input type="range" class="form-range" id="sl-${id}" min="${min}" max="${max}" step="${step}" />
    `;
    parent.appendChild(wrap);
    const inp = wrap.querySelector(`#sl-${id}`);
    const lbl = wrap.querySelector(`#lbl-${id}`);
    inp.value = String(p[key]);
    lbl.textContent = Number(inp.value).toFixed(dec);
    inp.addEventListener('input', () => {
      p[key] = parseFloat(inp.value);
      lbl.textContent = p[key].toFixed(dec);
      runSim();
    });
  };
  const sp = document.getElementById('sliders-p');
  const sq = document.getElementById('sliders-q');
  const ss = document.getElementById('sliders-sim');
  mk('kappa', 'κ (mean rev.)', 'kappa', 0.01, 5, 0.05, 2, sp);
  mk('theta', 'θ', 'theta', 0.01, 0.2, 0.001, 3, sp);
  mk('sigma', 'σ', 'sigma', 0.01, 0.5, 0.01, 2, sp);
  mk('x0', 'X₀', 'x0', 0.001, 0.2, 0.001, 3, sp);
  mk('kappaQ', 'κ<sup>ℚ</sup>', 'kappa_q', 0.01, 5, 0.05, 2, sq);
  mk('thetaQ', 'θ<sup>ℚ</sup>', 'theta_q', 0.01, 0.2, 0.001, 3, sq);

  const lvlWrap = document.createElement('div');
  lvlWrap.className = 'mb-2';
  lvlWrap.innerHTML = `
    <div class="slider-row mb-1"><label>log₂ N (level)</label><span class="badge bg-secondary param-badge" id="lbl-level"></span></div>
    <input type="range" class="form-range" id="sl-level" min="1" max="15" step="1" value="${p.level}" />
  `;
  ss.appendChild(lvlWrap);
  const slL = lvlWrap.querySelector('#sl-level');
  const lblL = lvlWrap.querySelector('#lbl-level');
  lblL.textContent = p.level;
  slL.addEventListener('input', () => {
    p.level = parseInt(slL.value, 10);
    lblL.textContent = p.level;
    runSim();
  });

  const tWrap = document.createElement('div');
  tWrap.className = 'mb-2';
  tWrap.innerHTML = `
    <div class="slider-row mb-1"><label>T</label><span class="badge bg-secondary param-badge" id="lbl-T"></span></div>
    <input type="range" class="form-range" id="sl-T" min="0.5" max="20" step="0.5" value="${p.T}" />
  `;
  ss.appendChild(tWrap);
  const slT = tWrap.querySelector('#sl-T');
  const lblT = tWrap.querySelector('#lbl-T');
  lblT.textContent = p.T.toFixed(1);
  slT.addEventListener('input', () => {
    p.T = parseFloat(slT.value);
    lblT.textContent = p.T.toFixed(1);
    runSim();
  });

  const kWrap = document.createElement('div');
  kWrap.className = 'mb-2';
  kWrap.innerHTML = `
    <div class="slider-row mb-1"><label>K paths</label><span class="badge bg-secondary param-badge" id="lbl-K"></span></div>
    <input type="range" class="form-range" id="sl-K" min="1" max="50" step="1" value="${p.K}" />
  `;
  ss.appendChild(kWrap);
  const slK = kWrap.querySelector('#sl-K');
  const lblK = kWrap.querySelector('#lbl-K');
  lblK.textContent = String(p.K);
  slK.addEventListener('input', () => {
    p.K = parseInt(slK.value, 10);
    lblK.textContent = String(p.K);
    if (kMode) runSim();
  });
}

function updateFormula() {
  const bm = document.getElementById('chk-bm').checked;
  const wt = bm
    ? '<span style="color:#27ae60;font-weight:600;">ΔW<sub>k</sub><sup>ℙ</sup></span>'
    : '<span style="opacity:0.25;">ΔW<sub>k</sub><sup>ℙ</sup></span>';
  document.getElementById('formula-display').innerHTML =
    `<span style="color:#374151;">ℙ-Brownian increments on the EM grid:</span> ` +
    `${wt}` +
    `<span style="color:#64748b;font-size:0.85rem;"> &nbsp;i.i.d. &nbsp;<strong>N</strong>(0, Δ<em>t</em>), &nbsp;Δ<em>t</em> = <em>T</em>/<em>N</em>, &nbsp;<em>k</em> = 0,…,<em>N</em>−1.</span>`;
  updateSamplingExplain();
}

async function runSim() {
  updateFormula();
  const body = {
    kappa: p.kappa,
    theta: p.theta,
    sigma: p.sigma,
    kappa_q: p.kappa_q,
    theta_q: p.theta_q,
    x0: p.x0,
    level: p.level,
    T: p.T,
    seed,
    k_mode: kMode,
    K: p.K,
  };
  try {
    const r = await fetch('/api/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      throw new Error(typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail) || r.statusText);
    }
    lastData = await r.json();
    updateStats();
    updateSamplingExplain();
    try {
      renderChart();
    } catch (chartErr) {
      document.getElementById('path-chart').innerHTML =
        `<div class="p-4 text-danger"><strong>Chart error.</strong><br>${String(
          chartErr.message || chartErr
        )}<br><br>Try fewer <strong>K paths</strong>.</div>`;
    }
    try {
      renderOpacityQChart();
    } catch (opErr) {
      const om = document.getElementById('path-chart-opacity');
      if (om) {
        om.innerHTML = `<div class="p-3 text-danger small"><strong>Opacity chart error.</strong><br>${String(
          opErr.message || opErr
        )}</div>`;
      }
    }
  } catch (e) {
    document.getElementById('path-chart').innerHTML =
      `<div class="p-4 text-danger"><strong>Backend error.</strong><br>${String(e.message)}<br><br>` +
      `Install modelling stack: <code>pip install -r requirements.txt</code> (see README).</div>`;
    const om = document.getElementById('path-chart-opacity');
    if (om) {
      try {
        Plotly.purge(om);
      } catch (_) {
        /* ignore */
      }
      om.innerHTML =
        '<div class="p-3 text-muted small">Opacity panel needs a successful simulation response.</div>';
    }
  }
}

function renderChart() {
  if (!lastData) return;
  const d = lastData;
  const wP = d.w_p;
  const taFull = timeAxisForW(d, wP, p.T);
  const N = d.stats.N;
  const dt = p.T / N;
  const showBM = document.getElementById('chk-bm').checked;
  if (!Array.isArray(wP) || wP.length === 0) {
    document.getElementById('path-chart').innerHTML =
      '<div class="p-4 text-warning">No <code>w_p</code> in API response — check backend / JSON.</div>';
    return;
  }
  const ex = d.extras;
  const nFan = ex && Array.isArray(ex.w_p) ? ex.w_p.length : 0;
  const alpha = nFan > 0 ? Math.max(0.05, Math.min(0.42, 48 / nFan)) : 0;
  const showWpToQ =
    document.getElementById('chk-wp-to-q')?.checked &&
    kMode &&
    ex &&
    Array.isArray(ex.w_q) &&
    ex.w_q.length === nFan &&
    nFan > 0 &&
    ex.q_fan_resampled_by_Z_T;
  /* Pool-weighted mean: align lengths to primary W (not d.t — avoids silent skip if t grid mismatches). */
  const meanYRaw = ex?.w_p_mean_under_q_weights;
  const hasQMean =
    showBM &&
    kMode &&
    Array.isArray(meanYRaw) &&
    meanYRaw.length === wP.length;
  const meanY = hasQMean ? meanYRaw : null;
  const traces = [];

  if (nFan > 0 && showBM) {
    const { x, y } = multiLineTrace(taFull, ex.w_p);
    traces.push({
      x,
      y,
      mode: 'lines',
      name: `${nFan} paths, uniform on pool (ℙ)`,
      line: { color: `rgba(39,174,96,${alpha})`, width: 1 },
      hoverinfo: 'skip',
    });
  }
  if (showWpToQ && showBM) {
    const logZq = ex.q_log_density;
    if (logZq && logZq.length === nFan) {
      const { alphas, widths } = qFanStylesFromLogZ(logZq);
      for (let j = 0; j < nFan; j++) {
        traces.push({
          x: taFull,
          y: ex.w_q[j],
          mode: 'lines',
          name:
            j === 0
              ? `${nFan} paths, weighted ∝Z_T (thin)`
              : `${nFan} paths`,
          showlegend: j === 0,
          line: {
            color: `rgba(236,72,153,${alphas[j]})`,
            width: widths[j],
          },
          hoverinfo: 'skip',
        });
      }
    } else {
      const { x, y } = multiLineTrace(taFull, ex.w_q);
      traces.push({
        x,
        y,
        mode: 'lines',
        name: `${nFan} draws, Cat(q)`,
        line: { color: `rgba(236,72,153,${Math.max(0.25, alpha + 0.12)})`, width: 0.95 },
        hoverinfo: 'skip',
      });
    }
  }
  if (showBM) {
    traces.push({
      x: taFull,
      y: wP,
      mode: 'lines',
      name: 'Primary W<sup>ℙ</sup>',
      line: { color: '#27ae60', width: 1.8 },
    });
  }
  if (traces.length === 0) {
    traces.push({
      x: [0, p.T],
      y: [0, 0],
      mode: 'lines',
      line: { width: 0, color: 'transparent' },
      hoverinfo: 'skip',
      showlegend: false,
    });
  }
  /* Single thin dashed trace for the pool q-mean (no extra layout.shapes — avoids double-stroked “fat” red). */
  if (hasQMean) {
    traces.push({
      x: taFull,
      y: meanY,
      mode: 'lines',
      name: 'Σ<sub>m</sub> q<sub>m</sub> W<sub>t</sub><sup>(m),ℙ</sup> (pool)',
      line: {
        color: '#b91c1c',
        width: 1.85,
        dash: 'dash',
        shape: 'linear',
      },
      hovertemplate: 'Σ q_m W_t^{(m),P}: %{y:.4f}<extra></extra>',
    });
  }

  const layout = {
    height: CHART_H,
    margin: { ...CHART_MARGINS },
    datarevision: String(Date.now()),
    showlegend: true,
    legend: { orientation: 'h', x: 0.5, xanchor: 'center', y: -0.08, font: { size: 11 } },
    xaxis: { title: 't', range: [0, p.T] },
    yaxis: { title: 'W' },
    yaxis2: { visible: false },
    shapes: [],
    plot_bgcolor: '#fafbff',
    paper_bgcolor: 'white',
    hovermode: 'x unified',
    annotations: showBM
      ? []
      : [
          {
            text: 'Enable <b>W<sup>ℙ</sup></b> to plot the Brownian driver.',
            xref: 'paper',
            yref: 'paper',
            x: 0.5,
            y: 0.5,
            showarrow: false,
            font: { size: 14, color: '#64748b' },
          },
        ],
  };

  const allY = [];
  const pushArr = (arr) => {
    arr.forEach((v) => {
      if (Number.isFinite(v)) allY.push(v);
    });
  };
  if (showBM) pushArr(wP);
  if (ex && nFan > 0 && showBM) ex.w_p.forEach((row) => pushArr(row));
  if (showWpToQ && showBM) ex.w_q.forEach((row) => pushArr(row));
  if (hasQMean) pushArr(meanY);
  if (allY.length) {
    const { mn, mx } = minMaxFinite(allY);
    if (Number.isFinite(mn) && Number.isFinite(mx)) {
      const pad = Math.max((mx - mn) * 0.12, 0.005);
      layout.yaxis.range = [mn - pad, mx + pad];
    }
  } else if (!showBM) {
    layout.yaxis.range = [-1, 1];
  }

  Plotly.react('path-chart', traces, layout, PC);
  let poolNote = '';
  if (ex && ex.pool_size) {
    poolNote = ` · pool M = ${ex.pool_size}`;
  }
  let samp = '';
  if (nFan > 0 && showBM) {
    samp = ' · Green: K distinct indices, uniform on {1,…,M}.';
    if (showWpToQ) {
      samp += ' Pink: K weighted draws ∝Z_T^(m), distinct when K≤M.';
    }
  }
  document.getElementById('lbl-step-info').textContent =
    `N = 2^${p.level} = ${N} · Δt = ${dt.toFixed(4)}${poolNote}${samp}`;
}

/** Map q_m / max(q) to stroke alpha: lighter lows, darker highs, still compressed vs linear q. */
function alphaFromQmSoft(qr, qMx) {
  const r = qMx > 0 ? Math.max(Number(qr) || 0, 0) / qMx : 0;
  const shaped = Math.pow(Math.max(r, 1e-12), 0.44);
  return 0.17 + 0.78 * shaped;
}

/** Second figure: same opacity-fan paths; toggle ℙ (equal α) vs ℚ (α from q_m). */
function renderOpacityQChart() {
  const mount = document.getElementById('path-chart-opacity');
  if (!mount || typeof Plotly === 'undefined') return;

  const placeholder = (html) => {
    try {
      Plotly.purge(mount);
    } catch (_) {
      /* ignore */
    }
    mount.innerHTML = html;
  };

  if (!lastData || !kMode) {
    placeholder(
      '<div class="p-3 text-muted small">Turn on <strong>Show K paths</strong> to build the pool and draw this panel.</div>'
    );
    return;
  }
  if (!document.getElementById('chk-bm')?.checked) {
    placeholder(
      '<div class="p-3 text-muted small">Turn on <strong>W<sup>ℙ</sup></strong> on the chart above to plot Brownian paths here.</div>'
    );
    return;
  }

  const ex = lastData.extras;
  const of = ex?.opacity_fan;
  const wRows = of?.w_p;
  const qArr = of?.q;
  if (!Array.isArray(wRows) || !Array.isArray(qArr) || wRows.length === 0 || qArr.length !== wRows.length) {
    placeholder(
      '<div class="p-3 text-warning small">No <code>opacity_fan</code> in the API response. Restart <code>uvicorn</code> from the current repo.</div>'
    );
    return;
  }

  mount.innerHTML = '';
  const ta = timeAxisForW(lastData, wRows[0], p.T);
  let qMx = 0;
  for (let i = 0; i < qArr.length; i++) {
    const v = Number(qArr[i]);
    if (Number.isFinite(v) && v > qMx) qMx = v;
  }
  if (!(qMx > 0)) qMx = 1;

  const useQOpacity = document.getElementById('chk-opacity-q')?.checked !== false;
  const nPaths = wRows.length;
  const alphaP = 0.4;

  const traces = [];
  for (let j = 0; j < wRows.length; j++) {
    const qj = Number(qArr[j]);
    const qr = Number.isFinite(qj) && qj >= 0 ? qj : 0;
    const alpha = useQOpacity ? alphaFromQmSoft(qr, qMx) : alphaP;
    const leg0 =
      useQOpacity
        ? `${nPaths} paths (ℚ: opacity ~ q_m)`
        : `${nPaths} paths (ℙ: equal opacity)`;
    const hoverLine = useQOpacity
      ? `m=${j + 1}, q_m=${qr.toExponential(4)}`
      : `m=${j + 1}, display mass 1/${nPaths} under ℙ on this panel`;
    traces.push({
      x: ta,
      y: wRows[j],
      mode: 'lines',
      name: j === 0 ? leg0 : `${nPaths} paths`,
      showlegend: j === 0,
      line: {
        color: `rgba(22, 163, 74, ${alpha})`,
        width: useQOpacity ? 1.85 : 1.65,
      },
      hoverinfo: 'text',
      text: ta.map(() => hoverLine),
    });
  }

  const allY = [];
  wRows.forEach((row) => {
    row.forEach((v) => {
      if (Number.isFinite(v)) allY.push(v);
    });
  });
  let yRange;
  if (allY.length) {
    const { mn, mx } = minMaxFinite(allY);
    if (Number.isFinite(mn) && Number.isFinite(mx)) {
      const pad = Math.max((mx - mn) * 0.1, 0.005);
      yRange = [mn - pad, mx + pad];
    }
  }

  const layout = {
    height: OPACITY_CHART_H,
    margin: { ...OPACITY_MARGINS },
    datarevision: `opacity-${Date.now()}`,
    showlegend: true,
    legend: { orientation: 'h', x: 0.5, xanchor: 'center', y: -0.12, font: { size: 10 } },
    xaxis: { title: 't', range: [0, p.T] },
    yaxis: { title: { text: 'W\u2119' } },
    plot_bgcolor: '#f8fdf8',
    paper_bgcolor: 'white',
    hovermode: 'closest',
  };
  if (yRange) layout.yaxis.range = yRange;

  const plotId = 'path-chart-opacity';
  Plotly.purge(plotId);
  const pDone = Plotly.newPlot(plotId, traces, layout, PC);
  if (pDone && typeof pDone.then === 'function') {
    pDone.catch((err) => {
      mount.innerHTML = `<div class="p-3 text-danger small"><strong>Plotly error.</strong><br>${String(
        err && err.message ? err.message : err
      )}</div>`;
    });
  }
}

function updateStats() {
  if (!lastData) return;
  const s = lastData.stats;
  const el = document.getElementById('stats-panel');
  el.className = 'card-body py-2 px-3 small';
  const fe = s.feller_ok
    ? '<span class="text-success">✓ Feller</span>'
    : '<span class="text-danger">✗ Feller</span>';
  const lz =
    s.log_density_Q_vs_P !== undefined
      ? `<div class="stat-row"><span class="text-muted">log Z<sub>T</sub> (ℚ vs ℙ)</span><span>${s.log_density_Q_vs_P.toFixed(4)}</span></div>`
      : '';
  const zt =
    s.density_Q_vs_P !== undefined
      ? `<div class="stat-row"><span class="text-muted">Z<sub>T</sub></span><span>${s.density_Q_vs_P.toExponential(3)}</span></div>`
      : '';
  const ex = lastData.extras;
  const poolDiag =
    ex && ex.pool_ess !== undefined
      ? `<div class="stat-row"><span class="text-muted">Pool ESS</span><span>${Number(ex.pool_ess).toFixed(1)} / ${ex.pool_size}</span></div>`
      : '';
  el.innerHTML = `
    <div class="stat-row"><span class="text-muted">Feller</span><span>${fe}</span></div>
    <div class="stat-row"><span class="text-muted">2κθ</span><span>${s.two_kappa_theta.toFixed(5)}</span></div>
    <div class="stat-row"><span class="text-muted">σ²</span><span>${s.sigma_sq.toFixed(5)}</span></div>
    <div class="stat-row"><span class="text-muted">𝔼<sup>ℙ</sup>[<em>X</em><sub>T</sub>] (CIR)</span><span>${s.cir_mean_T.toFixed(5)}</span></div>
    <div class="stat-row"><span class="text-muted"><em>X</em><sub>T</sub> (sim, ℙ)</span><span>${s.sim_X_T.toFixed(5)}</span></div>
    <div class="stat-row"><span class="text-muted"><em>W</em><sub>T</sub><sup>ℙ</sup> (primary)</span><span>${s.W_T.toFixed(5)}</span></div>
    ${lz}${zt}${poolDiag}
  `;
}

function boot() {
  try {
    buildSliders();
    updateFormula();
    if (!uiWired) {
      uiWired = true;
      document.getElementById('btn-kpaths').addEventListener('click', function () {
        kMode = !kMode;
        this.textContent = kMode ? '× Hide K paths' : 'Show K paths';
        this.classList.toggle('btn-warning', kMode);
        this.classList.toggle('btn-outline-light', !kMode);
        runSim();
      });
      document.getElementById('btn-resim').addEventListener('click', () => {
        seed = (Math.floor(Math.random() * 0x7fffffff) ^ Date.now()) >>> 0;
        runSim();
      });
      document.getElementById('chk-bm').addEventListener('change', () => {
        updateFormula();
        if (lastData) {
          renderChart();
          try {
            renderOpacityQChart();
          } catch (opErr) {
            const om = document.getElementById('path-chart-opacity');
            if (om) {
              om.innerHTML = `<div class="p-3 text-danger small"><strong>Opacity chart error.</strong><br>${String(
                opErr.message || opErr
              )}</div>`;
            }
          }
        }
      });
      document.getElementById('chk-wp-to-q').addEventListener('change', () => {
        updateFormula();
        if (lastData) renderChart();
      });
      document.getElementById('chk-opacity-q')?.addEventListener('change', () => {
        if (lastData && kMode) {
          try {
            renderOpacityQChart();
          } catch (opErr) {
            const om = document.getElementById('path-chart-opacity');
            if (om) {
              om.innerHTML = `<div class="p-3 text-danger small"><strong>Opacity chart error.</strong><br>${String(
                opErr.message || opErr
              )}</div>`;
            }
          }
        }
      });
    }
    runSim();
  } catch (err) {
    const fd = document.getElementById('formula-display');
    if (fd) {
      fd.innerHTML =
        `<p class="text-danger mb-0"><strong>Startup error.</strong> ${String(err.message || err)}</p>` +
        `<p class="small text-muted mb-0 mt-2">Open this app at the uvicorn URL (e.g. <code>http://127.0.0.1:8765/</code>) so <code>static/app.js</code> loads.</p>`;
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
