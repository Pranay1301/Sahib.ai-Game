import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";

const OUT_DIR = path.resolve("assets", "phase5");
const OUT_FILE = path.join(OUT_DIR, "mechanical-door-sprite.png");

const FRAME_WIDTH = 128;
const FRAME_HEIGHT = 48;
const FRAME_COUNT = 4;

const png = new PNG({
  width: FRAME_WIDTH * FRAME_COUNT,
  height: FRAME_HEIGHT,
  colorType: 6
});

const palette = {
  frameDark: [42, 37, 50, 255],
  shadow: [15, 12, 18, 120],
  wallLilac: [226, 204, 245, 255],
  wallLight: [248, 231, 255, 255],
  panelPurple: [184, 159, 220, 255],
  panelDark: [70, 57, 84, 255],
  amber: [238, 142, 58, 255],
  redGlow: [238, 54, 76, 255],
  redGlowSoft: [238, 54, 76, 95],
  interior: [18, 14, 22, 230]
};

for (let frame = 0; frame < FRAME_COUNT; frame += 1) {
  drawFrame(frame, frame / (FRAME_COUNT - 1));
}

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, PNG.sync.write(png));
console.log(`Generated ${OUT_FILE}`);

function drawFrame(frame, openProgress) {
  const xOffset = frame * FRAME_WIDTH;
  clearFrame(xOffset);

  roundedRect(xOffset + 4, 8, 120, 32, 10, palette.shadow);
  roundedRect(xOffset + 6, 6, 116, 34, 9, palette.frameDark);
  roundedRect(xOffset + 10, 9, 108, 28, 7, palette.wallLilac);
  roundedRect(xOffset + 12, 11, 104, 24, 5, palette.wallLight);

  const opening = 12 + openProgress * 46;
  const panelWidth = Math.max(11, 48 - openProgress * 32);
  const leftPanelX = xOffset + 16 - openProgress * 13;
  const rightPanelX = xOffset + FRAME_WIDTH - 16 - panelWidth + openProgress * 13;

  roundedRect(xOffset + 18, 15, 92, 16, 4, palette.interior);
  roundedRect(leftPanelX, 13, panelWidth, 20, 4, palette.panelPurple);
  roundedRect(rightPanelX, 13, panelWidth, 20, 4, palette.panelPurple);
  rect(leftPanelX + 4, 17, Math.max(4, panelWidth - 8), 3, palette.wallLight);
  rect(rightPanelX + 4, 17, Math.max(4, panelWidth - 8), 3, palette.wallLight);
  rect(leftPanelX + 5, 26, Math.max(5, panelWidth - 10), 3, palette.amber);
  rect(rightPanelX + 5, 26, Math.max(5, panelWidth - 10), 3, palette.amber);

  const gapX = xOffset + FRAME_WIDTH / 2 - opening / 2;
  roundedRect(gapX, 14, opening, 19, 4, palette.interior);
  rect(xOffset + FRAME_WIDTH / 2 - 1, 13, 2, 20, palette.redGlow);
  roundedRect(gapX + 2, 16, Math.max(2, opening - 4), 15, 4, palette.redGlowSoft);

  rect(xOffset + 14, 11, 6, 24, palette.panelDark);
  rect(xOffset + FRAME_WIDTH - 20, 11, 6, 24, palette.panelDark);
  rect(xOffset + 22, 34, 84, 3, palette.amber);
  rect(xOffset + 32, 7, 64, 2, palette.wallLight);
}

function clearFrame(xOffset) {
  for (let y = 0; y < FRAME_HEIGHT; y += 1) {
    for (let x = xOffset; x < xOffset + FRAME_WIDTH; x += 1) {
      setPixel(x, y, [0, 0, 0, 0]);
    }
  }
}

function roundedRect(x, y, width, height, radius, color) {
  for (let py = y; py < y + height; py += 1) {
    for (let px = x; px < x + width; px += 1) {
      const cx = px < x + radius ? x + radius : px >= x + width - radius ? x + width - radius - 1 : px;
      const cy = py < y + radius ? y + radius : py >= y + height - radius ? y + height - radius - 1 : py;
      const dx = px - cx;
      const dy = py - cy;
      if (dx * dx + dy * dy <= radius * radius) {
        setPixel(px, py, color);
      }
    }
  }
}

function rect(x, y, width, height, color) {
  for (let py = y; py < y + height; py += 1) {
    for (let px = x; px < x + width; px += 1) {
      setPixel(px, py, color);
    }
  }
}

function setPixel(x, y, color) {
  if (x < 0 || y < 0 || x >= png.width || y >= png.height) {
    return;
  }

  const index = (png.width * y + x) << 2;
  png.data[index] = color[0];
  png.data[index + 1] = color[1];
  png.data[index + 2] = color[2];
  png.data[index + 3] = color[3];
}
