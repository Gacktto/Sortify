import state from './state.js';
import { uiElements, populateUI, updateControlsState, applyStateFromURL, resetVisuals, handleRacerFinish, toggleQsVariantSelector, renderChallengersList, updateChallengerAddSelect, updateBenchmarkScoreboard, showReportModal, updateURLFromState, displayPreRaceScreen, displayPreBenchmarkScreen, displayPreSingleViewScreen, showCountdown, updateLiveConfig, updateLiveBenchmarkView, updateLiveCompetitorList, updateLiveSingleView } from './ui.js';
import { Visualizer } from './visualizer.js';
import { ALGORITHMS } from './algorithms.js';
import { ALGO_CONFIG } from './config.js';

let mediaRecorder;
let recordedChunks = [];
let recordingInterval = null;

async function startRecording() {
    if (!state.recordExecution) return;

    const elementToRecord = uiElements.visualizersArea;
    if (!elementToRecord) return;

    console.log("Iniciando gravação do elemento...");

    try {
        const canvas = document.createElement('canvas');
        canvas.width = elementToRecord.offsetWidth;
        canvas.height = elementToRecord.offsetHeight;
        const ctx = canvas.getContext('2d');

        const stream = canvas.captureStream(30);

        recordedChunks = [];
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'sortify-recording.webm';
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(url);
            a.remove();
        };

        mediaRecorder.start();

        recordingInterval = setInterval(async () => {
            try {
                const canvasFrame = await html2canvas(elementToRecord, { logging: false });
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(canvasFrame, 0, 0, canvas.width, canvas.height);
            } catch (err) {
                console.error("Erro durante a captura do frame:", err);
                stopRecording();
            }
        }, 33);

    } catch (err) {
        console.error("Erro ao configurar a gravação:", err);
        state.recordExecution = false;
        const toggle = document.getElementById('record-sort-toggle');
        if(toggle) toggle.checked = false;
    }
}

function stopRecording() {
    if (recordingInterval) {
        clearInterval(recordingInterval);
        recordingInterval = null;
    }
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        mediaRecorder = null;
    }
}

function switchMode(newMode) {
    if (state.isSorting) return;
    state.currentMode = newMode;

    uiElements.modeSwitcherContainer.querySelector('#mode-single-btn').classList.toggle('active', newMode === 'single');
    uiElements.modeSwitcherContainer.querySelector('#mode-race-btn').classList.toggle('active', newMode === 'race');
    uiElements.modeSwitcherContainer.querySelector('#mode-benchmark-btn').classList.toggle('active', newMode === 'benchmark');
    
    const racePanel = uiElements.algoSelectionArea.querySelector('#race-mode-panel');
    const benchmarkPanel = uiElements.algoSelectionArea.querySelector('#benchmark-mode-panel');
    
    racePanel.style.display = (newMode === 'single' || newMode === 'race') ? 'block' : 'none';
    benchmarkPanel.style.display = newMode === 'benchmark' ? 'block' : 'none';

    resetApp();
}

function generateMasterArray() {
    const size = uiElements.sizeSlider.value;
    const scenario = uiElements.scenarioSelect.value;
    state.masterArray = [];
    switch (scenario) {
        case 'nearlySorted':
            for (let i = 1; i <= size; i++) state.masterArray.push(i * 5);
            for (let k = 0; k < Math.floor(size / 10); k++) {
                const i = Math.floor(Math.random() * size);
                const j = Math.floor(Math.random() * size);
                [state.masterArray[i], state.masterArray[j]] = [state.masterArray[j], state.masterArray[i]];
            }
            break;
        case 'reversed':
            for (let i = size; i >= 1; i--) state.masterArray.push(i * 5);
            break;
        case 'fewUnique':
            const pool = [];
            const numUnique = Math.max(2, Math.floor(size / 10));
            for (let i = 0; i < numUnique; i++) pool.push(Math.floor(Math.random() * 100) + 5);
            for (let i = 0; i < size; i++) state.masterArray.push(pool[Math.floor(Math.random() * numUnique)]);
            break;
        default:
            for (let i = 0; i < size; i++) state.masterArray.push(Math.floor(Math.random() * 100) + 5);
            break;
    }
    state.activeVisualizers.forEach(viz => viz.setData(state.masterArray));
    updateURLFromState();
}

