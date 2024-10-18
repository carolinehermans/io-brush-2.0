const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");
let isDrawing = false;
let sourceImg = new Image();
const maskImg = new Image();

const imgW = 100;

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Load the mask image
maskImg.src = "./brush-stroke.png"; // Replace with your mask (B&W) image URL

let compositeImg;

// Helper function to apply mask and create composite image
function createMaskedImage(sourceImage, maskImage) {
  const offscreenCanvas = document.createElement("canvas");
  const offscreenCtx = offscreenCanvas.getContext("2d");
  offscreenCanvas.width = imgW;
  offscreenCanvas.height = imgW;

  const maskCanvas = document.createElement("canvas");
  const maskCtx = maskCanvas.getContext("2d");
  maskCanvas.width = imgW;
  maskCanvas.height = imgW;
  maskCtx.drawImage(maskImage, 0, 0, imgW, imgW);

  const maskData = maskCtx.getImageData(0, 0, imgW, imgW);

  const sourceCanvas = document.createElement("canvas");
  const sourceCtx = sourceCanvas.getContext("2d");
  sourceCanvas.width = imgW;
  sourceCanvas.height = imgW;
  sourceCtx.drawImage(sourceImage, 0, 0, imgW, imgW);

  const sourceData = sourceCtx.getImageData(0, 0, imgW, imgW);

  for (let i = 0; i < maskData.data.length; i += 4) {
    const red = maskData.data[i];
    const green = maskData.data[i + 1];
    const blue = maskData.data[i + 2];

    if (red > 180 && green > 180 && blue > 180) {
      sourceData.data[i + 3] = 0; // Set alpha to 0 (fully transparent)
    }
  }

  offscreenCtx.putImageData(sourceData, 0, 0);

  return offscreenCanvas;
}

// Function to fetch the image from the server
function fetchImage() {
  fetch('http://127.0.0.1:5000/api/tempImage')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.blob();
    })
    .then(blob => {
      // Create a local URL for the image blob
      sourceImg.src = URL.createObjectURL(blob);

      // Wait for the image to load
      return new Promise((resolve) => {
        sourceImg.onload = resolve;
      });
    })
    .then(() => {
      // Create the composite image with the mask applied
      compositeImg = createMaskedImage(sourceImg, maskImg);
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });
}

// Initial image fetch
fetchImage();

// Set interval to fetch the image every 5 seconds (5000 ms)
setInterval(fetchImage, 5000);

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

  const { x, y } = getCoordinates(event);
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
    const touch = event.touches[0];
    x = touch.clientX;
    y = touch.clientY;
  } else {
    x = event.clientX;
    y = event.clientY;
  }

  return { x, y };
}

// Triple-click detection for the top-right corner
let clickCount = 0;
let clickTimer = null;

canvas.addEventListener("click", (event) => {
  const { x, y } = getCoordinates(event);

  // Define the top-right corner area (let's say 100x100 pixels)
  const topRightAreaX = canvas.width - 100;
  const topRightAreaY = 100;

  // Check if the click is in the top-right corner
  if (x > topRightAreaX && y < topRightAreaY) {
    clickCount++;

    // Clear the timer if it's already running
    if (clickTimer) {
      clearTimeout(clickTimer);
    }

    // If there are 3 clicks within 500ms, clear the canvas
    if (clickCount === 3) {
      clearCanvas();
      clickCount = 0; // Reset the click count
    } else {
      // Set a timer to reset click count after 500ms
      clickTimer = setTimeout(() => {
        clickCount = 0;
      }, 500);
    }
  }
});
