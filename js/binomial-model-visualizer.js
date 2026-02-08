class BinomialModelVisualizer {
    constructor() {
        this.S0 = 100;
        this.u = 1.25;
        this.d = 0.75;
        this.r = 0.05;
        this.T = 3;
        this.pReal = 0.5;
        this.K = 100;
        
        this.tree = null;
        this.pStar = null;
        
        this.initialize();
    }
    
    initialize() {
        this.setupEventListeners();
        this.buildTree();
    }
    
    setupEventListeners() {
        const self = this;
        
        document.getElementById('u-mult').addEventListener('input', (e) => {
            self.u = parseFloat(e.target.value);
            document.getElementById('u-val').textContent = self.u.toFixed(2);
            self.buildTree();
        });
        
        document.getElementById('d-mult').addEventListener('input', (e) => {
            self.d = parseFloat(e.target.value);
            document.getElementById('d-val').textContent = self.d.toFixed(2);
            self.buildTree();
        });
        
        document.getElementById('init-price').addEventListener('change', (e) => {
            self.S0 = parseFloat(e.target.value);
            self.buildTree();
        });
        
        document.getElementById('rate').addEventListener('change', (e) => {
            self.r = parseFloat(e.target.value);
        });
        
        document.getElementById('periods').addEventListener('change', (e) => {
            self.T = parseInt(e.target.value);
            document.getElementById('maturity-display').textContent = self.T + ' periods';
            self.buildTree();
        });
        
        document.getElementById('p-prob').addEventListener('input', (e) => {
            self.pReal = parseFloat(e.target.value);
            document.getElementById('p-real').textContent = self.pReal.toFixed(2);
            self.updatePathAnalysis();
        });
        
        document.getElementById('strike').addEventListener('change', (e) => {
            self.K = parseFloat(e.target.value);
        });
        
        document.getElementById('build-tree').addEventListener('click', () => {
            self.buildTree();
        });
        
        document.getElementById('price-option').addEventListener('click', () => {
            self.priceOption();
        });
    }
    
    buildTree() {
        // Compute risk-neutral probability
        const deltaT = 1;
        const riskFreeDiscount = Math.exp(this.r * deltaT);
        this.pStar = (riskFreeDiscount - this.d) / (this.u - this.d);
        
        // Check if valid model
        if (this.pStar < 0 || this.pStar > 1) {
            alert('Invalid parameters: Risk-neutral probability must be in [0,1].\nAdjust u and d so that d < e^r < u');
            return;
        }
        
        // Build price tree
        this.tree = {};
        for (let t = 0; t <= this.T; t++) {
            this.tree[t] = {};
            for (let i = 0; i <= t; i++) {
                const ups = i;
                const downs = t - i;
                this.tree[t][i] = this.S0 * Math.pow(this.u, ups) * Math.pow(this.d, downs);
            }
        }
        
        this.drawTree();
        this.updatePathAnalysis();
    }
    
    drawTree() {
        const container = d3.select('#tree-visualization');
        container.html('');
        
        const nodeRadius = 20;
        const horizontalSpacing = 100;
        const verticalSpacing = 60;
        const leftMargin = 50;
        const topMargin = 30;
        
        const width = (this.T + 1) * horizontalSpacing + 2 * leftMargin;
        const height = (this.T + 1) * verticalSpacing + 2 * topMargin;
        
        const svg = container.append('svg')
            .attr('width', width)
            .attr('height', height);
        
        // Store node positions
        const nodePositions = {};
        
        // Draw edges first (behind nodes)
        for (let t = 0; t < this.T; t++) {
            for (let i = 0; i <= t; i++) {
                const x1 = leftMargin + t * horizontalSpacing;
                const y1 = topMargin + (t + 1) * verticalSpacing / 2 + i * verticalSpacing;
                
                // To node (i,t+1) - up move
                const x2 = leftMargin + (t + 1) * horizontalSpacing;
                const y2 = topMargin + (t + 2) * verticalSpacing / 2 + i * verticalSpacing;
                
                svg.append('line')
                    .attr('x1', x1).attr('y1', y1)
                    .attr('x2', x2).attr('y2', y2)
                    .attr('stroke', '#3498db').attr('stroke-width', 1);
                
                // To node (i+1,t+1) - down move
                const y3 = topMargin + (t + 2) * verticalSpacing / 2 + (i + 1) * verticalSpacing;
                
                svg.append('line')
                    .attr('x1', x1).attr('y1', y1)
                    .attr('x2', x2).attr('y2', y3)
                    .attr('stroke', '#e74c3c').attr('stroke-width', 1);
            }
        }
        
        // Draw nodes
        for (let t = 0; t <= this.T; t++) {
            for (let i = 0; i <= t; i++) {
                const x = leftMargin + t * horizontalSpacing;
                const y = topMargin + (t + 1) * verticalSpacing / 2 + i * verticalSpacing;
                
                nodePositions[`${t}_${i}`] = { x, y };
                
                const price = this.tree[t][i];
                
                svg.append('circle')
                    .attr('cx', x).attr('cy', y)
                    .attr('r', nodeRadius)
                    .attr('fill', '#e8f4f8')
                    .attr('stroke', '#333')
                    .attr('stroke-width', 2);
                
                svg.append('text')
                    .attr('x', x).attr('y', y)
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'middle')
                    .attr('font-size', '12px')
                    .attr('font-weight', 'bold')
                    .text(`$${price.toFixed(0)}`);
            }
        }
        
        // Time labels
        for (let t = 0; t <= this.T; t++) {
            svg.append('text')
                .attr('x', leftMargin + t * horizontalSpacing)
                .attr('y', topMargin - 10)
                .attr('text-anchor', 'middle')
                .attr('font-size', '12px')
                .attr('font-weight', 'bold')
                .text(`t=${t}`);
        }
    }
    
    updatePathAnalysis() {
        const pathsDiv = document.getElementById('paths-list');
        pathsDiv.innerHTML = '';
        
        const paths = [];
        
        // Generate all paths (sequences of ups and downs)
        for (let mask = 0; mask < Math.pow(2, this.T); mask++) {
            let path = [];
            let price = this.S0;
            let prob = 1;
            let probStar = 1;
            
            for (let step = 0; step < this.T; step++) {
                const isUp = (mask >> step) & 1;
                if (isUp) {
                    path.push('U');
                    price *= this.u;
                    prob *= this.pReal;
                    probStar *= this.pStar;
                } else {
                    path.push('D');
                    price *= this.d;
                    prob *= (1 - this.pReal);
                    probStar *= (1 - this.pStar);
                }
            }
            
            paths.push({
                path: path.join(''),
                finalPrice: price,
                prob: prob,
                probStar: probStar
            });
        }
        
        // Sort by final price
        paths.sort((a, b) => b.finalPrice - a.finalPrice);
        
        // Display paths
        paths.forEach((p, idx) => {
            const pathEl = document.createElement('div');
            pathEl.style.marginBottom = '4px';
            pathEl.innerHTML = `
                <strong>${p.path}</strong><br>
                Final: $${p.finalPrice.toFixed(2)}<br>
                P: ${(p.prob * 100).toFixed(1)}%, P*: ${(p.probStar * 100).toFixed(1)}%
            `;
            pathsDiv.appendChild(pathEl);
        });
    }
    
    priceOption() {
        if (!this.tree) {
            alert('Build tree first');
            return;
        }
        
        // Backward induction to compute option price
        const optionValues = {};
        
        // Terminal payoff
        for (let i = 0; i <= this.T; i++) {
            optionValues[`${this.T}_${i}`] = Math.max(this.tree[this.T][i] - this.K, 0);
        }
        
        // Backward induction
        const deltaT = 1;
        const discountFactor = Math.exp(-this.r * deltaT);
        
        for (let t = this.T - 1; t >= 0; t--) {
            for (let i = 0; i <= t; i++) {
                const valueUp = optionValues[`${t + 1}_${i}`];
                const valueDown = optionValues[`${t + 1}_${i + 1}`];
                
                const expectedValue = this.pStar * valueUp + (1 - this.pStar) * valueDown;
                optionValues[`${t}_${i}`] = discountFactor * expectedValue;
            }
        }
        
        const callPrice = optionValues['0_0'];
        document.getElementById('call-price').textContent = `$${callPrice.toFixed(2)}`;
        
        // Draw payoff chart
        this.drawPayoffChart();
    }
    
    drawPayoffChart() {
        const container = d3.select('#payoff-chart');
        container.html('');
        
        // Terminal payoffs
        const payoffs = [];
        for (let i = 0; i <= this.T; i++) {
            const price = this.tree[this.T][i];
            const payoff = Math.max(price - this.K, 0);
            payoffs.push({
                price: price,
                payoff: payoff,
                inTheMoney: price > this.K
            });
        }
        
        const maxPayoff = Math.max(...payoffs.map(p => p.payoff));
        const maxPrice = Math.max(...payoffs.map(p => p.price));
        
        const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        const width = 280 - margin.left - margin.right;
        const height = 280 - margin.top - margin.bottom;
        
        const svg = container.append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
        
        const xScale = d3.scaleLinear()
            .domain([0, maxPrice])
            .range([0, width]);
        
        const yScale = d3.scaleLinear()
            .domain([0, Math.max(maxPayoff, 10)])
            .range([height, 0]);
        
        // Draw bars
        svg.selectAll('.bar')
            .data(payoffs)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', (d, i) => (i / payoffs.length) * width + 5)
            .attr('y', d => yScale(d.payoff))
            .attr('width', width / payoffs.length - 10)
            .attr('height', d => height - yScale(d.payoff))
            .attr('fill', d => d.inTheMoney ? '#2ecc71' : '#e8e8e8');
        
        // Draw axes
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).ticks(3));
        
        svg.append('g')
            .call(d3.axisLeft(yScale).ticks(3));
        
        // Labels
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', height + 25)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .text('Stock Price');
        
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', -30)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .text('Call Payoff');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    new BinomialModelVisualizer();
});