function toggleLegendsVisibility() {
    if (state.activeVisualizers.length > 4) {
        uiElements.visualizersArea.classList.add('hide-legends');
        uiElements.visualizersArea.classList.add('small-grid');
    } else {
        uiElements.visualizersArea.classList.remove('hide-legends');
        uiElements.visualizersArea.classList.remove('small-grid');
    }
}

function createVisualizers(algoTypes) {
    resetVisuals();
    algoTypes.forEach(type => {
        if (ALGO_CONFIG[type]) {
            state.activeVisualizers.push(new Visualizer(type, uiElements.visualizersArea));
        }
    });

    if (state.activeVisualizers.length === 1) {
        uiElements.visualizersArea.classList.add('single-view-mode');
    } else {
        uiElements.visualizersArea.classList.remove('single-view-mode');
    }

    toggleLegendsVisibility();
}

function createVisualizersForCurrentMode() {
    if (state.isSorting) return;

    resetVisuals(); 

    switch (state.currentMode) {
        case 'race':
            displayPreRaceScreen();
            break;
        case 'benchmark':
            displayPreBenchmarkScreen();
            break;
        case 'single':
            displayPreSingleViewScreen();
            break;
    }
}

function setupSingleOrRaceVisualizers() {
    resetVisuals();
    const selectedAlgos = Array.from(uiElements.algoSelectionArea.querySelectorAll('#race-algo-toggles input:checked')).map(cb => cb.value);
    
    if (selectedAlgos.length === 0) {
        alert("Por favor, selecione ao menos um algoritmo.");
        state.isSorting = false;
        updateControlsState();
        return false;
    }
    
    if (state.currentMode === 'single' && selectedAlgos.length > 1) {
        alert("O Modo Single View permite apenas um algoritmo por vez.");
        state.isSorting = false;
        updateControlsState();
        return false;
    }
    
    createVisualizers(selectedAlgos);
    generateMasterArray();
    return true;
}

function setupBenchmarkVisualizers() {
    resetVisuals();
    const anchor = uiElements.algoSelectionArea.querySelector('#benchmark-anchor-select').value;
    const challengers = state.benchmarkChallengers;

    if (!anchor || challengers.length === 0) {
        alert("Selecione um Algoritmo Pivô e pelo menos um Desafiante.");
        state.isSorting = false;
        updateControlsState();
        return false;
    }

    createVisualizers([anchor, ...challengers]);
    generateMasterArray();
    return true;
}

async function runSingleMode() {
    if (!state.activeVisualizers.length) return;

    const result = await state.activeVisualizers[0].run(ALGORITHMS);

    if (!state.stopSignal && result && state.showReportAtEnd) {
        const summary = `Execução em modo Single View finalizada.`;
        showReportModal(`Relatório: ${result.viz.config.name}`, [result], 'single', summary);
    }
}

async function runRaceMode() {
    const selectedAlgos = Array.from(uiElements.algoSelectionArea.querySelectorAll('#race-algo-toggles input:checked')).map(cb => cb.value);
    
    if (selectedAlgos.length <= 1) {
        alert("O Modo Corrida requer pelo menos 2 algoritmos. Por favor, selecione mais competidores ou mude para o modo 'Single View'.");
        state.isSorting = false;
        return;
    }

    let finishedRacers = [];

    const racePromises = state.activeVisualizers.map(viz =>
        viz.run(ALGORITHMS).then(result => {
            if (!state.stopSignal && result) {
                handleRacerFinish(result, finishedRacers);
            }
        })
    );
    await Promise.all(racePromises);

    if (!state.stopSignal && finishedRacers.length > 0) {
        finishedRacers.sort((a, b) => a.time - b.time);
        const winnerCard = document.getElementById(`viz-${finishedRacers[0].viz.sortType}`);
        if (winnerCard) winnerCard.classList.add('winner-card');
    }
}

