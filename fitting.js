// Function Learning page specific JavaScript
let w = 0.3;
let b = -0.7;
let learningRate = 0.001;
let running = false;
let intervalId = null;
let stepCount = 0;

// Target function - linear
function target(x) {
    return 2 * x;
}

// Model function with tanh activation
function model(x) {
    return Math.tanh(w * x + b);
}

// Loss calculation - mean squared error
function loss() {
    let total = 0;
    const samplePoints = 31; // Sample every 0.1 units from -1.5 to 1.5

    for (let i = 0; i < samplePoints; i++) {
        let x = -1.5 + (3 * i) / (samplePoints - 1);
        let targetVal = target(x);
        let modelVal = model(x);
        total += Math.pow(targetVal - modelVal, 2);
    }

    return total / samplePoints;
}

// Numerical gradient calculation
function numericalGradient() {
    const epsilon = 0.0001;

    // Gradient with respect to w
    let loss_w_plus = 0;
    let loss_w_minus = 0;
    const samplePoints = 31; // Sample every 0.1 units from -1.5 to 1.5

    for (let i = 0; i < samplePoints; i++) {
        let x = -1.5 + (3 * i) / (samplePoints - 1);
        let targetVal = target(x);

        // w + epsilon
        let model_w_plus = Math.tanh((w + epsilon) * x + b);
        loss_w_plus += Math.pow(targetVal - model_w_plus, 2);

        // w - epsilon
        let model_w_minus = Math.tanh((w - epsilon) * x + b);
        loss_w_minus += Math.pow(targetVal - model_w_minus, 2);
    }

    let dw = (loss_w_plus - loss_w_minus) / (2 * epsilon);

    // Gradient with respect to b
    let loss_b_plus = 0;
    let loss_b_minus = 0;

    for (let i = 0; i < samplePoints; i++) {
        let x = -1.5 + (3 * i) / (samplePoints - 1);
        let targetVal = target(x);

        // b + epsilon
        let model_b_plus = Math.tanh(w * x + (b + epsilon));
        loss_b_plus += Math.pow(targetVal - model_b_plus, 2);

        // b - epsilon
        let model_b_minus = Math.tanh(w * x + (b - epsilon));
        loss_b_minus += Math.pow(targetVal - model_b_minus, 2);
    }

    let db = (loss_b_plus - loss_b_minus) / (2 * epsilon);

    return { dw, db };
}

// Draw curves
function drawCurves() {
    let targetPoints = [];
    let modelPoints = [];
    const sampleRate = 0.1;

    for (let xVal = -1.5; xVal <= 1.5; xVal += sampleRate) {
        // Target curve
        let targetY = target(xVal);
        let targetPx = (xVal + 1.5) * (400 / 3);
        let targetPy = 300 - (targetY + 3) * (300 / 6);
        targetPoints.push(`${targetPx},${targetPy}`);

        // Model curve
        let modelY = model(xVal);
        let modelPy = 300 - (modelY + 3) * (300 / 6);
        modelPoints.push(`${targetPx},${modelPy}`);
    }

    document.getElementById("target-curve")
        .setAttribute("points", targetPoints.join(" "));
    document.getElementById("model-curve")
        .setAttribute("points", modelPoints.join(" "));
}

// Update curves and info
function updateCurves() {
    drawCurves();
    updateInfo();
    updateDynamicDescription();
}

// Learning step
function step() {
    const { dw, db } = numericalGradient();

    // Update parameters
    w = w - learningRate * dw;
    b = b - learningRate * db;
    stepCount++;

    // Check for edge cases
    if (!isFinite(w) || !isFinite(b) || Math.abs(w) > 10 || Math.abs(b) > 10) {
        stop();
        return;
    }

    updateCurves();
}

// Start simulation
function start() {
    if (running) return;

    running = true;
    stepCount = 0;
    document.getElementById("start-btn-fitting").innerText = "Stop";

    intervalId = setInterval(step, 50);
}

// Stop simulation
function stop() {
    running = false;
    clearInterval(intervalId);
    document.getElementById("start-btn-fitting").innerText = "Start";
}

// Reset simulation
function reset() {
    stop();
    w = 0.5;
    b = 0;
    stepCount = 0;
    updateCurves();
    document.getElementById("learning-status").innerText = "Ready to learn";
    document.getElementById("learning-progress").innerText = "The model starts with random parameters and learns to match the target function through gradient descent.";
}

// Update text display
function updateInfo() {
    const currentLoss = loss();
    document.getElementById("fitting-info").innerText =
        "w = " + w.toFixed(3) +
        " | b = " + b.toFixed(3) +
        " | loss = " + currentLoss.toFixed(3);
}

// Format learning rate display (4 decimal places)
function formatLearningRate(value) {
    return value.toFixed(4);
}


// Format learning rate display (3 decimal places)
function formatLearningRate(value) {
    return value.toFixed(3);
}

// UI Event handlers
document.getElementById("start-btn-fitting").addEventListener("click", () => {
    if (running) {
        stop();
    } else {
        start();
    }
});

document.getElementById("reset-btn-fitting").addEventListener("click", reset);

const slider = document.getElementById("lr");
const lrText = document.getElementById("lrValue");

slider.addEventListener("input", () => {
    learningRate = parseFloat(slider.value);
    lrText.textContent = formatLearningRate(learningRate);
});

// Initialize on page load
window.addEventListener("load", () => {
    updateCurves();
    // Initialize learning rate display
    lrText.textContent = formatLearningRate(learningRate);
});