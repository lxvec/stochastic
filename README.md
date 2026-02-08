# Stochastic Calculus Visualizer

An interactive learning platform for understanding probability spaces, filtrations, conditional expectations, martingales, and binomial option pricing models.

## Project Structure

```
/Workspace
├── index.html                          # Landing page with navigation & overview
├── pages/
│   ├── partitions.html                 # Partition & σ-algebra visualization
│   ├── filtrations.html                # Information evolution over time
│   ├── conditional-expectation.html    # E[X|F] visualization & computation
│   ├── martingale.html                 # Martingale properties & risk-neutral pricing
│   └── binomial-model.html             # Binomial trees & option pricing
├── js/
│   ├── partition-visualizer.js         # Core partition visualization class
│   ├── filtration-visualizer.js        # Filtration timeline visualization
│   ├── conditional-expectation-visualizer.js  # Conditional expectation visualizer
│   ├── martingale-visualizer.js        # Martingale & binomial tree visualizer
│   └── binomial-model-visualizer.js    # Option pricing & path analysis
├── css/
│   └── styles.css                      # Unified styling
└── LaTeX/
    └── main.tex                        # Mathematical foundations document
```

## Pages Overview

### 1. **Partitions & σ-Algebras** (`pages/partitions.html`)
- **Focus**: Understanding sample spaces and their partition structure
- **Interactive Elements**:
  - Draggable partition lines (vertical & horizontal)
  - Real-time σ-algebra generation showing all 2^n possible unions
  - Random variable (stock price) assignment per atom
  - Multi-line cell labels showing atom names and prices
- **Key Concepts**:
  - Atoms: Indivisible regions of the partition
  - σ-algebra: Collection of all possible unions of atoms (cardinality = 2^n)
  - Measurability: A random variable is measurable with respect to a partition

### 2. **Filtrations & Information** (`pages/filtrations.html`)
- **Focus**: How information evolves over time
- **Interactive Elements**:
  - Timeline visualization showing partition refinement from t=0 to t=T
  - Step-by-step information revelation
  - Nested σ-algebra comparison (F₀ ⊆ F₁ ⊆ F₂ ⊆ ...)
  - Speed control and reset button
- **Key Concepts**:
  - Information is represented by σ-algebras
  - At each time step, new observations refine the partition
  - Filtrations capture the history of observations

### 3. **Conditional Expectation** (`pages/conditional-expectation.html`)
- **Focus**: E[X | F] as the best prediction given information F
- **Interactive Elements**:
  - Partition editor (same as page 1)
  - Random variable value assignment
  - Display of E[X | F] on each atom (constant across atoms)
  - Computation of unconditional expectation E[X]
- **Key Concepts**:
  - E[X | F] is F-measurable (constant on atoms of F)
  - For atom A: E[X | F](ω) = average of X over A for ω ∈ A
  - Intuition: Best prediction when you only know which atom you're in

### 4. **Martingale Properties** (`pages/martingale.html`)
- **Focus**: Martingales and risk-neutral option pricing
- **Interactive Elements**:
  - 2-period binomial tree with adjustable u, d, and r
  - Automatic computation of risk-neutral probability p*
  - Verification that E[Sₜ₊₁ | Fₜ] = Sₜ under ℚ measure
  - Real-world vs risk-neutral probability comparison
- **Key Concepts**:
  - Martingale property: E[Sₜ₊₁ | Fₜ] = Sₜ (no drift)
  - Risk-neutral measure ℚ: p* = (e^r - d)/(u - d)
  - Discounted prices are martingales under ℚ

### 5. **Binomial Market Model** (`pages/binomial-model.html`)
- **Focus**: Multi-period binomial trees and European option pricing
- **Interactive Elements**:
  - Adjustable model parameters (S₀, u, d, r, T)
  - Full binomial price tree visualization
  - European call option pricing via backward induction
  - Terminal payoff distribution chart
  - Path enumeration with real-world and risk-neutral probabilities
- **Key Concepts**:
  - Binomial tree: T periods, 2^T terminal nodes
  - Option pricing: C_t = e^(-r(T-t)) · E^ℚ[payoff | Fₜ]
  - Backward induction: Compute option value at each node

## Core Technologies

- **Frontend Framework**: Bootstrap 5.3.0 (responsive layout)
- **Visualization**: D3.js v7 (dynamic SVG rendering)
- **Language**: Vanilla JavaScript ES6+ (class-based architecture)
- **Styling**: Custom CSS with mathematical notation support

## Class Architecture

### PartitionVisualizer (partition-visualizer.js)
Base class for partition visualization:
- `createSVG()`: Initialize D3 SVG container
- `drawPartitionLines()`: Render draggable lines
- `drawPartitionCells()`: Render partition regions
- `getPartitionAtoms()`: Calculate atomic partition
- `generateSigmaAlgebra()`: Create all 2^n unions
- `updateRandomVariableUI()`: Handle value inputs
- `updateUI()`: Refresh all displays