async function runBenchmarkMode() {
    const anchor = uiElements.algoSelectionArea.querySelector('#benchmark-anchor-select').value;
    if (!anchor || state.benchmarkChallengers.length === 0) {
        alert("Selecione um Algoritmo Pivô e pelo menos um Desafiante.");
        return;
    }

    generateMasterArray(); 
    const benchmarkDataset = [...state.masterArray];

    state.benchmarkResults = [];

    uiElements.scoreboardTitle.innerText = `Rodada Solo`;
    
    resetVisuals();
    createVisualizers([anchor]);
    
    state.activeVisualizers[0].setData(benchmarkDataset);

    const anchorSoloResult = await state.activeVisualizers[0].run(ALGORITHMS);
    if (state.stopSignal) return;

    state.benchmarkResults.push({ round: 'Solo', winner: anchor, results: [anchorSoloResult] });
    updateBenchmarkScoreboard(null, [anchorSoloResult]);
    await new Promise(r => setTimeout(r, 2000));

    for (let i = 0; i < state.benchmarkChallengers.length; i++) {
        const challenger = state.benchmarkChallengers[i];
        uiElements.scoreboardTitle.innerText = `Rodada ${i + 1}/${state.benchmarkChallengers.length}`;
        
        resetVisuals();
        createVisualizers([anchor, challenger]);

        state.activeVisualizers.forEach(viz => viz.setData(benchmarkDataset));

        let roundResults = [];
        const roundPromises = state.activeVisualizers.map(viz =>
            viz.run(ALGORITHMS).then(res => {
                if (res) roundResults.push(res);
            })
        );
        await Promise.all(roundPromises);
        if (state.stopSignal) return;

        roundResults.sort((a, b) => a.time - b.time);
        state.benchmarkResults.push({
            round: `${ALGO_CONFIG[anchor].name} vs ${ALGO_CONFIG[challenger].name}`,
            winner: roundResults[0]?.type,
            results: roundResults
        });
        updateBenchmarkScoreboard(roundResults[0]?.viz, roundResults);
        await new Promise(r => setTimeout(r, 2000));
    }

    if (state.stopSignal) return;
    
    const summary = `Benchmark finalizado com ${state.benchmarkChallengers.length} rodada(s) de desafio.`;
    showReportModal('Relatório Final do Benchmark', state.benchmarkResults, 'benchmark', summary);
}


async function playAll() {
    if (state.isSorting) {
        state.executionState = state.executionState === 'paused' ? 'auto' : 'paused';
        updateControlsState();
        return;
    }

    state.isSorting = true;
    state.stopSignal = false;
    state.globalStartTime = Date.now();
    updateControlsState();

    let setupFunction;
    let runFunction;

    switch(state.currentMode) {
        case 'race':
            setupFunction = setupSingleOrRaceVisualizers;
            runFunction = runRaceMode;
            break;
        case 'benchmark':
            setupFunction = setupBenchmarkVisualizers;
            runFunction = runBenchmarkMode;
            break;
        case 'single':
            setupFunction = setupSingleOrRaceVisualizers;
            runFunction = runSingleMode;
            break;
    }

    const readyToStart = setupFunction();
    if (!readyToStart) return;

    showCountdown(async () => {
        await startRecording();
        await runFunction();

        if (state.recordExecution) {
            setTimeout(() => {
                stopRecording();
            }, 1000);
        } else {
            stopRecording();
        }

        if (!state.stopSignal) {
            state.isSorting = false;
        }
        updateControlsState();
    });
}

function resetApp() {
    state.stopSignal = true;
    state.isSorting = false;
    stopRecording();
    
    if (state.stepPromiseResolvers.length > 0) {
        state.stepPromiseResolvers.forEach(resolve => resolve(false));
        state.stepPromiseResolvers = [];
    }

    setTimeout(() => {
        state.stopSignal = false;
        resetVisuals();
        createVisualizersForCurrentMode();
        generateMasterArray();
        updateControlsState();
        uiElements.scoreboardTitle.innerText = "🏆 Placar 🏆";
    }, 50);
}

function triggerNextStep() {
    state.stepPromiseResolvers.forEach(resolve => resolve(true));
    state.stepPromiseResolvers = [];
}


