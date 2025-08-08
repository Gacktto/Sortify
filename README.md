<h1 align="center">Sortify</h1>

<p align="center">
  <img src="https://img.shields.io/github/license/Gacktto/Sortify" alt="license">
  <img src="https://img.shields.io/github/last-commit/Gacktto/Sortify" alt="last commit">
  <img src="https://img.shields.io/github/languages/top/Gacktto/Sortify" alt="languages">
  <img src="https://img.shields.io/badge/status-developing-yellow" alt="status">
</p>

<p align="center">Sortify is an interactive web application designed for students, educators, and developers to visualize, compare, and analyze the performance of various sorting algorithms. It serves as an advanced "studio" that goes beyond simple visualization, offering multiple analysis modes and detailed execution controls.</p>

## Live 
[Sortify Live](https://gacktto.github.io/Sortify/)

![Sortify Header](/assets/banner.png)

## About The Project

The goal of Sortify is to provide a robust and intuitive platform to demystify the inner workings and performance nuances of sorting algorithms. By enabling real-time, side-by-side comparisons and systematic benchmarks, the application facilitates a practical understanding of theoretical concepts such as time complexity, stability, and the impact of different input data scenarios.

## Key Features

* **Three Analysis Modes:**
    * **Single View:** A focused analysis of a single algorithm, complete with auxiliary visualizations (like the Heap Sort tree or Merge Sort sub-arrays) for a deeper understanding.
    * **Race Mode:** Pit multiple algorithms against each other in a real-time race using the same dataset.
    * **Benchmark Mode:** Perform a structured performance analysis by running a "pivot" algorithm against a list of "challengers" in consecutive rounds, ensuring fair and controlled comparisons.

* **Full Execution Control:**
    * **Data Size:** Dynamically adjust the number of elements to be sorted.
    * **Execution Speed:** Control the animation speed with a simple (global) or advanced (specific delays for comparison and swap operations) mode.
    * **Data Scenarios:** Test algorithms under various initial conditions: random, nearly sorted, reversed, or with few unique values.
    * **Step-by-Step Execution:** Execute algorithms one step at a time for a granular analysis of their process.

* **Detailed Statistics and Reports:**
    * Real-time tracking of the number of **comparisons** and **array accesses**.
    * At the end of a run, a comprehensive report modal is generated with charts (powered by Chart.js) comparing execution time, comparisons, and accesses.

* **Algorithm-Specific Customization:**
    * For Quick Sort, users can choose from five different pivot selection strategies (last, first, middle, median-of-three, and random).


## Implemented Algorithms

Sortify includes a comprehensive selection of classic and efficient algorithms:

* Bubble Sort
* Cocktail Shaker Sort
* Selection Sort
* Insertion Sort
* Heap Sort
* Merge Sort
* Quick Sort
* Radix Sort
* Bogo Sort

## Technologies Used

This project was built entirely with front-end web technologies, requiring no server-side backend or complex build steps.

* **HTML5**
* **CSS3** (with Custom Properties/Variables, Flexbox, and Grid Layout)
* **JavaScript (ES6 Modules)**
* **Chart.js** for data visualization in reports.

## Getting Started

As the project is self-contained, running it locally is very straightforward.

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/Gacktto/Sortify.git
    ```

2.  **Open the `index.html` file:**
    Navigate to the project folder and open the `index.html` file in your preferred web browser.

    *Note: For the best experience, especially due to the use of ES6 Modules (`import`/`export`), it is recommended to use a local server. An extension like **Live Server** for Visual Studio Code handles this easily.*
    

## Future Implementations

While the current version is fully functional, here are some potential features and improvements for the future:

* [ ] **Additional Algorithms:** Incorporate more sorting algorithms like Shell Sort, Tim Sort, or Bucket Sort.
* [x] **Live Code Highlighting:** Display a pseudo-code or actual code snippet for the running algorithm, highlighting the line of code that corresponds to the current operation (e.g., a comparison or swap).
* [x] **Memory Usage Visualization:** Add a visual indicator to show the auxiliary memory being used by non-in-place algorithms like Merge Sort.
* [ ] **Save/Load Presets:** Allow users to save their favorite configurations (algorithm selections, data size, scenario) and load them later.
* [ ] **Export Results:** Add functionality to export the data from benchmark reports as a CSV or JSON file for further analysis.

## License

This project is distributed under the **GNU General Public License v3.0 (GPL-3.0)**.

See the `LICENSE` file in the project root for the full text and further details.
