const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");
let isDrawing = false;
let img = new Image();

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Load the image that will follow the path
img.src = "./test-img.png";

// Set image width

// Event listeners for drawing
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseleave", stopDrawing);

canvas.addEventListener("touchstart", startDrawing, { passive: false });
canvas.addEventListener("touchmove", draw, { passive: false });
canvas.addEventListener("touchend", stopDrawing);

function startDrawing(event) {
  isDrawing = true;
}

function draw(event) {
  if (!isDrawing) return;

  // Handle touch/mouse positions
  const { x, y } = getCoordinates(event);

  // Draw the image at the current coordinates
  ctx.drawImage(img, x - img.width / 2, y - img.height / 2);
}

function stopDrawing() {
  isDrawing = false;
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Get coordinates for both mouse and touch events
function getCoordinates(event) {
  let x, y;

  if (event.touches) {
    // Touch event
    const touch = event.touches[0];
    x = touch.clientX;
    y = touch.clientY;
  } else {
    // Mouse event
    x = event.clientX;
    y = event.clientY;
  }

  return { x, y };
}
