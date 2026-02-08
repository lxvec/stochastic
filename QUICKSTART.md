# Quick Start Guide - Stochastic Calculus Visualizer

## ⚡ 30-Second Setup

### Option 1: Direct Browser (Easiest for Windows/Mac)
1. Open terminal/command prompt
2. Navigate to workspace folder
3. For Mac/Linux: `python3 -m http.server 8000`
4. For Windows: `python -m http.server 8000`
5. Open browser to `http://localhost:8000`

### Option 2: Using Provided Script
```bash
chmod +x server.sh    # Make script executable (Mac/Linux)
./server.sh           # Start server
# Or: bash server.sh
```

### Option 3: VS Code Live Server
- Install "Live Server" extension (by Ritwick Dey)
- Right-click `index.html` → "Open with Live Server"
- Browser opens automatically

## 🚀 What to Explore First

### 1. **Landing Page** (index.html)
- Understand the 5 core concepts
- See visual overview of each module
- Read accordion explanations

### 2. **Partitions Page** (pages/partitions.html) ⭐ START HERE
- Click "Add Vertical Line" to create partition
- Drag lines smoothly to adjust positions
- Right-click to remove lines
- Enter prices in input fields
- Watch σ-algebra grow (2^n elements)

### 3. **Filtrations Page** (pages/filtrations.html)
- Click "Next Step" to see information evolve
- Notice partition refinement over time
- Understand how F₀ ⊆ F₁ ⊆ F₂ ⊆ F₃

### 4. **Conditional Expectation** (pages/conditional-expectation.html)
- Create partition (same as page 1)
- Assign values to each atom
- See E[X|F] computed for each region
- Note: constant on each atom

### 5. **Martingale Properties** (pages/martingale.html)
- Adjust u, d, r sliders
- Watch binomial tree rebuild
- See risk-neutral probability p* calculate
- Verify: E[Sₜ₊₁|Fₜ] = Sₜ

### 6. **Binomial Model** (pages/binomial-model.html)
- Build multi-period trees (T=1,2,3,4,5)
- Change strike price (K)
- Click "Price Option" 
- See all 2^T terminal paths listed
- Watch payoff distribution

## 📊 Interactive Features

### Partition Page Controls
| Action | Result |
|--------|--------|
| Click "Add Vertical Line" | New partition line (centered) |
| Click "Add Horizontal Line" | New partition line (centered) |
| Drag blue line | Adjust partition smoothly |
| Right-click line | Delete that partition |
| Enter value in input | Assign stock price to atom |

### Filtration Page Controls
| Action | Result |
|--------|--------|
| Click "Next Step" | Advance timeline |
| Click "Reset" | Return to t=0 |
| Drag speed slider | Change animation speed |

### Conditional Expectation Controls
| Action | Result |
|--------|--------|
| Create partition | Define filtration F |
| Assign values | Define random variable X |
| E[X\|F] updates | Shows expected value per atom |

### Martingale Page Controls
| Action | Result |
|--------|--------|
| Drag u slider | Change up factor |
| Drag d slider | Change down factor |
| Change r | Recalculate risk-neutral prob |
| p^up slider | Change real-world probability |
| Click "Compute" | Verify martingale property |

### Binomial Model Controls
| Action | Result |
|--------|--------|
| Change all sliders | Rebuild price tree |
| Adjust T | Change number of periods |
| Adjust K | Change strike price |
| Click "Price Option" | Compute call value |

## 🎯 Learning Path

### For Beginners (Non-Math Background)
1. Start: Read landing page explanations
2. Next: Play with partitions page (drag lines around)
3. Then: Watch filtration timeline
4. Later: Explore binomial tree on last page
5. Deep: Go back and understand conditional expectations

### For Advanced (Math Background)
1. Start: Partitions page - create complex partitions
2. Then: Filtrations - understand nesting
3. Next: Conditional expectation - compute by hand first
4. Then: Martingale - verify p* calculations
5. Finally: Binomial - price real options

## 📐 Key Mathematical Insights

### Partitions & σ-Algebras
- **Partition atoms**: Indivisible regions
- **σ-algebra size**: Always 2^n (exactly!)
- **Example**: 2 lines → 4 atoms → 16 sets in σ-algebra