### FiltrationVisualizer (filtration-visualizer.js)
Timeline visualization of σ-algebra evolution:
- `generateFiltrationSequence()`: Create nested σ-algebras
- `renderTimeline()`: Draw SVG timeline
- `updateDisplay()`: Update information panel
- `nextStep()` / `reset()`: Control timeline playback

### ConditionalExpectationVisualizer (conditional-expectation-visualizer.js)
Extends PartitionVisualizer to add:
- `computeConditionalExpectations()`: Calculate E[X|F]
- `updateConditionalExpectationDisplay()`: Show grouped expectations
- `updateXValueDisplay()`: Show E[X]

### MartingaleVisualizer (martingale-visualizer.js)
Binomial tree with martingale verification:
- `drawBinomialTree()`: Render 2-period tree
- `computeMartingale()`: Calculate risk-neutral probabilities
- `verifyMartingale()`: Check E[Sₜ₊₁|Fₜ] = Sₜ
- `analyzePathExpectations()`: Show path probabilities

### BinomialModelVisualizer (binomial-model-visualizer.js)
Multi-period model with option pricing:
- `buildTree()`: Generate T-period price tree
- `drawTree()`: Visualize tree with D3
- `priceOption()`: Backward induction for call pricing
- `updatePathAnalysis()`: Enumerate all paths with probabilities
- `drawPayoffChart()`: Show terminal payoff distribution

## Mathematical Foundations

### Probability Space
- **Sample Space** Ω: Set of all possible outcomes
- **Partition**: Collection {A₁, A₂, ..., Aₙ} where atoms partition Ω
- **σ-algebra** σ(P): All possible unions of atoms in P
- **Cardinality**: |σ(P)| = 2^n where n = number of atoms

### σ-Algebra Definition
σ-algebra F on Ω is a collection of subsets such that:
1. ∅ ∈ F and Ω ∈ F
2. If A ∈ F, then A^c ∈ F (closed under complements)
3. If {Aᵢ} ⊆ F, then ⋃ Aᵢ ∈ F (closed under countable unions)

### Filtration
A filtration is a nested sequence of σ-algebras:
- F₀ ⊆ F₁ ⊆ F₂ ⊆ ... ⊆ F (non-decreasing)
- Fₜ represents information available at time t
- Each Fₜ is generated by a partition that refines over time

### Conditional Expectation
For random variable X and σ-algebra F:
- **Definition**: E[X | F] is the unique F-measurable random variable such that for all A ∈ F:
  - ∫_A X dℙ = ∫_A E[X|F] dℙ
- **On atoms**: For atom Aᵢ of F, E[X|F] is constant = (1/|Aᵢ|) Σ_{ω∈Aᵢ} X(ω)
- **Intuition**: Best prediction of X given only the information in F

### Martingale
Process {Sₜ} is a martingale with respect to {Fₜ} and ℙ if:
1. Sₜ is Fₜ-measurable
2. E[|Sₜ|] < ∞
3. **Martingale property**: E[Sₜ | Fₛ] = Sₛ for all s ≤ t

In discrete time: E[Sₜ₊₁ | Fₜ] = Sₜ (no drift)

### Risk-Neutral Pricing
In the binomial model with interest rate r and parameters u, d:
- **Risk-neutral probability**: p* = (e^r - d)/(u - d)
- **Martingale property**: Under ℚ measure with p*, E^ℚ[e^(-r)Sₜ₊₁ | Fₜ] = Sₜ
- **Option pricing**: C(S,t) = e^(-r(T-t)) E^ℚ[payoff(Sₜ) | Fₜ]

### Binomial Tree
- At each step t: Sₜ₊₁ = Sₜ · u (with prob p*) or Sₜ · d (with prob 1-p*)
- After T steps: 2^T possible terminal prices
- Number of up moves follows Binomial(T, p*) distribution
- European call payoff: max(S_T - K, 0)

## Usage Instructions

### To Open the Visualizer:
1. Open `index.html` in a web browser
2. Click "Start Learning" to begin
3. Navigate between pages using the navbar

### To Interact:
- **Partitions page**: Drag lines to adjust partition, click buttons to add lines, right-click to remove
- **Filtrations page**: Use "Next Step" button to advance timeline
- **Conditional Expectation**: Enter values in input fields to compute E[X|F]
- **Martingale**: Adjust sliders to see risk-neutral probability change
- **Binomial Model**: Modify parameters to build different trees and price options

## Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (may require enabling developer mode for file:// access)

## Educational Use
This visualizer is designed for:
- Undergraduate stochastic calculus courses
- Finance/mathematical finance programs
- Self-study of probability and stochastic processes
- Visual understanding of abstract mathematical concepts

## Future Enhancements
- 3D visualization of high-dimensional sample spaces
- Continuous-time stochastic processes (Brownian motion)
- American option pricing with early exercise
- Itô's lemma and stochastic differential equations
- Monte Carlo simulation visualization
