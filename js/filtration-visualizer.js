class FiltrationVisualizer {
    constructor() {
        this.currentStep = 0;
        this.maxSteps = 4;
        this.timeline = [];
        this.speed = 2;
        this.isRunning = false;
        
        this.initialize();
    }
    
    initialize() {
        this.setupEventListeners();
        this.generateFiltrationSequence();
        this.renderTimeline();
        this.updateDisplay();
    }
    
    setupEventListeners() {
        const self = this;
        
        document.getElementById('next-step-btn').addEventListener('click', () => {
            self.nextStep();
        });
        
        document.getElementById('reset-filtration-btn').addEventListener('click', () => {
            self.reset();
        });
        
        document.getElementById('speed-slider').addEventListener('input', (e) => {
            self.speed = parseInt(e.target.value);
        });
    }
    
    generateFiltrationSequence() {
        // Generate a nested sequence of σ-algebras representing information revelation
        this.timeline = [];
        
        // Step 0: Trivial σ-algebra {∅, Ω}
        this.timeline.push({
            step: 0,
            name: 'F₀ (No information)',
            sigma: [
                { label: '∅', atoms: [] },
                { label: 'Ω', atoms: ['A₁', 'A₂', 'A₃', 'A₄'] }
            ],
            observation: 'Nothing observed yet',
            description: 'Only know sample space is partitioned in 4 atoms'
        });
        
        // Step 1: Partition by first observation X₁: up/down movement
        this.timeline.push({
            step: 1,
            name: 'F₁ = σ(X₁)',
            sigma: [
                { label: '∅', atoms: [] },
                { label: '{A₁, A₂}', atoms: ['A₁', 'A₂'], note: 'X₁ = Up' },
                { label: '{A₃, A₄}', atoms: ['A₃', 'A₄'], note: 'X₁ = Down' },
                { label: 'Ω', atoms: ['A₁', 'A₂', 'A₃', 'A₄'] }
            ],
            observation: 'Observe X₁ ∈ {Up, Down}',
            description: 'Can distinguish between Up and Down movements'
        });
        
        // Step 2: Further refinement with X₂
        this.timeline.push({
            step: 2,
            name: 'F₂ = σ(X₁, X₂)',
            sigma: [
                { label: '∅', atoms: [] },
                { label: '{A₁}', atoms: ['A₁'], note: 'UU' },
                { label: '{A₂}', atoms: ['A₂'], note: 'UD' },
                { label: '{A₃}', atoms: ['A₃'], note: 'DU' },
                { label: '{A₄}', atoms: ['A₄'], note: 'DD' },
                { label: '{A₁, A₂}', atoms: ['A₁', 'A₂'], note: 'Up first' },
                { label: '{A₃, A₄}', atoms: ['A₃', 'A₄'], note: 'Down first' },
                { label: 'Ω', atoms: ['A₁', 'A₂', 'A₃', 'A₄'] }
            ],
            observation: 'Observe X₂ (second movement)',
            description: 'Can distinguish all 4 possible 2-step paths'
        });
        
        // Step 3: Complete information
        this.timeline.push({
            step: 3,
            name: 'F₃ = σ(Ω)',
            sigma: this.generatePowerSet(['A₁', 'A₂', 'A₃', 'A₄']),
            observation: 'Complete path known',
            description: 'All information revealed, can distinguish any subset of atoms'
        });
    }
    
    generatePowerSet(atoms) {
        const sigma = [];
        const n = atoms.length;
        
        for (let i = 0; i < Math.pow(2, n); i++) {
            let subset = [];
            for (let j = 0; j < n; j++) {
                if ((i >> j) & 1) {
                    subset.push(atoms[j]);
                }
            }
            
            let label = '∅';
            if (subset.length === n) {
                label = 'Ω';
            } else if (subset.length > 0) {
                label = `{${subset.join(',')}}`;
            }
            
            sigma.push({ label: label, atoms: subset });
        }
        
        return sigma;
    }
    
    renderTimeline() {
        const timeline = d3.select('#filtration-timeline');
        timeline.html('');
        
        const svgWidth = 1200;
        const svgHeight = 450;
        const padding = 40;
        
        const svg = timeline.append('svg')
            .attr('width', svgWidth)
            .attr('height', svgHeight);
        
        const stepWidth = (svgWidth - 2 * padding) / this.maxSteps;
        const stepHeight = 200;
        const partitionY = 50;
        const boxSize = 40;
        
        // Draw steps
        for (let t = 0; t <= this.maxSteps; t++) {
            const x = padding + t * stepWidth;
            
            // Step label
            svg.append('text')
                .attr('x', x)
                .attr('y', 30)
                .attr('text-anchor', 'middle')
                .attr('font-weight', 'bold')
                .attr('font-size', '14px')
                .text(`t=${t}`);
            
            // Observation label
            const info = this.timeline[t];
            if (info) {
                svg.append('text')
                    .attr('x', x)
                    .attr('y', 420)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', '12px')
                    .attr('fill', '#666')
                    .text(info.observation);
            }
            
            // Draw partition visualization
            if (t === 0) {
                // One big box for t=0
                svg.append('rect')
                    .attr('x', x - boxSize / 2)
                    .attr('y', partitionY)
                    .attr('width', boxSize * 2)
                    .attr('height', boxSize * 2)
                    .attr('fill', '#e8f4f8')
                    .attr('stroke', '#3498db')
                    .attr('stroke-width', 2);
                
                svg.append('text')
                    .attr('x', x)
                    .attr('y', partitionY + boxSize + 5)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', '12px')
                    .attr('fill', '#333')
                    .text('Ω');
            } else if (t === 1) {
                // Two horizontal boxes
                svg.append('rect')
                    .attr('x', x - boxSize)
                    .attr('y', partitionY)
                    .attr('width', boxSize * 2)
                    .attr('height', boxSize)
                    .attr('fill', '#e8f4f8')
                    .attr('stroke', '#3498db')
                    .attr('stroke-width', 2);
                
                svg.append('rect')
                    .attr('x', x - boxSize)
                    .attr('y', partitionY + boxSize)
                    .attr('width', boxSize * 2)
                    .attr('height', boxSize)
                    .attr('fill', '#fce8e8')
                    .attr('stroke', '#e74c3c')
                    .attr('stroke-width', 2);
                
                svg.append('text')
                    .attr('x', x)
                    .attr('y', partitionY + boxSize / 2 + 5)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', '11px')
                    .text('Up');
                
                svg.append('text')
                    .attr('x', x)
                    .attr('y', partitionY + boxSize * 1.5 + 5)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', '11px')
                    .text('Down');
            } else if (t === 2) {
                // Four boxes in grid
                const colors = ['#a8d8f0', '#8cc9e8', '#ffd6d6', '#ffb8b8'];
                const labels = ['UU', 'UD', 'DU', 'DD'];
                
                for (let i = 0; i < 4; i++) {
                    const row = i % 2;
                    const col = Math.floor(i / 2);
                    
                    svg.append('rect')
                        .attr('x', x - boxSize + col * boxSize)
                        .attr('y', partitionY + row * boxSize)
                        .attr('width', boxSize)
                        .attr('height', boxSize)
                        .attr('fill', colors[i])
                        .attr('stroke', '#666')
                        .attr('stroke-width', 1);
                    
                    svg.append('text')
                        .attr('x', x - boxSize / 2 + col * boxSize)
                        .attr('y', partitionY + (row + 0.5) * boxSize + 4)
                        .attr('text-anchor', 'middle')
                        .attr('font-size', '10px')
                        .text(labels[i]);
                }
            } else if (t === 3) {
                // Fine grid showing many small atoms
                const gridSize = 8;
                for (let i = 0; i < gridSize; i++) {
                    for (let j = 0; j < gridSize; j++) {
                        svg.append('rect')
                            .attr('x', x - boxSize + (i / gridSize) * boxSize * 2)
                            .attr('y', partitionY + (j / gridSize) * boxSize * 2)
                            .attr('width', (boxSize * 2) / gridSize)
                            .attr('height', (boxSize * 2) / gridSize)
                            .attr('fill', '#f0f0f0')
                            .attr('stroke', '#ccc')
                            .attr('stroke-width', 0.5)
                            .attr('opacity', 0.7);
                    }
                }
                
                svg.append('text')
                    .attr('x', x)
                    .attr('y', partitionY + boxSize + 5)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', '10px')
                    .attr('fill', '#666')
                    .text('2¹⁶ sets');
            }
            
            // Arrow between steps
            if (t < this.maxSteps) {
                svg.append('line')
                    .attr('x1', x + stepWidth / 2 - 15)
                    .attr('y1', partitionY + boxSize + 20)
                    .attr('x2', x + stepWidth / 2 + 15)
                    .attr('y2', partitionY + boxSize + 20)
                    .attr('stroke', '#999')
                    .attr('stroke-width', 2)
                    .attr('marker-end', 'url(#arrowhead)');
            }
        }
        
        // Add arrowhead marker
        svg.append('defs').append('marker')
            .attr('id', 'arrowhead')
            .attr('markerWidth', 10)
            .attr('markerHeight', 10)
            .attr('refX', 9)
            .attr('refY', 3)
            .attr('orient', 'auto')
            .append('polygon')
            .attr('points', '0 0, 10 3, 0 6')
            .attr('fill', '#999');
    }
    
    updateDisplay() {
        const info = this.timeline[this.currentStep];
        
        // Update σ-algebra list
        const sigmaDiv = document.getElementById('current-sigma');
        sigmaDiv.innerHTML = '';
        
        info.sigma.forEach(set => {
            const setEl = document.createElement('div');
            setEl.className = 'sigma-element';
            setEl.innerHTML = `<strong>${set.label}</strong>`;
            if (set.note) {
                setEl.innerHTML += ` <small class="text-muted">(${set.note})</small>`;
            }
            sigmaDiv.appendChild(setEl);
        });
        
        document.getElementById('current-cardinality').textContent = info.sigma.length;
        
        // Update new information
        const newInfoDiv = document.getElementById('new-info');
        newInfoDiv.innerHTML = '';
        
        if (this.currentStep < this.maxSteps) {
            const nextInfo = this.timeline[this.currentStep + 1];
            
            nextInfo.sigma.forEach(set => {
                if (set.label !== '∅' && set.label !== 'Ω' && set.atoms.length > 0 && set.atoms.length < 4) {
                    const setEl = document.createElement('div');
                    setEl.className = 'sigma-element';
                    setEl.innerHTML = `<strong>${set.label}</strong>`;
                    if (set.note) {
                        setEl.innerHTML += ` <small class="text-muted">(${set.note})</small>`;
                    }
                    newInfoDiv.appendChild(setEl);
                }
            });
            
            document.getElementById('new-cardinality').textContent = nextInfo.sigma.length;
        }
        
        // Highlight current step in timeline
        d3.selectAll('.timeline-step-box').style('stroke', '#999').style('stroke-width', 1);
    }
    
    nextStep() {
        if (this.currentStep < this.maxSteps) {
            this.currentStep++;
            this.updateDisplay();
        }
    }
    
    reset() {
        this.currentStep = 0;
        this.updateDisplay();
    }
}

// Initialize visualizer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new FiltrationVisualizer();
});
