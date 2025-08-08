const state = {
    masterArray: [],
    activeVisualizers: [],
    benchmarkChallengers: [],
    benchmarkResults: [],
    stopSignal: false,
    isSorting: false,
    globalStartTime: 0,
    delay: {
        mode: 'simple',
        simple: 30,
        compare: 50,
        swap: 100,
    },
    currentMode: 'race',
    executionState: 'auto',
    pivotStrategy: 'last',
    stepPromiseResolvers: [],
    showReportAtEnd: true,
    recordExecution: false,
    charts: {
        timeChart: null,
        comparisonsChart: null,
        accessesChart: null,
    }
};

export default state;