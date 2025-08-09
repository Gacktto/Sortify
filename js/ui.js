import { ALGO_CONFIG } from './config.js';
import state from './state.js';

export const uiElements = {
    mainContent: document.getElementById('main-content'),
    visualizersArea: document.getElementById('visualizers-area'),
    scoreboardList: document.getElementById('scoreboard-list'),
    scoreboardTitle: document.getElementById('scoreboard-title'),
    playBtn: document.getElementById('play-btn'),
    pauseBtn: document.getElementById('pause-btn'),
    nextStepBtn: document.getElementById('next-step-btn'),
    resetBtn: document.getElementById('reset-btn'),
    sizeSlider: document.getElementById('size-slider'),
    sizeLabel: document.getElementById('size-label'),
    speedSlider: document.getElementById('speed-slider'),
    speedLabel: document.getElementById('speed-label'),
    scenarioSelect: document.getElementById('scenario-select'),
    leftSidebar: document.getElementById('left-sidebar'),
    rightSidebar: document.getElementById('right-sidebar'),
    hideUiBtn: document.getElementById('hide-ui-btn'),
    algoSelectionArea: document.getElementById('algorithms-selection-area'),
    modeSwitcherContainer: document.getElementById('mode-switcher-container'),
    executionModeSwitcher: document.getElementById('execution-mode-switcher'),
    qsVariantGroup: document.getElementById('qs-variant-group'),
    qsVariantSelect: document.getElementById('qs-variant-select'),
    benchmarkModal: document.getElementById('benchmark-modal'),
    benchmarkModalClose: document.getElementById('benchmark-modal-close'),
    benchmarkResultsContainer: document.getElementById('benchmark-results-container'),
    benchmarkSummaryTitle: document.getElementById('benchmark-summary-title'),
    benchmarkSummaryStats: document.getElementById('benchmark-summary-stats'),
    floatingControlsContainer: document.getElementById('floating-controls-container'),
    floatingPlayBtn: document.getElementById('floating-play-btn'),
    floatingPauseBtn: document.getElementById('floating-pause-btn'),
    floatingNextStepBtn: document.getElementById('floating-next-step-btn'),
    floatingResetBtn: document.getElementById('floating-reset-btn'),
    floatingSizeSlider: document.getElementById('floating-size-slider'),
    floatingSizeLabel: document.getElementById('floating-size-label'),
    floatingSpeedSlider: document.getElementById('floating-speed-slider'),
    floatingSpeedLabel: document.getElementById('floating-speed-label'),
    codeViewerContainer: document.getElementById('code-viewer-container'),
};

export function handleRacerFinish(result, finishedRacers) {
    finishedRacers.push(result);
    if (finishedRacers.length === 1) {
        uiElements.rightSidebar.classList.remove('initial-hidden');
    }
    finishedRacers.sort((a, b) => a.time - b.time);

    uiElements.scoreboardTitle.textContent = "Resultado da Corrida";
    uiElements.scoreboardList.innerHTML = '';
    
    const clockIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
    const compareIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><path d="M3 12v2a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4v-2"/><line x1="12" y1="6" x2="12" y2="18"/></svg>`;
    const accessIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17l5-5-5-5"/><path d="M12 17l5-5-5-5"/></svg>`;

    finishedRacers.forEach((racer, index) => {
        const rank = index + 1;
        const li = document.createElement('li');
        li.className = 'scoreboard-item';

        if (rank === 1) {
            li.classList.add('winner');
        }
        
        li.innerHTML = `
            <div class="scoreboard-rank">
                <span>#${rank}</span>
                ${rank === 1 ? '<span class="winner-icon">🏆</span>' : ''}
            </div>
            <div class="scoreboard-details">
                <div class="scoreboard-main-info">
                    <span class="scoreboard-name">${racer.viz.config.name}</span>
                    <span class="scoreboard-time">${clockIcon} ${racer.time.toFixed(3)}s</span>
                </div>
                <div class="scoreboard-sub-stats">
                    <span>${compareIcon} ${racer.comparisons.toLocaleString('pt-BR')} comp.</span>
                    <span>${accessIcon} ${racer.accesses.toLocaleString('pt-BR')} acessos</span>
                </div>
            </div>
        `;
        uiElements.scoreboardList.appendChild(li);
    });
}

