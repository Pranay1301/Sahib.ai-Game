import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { NodeIO } from '@gltf-transform/core';
import { prune } from '@gltf-transform/functions';
import { PNG } from 'pngjs';
import {
  PHASE6_GLB_ASSETS,
  PHASE6_GLB_OUTPUT_DIR,
  REPO_ROOT,
  getPhase6OptimizedGlbPath,
  getPhase6SourceGlbPath,
} from './phase6GlbManifest.mjs';

const gltfTransformCli = path.join(
  REPO_ROOT,
  'node_modules',
  '@gltf-transform',
  'cli',
  'bin',
  'cli.js',
);

// Keep runtime compatibility simple for React Native Three.js:
// avoid Meshopt/Draco extensions until the expo-gl loader explicitly wires decoders.
const BASE_OPTIMIZE_ARGS = [
  '--compress',
  'false',
  '--texture-compress',
  'auto',
  '--texture-size',
  '1024',
  '--flatten',
  'false',
  '--join',
  'false',
  '--instance',
  'false',
  '--palette',
  'false',
  '--simplify-error',
  '0.0001',
];
const HERO_SIMPLIFY_RATIO = '0.85';
const ENEMY_SIMPLIFY_RATIO = '0.65';
const ENEMY_RUNTIME_ANIMATIONS = new Set([
  'Dead',
  'Running',
  'Walk_Forward_While_Shooting',
]);
const optimizeScope = process.env.PHASE6_OPTIMIZE_SCOPE ?? 'all';

function formatMb(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function getFileSize(filePath) {
  return fs.statSync(filePath).size;
}

async function bakeTextureToVertexColors(filePath, asset) {
  const io = new NodeIO();
  const document = await io.read(filePath);
  const root = document.getRoot();
  const buffer = root.listBuffers()[0] ?? document.createBuffer();
  let bakedPrimitiveCount = 0;
  let removedAnimationCount = 0;

  if (asset.id !== 'hero') {
    for (const animation of root.listAnimations()) {
      if (!ENEMY_RUNTIME_ANIMATIONS.has(animation.getName())) {
        animation.dispose();
        removedAnimationCount += 1;
      }
    }
  }

  for (const mesh of root.listMeshes()) {
    for (const primitive of mesh.listPrimitives()) {
      const material = primitive.getMaterial();
      const texture = material?.getBaseColorTexture();
      const uvAccessor = primitive.getAttribute('TEXCOORD_0');
      const positionAccessor = primitive.getAttribute('POSITION');

      if (!material || !texture || !uvAccessor || !positionAccessor || !texture.getImage()) {
        continue;
      }

      const image = PNG.sync.read(Buffer.from(texture.getImage()));
      const vertexCount = positionAccessor.getCount();
      const colorArray = new Float32Array(vertexCount * 4);
      const uv = [0, 0];

      for (let index = 0; index < vertexCount; index += 1) {
        uvAccessor.getElement(index, uv);
        const color = sampleTexture(image, uv[0], uv[1]);
        colorArray[index * 4] = srgbToLinear(color.r);
        colorArray[index * 4 + 1] = srgbToLinear(color.g);
        colorArray[index * 4 + 2] = srgbToLinear(color.b);
        colorArray[index * 4 + 3] = color.a;
      }

      const colorAccessor = document
        .createAccessor(`${mesh.getName() || 'character'}_COLOR_0`)
        .setType('VEC4')
        .setArray(colorArray)
        .setBuffer(buffer);
      primitive.setAttribute('COLOR_0', colorAccessor);

      material.setBaseColorTexture(null);
      material.setEmissiveTexture(null);
      material.setMetallicRoughnessTexture(null);
      material.setNormalTexture(null);
      material.setOcclusionTexture(null);
      material.setBaseColorFactor([1, 1, 1, 1]);
      material.setEmissiveFactor([0, 0, 0]);
      material.setMetallicFactor(0.04);
      material.setRoughnessFactor(0.82);
      material.setDoubleSided(true);
      bakedPrimitiveCount += 1;
    }
  }

  for (const texture of root.listTextures()) {
    texture.dispose();
  }

  await document.transform(prune());
  await io.write(filePath, document);
  return {
    bakedPrimitiveCount,
    removedAnimationCount,
  };
}

function sampleTexture(image, rawU, rawV) {
  const u = wrap01(rawU);
  const v = wrap01(rawV);
  const x = clamp(Math.round(u * (image.width - 1)), 0, image.width - 1);
  const y = clamp(Math.round((1 - v) * (image.height - 1)), 0, image.height - 1);
  const offset = (y * image.width + x) * 4;

  return {
    r: image.data[offset] / 255,
    g: image.data[offset + 1] / 255,
    b: image.data[offset + 2] / 255,
    a: image.data[offset + 3] / 255,
  };
}

function wrap01(value) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return ((value % 1) + 1) % 1;
}

function srgbToLinear(value) {
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

if (!fs.existsSync(gltfTransformCli)) {
  throw new Error(
    `Missing gltf-transform CLI at ${gltfTransformCli}. Run npm install before optimizing.`,
  );
}

fs.mkdirSync(PHASE6_GLB_OUTPUT_DIR, { recursive: true });

console.log('Optimizing Phase 6 Meshy merged GLBs');
console.log(`Output: ${path.relative(REPO_ROOT, PHASE6_GLB_OUTPUT_DIR)}`);
console.log(`Scope: ${optimizeScope}`);

const assetsToOptimize = PHASE6_GLB_ASSETS.filter((asset) => {
  if (optimizeScope === 'enemies') {
    return asset.id !== 'hero';
  }

  if (optimizeScope === 'hero') {
    return asset.id === 'hero';
  }

  return true;
});

for (const asset of assetsToOptimize) {
  const sourcePath = getPhase6SourceGlbPath(asset);
  const outputPath = getPhase6OptimizedGlbPath(asset);
  const optimizeArgs = getOptimizeArgs(asset);

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing source GLB for ${asset.label}: ${sourcePath}`);
  }

  const beforeSize = getFileSize(sourcePath);
  const result = spawnSync(
    process.execPath,
    [gltfTransformCli, 'optimize', sourcePath, outputPath, ...optimizeArgs],
    {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: 'pipe',
    },
  );

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }

  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  if (result.status !== 0) {
    if (result.error) {
      console.error(result.error);
    }

    throw new Error(`Optimization failed for ${asset.label}`);
  }

  const postProcess = await bakeTextureToVertexColors(outputPath, asset);
  const afterSize = getFileSize(outputPath);
  const reduction = beforeSize > 0 ? (1 - afterSize / beforeSize) * 100 : 0;
  console.log(
    `${asset.label}: ${formatMb(beforeSize)} -> ${formatMb(afterSize)} (${reduction.toFixed(1)}% smaller, ${postProcess.bakedPrimitiveCount} primitive(s) color-baked, ${postProcess.removedAnimationCount} animation(s) stripped)`,
  );
}

console.log('\nDone. Run npm run inspect:phase6-glb to verify animations, vertex colors, and texture removal.');

function getOptimizeArgs(asset) {
  const simplifyRatio = asset.id === 'hero' ? HERO_SIMPLIFY_RATIO : ENEMY_SIMPLIFY_RATIO;
  return [
    ...BASE_OPTIMIZE_ARGS,
    '--simplify-ratio',
    simplifyRatio,
  ];
}
