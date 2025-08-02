export const ALGO_CONFIG = {
    bubble: { 
        name: 'Bubble Sort', 
        color: '#ff6347',
        complexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
        properties: { stable: true, inPlace: true }
    },
    cocktail: { 
        name: 'Cocktail Shaker', 
        color: '#e57373',
        complexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
        properties: { stable: true, inPlace: true }
    },
    selection: { 
        name: 'Selection Sort', 
        color: '#ffa500',
        complexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
        properties: { stable: false, inPlace: true }
    },
    insertion: { 
        name: 'Insertion Sort', 
        color: '#9370db',
        complexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
        properties: { stable: true, inPlace: true }
    },
    heap: { 
        name: 'Heap Sort', 
        color: '#db7093',
        complexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
        properties: { stable: false, inPlace: true }
    },
    merge: { 
        name: 'Merge Sort', 
        color: '#20b2aa',
        complexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
        properties: { stable: true, inPlace: false }
    },
    quick: { 
        name: 'Quick Sort', 
        color: '#4682b4',
        complexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
        properties: { stable: false, inPlace: true }
    },
    radix: { 
        name: 'Radix Sort', 
        color: '#66bb6a',
        complexity: { best: 'O(nk)', average: 'O(nk)', worst: 'O(nk)' },
        properties: { stable: true, inPlace: false }
    },
    bogo: { 
        name: 'Bogo Sort', 
        color: '#78909c',
        complexity: { best: 'O(n)', average: 'O((n+1)!)', worst: '∞' },
        properties: { stable: false, inPlace: true }
    },
};

export const COMPARISON_COLOR = 'var(--comparison-color)';
export const MOVEMENT_COLOR = 'var(--movement-color)';
export const PIVOT_COLOR = 'var(--pivot-color)';