function initializeApp() {
    populateUI();
    applyStateFromURL(switchMode);
    resetApp();

    const showReportToggle = document.getElementById('show-report-toggle');
    if (showReportToggle) {
        showReportToggle.addEventListener('change', (e) => {
            state.showReportAtEnd = e.target.checked;
        });
    }

    const recordSortToggle = document.getElementById('record-sort-toggle');
    if (recordSortToggle) {
        recordSortToggle.addEventListener('change', (e) => {
            state.recordExecution = e.target.checked;
        });
    }
    
    function handleSettingsChange() {
        switch(state.currentMode) {
            case 'race':
                updateLiveCompetitorList();
                break;
            case 'benchmark':
                updateLiveBenchmarkView();
                break;
            case 'single':
                updateLiveSingleView();
                break;
        }
        updateLiveConfig();
        updateURLFromState();
    }

    function showUIToast() {
        if (localStorage.getItem('showHideUiMessage') === 'false') return;
    
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerHTML = `
            <span>Pressione <strong>'Q'</strong> para reexibir a UI.</span>
            <label><input type="checkbox" id="dont-show-again-checkbox"> Não mostrar novamente</label>
        `;
        document.body.appendChild(toast);

        const checkbox = document.getElementById('dont-show-again-checkbox');
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                localStorage.setItem('showHideUiMessage', 'false');
            } else {
                localStorage.removeItem('showHideUiMessage');
            }
        });
    }

    function hideUI() {
        document.body.classList.add('ui-hidden');
        uiElements.leftSidebar.classList.add('hidden');
        uiElements.floatingControlsContainer.classList.remove('hidden');
        uiElements.hideUiBtn.classList.add('hidden');
        showUIToast();
    }

    function showUI() {
        document.body.classList.remove('ui-hidden');
        uiElements.leftSidebar.classList.remove('hidden');
        uiElements.floatingControlsContainer.classList.add('hidden');
        uiElements.hideUiBtn.classList.remove('hidden');
    }

    // --- Event Listeners for Floating Controls (syncs with main controls) ---
    uiElements.floatingPlayBtn.addEventListener('click', playAll);
    uiElements.floatingPauseBtn.addEventListener('click', playAll);
    uiElements.floatingNextStepBtn.addEventListener('click', triggerNextStep);
    uiElements.floatingResetBtn.addEventListener('click', resetApp);

    uiElements.floatingSizeSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        uiElements.floatingSizeLabel.innerText = value;
        uiElements.sizeSlider.value = value;
        uiElements.sizeLabel.innerText = value;
        generateMasterArray();
        updateLiveConfig();
    });

    uiElements.floatingSpeedSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        uiElements.floatingSpeedLabel.innerText = value;
        uiElements.speedSlider.value = value;
        uiElements.speedLabel.innerText = value;
        state.delay.simple = 101 - parseInt(value, 10);
        updateLiveConfig();
    });

    document.getElementById('compare-delay-slider').addEventListener('input', (e) => {
        document.getElementById('compare-delay-label').innerText = e.target.value;
        state.delay.compare = parseInt(e.target.value, 10);
        updateLiveConfig();
    });
    document.getElementById('swap-delay-slider').addEventListener('input', (e) => {
        document.getElementById('swap-delay-label').innerText = e.target.value;
        state.delay.swap = parseInt(e.target.value, 10);
        updateLiveConfig();
    });
    document.getElementById('delay-mode-select').addEventListener('input', (e) => {
        state.delay.mode = e.target.value;
        document.getElementById('simple-delay-panel').style.display = state.delay.mode === 'simple' ? 'block' : 'none';
        document.getElementById('advanced-delay-panel').style.display = state.delay.mode === 'advanced' ? 'block' : 'none';
        updateLiveConfig();
    });
    uiElements.speedSlider.addEventListener('input', (e) => {
        uiElements.speedLabel.innerText = e.target.value;
        state.delay.simple = 101 - parseInt(e.target.value, 10);
        // Sync with floating slider
        uiElements.floatingSpeedSlider.value = e.target.value;
        uiElements.floatingSpeedLabel.innerText = e.target.value;
        updateLiveConfig();
    });

    uiElements.sizeSlider.addEventListener('input', (e) => {
        uiElements.sizeLabel.innerText = e.target.value;
        // Sync with floating slider
        uiElements.floatingSizeSlider.value = e.target.value;
        uiElements.floatingSizeLabel.innerText = e.target.value;
        generateMasterArray();
        updateLiveConfig();
    });
    uiElements.scenarioSelect.addEventListener('input', () => {
        generateMasterArray();
        updateLiveConfig();
    });
    uiElements.qsVariantSelect.addEventListener('input', (e) => {
        state.pivotStrategy = e.target.value;
        updateLiveConfig();
    });

    const algoArea = uiElements.algoSelectionArea;
    algoArea.addEventListener('click', (e) => {
        if (e.target.matches('.remove-challenger-btn')) {
            state.benchmarkChallengers = state.benchmarkChallengers.filter(k => k !== e.target.dataset.key);
            renderChallengersList();
            updateLiveBenchmarkView();
            updateLiveConfig();
        }
    });
    algoArea.addEventListener('change', (e) => {
        if (e.target.matches('#race-algo-toggles input')) {
            if (state.isSorting) return;
            if (state.currentMode === 'single' && e.target.checked) {
                algoArea.querySelectorAll('#race-algo-toggles input').forEach(cb => { if (cb !== e.target) cb.checked = false; });
            }
            toggleQsVariantSelector();
            handleSettingsChange();
        }
        if (e.target.matches('#benchmark-anchor-select')) {
            state.benchmarkChallengers = [];
            renderChallengersList();
            updateChallengerAddSelect();
            handleSettingsChange();
        }
        if (e.target.matches('#benchmark-challenger-add')) {
            if (e.target.value) {
                state.benchmarkChallengers.push(e.target.value);
                renderChallengersList();
                updateChallengerAddSelect();
                handleSettingsChange();
            }
            e.target.value = '';
        }
    });
    
    const presetBtnContainer = document.getElementById('preset-buttons-container');
    if(presetBtnContainer) {
        presetBtnContainer.addEventListener('click', (e) => {
            if (!e.target.matches('.preset-btn')) return;
            const classics = ['bubble', 'cocktail', 'selection', 'insertion'];
            const efficient = ['heap', 'merge', 'quick'];
            let algosToSelect = [];
            const allAlgoKeys = Object.keys(ALGO_CONFIG);
            const allCheckboxes = uiElements.algoSelectionArea.querySelectorAll('#race-algo-toggles input');
            switch(e.target.id) {
                case 'preset-classics': algosToSelect = classics; break;
                case 'preset-efficient': algosToSelect = efficient; break;
                case 'preset-all': algosToSelect = allAlgoKeys; break;
                case 'preset-clear': algosToSelect = []; break;
            }
            allCheckboxes.forEach(checkbox => { checkbox.checked = algosToSelect.includes(checkbox.value); });
            toggleQsVariantSelector();
            handleSettingsChange();
        });
    }

    uiElements.playBtn.addEventListener('click', playAll);
    uiElements.pauseBtn.addEventListener('click', playAll);
    uiElements.resetBtn.addEventListener('click', resetApp);
    uiElements.modeSwitcherContainer.addEventListener('click', (e) => {
        if (e.target.matches('#mode-single-btn')) switchMode('single');
        if (e.target.matches('#mode-race-btn')) switchMode('race');
        if (e.target.matches('#mode-benchmark-btn')) switchMode('benchmark');
    });
    uiElements.executionModeSwitcher.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON') return;

        const newMode = e.target.id === 'exec-mode-auto' ? 'auto' : 'step';
        
        if (newMode === state.executionState) return;

        const oldMode = state.executionState;
        state.executionState = newMode;

        uiElements.executionModeSwitcher.querySelector('#exec-mode-auto').classList.toggle('active', state.executionState === 'auto');
        uiElements.executionModeSwitcher.querySelector('#exec-mode-step').classList.toggle('active', state.executionState === 'step');

        if (oldMode === 'step' && newMode === 'auto' && state.isSorting) {
            state.stepPromiseResolvers.forEach(resolve => resolve(true));
            state.stepPromiseResolvers = [];
        }

        updateControlsState();
    });
    uiElements.nextStepBtn.addEventListener('click', triggerNextStep);

    uiElements.hideUiBtn.addEventListener('click', hideUI);
    window.addEventListener('keydown', (event) => {
        if (event.key.toLowerCase() === 'q' && document.body.classList.contains('ui-hidden')) {
            showUI();
        }
    });

    uiElements.benchmarkModalClose.addEventListener('click', () => {
        uiElements.benchmarkModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === uiElements.benchmarkModal) {
            uiElements.benchmarkModal.style.display = 'none';
        }
    });
    
}

window.onload = initializeApp;