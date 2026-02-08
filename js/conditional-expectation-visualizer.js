class ConditionalExpectationVisualizer extends PartitionVisualizer {
    constructor() {
        super();
        this.computeConditionalExpectations();
    }
    
    updateUI() {
        super.updateUI();
        this.computeConditionalExpectations();
        this.updateConditionalExpectationDisplay();
        this.updateXValueDisplay();
    }
    
    computeConditionalExpectations() {
        const atoms = this.getPartitionAtoms();
        this.conditionalExpectations = {};
        
        atoms.forEach((atom, index) => {
            const value = this.randomVariableValues[index];
            if (value !== undefined) {
                this.conditionalExpectations[atom.label] = value;
            }
        });
    }
    
    updateConditionalExpectationDisplay() {
        const atoms = this.getPartitionAtoms();
        const condExpDiv = document.getElementById('conditional-expectations');
        condExpDiv.innerHTML = '';
        
        if (atoms.length === 0) {
            condExpDiv.innerHTML = '<div class="text-muted text-center py-3">Add partitions to compute E[X | F]</div>';
            return;
        }
        
        // Group atoms by their conditional expectation value
        const grouped = {};
        atoms.forEach((atom, index) => {
            const value = this.randomVariableValues[index];
            if (value !== undefined) {
                if (!grouped[value]) {
                    grouped[value] = [];
                }
                grouped[value].push(atom.label);
            }
        });
        
        let hasGroups = false;
        Object.entries(grouped).forEach(([value, atomLabels]) => {
            if (atomLabels.length > 0) {
                hasGroups = true;
                const groupEl = document.createElement('div');
                groupEl.className = 'card mb-2';
                groupEl.innerHTML = `
                    <div class="card-body p-2">
                        <div style="font-size: 12px; color: #666;">On atoms: ${atomLabels.join(', ')}</div>
                        <div style="font-size: 14px; font-weight: bold; color: #0066cc;">
                            E[X | F] = ${parseFloat(value).toFixed(2)}
                        </div>
                    </div>
                `;
                condExpDiv.appendChild(groupEl);
            }
        });
        
        if (!hasGroups) {
            condExpDiv.innerHTML = '<div class="text-muted text-center py-3">Assign values to atoms above</div>';
        }
    }
    
    updateXValueDisplay() {
        const atoms = this.getPartitionAtoms();
        const xDiv = document.getElementById('x-values');
        xDiv.innerHTML = '';
        
        let totalValue = 0;
        let count = 0;
        
        atoms.forEach((atom, index) => {
            const value = this.randomVariableValues[index];
            if (value !== undefined && value !== null) {
                totalValue += parseFloat(value);
                count++;
                
                const itemDiv = document.createElement('div');
                itemDiv.className = 'atom-item';
                itemDiv.innerHTML = `<strong>${atom.label}:</strong> X = ${parseFloat(value).toFixed(2)}`;
                xDiv.appendChild(itemDiv);
            }
        });
        
        const expectedValue = count > 0 ? (totalValue / count).toFixed(2) : '-';
        document.getElementById('expected-value').textContent = expectedValue;
        
        if (count === 0) {
            xDiv.innerHTML = '<div class="text-muted text-center py-3">Assign values to atoms</div>';
        }
    }
}

// Initialize visualizer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ConditionalExpectationVisualizer();
});