export function updateBenchmarkScoreboard(winnerViz, results) {
    uiElements.rightSidebar.classList.remove('initial-hidden', 'collapsed');
    uiElements.scoreboardList.innerHTML = '';

    const clockIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
    const compareIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><path d="M3 12v2a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4v-2"/><line x1="12" y1="6" x2="12" y2="18"/></svg>`;
    const accessIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17l5-5-5-5"/><path d="M12 17l5-5-5-5"/></svg>`;

    results.forEach((res, index) => {
        const rank = index + 1;
        const li = document.createElement('li');
        li.className = 'scoreboard-item';

        if (rank === 1) {
            li.classList.add('winner');
        }
        
        li.innerHTML = `
            <div class="scoreboard-rank">
                <span>#${rank}</span>
                ${rank === 1 ? '<span class="winner-icon">🏆</span>' : ''}
            </div>
            <div class="scoreboard-details">
                <div class="scoreboard-main-info">
                    <span class="scoreboard-name">${res.viz.config.name}</span>
                    <span class="scoreboard-time">${clockIcon} ${res.time.toFixed(3)}s</span>
                </div>
                <div class="scoreboard-sub-stats">
                    <span>${compareIcon} ${res.comparisons.toLocaleString('pt-BR')} comp.</span>
                    <span>${accessIcon} ${res.accesses.toLocaleString('pt-BR')} acessos</span>
                </div>
            </div>
        `;
        
        uiElements.scoreboardList.appendChild(li);

        const isWinnerOfRound = winnerViz ? res.viz === winnerViz : true;
        if (isWinnerOfRound) {
            res.viz.cardElement.classList.add('winner-card');
        } else {
            res.viz.cardElement.classList.add('loser-card');
        }
    });
}

