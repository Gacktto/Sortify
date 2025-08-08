import {
	COMPARISON_COLOR,
	MOVEMENT_COLOR,
	PIVOT_COLOR
} from './config.js';
import state from './state.js';

async function wait(type = 'general') {
    if (state.stopSignal) return false;

    let currentDelay = 0;
    if (state.delay.mode === 'simple') {
        currentDelay = state.delay.simple;
    } else {
        switch (type) {
            case 'compare':
                currentDelay = state.delay.compare;
                break;
            case 'swap':
                currentDelay = state.delay.swap;
                break;
            default:
                currentDelay = 20;
        }
    }

    while (state.executionState === 'paused' && !state.stopSignal) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (state.stopSignal) return false;

    if (state.executionState === 'auto') {
        if (currentDelay > 0) {
            await new Promise(resolve => setTimeout(resolve, currentDelay));
        }
    } else if (state.executionState === 'step') {
        await new Promise(resolve => {
            state.stepPromiseResolvers.push(resolve);
        });
    }

    return !state.stopSignal;
}

function drawHeapTree(viz, size, highlights = {}) {
	const container = viz.auxContainer;
	container.innerHTML = '';
	if (size === 0) return;

	const BASE_NODE_DIAMETER = 30;
	const BASE_HORIZONTAL_SPACING = 20;
	const BASE_VERTICAL_SPACING = 50;
	const PADDING = 15;

	const nodePositions = new Array(size);
	let xOffset = PADDING;

	function calculatePositions(index, depth) {
		if (index >= size) return;
		const leftChildIdx = 2 * index + 1;
		const rightChildIdx = 2 * index + 2;

		calculatePositions(leftChildIdx, depth + 1);

		nodePositions[index] = {
			x: xOffset + BASE_NODE_DIAMETER / 2,
			y: depth * BASE_VERTICAL_SPACING + BASE_NODE_DIAMETER / 2 + PADDING
		};
		xOffset += BASE_NODE_DIAMETER + BASE_HORIZONTAL_SPACING;

		calculatePositions(rightChildIdx, depth + 1);

		if (leftChildIdx < size && rightChildIdx < size) {
			nodePositions[index].x = (nodePositions[leftChildIdx].x + nodePositions[rightChildIdx].x) / 2;
		}
	}

	calculatePositions(0, 0);

	const treeWidth = xOffset - BASE_HORIZONTAL_SPACING + PADDING;
	const treeHeight = (Math.floor(Math.log2(size)) + 1) * BASE_VERTICAL_SPACING + PADDING;

	const availableWidth = container.offsetWidth;
	const availableHeight = container.offsetHeight;

	const scaleX = availableWidth / treeWidth;
	const scaleY = availableHeight / treeHeight;
	const scaleFactor = Math.min(scaleX, scaleY, 1);

	const treeContainer = document.createElement('div');
	treeContainer.className = 'heap-tree';
	treeContainer.style.width = `${treeWidth}px`;
	treeContainer.style.height = `${treeHeight}px`;
	treeContainer.style.transform = `scale(${scaleFactor})`;

	const svgNS = "http://www.w3.org/2000/svg";
	const svg = document.createElementNS(svgNS, "svg");
	svg.setAttribute('class', 'heap-svg-canvas');
	treeContainer.appendChild(svg);

	for (let i = 0; i < size; i++) {
		const leftChildIdx = 2 * i + 1;
		const rightChildIdx = 2 * i + 2;
		if (leftChildIdx < size) {
			const line = document.createElementNS(svgNS, 'line');
			line.setAttribute('x1', nodePositions[i].x);
			line.setAttribute('y1', nodePositions[i].y);
			line.setAttribute('x2', nodePositions[leftChildIdx].x);
			line.setAttribute('y2', nodePositions[leftChildIdx].y);
			svg.appendChild(line);
		}
		if (rightChildIdx < size) {
			const line = document.createElementNS(svgNS, 'line');
			line.setAttribute('x1', nodePositions[i].x);
			line.setAttribute('y1', nodePositions[i].y);
			line.setAttribute('x2', nodePositions[rightChildIdx].x);
			line.setAttribute('y2', nodePositions[rightChildIdx].y);
			svg.appendChild(line);
		}
	}

	nodePositions.forEach((pos, i) => {
		const nodeEl = document.createElement('div');
		nodeEl.className = 'heap-node';
		nodeEl.textContent = viz.array[i];
		nodeEl.style.left = `${pos.x}px`;
		nodeEl.style.top = `${pos.y}px`;

		if (highlights.compare?.includes(i)) nodeEl.classList.add('highlight-compare');
		if (highlights.move?.includes(i)) nodeEl.classList.add('highlight-move');

		treeContainer.appendChild(nodeEl);
	});

	container.appendChild(treeContainer);
}