### Filtrations
- **Information grows**: F₀ ⊆ F₁ ⊆ F₂ ⊆ ...
- **Partitions refine**: Fewer large cells → more small cells
- **Intuition**: Learning happens step by step

### Conditional Expectation
- **Always F-measurable**: Constant on each F-atom
- **Average value**: On atom A, equals mean of X over A
- **Best guess**: Optimal prediction with available information

### Martingale Property
- **No drift**: Expected future price = current price
- **Risk-neutral**: Adjusted for interest rate
- **Formula**: p* = (e^r - d)/(u - d)

### Option Pricing
- **Backward induction**: Work from terminal payoff backward
- **Discount**: Multiply by e^(-r) at each step
- **Risk-neutral**: Use p*, not real probability

## 🐛 Troubleshooting

### "Can't load page" or blank white screen
1. Make sure server is running (see setup above)
2. Check browser console (F12) for errors
3. Try hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)

### Visualizations not showing
1. Make sure D3.js loads (check console)
2. Verify Bootstrap CSS loads (check developer tools)
3. Try different browser (Chrome, Firefox, Safari)

### Drag not working smoothly
1. This is normal on some devices - try different browser
2. Make sure JavaScript is enabled
3. Try refreshing page

### Numbers look weird or math symbols missing
1. This is fine - browser may render subscripts differently
2. Math is still correct internally
3. Try different browser if this bothers you

## 📱 Browser Support

| Browser | Status | Notes |
|---------|--------|-------|
| Chrome | ✓ Full | Best performance |
| Firefox | ✓ Full | Excellent support |
| Safari | ✓ Full | Works great |
| Edge | ✓ Full | Chromium-based |
| IE 11 | ✗ No | Not supported |

## 💾 File Structure Reference

```
index.html           ← Start here (landing page)
pages/
├── partitions.html           ← Σ-algebras & partitions
├── filtrations.html          ← Information evolution
├── conditional-expectation.html ← E[X|F]
├── martingale.html           ← Martingales & risk-neutral
└── binomial-model.html       ← Option pricing & trees
js/
├── partition-visualizer.js   ← Base class
├── filtration-visualizer.js
├── conditional-expectation-visualizer.js
├── martingale-visualizer.js
└── binomial-model-visualizer.js
css/
└── styles.css               ← All styling
```

## ❓ Common Questions

**Q: Why 2^n sets in σ-algebra?**
A: Each atom can be either in or out of a set, giving 2^n possibilities.

**Q: Can I combine multiple partitions?**
A: No, the pages show single partitions. Combinations are implicit in filtrations.

**Q: What do the colors mean?**
A: Gray = partition regions, Blue = lines/up moves, Red = down moves

**Q: Can I export the visualizations?**
A: Not directly, but you can screenshot them (F12 → inspect → adjust)

**Q: How is option price calculated?**
A: Backward induction: compute value at each node, discount by e^(-r)

**Q: Why does p* have to be between 0 and 1?**
A: It's a probability! Must satisfy 0 ≤ p* ≤ 1 for valid models.

## 🎓 Learning Resources

- `README.md` - Full technical documentation
- `IMPLEMENTATION_SUMMARY.md` - Implementation details
- LaTeX/main.tex - Mathematical foundations
- Each page has "Mathematical Definition" section with proofs

## ✨ Tips for Best Learning

1. **Play first, understand second** - Adjust sliders and observe
2. **Read definitions carefully** - Each page has the math
3. **Vary parameters systematically** - Change one thing at a time
4. **Verify by hand** - Calculate σ-algebra size yourself
5. **Connect concepts** - Use same partitions across pages
6. **Visualize the math** - See shapes correspond to equations

## 🚀 Next Steps

1. Complete all 5 pages
2. Try creating complex partitions (3-4 lines each direction)
3. Verify σ-algebra cardinality matches 2^n
4. Price both call and put options
5. Explain each concept to someone else

---

**Happy Learning!** 🎉

If you have questions about the math, check the `README.md` or return to the landing page explanations.
