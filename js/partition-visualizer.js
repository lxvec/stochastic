class PartitionVisualizer {
    constructor() {
        this.svgWidth = 600;
        this.svgHeight = 400;
        this.margin = { top: 20, right: 20, bottom: 20, left: 20 };
        
        this.boxX = this.margin.left;
        this.boxY = this.margin.top;
        this.boxWidth = this.svgWidth - this.margin.left - this.margin.right;
        this.boxHeight = this.svgHeight - this.margin.top - this.margin.bottom;
        
        this.verticalLines = [];
        this.horizontalLines = [];
        this.isDragging = false;
        this.draggedLineIndex = null;
        this.draggedLineType = null;
        
        // Random variable storage: maps atom index to price value
        this.randomVariableValues = {};
        
        this.initialize();
    }
    
    initialize() {
        this.createSVG();
        this.setupButtonListeners();
        this.setupGlobalDragListeners();
        this.updateVisualization();
    }
    
    createSVG() {
        const container = d3.select('#visualization');
        container.html('');
        
        this.svg = container
            .append('svg')
            .attr('width', this.svgWidth)
            .attr('height', this.svgHeight);
        
        this.svg.append('rect')
            .attr('class', 'sample-space')
            .attr('x', this.boxX)
            .attr('y', this.boxY)
            .attr('width', this.boxWidth)
            .attr('height', this.boxHeight);
        
        this.linesGroup = this.svg.append('g').attr('class', 'lines-group');
    }
    
    setupButtonListeners() {
        const self = this;
        
        document.addEventListener('click', function(e) {
            if (e.target.id === 'add-vertical-btn') {
                self.addVerticalLine(self.boxWidth / 2);
            }
            if (e.target.id === 'add-horizontal-btn') {
                self.addHorizontalLine(self.boxHeight / 2);
            }
        });
    }
    
    setupGlobalDragListeners() {
        const self = this;
        
        const handleDragMove = function(clientX, clientY) {
            if (!self.isDragging) return;
            
            const rect = self.svg.node().getBoundingClientRect();
            
            const relativeX = clientX - rect.left;
            const relativeY = clientY - rect.top;
            
            if (self.draggedLineType === 'vertical') {
                let newX = relativeX - self.boxX;
                newX = Math.max(0, Math.min(self.boxWidth, newX));
                self.verticalLines[self.draggedLineIndex] = Math.round(newX);
                self.updateDraggedLineDisplay();
            } else if (self.draggedLineType === 'horizontal') {
                let newY = relativeY - self.boxY;
                newY = Math.max(0, Math.min(self.boxHeight, newY));
                self.horizontalLines[self.draggedLineIndex] = Math.round(newY);
                self.updateDraggedLineDisplay();
            }
        };
        
        const handleDragEnd = function() {
            if (self.isDragging) {
                self.isDragging = false;
                self.draggedLineIndex = null;
                self.draggedLineType = null;
                self.generateSigmaAlgebra();
                self.updateUI();
            }
        };
        
        // Mouse events
        document.addEventListener('mousemove', function(e) {
            handleDragMove(e.clientX, e.clientY);
        });
        
        document.addEventListener('mouseup', handleDragEnd);
        
        // Touch events for iPad/mobile
        document.addEventListener('touchmove', function(e) {
            if (self.isDragging) {
                e.preventDefault();
                const touch = e.touches[0];
                handleDragMove(touch.clientX, touch.clientY);
            }
        }, { passive: false });
        
        document.addEventListener('touchend', handleDragEnd);
    }
    
    addVerticalLine(x) {
        x = Math.round(x);
        const snappedX = Math.round(x / 10) * 10;
        
        if (snappedX > 10 && snappedX < this.boxWidth - 10) {
            const exists = this.verticalLines.some(existingX => Math.abs(existingX - snappedX) < 30);
            if (!exists) {
                this.verticalLines.push(snappedX);
                this.verticalLines.sort((a, b) => a - b);
                this.updateVisualization();
            }
        }
    }
    
    addHorizontalLine(y) {
        y = Math.round(y);
        const snappedY = Math.round(y / 10) * 10;
        
        if (snappedY > 10 && snappedY < this.boxHeight - 10) {
            const exists = this.horizontalLines.some(existingY => Math.abs(existingY - snappedY) < 30);
            if (!exists) {
                this.horizontalLines.push(snappedY);
                this.horizontalLines.sort((a, b) => a - b);
                this.updateVisualization();
            }
        }
    }
    
    startDrag(type, index) {
        this.isDragging = true;
        this.draggedLineType = type;
        this.draggedLineIndex = index;
    }
    
    updateDraggedLineDisplay() {
        if (this.draggedLineType === 'vertical') {
            const x = this.verticalLines[this.draggedLineIndex];
            const realX = this.boxX + x;
            
            this.linesGroup.selectAll(`.v-line-${this.draggedLineIndex}`)
                .attr('x1', realX)
                .attr('x2', realX);
                
            this.linesGroup.selectAll(`.v-area-${this.draggedLineIndex}`)
                .attr('x', realX - 12);
        } else if (this.draggedLineType === 'horizontal') {
            const y = this.horizontalLines[this.draggedLineIndex];
            const realY = this.boxY + y;
            
            this.linesGroup.selectAll(`.h-line-${this.draggedLineIndex}`)
                .attr('y1', realY)
                .attr('y2', realY);
                
            this.linesGroup.selectAll(`.h-area-${this.draggedLineIndex}`)
                .attr('y', realY - 12);
        }
        
        this.drawPartitionCells();
    }
    
    updateVisualization() {
        this.drawPartitionLines();
        this.drawPartitionCells();
        this.generateSigmaAlgebra();
        this.updateRandomVariableUI();
        this.updateUI();
    }
    
    drawPartitionCells() {
        const atoms = this.getPartitionAtoms();
        
        let cellsGroup = this.linesGroup.select('.cells-group');
        if (cellsGroup.empty()) {
            cellsGroup = this.linesGroup.insert('g', ':first-child').attr('class', 'cells-group');
        }
        cellsGroup.selectAll('*').remove();
        
        atoms.forEach((atom, index) => {
            const x = this.boxX + atom.x1;
            const y = this.boxY + atom.y1;
            const width = atom.x2 - atom.x1;
            const height = atom.y2 - atom.y1;
            
            cellsGroup.append('rect')
                .attr('class', 'partition-cell')
                .attr('x', x)
                .attr('y', y)
                .attr('width', width)
                .attr('height', height)
                .attr('fill', '#f5f5f5')
                .attr('opacity', 0.5)
                .attr('stroke', '#999')
                .attr('stroke-width', 1);
            
            cellsGroup.append('text')
                .attr('class', `partition-cell-label partition-cell-label-${index}`)
                .attr('x', x + width / 2)
                .attr('y', y + height / 2)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .attr('font-size', '14px')
                .attr('font-weight', 'bold')
                .attr('fill', '#333')
                .attr('pointer-events', 'none')
                .text(atom.label);
        });
    }
    
    drawPartitionLines() {
        this.linesGroup.selectAll('.partition-line').remove();
        this.linesGroup.selectAll('.partition-handle').remove();
        this.linesGroup.selectAll('.partition-handle-area').remove();
        
        this.verticalLines.forEach((x, index) => {
            const realX = this.boxX + x;
            
            this.linesGroup.append('rect')
                .attr('class', `partition-handle-area v-area-${index}`)
                .attr('x', realX - 12)
                .attr('y', this.boxY)
                .attr('width', 24)
                .attr('height', this.boxHeight)
                .attr('fill', 'transparent')
                .attr('cursor', 'col-resize')
                .attr('pointer-events', 'all')
                .on('mousedown', (event) => {
                    event.stopPropagation();
                    this.startDrag('vertical', index);
                })
                .on('touchstart', (event) => {
                    event.stopPropagation();
                    this.startDrag('vertical', index);
                })
                .on('contextmenu', (event) => {
                    event.preventDefault();
                    this.removeVerticalLine(index);
                });
            
            this.linesGroup.append('line')
                .attr('class', `partition-line v-line-${index}`)
                .attr('x1', realX)
                .attr('y1', this.boxY)
                .attr('x2', realX)
                .attr('y2', this.boxY + this.boxHeight)
                .attr('pointer-events', 'none');
        });
        
        this.horizontalLines.forEach((y, index) => {
            const realY = this.boxY + y;
            
            this.linesGroup.append('rect')
                .attr('class', `partition-handle-area h-area-${index}`)
                .attr('x', this.boxX)
                .attr('y', realY - 12)
                .attr('width', this.boxWidth)
                .attr('height', 24)
                .attr('fill', 'transparent')
                .attr('cursor', 'row-resize')
                .attr('pointer-events', 'all')
                .on('mousedown', (event) => {
                    event.stopPropagation();
                    this.startDrag('horizontal', index);
                })
                .on('touchstart', (event) => {
                    event.stopPropagation();
                    this.startDrag('horizontal', index);
                })
                .on('contextmenu', (event) => {
                    event.preventDefault();
                    this.removeHorizontalLine(index);
                });
            
            this.linesGroup.append('line')
                .attr('class', `partition-line h-line-${index}`)
                .attr('x1', this.boxX)
                .attr('y1', realY)
                .attr('x2', this.boxX + this.boxWidth)
                .attr('y2', realY)
                .attr('pointer-events', 'none');
        });
    }
    
    removeVerticalLine(index) {
        this.verticalLines.splice(index, 1);
        this.updateVisualization();
    }
    
    removeHorizontalLine(index) {
        this.horizontalLines.splice(index, 1);
        this.updateVisualization();
    }
    
    generateSigmaAlgebra() {
        const atoms = this.getPartitionAtoms();
        this.sigmaAlgebra = this.generateAllUnions(atoms);
    }
    
    getPartitionAtoms() {
        const atoms = [];
        const xPoints = [0, ...this.verticalLines, this.boxWidth].sort((a, b) => a - b);
        const yPoints = [0, ...this.horizontalLines, this.boxHeight].sort((a, b) => a - b);
        
        const uniqueX = [...new Set(xPoints)];
        const uniqueY = [...new Set(yPoints)];
        
        for (let i = 0; i < uniqueX.length - 1; i++) {
            for (let j = 0; j < uniqueY.length - 1; j++) {
                atoms.push({
                    id: atoms.length + 1,
                    x1: uniqueX[i],
                    x2: uniqueX[i + 1],
                    y1: uniqueY[j],
                    y2: uniqueY[j + 1],
                    label: `A${atoms.length + 1}`
                });
            }
        }
        
        return atoms;
    }
    
    generateAllUnions(atoms) {
        if (atoms.length === 0) {
            return [{ set: [], label: '∅' }];
        }
        
        const sigma = [];
        const numSubsets = Math.pow(2, atoms.length);
        
        for (let i = 0; i < numSubsets; i++) {
            const subset = [];
            const binaryStr = i.toString(2).padStart(atoms.length, '0');
            
            for (let j = 0; j < atoms.length; j++) {
                if (binaryStr[j] === '1') {
                    subset.push(atoms[j].label);
                }
            }
            
            if (subset.length === 0) {
                sigma.push({ set: [], label: '∅' });
            } else if (subset.length === atoms.length) {
                sigma.push({ set: subset, label: 'Ω' });
            } else {
                sigma.push({ set: subset, label: `{${subset.join(',')}}` });
            }
        }
        
        const seen = new Set();
        return sigma.filter(item => {
            const key = item.label;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }
    
    updateRandomVariableUI() {
        const atoms = this.getPartitionAtoms();
        const inputContainer = d3.select('#random-variable-inputs');
        inputContainer.html('');
        
        if (atoms.length === 0) {
            inputContainer.append('div')
                .attr('class', 'text-muted')
                .style('font-size', '13px')
                .text('Add partitions to define a random variable.');
            return;
        }
        
        atoms.forEach((atom, index) => {
            const itemDiv = inputContainer.append('div')
                .style('margin-bottom', '8px')
                .style('display', 'flex')
                .style('align-items', 'center')
                .style('gap', '8px');
            
            itemDiv.append('label')
                .style('margin', '0')
                .style('min-width', '40px')
                .style('font-weight', '500')
                .text(atom.label + ':');
            
            const input = itemDiv.append('input')
                .attr('type', 'number')
                .attr('class', 'form-control rv-input')
                .attr('data-atom-index', index)
                .style('flex', '1')
                .style('height', '32px')
                .style('font-size', '13px')
                .attr('placeholder', 'Enter price')
                .attr('value', this.randomVariableValues[index] || '');
            
            input.on('change', (e) => {
                const value = parseFloat(e.target.value);
                if (!isNaN(value)) {
                    this.randomVariableValues[index] = value;
                    this.updatePartitionCellLabels();
                }
            });
        });
    }
    
    updatePartitionCellLabels() {
        const atoms = this.getPartitionAtoms();
        const cellsGroup = this.linesGroup.select('.cells-group');
        
        atoms.forEach((atom, index) => {
            const priceValue = this.randomVariableValues[index];
            
            cellsGroup.selectAll(`.partition-cell-label-${index}`).remove();
            
            const x = this.boxX + atom.x1;
            const y = this.boxY + atom.y1;
            const width = atom.x2 - atom.x1;
            const height = atom.y2 - atom.y1;
            
            const labelGroup = cellsGroup.append('text')
                .attr('class', `partition-cell-label partition-cell-label-${index}`)
                .attr('x', x + width / 2)
                .attr('y', y + height / 2 - 8)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .attr('font-weight', 'bold')
                .attr('fill', '#333')
                .attr('pointer-events', 'none');
            
            labelGroup.append('tspan')
                .attr('x', x + width / 2)
                .attr('dy', '0')
                .attr('font-size', '14px')
                .text(atom.label);
            
            if (priceValue !== undefined && priceValue !== null) {
                labelGroup.append('tspan')
                    .attr('x', x + width / 2)
                    .attr('dy', '16px')
                    .attr('font-size', '12px')
                    .text(`S = ${priceValue}`);
            }
        });
    }
    
    updateUI() {
        const atoms = this.getPartitionAtoms();
        
        const atomsList = d3.select('#atoms-list');
        atomsList.html('');
        
        if (atoms.length === 0) {
            atomsList.append('div')
                .attr('class', 'atom-item empty-set')
                .text('No partitions yet. Click buttons to add lines.');
        } else {
            atoms.forEach((atom) => {
                atomsList.append('div')
                    .attr('class', 'atom-item')
                    .text(atom.label);
            });
        }
        
        const sigmaList = d3.select('#sigma-algebra-list');
        sigmaList.html('');
        
        if (this.sigmaAlgebra.length === 1) {
            sigmaList.append('div')
                .attr('class', 'sigma-element empty-set')
                .text('σ(Ω)');
        } else {
            this.sigmaAlgebra.forEach(item => {
                sigmaList.append('div')
                    .attr('class', 'sigma-element')
                    .text(item.label);
            });
        }
        
        d3.select('#cardinality').text(Math.pow(2, atoms.length));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PartitionVisualizer();
});