function createOrUpdateChart(canvasId, chartVar, label, labels, data, colors, textColor) {
    if (state.charts[chartVar]) state.charts[chartVar].destroy();
    const ctx = document.getElementById(canvasId).getContext('2d');
    state.charts[chartVar] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                backgroundColor: colors,
                borderWidth: 0
            }]
        },
        options: {
            indexAxis: 'y',
            scales: {
                x: { beginAtZero: true, ticks: { color: textColor }, grid: { color: 'rgba(114, 117, 126, 0.3)' } },
                y: { ticks: { color: textColor }, grid: { display: false } }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

let lastReportData = null;

export function getLastReportData() {
    return lastReportData;
}

export function exportToCSV(headers, data, fileName) {
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function exportToJSON(data, fileName) {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function showReportModal(title, data, mode, summaryText = '') {
    lastReportData = data;

    uiElements.benchmarkSummaryTitle.innerText = title;
    uiElements.benchmarkSummaryStats.innerHTML = `<p>${summaryText}</p>`;

    const exportMenu = document.getElementById('export-menu-container');
    if (mode === 'benchmark') {
        exportMenu.style.display = 'block';
    } else {
        exportMenu.style.display = 'none';
    }
    
    let tableHTML = '';
    const chartLabels = [];
    const chartColors = [];
    const timeData = [];
    const comparisonsData = [];
    const accessesData = [];

    if (mode === 'benchmark') {
        const aggregatedStats = {};

        data.forEach(round => {
            round.results.forEach(res => {
                if (!aggregatedStats[res.type]) {
                    aggregatedStats[res.type] = {
                        name: res.viz.config.name,
                        color: res.viz.config.color,
                        runs: 0,
                        time: 0,
                        comparisons: 0,
                        accesses: 0,
                    };
                }
                const stats = aggregatedStats[res.type];
                stats.runs++;
                stats.time += res.time;
                stats.comparisons += res.comparisons;
                stats.accesses += res.accesses;
            });
        });

        tableHTML = `<h3 style="color: var(--text-headline);">Resultados Agregados (Médias)</h3>
                     <table class="results-table">
                        <tr><th>Algoritmo</th><th>Tempo Médio (s)</th><th>Comparações Médias</th><th>Acessos Médios</th></tr>`;
        
        const sortedAggregate = Object.values(aggregatedStats).sort((a, b) => (a.time / a.runs) - (b.time / b.runs));

        sortedAggregate.forEach(stats => {
            const avgTime = stats.time / stats.runs;
            const avgComparisons = stats.comparisons / stats.runs;
            const avgAccesses = stats.accesses / stats.runs;

            tableHTML += `<tr>
                <td>${stats.name}</td>
                <td class="winner">${avgTime.toFixed(3)}s</td>
                <td>${Math.round(avgComparisons).toLocaleString('pt-BR')}</td>
                <td>${Math.round(avgAccesses).toLocaleString('pt-BR')}</td>
            </tr>`;
            
            chartLabels.push(stats.name);
            chartColors.push(stats.color);
            timeData.push(avgTime);
            comparisonsData.push(avgComparisons);
            accessesData.push(avgAccesses);
        });
        tableHTML += `</table>`;

        tableHTML += `<h3 style="color: var(--text-headline); margin-top: 2rem;">Log Detalhado das Rodadas</h3>`;
        data.forEach(round => {
            tableHTML += `<div style="margin-bottom: 1rem;"><strong>Rodada: ${round.round}</strong></div>
                          <table class="results-table">
                            <tr><th>Algoritmo</th><th>Tempo (s)</th><th>Comparações</th><th>Acessos</th></tr>`;
            round.results.sort((a,b) => a.time - b.time).forEach(res => {
                 tableHTML += `<tr>
                    <td>${res.viz.config.name}</td>
                    <td>${res.time.toFixed(3)}s</td>
                    <td>${res.comparisons.toLocaleString('pt-BR')}</td>
                    <td>${res.accesses.toLocaleString('pt-BR')}</td>
                </tr>`;
            });
            tableHTML += `</table>`;
        });

    } else {
        tableHTML = `<table class="results-table">
                        <tr><th>Algoritmo</th><th>Tempo (s)</th><th>Comparações</th><th>Acessos</th></tr>`;
        
        data.forEach(run => {
            tableHTML += `<tr>
                <td>${run.viz.config.name}</td>
                <td class="winner">${run.time.toFixed(3)}s</td>
                <td>${run.comparisons.toLocaleString('pt-BR')}</td>
                <td>${run.accesses.toLocaleString('pt-BR')}</td>
            </tr>`;

            chartLabels.push(run.viz.config.name);
            chartColors.push(run.viz.config.color);
            timeData.push(run.time);
            comparisonsData.push(run.comparisons);
            accessesData.push(run.accesses);
        });
        tableHTML += `</table>`;
    }

    uiElements.benchmarkResultsContainer.innerHTML = tableHTML;
    
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-main');
    createOrUpdateChart('timeChart', 'timeChart', 'Tempo (s)', chartLabels, timeData, chartColors, textColor);
    createOrUpdateChart('comparisonsChart', 'comparisonsChart', 'Comparações', chartLabels, comparisonsData, chartColors, textColor);
    createOrUpdateChart('accessesChart', 'accessesChart', 'Acessos ao Array', chartLabels, accessesData, chartColors, textColor);
    
    uiElements.benchmarkModal.style.display = 'flex';
}

function updateFloatingControlsState() {
    const { isSorting, executionState } = state;
    const { floatingPlayBtn, floatingPauseBtn, floatingNextStepBtn, floatingSizeSlider, floatingSpeedSlider } = uiElements;

    if (!floatingPlayBtn || !floatingPauseBtn || !floatingNextStepBtn || !floatingSizeSlider || !floatingSpeedSlider) return;

    const controlsToDisable = [floatingSizeSlider, floatingSpeedSlider];
    controlsToDisable.forEach(el => el.disabled = isSorting);

    floatingPlayBtn.style.display = 'none';
    floatingPauseBtn.style.display = 'none';
    floatingNextStepBtn.style.display = 'none';

    if (!isSorting) {
        floatingPlayBtn.style.display = 'flex';
    } else {
        if (executionState === 'auto') {
            floatingPauseBtn.style.display = 'flex';
        } else if (executionState === 'step') {
            floatingNextStepBtn.style.display = 'flex';
        } else if (executionState === 'paused') {
            floatingPlayBtn.style.display = 'flex';
        }
    }
}

export function updateControlsState() {
    const { isSorting, executionState } = state;
    const { playBtn, pauseBtn, nextStepBtn, resetBtn, sizeSlider, speedSlider, scenarioSelect, qsVariantSelect, algoSelectionArea } = uiElements;

    resetBtn.disabled = false;

    const controlsToDisable = [sizeSlider, speedSlider, scenarioSelect, qsVariantSelect];
    controlsToDisable.forEach(el => el.disabled = isSorting);
    algoSelectionArea.querySelectorAll('select, input, button, label').forEach(el => {
        el.style.pointerEvents = isSorting ? 'none' : 'auto';
        el.style.opacity = isSorting ? '0.5' : '1';
    });
    
    playBtn.style.display = 'none';
    pauseBtn.style.display = 'none';
    nextStepBtn.style.display = 'none';

    if (!isSorting) {
        playBtn.style.display = 'block';
        playBtn.innerText = "iniciar";
        playBtn.disabled = false;
    } else {
        if (executionState === 'auto') {
            pauseBtn.style.display = 'block';
            pauseBtn.disabled = false;
        } else if (executionState === 'step') {
            nextStepBtn.style.display = 'block';
            nextStepBtn.disabled = false;
        } else if (executionState === 'paused') {
            playBtn.style.display = 'block';
            playBtn.innerText = "Retomar";
            playBtn.disabled = false;
        }
    }

    updateFloatingControlsState();
}


export function resetVisuals() {
    state.activeVisualizers.forEach(v => v.destroy());
    state.activeVisualizers = [];
    
    if (uiElements.visualizersArea) {
        uiElements.visualizersArea.innerHTML = ''; 
    }

    if (uiElements.scoreboardList) {
        uiElements.scoreboardList.innerHTML = '';
    }
    if (uiElements.rightSidebar && !uiElements.rightSidebar.classList.contains('initial-hidden')) {
       uiElements.rightSidebar.classList.add('initial-hidden');
    }
    document.querySelectorAll('.winner-card, .loser-card').forEach(c => c.classList.remove('winner-card', 'loser-card'));
    
}

export function populateUI() {
    uiElements.modeSwitcherContainer.innerHTML = `
        <div class="mode-switcher">
            <button id="mode-single-btn" class="mode-button">Single View</button>
            <button id="mode-race-btn" class="mode-button">Corrida</button>
            <button id="mode-benchmark-btn" class="mode-button">Benchmark</button>
        </div>`;

    const presetsHTML = `
    <div id="preset-buttons-container">
        <button class="preset-btn" id="preset-classics">Clássicos (n²)</button>
        <button class="preset-btn" id="preset-efficient">Eficientes (n log n)</button>
        <button class="preset-btn" id="preset-all">Todos</button>
        <button class="preset-btn" id="preset-clear">Limpar</button>
    </div>`;

    const userPresetsHTML = `
    <div class="control-group" id="user-presets-container">
        <label for="user-presets-select">Presets Salvos:</label>
        <div class="select-wrapper">
            <select id="user-presets-select">
                <option value="">Carregar preset...</option>
            </select>
        </div>
        <button id="save-preset-btn" class="control-button">Salvar</button>
        <button id="delete-preset-btn" class="control-button danger-button">Excluir</button>
    </div>`;
    
    const racePanelHTML = `
    <div id="race-mode-panel">
        <label>Selecione os competidores:</label>
        ${presetsHTML} 
        <div id="race-algo-toggles" style="display: flex; flex-wrap: wrap; gap: 5px;">
            ${Object.keys(ALGO_CONFIG).map(key => `<div class="algo-toggle"><input type="checkbox" id="cb-${key}" value="${key}"><label for="cb-${key}">${ALGO_CONFIG[key].name}</label></div>`).join('')}
        </div>
        ${userPresetsHTML}
    </div>`;

    const benchmarkPanelHTML = `
    <div id="benchmark-mode-panel" style="display: none;">
        <div class="control-group">
            <label for="benchmark-anchor-select">Algoritmo Pivô:</label>
            <select id="benchmark-anchor-select">${Object.keys(ALGO_CONFIG).map(key => `<option value="${key}">${ALGO_CONFIG[key].name}</option>`).join('')}</select>
        </div>
        <div class="control-group">
            <label for="benchmark-challenger-add">Adicionar Desafiante:</label>
            <select id="benchmark-challenger-add"></select>
        </div>
        <div class="control-group">
            <label>Ordem dos Desafios (arraste):</label>
            <ul id="challengers-list"></ul>
        </div>
    </div>`;


    uiElements.algoSelectionArea.innerHTML = racePanelHTML + benchmarkPanelHTML;
    updateChallengerAddSelect();
    populatePresetList();
}

export function populatePresetList() {
    const presets = getSavedPresets();
    const select = document.getElementById('user-presets-select');
    select.innerHTML = '<option value="">Carregar preset...</option>';
    for (const presetName in presets) {
        const option = document.createElement('option');
        option.value = presetName;
        option.textContent = presetName;
        select.appendChild(option);
    }
}

export function getSavedPresets() {
    return JSON.parse(localStorage.getItem('sortify_presets')) || {};
}

export function savePreset(name, queryString) {
    const presets = getSavedPresets();
    presets[name] = queryString;
    localStorage.setItem('sortify_presets', JSON.stringify(presets));
    populatePresetList();
}

export function deletePreset(name) {
    const presets = getSavedPresets();
    delete presets[name];
    localStorage.setItem('sortify_presets', JSON.stringify(presets));
    populatePresetList();
}


export function updateChallengerAddSelect() {
    const anchor = uiElements.algoSelectionArea.querySelector('#benchmark-anchor-select').value;
    const available = Object.keys(ALGO_CONFIG).filter(key => key !== anchor && !state.benchmarkChallengers.includes(key));
    uiElements.algoSelectionArea.querySelector('#benchmark-challenger-add').innerHTML = '<option value="">Selecionar</option>' + available.map(key => `<option value="${key}">${ALGO_CONFIG[key].name}</option>`).join('');
}

export function renderChallengersList() {
    const list = uiElements.algoSelectionArea.querySelector('#challengers-list');
    list.innerHTML = '';
    state.benchmarkChallengers.forEach(key => {
        const li = document.createElement('li');
        li.dataset.key = key;
        li.draggable = true;
        li.innerHTML = `<span><span class="drag-handle">☰</span> ${ALGO_CONFIG[key].name}</span><button class="remove-challenger-btn" data-key="${key}">&times;</button>`;
        list.appendChild(li);
    });
    updateURLFromState();
}

export function toggleQsVariantSelector() {
    const quickSelected = uiElements.algoSelectionArea.querySelector('#cb-quick')?.checked;
    uiElements.qsVariantGroup.style.display = quickSelected ? 'block' : 'none';
    updateURLFromState();
}

export function updateURLFromState() {
    const params = new URLSearchParams();
    params.set('mode', state.currentMode);
    params.set('size', uiElements.sizeSlider.value);
    params.set('scenario', uiElements.scenarioSelect.value);

    params.set('delayMode', state.delay.mode);
    params.set('speed', uiElements.speedSlider.value);
    params.set('compareDelay', document.getElementById('compare-delay-slider').value);
    params.set('swapDelay', document.getElementById('swap-delay-slider').value);

    if (state.currentMode === 'race' || state.currentMode === 'single') {
        const algos = Array.from(uiElements.algoSelectionArea.querySelectorAll('#race-algo-toggles input:checked')).map(cb => cb.value);
        if (algos.length > 0) params.set('algos', algos.join(','));
        if (algos.includes('quick')) params.set('pivot', uiElements.qsVariantSelect.value);
    } else {
        const anchor = uiElements.algoSelectionArea.querySelector('#benchmark-anchor-select').value;
        params.set('anchor', anchor);
        if (state.benchmarkChallengers.length > 0) params.set('challengers', state.benchmarkChallengers.join(','));
        if (anchor === 'quick' || state.benchmarkChallengers.includes('quick')) params.set('pivot', uiElements.qsVariantSelect.value);
    }
    history.pushState(null, '', '?' + params.toString());
}

export function applyStateFromURL(switchModeCallback) {
    const params = new URLSearchParams(window.location.search);

    const delayMode = params.get('delayMode') || 'simple';
    document.getElementById('delay-mode-select').value = delayMode;
    state.delay.mode = delayMode;
    document.getElementById('simple-delay-panel').style.display = delayMode === 'simple' ? 'block' : 'none';
    document.getElementById('advanced-delay-panel').style.display = delayMode === 'advanced' ? 'block' : 'none';

    if (params.get('speed')) {
        uiElements.speedSlider.value = params.get('speed');
        uiElements.speedLabel.innerText = uiElements.speedSlider.value;
        state.delay.simple = 101 - parseInt(uiElements.speedSlider.value, 10);
    }

    if (params.get('compareDelay')) {
        const compareDelay = params.get('compareDelay');
        document.getElementById('compare-delay-slider').value = compareDelay;
        document.getElementById('compare-delay-label').innerText = compareDelay;
        state.delay.compare = parseInt(compareDelay, 10);
    }

    if (params.get('swapDelay')) {
        const swapDelay = params.get('swapDelay');
        document.getElementById('swap-delay-slider').value = swapDelay;
        document.getElementById('swap-delay-label').innerText = swapDelay;
        state.delay.swap = parseInt(swapDelay, 10);
    }

    if (params.get('size')) {
        uiElements.sizeSlider.value = params.get('size');
        uiElements.sizeLabel.innerText = uiElements.sizeSlider.value;
    }
    
    if (params.get('scenario')) uiElements.scenarioSelect.value = params.get('scenario');
    if (params.get('pivot')) uiElements.qsVariantSelect.value = params.get('pivot');
    state.pivotStrategy = uiElements.qsVariantSelect.value;
    
    const urlMode = params.get('mode') || 'single';
    
    if (switchModeCallback) {
        switchModeCallback(urlMode);
    }

    if (urlMode === 'single' || urlMode === 'race') {
        const algos = params.get('algos')?.split(',') || [];
        uiElements.algoSelectionArea.querySelectorAll('#race-algo-toggles input').forEach(cb => cb.checked = algos.includes(cb.value));
        toggleQsVariantSelector();
    } else if (urlMode === 'benchmark') {
        if (params.get('anchor')) uiElements.algoSelectionArea.querySelector('#benchmark-anchor-select').value = params.get('anchor');
        const challengers = params.get('challengers')?.split(',') || [];
        state.benchmarkChallengers = challengers;
        renderChallengersList();
        updateChallengerAddSelect();
    }
}

function buildConfigHTML() {
    const selectedAlgos = Array.from(document.querySelectorAll('#race-algo-toggles input:checked')).map(cb => cb.value);
    const speedMode = document.getElementById('delay-mode-select').value;
    const speedValue = (speedMode === 'simple')
        ? `Simples (${document.getElementById('speed-slider').value})`
        : `Avançado <small>(C:${document.getElementById('compare-delay-slider').value}ms | M:${document.getElementById('swap-delay-slider').value}ms)</small>`;

    let pivotHTML = '';
    const isBenchmarkQuick = state.currentMode === 'benchmark' && (document.getElementById('benchmark-anchor-select').value === 'quick' || state.benchmarkChallengers.includes('quick'));
    const shouldShowPivot = selectedAlgos.includes('quick') || isBenchmarkQuick;

    if (shouldShowPivot) {
        const pivotOption = document.querySelector(`#qs-variant-select option[value="${state.pivotStrategy}"]`);
        if (pivotOption) {
            pivotHTML = `<div class="value">${pivotOption.textContent}</div>`;
        }
    }

    return `
        <div class="config-panel-item"><div class="label">Tamanho dos Dados</div><div class="value" id="live-config-size">${uiElements.sizeSlider.value}</div></div>
        <div class="config-panel-item"><div class="label">Cenário</div><div class="value" id="live-config-scenario">${document.querySelector(`#scenario-select option[value="${uiElements.scenarioSelect.value}"]`).textContent}</div></div>
        <div class="config-panel-item"><div class="label">Velocidade</div><div class="value" id="live-config-speed">${speedValue}</div></div>
        <div class="config-panel-item" id="live-config-pivot-wrapper" style="display: ${pivotHTML ? 'block' : 'none'};">
            <div class="label">Pivô do Quick Sort</div>
            <div class="value" id="live-config-pivot">${pivotHTML}</div>
        </div>
    `;
}

export function displayPreRaceScreen() {
    uiElements.visualizersArea.innerHTML = `
        <div class="pre-start-container">
            <div class="pre-start-header"><h1 class="title">Corrida de Algoritmos</h1><p class="subtitle">Prepare os competidores e a configuração para a disputa.</p></div>
            <div class="race-layout">
                <div class="config-panel"><h3>Configuração da Execução</h3><div class="config-panel-grid" id="live-config-grid">${buildConfigHTML()}</div></div>
                <div class="competitors-grid" id="live-competitors-grid"></div>
            </div>
        </div>`;
    updateLiveCompetitorList();
}

export function displayPreBenchmarkScreen() {
     uiElements.visualizersArea.innerHTML = `
        <div class="pre-start-container">
            <div class="pre-start-header"><h1 class="title">Benchmark</h1><p class="subtitle">Análise de performance comparativa.</p></div>
            <div id="live-benchmark-layout"></div>
            <div class="config-panel"><h3>Configuração da Execução</h3><div class="config-panel-grid" id="live-config-grid">${buildConfigHTML()}</div></div>
        </div>`;
    updateLiveBenchmarkView();
}

export function displayPreSingleViewScreen() {
    uiElements.visualizersArea.innerHTML = `
        <div class="pre-start-container">
            <div class="pre-start-header"><h1 class="title">Análise de Algoritmo</h1><p class="subtitle">Explore em detalhes as características e a configuração da execução.</p></div>
            <div class="single-view-layout" id="live-single-view-container"></div>
        </div>`;
    updateLiveSingleView();
}

export function updateLiveConfig() {
    const grid = document.getElementById('live-config-grid');
    if (grid) grid.innerHTML = buildConfigHTML();
}

export function updateLiveCompetitorList() {
    const container = document.getElementById('live-competitors-grid');
    if (!container) return;

    const selectedAlgos = Array.from(document.querySelectorAll('#race-algo-toggles input:checked')).map(cb => cb.value);
    if (selectedAlgos.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted); text-align: center; grid-column: 1 / -1;">Nenhum competidor selecionado.</p>`;
        return;
    }
    const competitorsHTML = selectedAlgos.map(key => {
        const config = ALGO_CONFIG[key];
        return `<div class="info-card" style="--algo-color: ${config.color};"><h3>${config.name}</h3><div class="details-grid"><div class="detail-item"><span class="label">Complexidade Média</span><span class="value">${config.complexity.average}</span></div><div class="detail-item"><span class="label">Estável</span><span class="value ${config.properties.stable ? 'bool-true' : 'bool-false'}">${config.properties.stable ? 'Sim' : 'Não'}</span></div><div class="detail-item"><span class="label">In-Place</span><span class="value ${config.properties.inPlace ? 'bool-true' : 'bool-false'}">${config.properties.inPlace ? 'Sim' : 'Não'}</span></div></div></div>`;
    }).join('');
    container.innerHTML = competitorsHTML;
}

export function updateLiveBenchmarkView() {
    const container = document.getElementById('live-benchmark-layout');
    if (!container) return;
    
    const pivotKey = document.getElementById('benchmark-anchor-select').value;
    const challengerKeys = state.benchmarkChallengers;
    const pivotConfig = ALGO_CONFIG[pivotKey];

    if (!pivotKey || challengerKeys.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted); text-align: center;">Selecione um Pivô e adicione Desafiantes.</p>`;
        return;
    }

    const pivotCardHTML = `<div class="info-card" style="--algo-color: ${pivotConfig.color};"><h3>${pivotConfig.name} (Pivô)</h3><div class="details-grid"><div class="detail-item"><span class="label">Complexidade Média</span><span class="value">${pivotConfig.complexity.average}</span></div><div class="detail-item"><span class="label">Pior Caso</span><span class="value">${pivotConfig.complexity.worst}</span></div></div></div>`;
    const challengersHTML = challengerKeys.map(key => `<div class="challenger-item" style="--algo-color: ${ALGO_CONFIG[key].color};">${ALGO_CONFIG[key].name}</div>`).join('');

    container.innerHTML = `<div class="benchmark-layout"><div class="pivot-side">${pivotCardHTML}</div><div class="vs-text">VS</div><div class="challengers-side"><div class="challengers-list">${challengersHTML}</div></div></div>`;
}

export function updateLiveSingleView() {
    const container = document.getElementById('live-single-view-container');
    if (!container) return;

    const selectedAlgos = Array.from(document.querySelectorAll('#race-algo-toggles input:checked')).map(cb => cb.value);
    if (selectedAlgos.length !== 1) {
        container.innerHTML = `<p style="color: var(--text-muted); text-align: center;">Por favor, selecione <strong>exatamente um</strong> algoritmo.</p>`;
        return;
    }

    const algoKey = selectedAlgos[0];
    const config = ALGO_CONFIG[algoKey];
    const configHTML = buildConfigHTML();
    
    container.innerHTML = `<div><div class="info-card" style="--algo-color: ${config.color};"><h3 style="font-size: 1.8rem;">${config.name}</h3><div class="details-grid"><div class="detail-item"><span class="label">Melhor Caso</span><span class="value">${config.complexity.best}</span></div><div class="detail-item"><span class="label">Caso Médio</span><span class="value">${config.complexity.average}</span></div><div class="detail-item"><span class="label">Pior Caso</span><span class="value">${config.complexity.worst}</span></div><hr style="border-color: rgba(255,255,255,0.1); margin: 0.5rem 0;"><div class="detail-item"><span class="label">Estável</span><span class="value ${config.properties.stable ? 'bool-true' : 'bool-false'}">${config.properties.stable ? 'Sim' : 'Não'}</span></div><div class="detail-item"><span class="label">In-Place (memória extra)</span><span class="value ${config.properties.inPlace ? 'bool-true' : 'bool-false'}">${config.properties.inPlace ? 'Não' : 'Sim'}</span></div></div></div><div class="config-panel" style="margin-top: 1.5rem"><h3>Configuração da Análise</h3><div class="config-panel-grid">${configHTML}</div></div></div>`;
}

export function showCountdown(onCompleteCallback) {
    const overlay = document.createElement('div');
    overlay.id = 'countdown-overlay';
    
    const timerSpan = document.createElement('span');
    timerSpan.id = 'countdown-timer';
    
    overlay.appendChild(timerSpan);
    uiElements.mainContent.appendChild(overlay);

    let count = 3;
    timerSpan.textContent = count;

    const interval = setInterval(() => {
        count--;
        if (count > 0) {
            timerSpan.textContent = count;
        } else {
            clearInterval(interval);
            overlay.remove();
            onCompleteCallback();
        }
    }, 1000);
}