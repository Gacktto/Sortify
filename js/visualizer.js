import { ALGO_CONFIG } from './config.js';
import state from './state.js';
import { CODE_SNIPPETS } from './code-snippets.js';
import { uiElements } from './ui.js';

export class Visualizer {
    constructor(sortType, visualizersArea) {
        this.sortType = sortType;
        this.config = ALGO_CONFIG[sortType];
        this.array = [];
        this.bars = [];
        this.progressCounter = 0;
        this.isSorted = false;
        this.completionTime = null;
        this.comparisons = 0;
        this.accesses = 0;
        this.auxiliaryMemory = 0;

        const card = document.createElement('div');
        card.className = 'visualizer-card';
        card.id = `viz-${sortType}`;

        card.innerHTML = `
            <div class="card-header">
                <h3>${this.config.name}</h3>
                <button class="toggle-code-btn">Ver Código</button>
            </div>
            <div class="bars-container"></div>

            <div class="aux-visualizer-container"></div>
            
            <div class="card-legend">
              <div class="legend-item">
                <span class="legend-color-swatch" style="background-color: var(--text-main);"></span>
                <span class="legend-label">Padrão</span>
              </div>
              <div class="legend-item">
                <span class="legend-color-swatch" style="background-color: var(--comparison-color);"></span>
                <span class="legend-label">Comparando</span>
              </div>
              <div class="legend-item">
                <span class="legend-color-swatch" style="background-color: var(--movement-color);"></span>
                <span class="legend-label">Movendo</span>
              </div>
              <div class="legend-item">
                <span class="legend-color-swatch" style="background-color: var(--pivot-color);"></span><span class="legend-label">Pivô</span>
              </div>
              <div class="legend-item">
                <span class="legend-color-swatch" style="background-color: ${this.config.color};"></span>
                <span class="legend-label">Ordenado</span>
              </div>
            </div>

            <div class="stats-display">
                <span>Comparações: <span class="stats-comparisons">0</span></span>
                <span>Acessos: <span class="stats-accesses">0</span></span>
            </div>
            <div class="memory-usage-container">
                <div class="memory-usage-label">Memória Auxiliar: <span>0</span></div>
                <div class="memory-usage-bar-wrapper">
                    <div class="memory-usage-bar"></div>
                </div>
            </div>
            <div class="progress-container"><div class="progress-bar" style="background-color: ${this.config.color};"></div></div>
            <div class="status-box">Pronto</div>`;
        
        visualizersArea.appendChild(card);

        this.cardElement = card;
        this.barsContainer = card.querySelector('.bars-container');
        this.auxContainer = card.querySelector('.aux-visualizer-container');
        this.progressBar = card.querySelector('.progress-bar');
        this.statusBox = card.querySelector('.status-box');
        this.comparisonsEl = card.querySelector('.stats-comparisons');
        this.accessesEl = card.querySelector('.stats-accesses');
        this.memoryUsageBar = card.querySelector('.memory-usage-bar');
        this.memoryUsageContainer = card.querySelector('.memory-usage-container');

        if (this.config.properties.inPlace) {
            this.memoryUsageContainer.style.display = 'none';
        }

        if (this.sortType !== 'heap' && this.sortType !== 'merge') {
            this.auxContainer.remove();
        }

        this.cardElement.querySelector('.toggle-code-btn').addEventListener('click', () => {
            uiElements.codeViewerContainer.classList.toggle('hidden');
            uiElements.visualizersArea.classList.toggle('code-visible');
        });
    }

    highlightLine(lineNumber) {
        const codeContainer = uiElements.codeViewerContainer;
        const preElement = codeContainer.querySelector('pre');

        preElement.querySelectorAll('.line-highlight').forEach(el => {
            el.classList.remove('line-highlight');
        });

        const lineElement = preElement.querySelector(`.token.line:nth-child(${lineNumber})`);
        if (lineElement) {
            lineElement.classList.add('line-highlight');
        }
    }

