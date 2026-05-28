import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";

const OUTPUT_DIR = path.join("assets", "phase9", "runtime");
const CELL_SIZE = 96;
const FRAME_COUNT = 4;

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

writeSheet("block_wall_runtime.png", drawBlockWallFrame);
writeSheet("sand_trap_runtime.png", drawSandTrapFrame);

function writeSheet(fileName, drawFrame) {
  const image = new PNG({
    width: CELL_SIZE * FRAME_COUNT,
    height: CELL_SIZE,
    colorType: 6
  });

  for (let frame = 0; frame < FRAME_COUNT; frame += 1) {
    drawFrame(image, frame);
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, fileName), PNG.sync.write(image));
}

function drawBlockWallFrame(image, frame) {
  const offsetX = frame * CELL_SIZE;
  const glow = 34 + frame * 13;
  drawSoftShadow(image, offsetX + 15, 35, 66, 22, [80, 38, 42, 72]);
  drawRoundedRect(image, offsetX + 14, 32, 68, 24, 7, [46, 31, 31, 255]);
  drawRoundedRect(image, offsetX + 17, 29, 62, 23, 6, [178, 127, 84, 255]);
  drawRoundedRect(image, offsetX + 19, 31, 58, 18, 5, [215, 164, 106, 255]);
  drawLine(image, offsetX + 26, 31, offsetX + 26, 49, [124, 80, 62, 230], 2);
  drawLine(image, offsetX + 43, 30, offsetX + 43, 50, [126, 78, 62, 230], 2);
  drawLine(image, offsetX + 61, 31, offsetX + 61, 49, [124, 80, 62, 230], 2);
  drawLine(image, offsetX + 18, 29, offsetX + 78, 29, [255, 220, 150, 150], 2);
  drawLine(image, offsetX + 17, 54, offsetX + 79, 54, [125, 68, 54, 190], 2);
  drawCracks(image, offsetX, frame);
  drawPixel(image, offsetX + 9, 44, [244, 211, 111, glow]);
  drawPixel(image, offsetX + 86, 44, [244, 211, 111, glow]);
}

function drawSandTrapFrame(image, frame) {
  const offsetX = frame * CELL_SIZE;
  const pulse = 18 + frame * 8;
  drawEllipse(image, offsetX + 48, 51, 34, 24, [145, 100, 45, 92]);
  drawEllipse(image, offsetX + 48, 47, 30, 20, [218, 167, 78, 190]);
  drawEllipse(image, offsetX + 48, 45, 23, 14, [247, 207, 117, 225]);
  drawEllipse(image, offsetX + 48, 45, 15, 8, [255, 230, 157, 210]);
  drawLine(image, offsetX + 24, 46, offsetX + 72, 40 + frame, [107, 74, 52, 92], 2);
  drawLine(image, offsetX + 27, 56 - frame, offsetX + 70, 51, [107, 74, 52, 98], 2);
  drawLine(image, offsetX + 37, 30, offsetX + 45, 35, [244, 211, 111, 110 + pulse], 2);
  drawLine(image, offsetX + 61, 59, offsetX + 70, 65, [244, 211, 111, 95 + pulse], 2);
  drawRing(image, offsetX + 48, 47, 36 + frame * 2, 25 + frame, [244, 211, 111, 42]);
}

function drawCracks(image, offsetX, frame) {
  if (frame >= 1) {
    drawLine(image, offsetX + 35, 33, offsetX + 40, 44, [75, 39, 43, 210], 2);
  }
  if (frame >= 2) {
    drawLine(image, offsetX + 52, 31, offsetX + 47, 41, [75, 39, 43, 220], 2);
    drawLine(image, offsetX + 47, 41, offsetX + 55, 50, [75, 39, 43, 220], 2);
  }
  if (frame >= 3) {
    drawLine(image, offsetX + 64, 33, offsetX + 69, 48, [75, 39, 43, 225], 2);
  }
}

function drawRoundedRect(image, x, y, width, height, radius, color) {
  for (let py = y; py < y + height; py += 1) {
    for (let px = x; px < x + width; px += 1) {
      const dx = px < x + radius ? x + radius - px : px >= x + width - radius ? px - (x + width - radius - 1) : 0;
      const dy = py < y + radius ? y + radius - py : py >= y + height - radius ? py - (y + height - radius - 1) : 0;
      if (dx * dx + dy * dy <= radius * radius) {
        drawPixel(image, px, py, color);
      }
    }
  }
}

function drawSoftShadow(image, x, y, width, height, color) {
  drawRoundedRect(image, x, y, width, height, 12, color);
}

function drawEllipse(image, cx, cy, rx, ry, color) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y += 1) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x += 1) {
      const nx = (x - cx) / rx;
      const ny = (y - cy) / ry;
      if (nx * nx + ny * ny <= 1) {
        drawPixel(image, x, y, color);
      }
    }
  }
}

function drawRing(image, cx, cy, rx, ry, color) {
  for (let angle = 0; angle < Math.PI * 2; angle += 0.02) {
    drawPixel(image, Math.round(cx + Math.cos(angle) * rx), Math.round(cy + Math.sin(angle) * ry), color);
  }
}

function drawLine(image, x1, y1, x2, y2, color, thickness = 1) {
  const steps = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1)));
  for (let step = 0; step <= steps; step += 1) {
    const x = x1 + ((x2 - x1) * step) / steps;
    const y = y1 + ((y2 - y1) * step) / steps;
    for (let ox = -thickness; ox <= thickness; ox += 1) {
      for (let oy = -thickness; oy <= thickness; oy += 1) {
        if (ox * ox + oy * oy <= thickness * thickness) {
          drawPixel(image, Math.round(x + ox), Math.round(y + oy), color);
        }
      }
    }
  }
}

function drawPixel(image, x, y, color) {
  if (x < 0 || y < 0 || x >= image.width || y >= image.height) {
    return;
  }

  const index = (image.width * y + x) * 4;
  const sourceAlpha = color[3] / 255;
  const targetAlpha = image.data[index + 3] / 255;
  const outAlpha = sourceAlpha + targetAlpha * (1 - sourceAlpha);
  if (outAlpha <= 0) {
    return;
  }

  image.data[index] = Math.round((color[0] * sourceAlpha + image.data[index] * targetAlpha * (1 - sourceAlpha)) / outAlpha);
  image.data[index + 1] = Math.round((color[1] * sourceAlpha + image.data[index + 1] * targetAlpha * (1 - sourceAlpha)) / outAlpha);
  image.data[index + 2] = Math.round((color[2] * sourceAlpha + image.data[index + 2] * targetAlpha * (1 - sourceAlpha)) / outAlpha);
  image.data[index + 3] = Math.round(outAlpha * 255);
}