export const ALGORITHMS = {
	bubble: async (viz) => {
		const n = viz.array.length;
		for (let i = 0; i < n - 1; i++) {
			for (let j = 0; j < n - i - 1; j++) {
				viz.highlight(COMPARISON_COLOR, j, j + 1);
				if (!(await wait('compare'))) return;
				viz.incrementComparisons();
				if (viz.array[j] > viz.array[j + 1]) {
					viz.highlight(MOVEMENT_COLOR, j, j + 1);
					await viz.swap(j, j + 1);
					if (!(await wait('swap'))) return;
				}
				viz.unhighlight(j, j + 1);
			}
			viz.markBarSorted(n - 1 - i);
			viz.updateProgress(i + 1, n - 1);
		}
		if (n > 0) viz.markBarSorted(0);
	},

	cocktail: async (viz) => {
		const n = viz.array.length;
		let swapped = true;
		let start = 0;
		let end = n - 1;
		let progress = 0;
		while (swapped) {
			swapped = false;
			for (let i = start; i < end; ++i) {
				viz.highlight(COMPARISON_COLOR, i, i + 1);
				if (!(await wait('compare'))) return;
				viz.incrementComparisons();
				if (viz.array[i] > viz.array[i + 1]) {
					viz.highlight(MOVEMENT_COLOR, i, i + 1);
					await viz.swap(i, i + 1);
					swapped = true;
					if (!(await wait('swap'))) return;
				}
				viz.unhighlight(i, i + 1);
			}
			if (!swapped) break;
			swapped = false;
			viz.markBarSorted(end);
			progress++;
			end--;
			for (let i = end - 1; i >= start; --i) {
				viz.highlight(COMPARISON_COLOR, i, i + 1);
				if (!(await wait('compare'))) return;
				viz.incrementComparisons();
				if (viz.array[i] > viz.array[i + 1]) {
					viz.highlight(MOVEMENT_COLOR, i, i + 1);
					await viz.swap(i, i + 1);
					swapped = true;
					if (!(await wait('swap'))) return;
				}
				viz.unhighlight(i, i + 1);
			}
			viz.markBarSorted(start);
			progress++;
			start++;
			viz.updateProgress(progress, n);
		}
		for (let i = 0; i < n; i++) viz.markBarSorted(i);
		viz.updateProgress(n, n);
	},

	selection: async (viz) => {
		const n = viz.array.length;
		for (let i = 0; i < n - 1; i++) {
			let min_idx = i;
			viz.highlight(PIVOT_COLOR, min_idx);
			for (let j = i + 1; j < n; j++) {
				viz.highlight(COMPARISON_COLOR, j, min_idx);
				if (!(await wait('compare'))) return;
				viz.incrementComparisons();
				if (viz.array[j] < viz.array[min_idx]) {
					viz.unhighlight(min_idx);
					min_idx = j;
					viz.highlight(PIVOT_COLOR, min_idx);
				}
				viz.unhighlight(j);
			}
			if (min_idx !== i) {
				viz.highlight(MOVEMENT_COLOR, i, min_idx);
				if (!(await wait('swap'))) return;
				await viz.swap(i, min_idx);
			}
			viz.unhighlight(i, min_idx);
			viz.markBarSorted(i);
			viz.updateProgress(i + 1, n - 1);
		}
		if (n > 0) viz.markBarSorted(n - 1);
	},

	insertion: async (viz) => {
		const n = viz.array.length;
		for (let i = 1; i < n; i++) {
			let key = viz.array[i];
			let j = i - 1;
			viz.highlight(MOVEMENT_COLOR, i);
			if (!(await wait('compare'))) return;
			while (j >= 0 && (viz.highlight(COMPARISON_COLOR, j), viz.incrementComparisons(), viz.array[j] > key)) {
				if (!(await wait('compare'))) return;
				viz.highlight(MOVEMENT_COLOR, j + 1, j);
				viz.array[j + 1] = viz.array[j];
				viz.incrementAccesses();
				viz.bars[j + 1].style.height = viz.bars[j].style.height;
				if (!(await wait('swap'))) return;
				viz.unhighlight(j + 1, j);
				j--;
			}
			viz.highlight(MOVEMENT_COLOR, j + 1);
			viz.array[j + 1] = key;
			viz.incrementAccesses();
			viz.bars[j + 1].style.height = `${(key / viz.maxHeight) * 100}%`;
			if (!(await wait('swap'))) return;
			viz.unhighlight(j + 1, i);
			viz.updateProgress(i + 1, n);
		}
	},

	heap: async (viz) => {
		const n = viz.array.length;
		const isSingleView = state.activeVisualizers.length === 1;

		const heapify = async (size, i) => {
			if (isSingleView) drawHeapTree(viz, size, {
				compare: [i, 2 * i + 1, 2 * i + 2]
			});
			let largest = i,
				l = 2 * i + 1,
				r = 2 * i + 2;
			viz.highlight(COMPARISON_COLOR, i, l, r);
			if (!(await wait('compare'))) return;
			if (l < size) {
				viz.incrementComparisons();
				if (viz.array[l] > viz.array[largest]) largest = l;
			}
			if (r < size) {
				viz.incrementComparisons();
				if (viz.array[r] > viz.array[largest]) largest = r;
			}
			viz.unhighlight(i, l, r);

			if (largest !== i) {
				if (isSingleView) drawHeapTree(viz, size, {
					move: [i, largest]
				});
				viz.highlight(MOVEMENT_COLOR, i, largest);
				if (!(await wait('swap'))) return;
				await viz.swap(i, largest);
				viz.unhighlight(i, largest);
				await heapify(size, largest);
			} else {
				if (isSingleView) drawHeapTree(viz, size);
			}
		};

		for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
			await heapify(n, i);
		}

		if (isSingleView) {
			drawHeapTree(viz, n);
			if (!(await wait('general'))) return;
		}

		for (let i = n - 1; i > 0; i--) {
			if (isSingleView) drawHeapTree(viz, i + 1, {
				move: [0, i]
			});
			viz.highlight(MOVEMENT_COLOR, 0, i);
			if (!(await wait('swap'))) return;
			await viz.swap(0, i);
			viz.unhighlight(0, i);
			viz.markBarSorted(i);
			viz.updateProgress(n - i, n);
			await heapify(i, 0);
		}
		if (n > 0) viz.markBarSorted(0);
		if (isSingleView) viz.auxContainer.innerHTML = '';
	},

	quick: async (viz, strategy) => {
		const partition = async (low, high) => {
			const pivotIndex = await choosePivot(low, high);
			const pivotValue = viz.array[pivotIndex];
			await viz.swap(pivotIndex, high);
			viz.highlight(PIVOT_COLOR, high);
			let i = low;
			for (let j = low; j < high; j++) {
				viz.highlight(COMPARISON_COLOR, j);
				if (!(await wait('compare'))) return -1;
				viz.incrementComparisons();
				if (viz.array[j] < pivotValue) {
					viz.highlight(MOVEMENT_COLOR, i, j);
					if (!(await wait('swap'))) return;
					await viz.swap(i, j);
					viz.unhighlight(i, j);
					i++;
				}
				viz.unhighlight(j);
			}
			viz.highlight(MOVEMENT_COLOR, i, high);
			if (!(await wait('swap'))) return;
			await viz.swap(i, high);
			viz.unhighlight(i, high);
			return i;
		};
		const choosePivot = async (low, high) => {
			let pivotIdx;
			switch (strategy) {
				case 'first':
					pivotIdx = low;
					break;
				case 'middle':
					pivotIdx = Math.floor((low + high) / 2);
					break;
				case 'random':
					pivotIdx = Math.floor(Math.random() * (high - low + 1) + low);
					break;
				case 'median':
					const mid = Math.floor((low + high) / 2);
					viz.highlight(COMPARISON_COLOR, low, mid, high);
					if (!(await wait())) return high;
					viz.incrementComparisons(3);
					if (viz.array[low] > viz.array[mid]) await viz.swap(low, mid);
					if (viz.array[low] > viz.array[high]) await viz.swap(low, high);
					if (viz.array[mid] > viz.array[high]) await viz.swap(mid, high);
					viz.unhighlight(low, mid, high);
					pivotIdx = mid;
					break;
				case 'last':
				default:
					pivotIdx = high;
					break;
			}
			return pivotIdx;
		};
		const sort = async (low, high) => {
			if (low < high) {
				if (state.stopSignal) return;
				let pi = await partition(low, high);
				if (pi === -1) return;
				viz.markBarSorted(pi);
				viz.progressCounter++;
				viz.updateProgress(viz.progressCounter, viz.array.length);
				await Promise.all([sort(low, pi - 1), sort(pi + 1, high)]);
			} else if (low === high) {
				viz.markBarSorted(low);
				viz.progressCounter++;
				viz.updateProgress(viz.progressCounter, viz.array.length);
			}
		};
		await sort(0, viz.array.length - 1);
	},

	merge: async (viz) => {
		const n = viz.array.length;
		const isSingleView = state.activeVisualizers.length === 1;

		const renderSubArrayHTML = (array, label, idPrefix) => {
			const MAX_ITEMS = 30;
			const EDGE_ITEMS = 14;

			let itemsHTML = '';
			if (array.length > MAX_ITEMS) {
				const startItems = array.slice(0, EDGE_ITEMS);
				const endItems = array.slice(array.length - EDGE_ITEMS);

				itemsHTML += startItems.map((val, idx) => `<span class="sub-array-item" id="${idPrefix}-${idx}">${val}</span>`).join('');
				itemsHTML += `<span class="sub-array-ellipsis">...</span>`;
				itemsHTML += endItems.map((val, idx) => {
					const originalIndex = array.length - EDGE_ITEMS + idx;
					return `<span class="sub-array-item" id="${idPrefix}-${originalIndex}">${val}</span>`;
				}).join('');
			} else {
				itemsHTML = array.map((val, idx) => `<span class="sub-array-item" id="${idPrefix}-${idx}">${val}</span>`).join('');
			}
			return `<div class="sub-array"><span class="sub-array-label">${label}:</span>${itemsHTML}</div>`;
		};

		const merge = async (l, m, r) => {
			let n1 = m - l + 1,
				n2 = r - m;
			let L = new Array(n1),
				R = new Array(n2);
			for (let i = 0; i < n1; i++) L[i] = viz.array[l + i];
			for (let j = 0; j < n2; j++) R[j] = viz.array[m + 1 + j];

            viz.updateMemoryUsage(n1 + n2);

			if (isSingleView) {
				const htmlL = renderSubArrayHTML(L, 'L', 'L');
				const htmlR = renderSubArrayHTML(R, 'R', 'R');
				viz.auxContainer.innerHTML = `<div class="merge-sub-arrays">${htmlL}${htmlR}</div>`;
			}

			let i = 0,
				j = 0,
				k = l;
			const maxHeight = Math.max(...viz.array, 1);
			while (i < n1 && j < n2) {
				viz.highlight(COMPARISON_COLOR, l + i, m + 1 + j);
				if (isSingleView) {
					document.getElementById(`L-${i}`)?.classList.add('highlight-compare');
					document.getElementById(`R-${j}`)?.classList.add('highlight-compare');
				}
				if (!(await wait('compare'))) return;
				viz.incrementComparisons();

				let wasL = false;
				if (L[i] <= R[j]) {
					viz.array[k] = L[i];
					if (isSingleView) document.getElementById(`L-${i}`)?.classList.add('used');
					i++;
					wasL = true;
				} else {
					viz.array[k] = R[j];
					if (isSingleView) document.getElementById(`R-${j}`)?.classList.add('used');
					j++;
				}

				viz.unhighlight(l + i, m + 1 + j);
				if (isSingleView) {
					const idL = `L-${i - 1}`,
						idR = `R-${j - 1}`;
					if (wasL) document.getElementById(idL)?.classList.remove('highlight-compare');
					else document.getElementById(idR)?.classList.remove('highlight-compare');
				}

				viz.incrementAccesses();
				viz.highlight(MOVEMENT_COLOR, k);
				viz.bars[k].style.height = `${(viz.array[k] / maxHeight) * 100}%`;
				if (!(await wait('swap'))) return;
				viz.unhighlight(k);
				k++;
			}
			while (i < n1) {
				if (isSingleView) document.getElementById(`L-${i}`)?.classList.add('used');
				viz.array[k] = L[i];
				viz.incrementAccesses();
				viz.highlight(MOVEMENT_COLOR, k);
				viz.bars[k].style.height = `${(viz.array[k] / maxHeight) * 100}%`;
				if (!(await wait('swap'))) return;
				viz.unhighlight(k);
				i++;
				k++;
			}
			while (j < n2) {
				if (isSingleView) document.getElementById(`R-${j}`)?.classList.add('used');
				viz.array[k] = R[j];
				viz.incrementAccesses();
				viz.highlight(MOVEMENT_COLOR, k);
				viz.bars[k].style.height = `${(viz.array[k] / maxHeight) * 100}%`;
				if (!(await wait('swap'))) return;
				viz.unhighlight(k);
				j++;
				k++;
			}
            viz.updateMemoryUsage(0);
		};

		const sort = async (l, r) => {
			if (l >= r || state.stopSignal) return;
			const m = l + Math.floor((r - l) / 2);
			await sort(l, m);
			await sort(m + 1, r);
			await merge(l, m, r);
		};

		await sort(0, n - 1);
		if (isSingleView) viz.auxContainer.innerHTML = '';
	},
	radix: async (viz) => {
		const getMax = () => {
			let max = 0;
			for (const num of viz.array)
				if (num > max) max = num;
			return max;
		};
		const countSort = async (exp) => {
			const output = new Array(viz.array.length);
			const count = new Array(10).fill(0);
			for (let i = 0; i < viz.array.length; i++) {
				const digit = Math.floor(viz.array[i] / exp) % 10;
				count[digit]++;
				viz.incrementAccesses();
				viz.highlight(COMPARISON_COLOR, i);
				if (!(await wait())) return false;
				viz.unhighlight(i);
			}
			for (let i = 1; i < 10; i++) count[i] += count[i - 1];
			for (let i = viz.array.length - 1; i >= 0; i--) {
				const digit = Math.floor(viz.array[i] / exp) % 10;
				output[count[digit] - 1] = viz.array[i];
				count[digit]--;
				viz.incrementAccesses();
			}
			for (let i = 0; i < viz.array.length; i++) {
				viz.array[i] = output[i];
				viz.bars[i].style.height = `${(viz.array[i] / viz.maxHeight) * 100}%`;
				viz.incrementAccesses();
				viz.highlight(MOVEMENT_COLOR, i);
				if (!(await wait())) return false;
				viz.unhighlight(i);
			}
			return true;
		};
		const max = getMax();
		for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
			if (!(await countSort(exp))) return;
			viz.updateProgress(Math.log10(exp), Math.log10(max));
		}
	},
	bogo: async (viz) => {
		const isArraySorted = (arr) => {
			for (let i = 0; i < arr.length - 1; i++)
				if (arr[i] > arr[i + 1]) return false;
			return true;
		};
		const shuffle = () => {
			for (let i = viz.array.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[viz.array[i], viz.array[j]] = [viz.array[j], viz.array[i]];
			}
			viz.incrementAccesses(viz.array.length * 2);
		};
		let attempts = 0;
		while (true) {
			viz.incrementComparisons(viz.array.length > 1 ? viz.array.length - 1 : 0);
			if (isArraySorted(viz.array)) {
				viz.updateStatus(`Ordenado após ${attempts.toLocaleString('pt-BR')} tentativas!`);
				break;
			}
			if (state.stopSignal) return;
			if (!(await wait())) return;
			attempts++;
			viz.updateStatus(`Tentativa #${attempts.toLocaleString('pt-BR')}...`);
			shuffle();
			viz.redrawAllBars();
		}
	},
};