    updateMemoryUsage(auxiliarySize) {

        this.auxiliaryMemory = auxiliarySize;
        const totalMemory = this.array.length + this.auxiliaryMemory;
        const percentage = totalMemory > 0 ? (this.auxiliaryMemory / totalMemory) * 100 : 0;
        this.memoryUsageBar.style.width = `${percentage}%`;
        this.memoryUsageContainer.querySelector('.memory-usage-label span').textContent = `${this.auxiliaryMemory}`;
    }

    setData(data) {
        this.array = [...data];
        this.isSorted = false;
        this.progressCounter = 0;
        this.completionTime = null;
        this.comparisons = 0;
        this.accesses = 0;
        this.auxiliaryMemory = 0;
        
        this.maxHeight = Math.max(...data, 1);

        this.comparisonsEl.textContent = '0';
        this.accessesEl.textContent = '0';
        this.barsContainer.innerHTML = '';
        
        this.array.forEach(value => {
            const bar = document.createElement('div');
            bar.className = 'bar';
            bar.style.height = `${(value / this.maxHeight) * 100}%`;
            this.barsContainer.appendChild(bar);
        });
        this.bars = Array.from(this.barsContainer.children);
        this.updateStatus('Pronto');
        this.updateProgress(0, 1);
        this.updateMemoryUsage(0);
        this.cardElement.classList.remove('winner-card', 'loser-card');
    }

    incrementComparisons(count = 1) { 
        this.comparisons += count; this.comparisonsEl.textContent = this.comparisons.toLocaleString('pt-BR');
    }

    incrementAccesses(count = 1) { 
        this.accesses += count; this.accessesEl.textContent = this.accesses.toLocaleString('pt-BR'); 
    }

    updateStatus(text) { 
        this.statusBox.innerText = text; 
    }

    updateProgress(completed, total) { 
        if (total > 0) this.progressBar.style.width = `${Math.min(100, (completed / total) * 100)}%`; 
    }

    highlight(color, ...indices) { 
        indices.forEach(i => { if (this.bars[i]) this.bars[i].style.backgroundColor = color; }); 
    }

    unhighlight(...indices) { 
        indices.forEach(i => { 
            if (this.bars[i]) this.bars[i].style.backgroundColor = this.isSorted || this.bars[i].classList.contains('sorted') ? this.config.color : 'var(--text-main)'; 
        }); 
    }
    
    async swap(i, j) {
        if (i === j) return;
        this.incrementAccesses(2);
        [this.array[i], this.array[j]] = [this.array[j], this.array[i]];
        [this.bars[i].style.height, this.bars[j].style.height] = [this.bars[j].style.height, this.bars[i].style.height];
    }

    markBarSorted(...indices) { 
        indices.forEach(i => { 
            if (this.bars[i]) { this.bars[i].classList.add('sorted'); this.bars[i].style.backgroundColor = this.config.color; } 
        }); 
    }

    markAllSorted() { 
        this.isSorted = true; this.bars.forEach(b => b.style.backgroundColor = this.config.color); this.updateProgress(1, 1); 
    }

    destroy() { 
        if (this.cardElement) this.cardElement.remove(); 
    }

    redrawAllBars() { 
        const maxHeight = Math.max(...this.array, 1); this.array.forEach((value, i) => { 
            if (this.bars[i]) this.bars[i].style.height = `${(value / maxHeight) * 100}%`; 
        }); 
    }

    async run(algorithms) {
        this.isSorted = false;
        this.updateStatus('Ordenando...');
        const sortFunction = algorithms[this.sortType];
        
        if (sortFunction) {
            if (this.sortType === 'quick') {
                await sortFunction(this, state.pivotStrategy);
            } else {
                await sortFunction(this);
            }
        }
        
        if (!state.stopSignal) {
            this.completionTime = (Date.now() - state.globalStartTime) / 1000;
            this.markAllSorted();
            this.updateStatus(`Concluído!`);
            return {
                viz: this,
                time: this.completionTime,
                type: this.sortType,
                comparisons: this.comparisons,
                accesses: this.accesses
            };
        } else {
            this.updateStatus('Interrompido.');
            return null;
        }
    }
}