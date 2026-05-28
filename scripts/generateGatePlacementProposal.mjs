import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";

const rootDir = process.cwd();
const inputPath = path.join(rootDir, "map.png");
const outputPath = path.join(rootDir, "docs", "gate-placement-proposal.png");

const gates = [
  { id: "i1_front", x: 566, y: 358, width: 76, height: 18, rotation: -20 },
  { id: "i1_side", x: 474, y: 456, width: 68, height: 18, rotation: 58 },
  { id: "i1_rear", x: 645, y: 560, width: 78, height: 18, rotation: 15 },

  { id: "i2_front", x: 704, y: 256, width: 76, height: 18, rotation: -35 },
  { id: "i2_side", x: 812, y: 210, width: 70, height: 18, rotation: 82 },
  { id: "i2_rear", x: 910, y: 337, width: 76, height: 18, rotation: 15 },

  { id: "i3_front", x: 735, y: 575, width: 76, height: 18, rotation: 20 },
  { id: "i3_side", x: 840, y: 735, width: 70, height: 18, rotation: 78 },
  { id: "i3_rear", x: 986, y: 628, width: 76, height: 18, rotation: -25 },

  { id: "i4_front", x: 1048, y: 334, width: 78, height: 18, rotation: -25 },
  { id: "i4_side", x: 1212, y: 425, width: 72, height: 18, rotation: 4 },
  { id: "i4_rear", x: 1090, y: 585, width: 78, height: 18, rotation: 22 },

  { id: "center_northwest", x: 770, y: 400, width: 70, height: 18, rotation: -18 },
  { id: "center_northeast", x: 1005, y: 392, width: 70, height: 18, rotation: 24 },
  { id: "center_south", x: 875, y: 574, width: 70, height: 18, rotation: 0 }
];

const image = PNG.sync.read(fs.readFileSync(inputPath));

for (const gate of gates) {
  drawGate(image, gate);
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, PNG.sync.write(image));
console.log(`Generated ${outputPath}`);

function drawGate(image, gate) {
  const radians = (gate.rotation * Math.PI) / 180;
  const cos = Math.cos(-radians);
  const sin = Math.sin(-radians);
  const halfWidth = gate.width / 2;
  const halfHeight = gate.height / 2;
  const bound = Math.ceil(Math.sqrt(halfWidth * halfWidth + halfHeight * halfHeight)) + 5;

  for (let y = gate.y - bound; y <= gate.y + bound; y += 1) {
    for (let x = gate.x - bound; x <= gate.x + bound; x += 1) {
      const dx = x - gate.x;
      const dy = y - gate.y;
      const localX = dx * cos - dy * sin;
      const localY = dx * sin + dy * cos;
      const inside = Math.abs(localX) <= halfWidth && Math.abs(localY) <= halfHeight;
      if (!inside) {
        continue;
      }

      const edgeDistance = Math.min(
        halfWidth - Math.abs(localX),
        halfHeight - Math.abs(localY)
      );
      const color = edgeDistance <= 2
        ? [245, 210, 92, 255]
        : [0, 0, 0, 245];
      blendPixel(image, x, y, color);
    }
  }
}

function blendPixel(image, x, y, color) {
  if (x < 0 || y < 0 || x >= image.width || y >= image.height) {
    return;
  }

  const index = (image.width * y + x) << 2;
  const alpha = color[3] / 255;
  image.data[index] = Math.round(color[0] * alpha + image.data[index] * (1 - alpha));
  image.data[index + 1] = Math.round(color[1] * alpha + image.data[index + 1] * (1 - alpha));
  image.data[index + 2] = Math.round(color[2] * alpha + image.data[index + 2] * (1 - alpha));
  image.data[index + 3] = 255;
}
