const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");
let isDrawing = false;
let sourceImg = new Image();
const maskImg = new Image();

const imgW = 100;

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Load the image that will follow the path
sourceImg.src = "./test-img-2.png";
maskImg.src = "./brush-stroke.png"; // Replace with your mask (B&W) image URL

let compositeImg;

// Helper function to apply mask and create composite image
function createMaskedImage(sourceImage, maskImage) {
  // Create an offscreen canvas for the result
  const offscreenCanvas = document.createElement("canvas");
  const offscreenCtx = offscreenCanvas.getContext("2d");
  offscreenCanvas.width = imgW;
  offscreenCanvas.height = imgW;

  // Draw the mask onto an offscreen canvas
  const maskCanvas = document.createElement("canvas");
  const maskCtx = maskCanvas.getContext("2d");
  maskCanvas.width = imgW;
  maskCanvas.height = imgW;
  maskCtx.drawImage(maskImage, 0, 0, imgW, imgW);

  const maskData = maskCtx.getImageData(0, 0, imgW, imgW);

  // Draw the source image on another offscreen canvas
  const sourceCanvas = document.createElement("canvas");
  const sourceCtx = sourceCanvas.getContext("2d");
  sourceCanvas.width = imgW;
  sourceCanvas.height = imgW;
  sourceCtx.drawImage(sourceImage, 0, 0, imgW, imgW);

  const sourceData = sourceCtx.getImageData(0, 0, imgW, imgW);

  // Loop through the mask image pixels and apply the mask as transparency
  for (let i = 0; i < maskData.data.length; i += 4) {
    const red = maskData.data[i];
    const green = maskData.data[i + 1];
    const blue = maskData.data[i + 2];

    // If the mask pixel is white or near white, set the source pixel to be transparent
    if (red > 180 && green > 180 && blue > 180) {
      sourceData.data[i + 3] = 0; // Set alpha to 0 (fully transparent)
    }
  }

  // Put the modified source image onto the offscreen canvas
  offscreenCtx.putImageData(sourceData, 0, 0);

  return offscreenCanvas;
}

Promise.all([
  new Promise((resolve) => {
    sourceImg.onload = resolve;
  }),
  new Promise((resolve) => {
    maskImg.onload = resolve;
  }),
]).then(() => {
  // Create the composite image with the mask applied
  compositeImg = createMaskedImage(sourceImg, maskImg);
});

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
  if (!isDrawing || !compositeImg) return;

  // Handle touch/mouse positions
  const { x, y } = getCoordinates(event);

  // Draw the composite image at the current coordinates without overwriting other content
  ctx.drawImage(compositeImg, x - imgW / 2, y - imgW / 2);
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
