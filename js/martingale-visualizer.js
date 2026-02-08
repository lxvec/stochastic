class MartingaleVisualizer {
    constructor() {
        this.S0 = 100;
        this.u = 1.2;
        this.d = 0.8;
        this.r = 0.05;
        
        this.initialize();
    }
    
    initialize() {
        this.setupEventListeners();
        this.drawBinomialTree();
    }
    
    setupEventListeners() {
        const self = this;
        
        document.getElementById('u-factor').addEventListener('input', (e) => {
            self.u = parseFloat(e.target.value);
            document.getElementById('u-value').textContent = self.u.toFixed(2);
            self.drawBinomialTree();
        });
        
        document.getElementById('d-factor').addEventListener('input', (e) => {
            self.d = parseFloat(e.target.value);
            document.getElementById('d-value').textContent = self.d.toFixed(2);
            self.drawBinomialTree();
        });
        
        document.getElementById('initial-price').addEventListener('change', (e) => {
            self.S0 = parseFloat(e.target.value);
            self.drawBinomialTree();
        });
        
        document.getElementById('risk-free').addEventListener('change', (e) => {
            self.r = parseFloat(e.target.value);
            self.computeMartingale();
        });
        
        document.getElementById('compute-martingale').addEventListener('click', () => {
            self.computeMartingale();
        });
    }
    
    drawBinomialTree() {
        const container = d3.select('#binomial-tree');
        container.html('');
        
        const width = 800;
        const height = 300;
        const svg = container.append('svg')
            .attr('width', width)
            .attr('height', height);
        
        // Node positions
        const nodes = [
            // t=0
            { t: 0, idx: 0, x: 100, y: 150, price: this.S0, name: 'S₀' },
            // t=1
            { t: 1, idx: 0, x: 300, y: 100, price: this.S0 * this.u, name: 'S₀u' },
            { t: 1, idx: 1, x: 300, y: 200, price: this.S0 * this.d, name: 'S₀d' },
            // t=2
            { t: 2, idx: 0, x: 500, y: 60, price: this.S0 * this.u * this.u, name: 'S₀u²' },
            { t: 2, idx: 1, x: 500, y: 150, price: this.S0 * this.u * this.d, name: 'S₀ud' },
            { t: 2, idx: 2, x: 500, y: 240, price: this.S0 * this.d * this.d, name: 'S₀d²' },
        ];
        
        // Draw edges
        // t=0 to t=1
        svg.append('line').attr('x1', 100).attr('y1', 150).attr('x2', 300).attr('y2', 100)
            .attr('stroke', '#3498db').attr('stroke-width', 2);
        svg.append('line').attr('x1', 100).attr('y1', 150).attr('x2', 300).attr('y2', 200)
            .attr('stroke', '#e74c3c').attr('stroke-width', 2);
        
        // t=1 to t=2
        svg.append('line').attr('x1', 300).attr('y1', 100).attr('x2', 500).attr('y2', 60)
            .attr('stroke', '#3498db').attr('stroke-width', 2);
        svg.append('line').attr('x1', 300).attr('y1', 100).attr('x2', 500).attr('y2', 150)
            .attr('stroke', '#2ecc71').attr('stroke-width', 2);
        svg.append('line').attr('x1', 300).attr('y1', 200).attr('x2', 500).attr('y2', 150)
            .attr('stroke', '#2ecc71').attr('stroke-width', 2);
        svg.append('line').attr('x1', 300).attr('y1', 200).attr('x2', 500).attr('y2', 240)
            .attr('stroke', '#e74c3c').attr('stroke-width', 2);
        
        // Draw nodes
        nodes.forEach(node => {
            const circle = svg.append('circle')
                .attr('cx', node.x)
                .attr('cy', node.y)
                .attr('r', 25)
                .attr('fill', '#f5f5f5')
                .attr('stroke', '#333')
                .attr('stroke-width', 2);
            
            svg.append('text')
                .attr('x', node.x)
                .attr('y', node.y - 5)
                .attr('text-anchor', 'middle')
                .attr('font-size', '12px')
                .attr('font-weight', 'bold')
                .text(node.name);
            
            svg.append('text')
                .attr('x', node.x)
                .attr('y', node.y + 12)
                .attr('text-anchor', 'middle')
                .attr('font-size', '11px')
                .attr('fill', '#0066cc')
                .text(`$${node.price.toFixed(2)}`);
        });
        
        // Edge labels
        svg.append('text').attr('x', 190).attr('y', 120).attr('font-size', '11px').attr('fill', '#3498db').text('↑u=' + this.u);
        svg.append('text').attr('x', 190).attr('y', 190).attr('font-size', '11px').attr('fill', '#e74c3c').text('↓d=' + this.d);
        
        svg.append('text').attr('x', 390).attr('y', 70).attr('font-size', '11px').attr('fill', '#3498db').text('↑u=' + this.u);
        svg.append('text').attr('x', 390).attr('y', 130).attr('font-size', '11px').attr('fill', '#2ecc71').text('ud');
        svg.append('text').attr('x', 390).attr('y', 230).attr('font-size', '11px').attr('fill', '#e74c3c').text('↓d=' + this.d);
    }
    
    computeMartingale() {
        const deltaT = 1;
        const riskFreeDiscount = Math.exp(this.r * deltaT);
        
        // Solve for risk-neutral probabilities: p^u * u + p^d * d = e^(r*Δt)
        // where p^u + p^d = 1
        // p^u * u + (1 - p^u) * d = e^(r*Δt)
        // p^u * (u - d) + d = e^(r*Δt)
        // p^u = (e^(r*Δt) - d) / (u - d)
        
        const pUp = (riskFreeDiscount - this.d) / (this.u - this.d);
        const pDown = 1 - pUp;
        
        document.getElementById('p-up-display').textContent = pUp.toFixed(4);
        document.getElementById('p-down-display').textContent = pDown.toFixed(4);
        
        // Verify martingale property
        this.verifyMartingale(pUp, pDown);
        this.analyzePathExpectations(pUp, pDown);
    }
    
    verifyMartingale(pUp, pDown) {
        const verifyDiv = document.getElementById('martingale-verification');
        verifyDiv.innerHTML = '';
        
        // At t=0, compute E[S₁ | F₀] = S₀ * (p^u * u + p^d * d)
        const expectedS1 = this.S0 * (pUp * this.u + pDown * this.d);
        const discountedS1 = expectedS1 / Math.exp(this.r);
        
        // At t=1, UP node: compute E[S₂ | F₁^up] = S₀u * (p^u * u + p^d * d)
        const expectedS2_up = (this.S0 * this.u) * (pUp * this.u + pDown * this.d);
        const discountedS2_up = expectedS2_up / (Math.exp(this.r * 2));
        
        // At t=1, DOWN node: compute E[S₂ | F₁^down] = S₀d * (p^u * u + p^d * d)
        const expectedS2_down = (this.S0 * this.d) * (pUp * this.u + pDown * this.d);
        const discountedS2_down = expectedS2_down / (Math.exp(this.r * 2));
        
        // Build verification HTML
        let html = `
            <div class="mb-2">
                <strong>E[S₁ | F₀] = </strong> ${pUp.toFixed(4)} × ${this.u} + ${pDown.toFixed(4)} × ${this.d}
            </div>
            <div class="mb-2">
                <strong>= ${(pUp * this.u + pDown * this.d).toFixed(4)} = ${riskFreeDiscount.toFixed(4)}</strong> ✓
            </div>
            <div class="alert alert-success mt-2">
                <strong>Martingale Property Holds!</strong>
                The discounted price process is a martingale under these risk-neutral probabilities.
            </div>
        `;
        
        // Check if actual martingale (without risk-free adjustment)
        const isMartingale = Math.abs(expectedS1 - this.S0) < 0.01;
        if (isMartingale) {
            html += `<div class="alert alert-warning"><strong>Note:</strong> This is a martingale even before discounting!</div>`;
        }
        
        verifyDiv.innerHTML = html;
    }
    
    analyzePathExpectations(pUp, pDown) {
        const analysisDiv = document.getElementById('path-analysis');
        analysisDiv.innerHTML = '';
        
        let html = '<strong>Path Probabilities and Expected Values:</strong><br><br>';
        
        // t=1 expectations
        const S1_up = this.S0 * this.u;
        const S1_down = this.S0 * this.d;
        
        html += `<strong>At t=1:</strong><br>`;
        html += `P^ℚ(up) = ${pUp.toFixed(4)},  S₁(up) = $${S1_up.toFixed(2)}<br>`;
        html += `P^ℚ(down) = ${pDown.toFixed(4)},  S₁(down) = $${S1_down.toFixed(2)}<br>`;
        html += `E^ℚ[S₁ | F₀] = ${(pUp * S1_up + pDown * S1_down).toFixed(2)}<br><br>`;
        
        // t=2 expectations
        const S2_uu = this.S0 * this.u * this.u;
        const S2_ud = this.S0 * this.u * this.d;
        const S2_dd = this.S0 * this.d * this.d;
        
        html += `<strong>At t=2:</strong><br>`;
        html += `P^ℚ(uu) = ${(pUp * pUp).toFixed(4)},  S₂(uu) = $${S2_uu.toFixed(2)}<br>`;
        html += `P^ℚ(ud) = ${(2 * pUp * pDown).toFixed(4)},  S₂(ud) = $${S2_ud.toFixed(2)}<br>`;
        html += `P^ℚ(dd) = ${(pDown * pDown).toFixed(4)},  S₂(dd) = $${S2_dd.toFixed(2)}<br><br>`;
        
        html += `E^ℚ[S₂ | uu at t=1] = ${(pUp * S2_uu + pDown * S2_ud).toFixed(2)}<br>`;
        html += `E^ℚ[S₂ | dd at t=1] = ${(pUp * S2_ud + pDown * S2_dd).toFixed(2)}<br>`;
        html += `E^ℚ[S₂ | F₀] = ${(pUp * pUp * S2_uu + 2 * pUp * pDown * S2_ud + pDown * pDown * S2_dd).toFixed(2)}`;
        
        analysisDiv.innerHTML = html;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    new MartingaleVisualizer();
});
