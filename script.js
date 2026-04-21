// Optimization page specific JavaScript
let x = 2;
let lr = 0.03;
let running = false;
let intervalId = null;
let mode = "quadratic";
let stepCount = 0;

// Loss functions
function loss(x) {
    if (mode === "quadratic") return x * x;
    if (mode === "cubic") return x * x * x;
    if (mode === "sin") return Math.sin(x);
    if (mode === "doublewell") return x*x*x*x - x*x;
}

// Gradients
function gradient(x) {
    if (mode === "quadratic") return 2 * x;
    if (mode === "cubic") return 3 * x * x;
    if (mode === "sin") return Math.cos(x);
    if (mode === "doublewell") return 4*x*x*x - 2*x;
}

// Draw function curve
function drawCurve() {
    let points = [];
    const sampleRate = 0.1;

    for (let xVal = -5; xVal <= 5; xVal += sampleRate) {
        let yVal = loss(xVal);

        // Handle extreme values
        if (!isFinite(yVal)) continue;

        // Clamp y-values to prevent overflow
        yVal = Math.max(-5, Math.min(5, yVal));

        let px = (xVal + 5) * 40;     // scale x: [-5,5] -> [0,400]
        let py = 150 - yVal * 20;     // scale + invert y

        // Clamp y to prevent SVG overflow
        py = Math.max(0, Math.min(300, py));

        points.push(`${px},${py}`);
    }

    document.getElementById("curve")
        .setAttribute("points", points.join(" "));
}

// Update moving point position
function updatePoint() {
    let yVal = loss(x);

    // Clamp y-values
    yVal = Math.max(-5, Math.min(5, yVal));

    let px = (x + 5) * 40;
    let py = 150 - yVal * 20;

    // Clamp y to prevent SVG overflow
    py = Math.max(0, Math.min(300, py));

    let point = document.getElementById("point");
    point.setAttribute("cx", px);
    point.setAttribute("cy", py);
}

// Gradient descent step
function step() {
    let g = gradient(x);
    x = x - lr * g;
    stepCount++;

    // Check for edge cases
    if (!isFinite(x) || Math.abs(x) > 10) {
        stop();
        return;
    }

    updatePoint();
    updateText();
    updateDynamicDescription();
}

// Start simulation
function start() {
    if (running) return;

    running = true;
    stepCount = 0;
    document.getElementById("start-btn").innerText = "Stop";
    document.getElementById("function-select").disabled = true;

    intervalId = setInterval(step, 50);
}

// Stop simulation
function stop() {
    running = false;
    clearInterval(intervalId);
    document.getElementById("start-btn").innerText = "Start";
    document.getElementById("function-select").disabled = false;
}

// Reset simulation
function reset() {
    stop();
    x = 2;
    stepCount = 0;
    updatePoint();
    updateText();
    document.getElementById("status").innerText = "Ready to start";
    document.getElementById("math-status").innerText = "Select a function and press Start to begin optimization.";
}

// Update text display
function updateText() {
    document.getElementById("info").innerText =
        "x = " + x.toFixed(3) +
        " | loss = " + loss(x).toFixed(3);
}

// Update dynamic description
function updateDynamicDescription() {
    const status = document.getElementById("status");
    const mathStatus = document.getElementById("math-status");

    if (mode === "quadratic") {
        if (Math.abs(x) < 0.1) {
            status.innerText = "Converged to minimum";
            mathStatus.innerText = "System has converged to the global minimum at x = 0. The gradient is now nearly zero.";
        } else {
            status.innerText = "Converging to minimum";
            mathStatus.innerText = "The system is descending toward a minimum. Gradient descent is effectively reducing the loss.";
        }
    } else if (mode === "cubic") {
        status.innerText = "Diverging";
        mathStatus.innerText = "The function has no minimum. The system is unstable and diverging to infinity.";
    } else if (mode === "sin") {
        if (Math.abs(gradient(x)) < 0.1) {
            status.innerText = "Found local minimum";
            mathStatus.innerText = "System has settled into a local minimum. The gradient is near zero.";
        } else {
            status.innerText = "Finding local minimum";
            mathStatus.innerText = "The point is searching for a local minimum in the sinusoidal landscape.";
        }
    } else if (mode === "doublewell") {
        if (Math.abs(x - 0.707) < 0.1 || Math.abs(x + 0.707) < 0.1) {
            status.innerText = "Converged to minimum";
            mathStatus.innerText = "System has converged to one of the two minima at x = ±1/√2 ≈ ±0.707.";
        } else {
            status.innerText = "Choosing minimum";
            mathStatus.innerText = "The system is descending toward one of the two available minima.";
        }
    }
}

// UI Event handlers
document.getElementById("start-btn").addEventListener("click", () => {
    if (running) {
        stop();
    } else {
        start();
    }
});

document.getElementById("reset-btn").addEventListener("click", reset);

document.getElementById("function-select").addEventListener("change", (e) => {
    mode = e.target.value;
    stop(); // Stop simulation first
    drawCurve();
    reset();
});

document.getElementById("learning-rate").addEventListener("input", (e) => {
    lr = parseFloat(e.target.value);
    document.getElementById("lr-value").innerText = lr.toFixed(2);
});

// Initialize on page load
window.addEventListener("load", () => {
    drawCurve();
    updatePoint();
    updateText();
});