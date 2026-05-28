import fs from 'node:fs';
import path from 'node:path';
import {
  PHASE6_GLB_ASSETS,
  getPhase6OptimizedGlbPath,
  getPhase6SourceGlbPath,
} from './phase6GlbManifest.mjs';

const JSON_CHUNK_TYPE = 0x4e4f534a;
const EXPECTED_ANIMATIONS = [
  'Dead',
  'Idle_02',
  'Running',
  'Walk_Forward_While_Shooting',
  'Walking',
];
const EXPECTED_ENEMY_OPTIMIZED_ANIMATIONS = [
  'Dead',
  'Running',
  'Walk_Forward_While_Shooting',
];

function formatMb(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function readGlbJson(filePath) {
  const buffer = fs.readFileSync(filePath);

  if (buffer.toString('utf8', 0, 4) !== 'glTF') {
    throw new Error(`Not a GLB file: ${filePath}`);
  }

  let offset = 12;
  while (offset < buffer.length) {
    const chunkLength = buffer.readUInt32LE(offset);
    const chunkType = buffer.readUInt32LE(offset + 4);
    const chunkStart = offset + 8;
    const chunkEnd = chunkStart + chunkLength;

    if (chunkType === JSON_CHUNK_TYPE) {
      const jsonText = buffer.toString('utf8', chunkStart, chunkEnd).trim();
      return JSON.parse(jsonText);
    }

    offset = chunkEnd;
  }

  throw new Error(`No JSON chunk found in GLB: ${filePath}`);
}

function summarizeGlb(filePath, expectedAnimations = EXPECTED_ANIMATIONS) {
  const stat = fs.statSync(filePath);
  const json = readGlbJson(filePath);
  const animations = (json.animations ?? []).map((animation) => animation.name ?? '(unnamed)');
  const missingAnimations = expectedAnimations.filter((name) => !animations.includes(name));
  const colorAttributes = (json.meshes ?? []).reduce(
    (count, mesh) =>
      count +
      (mesh.primitives ?? []).filter((primitive) => Boolean(primitive.attributes?.COLOR_0)).length,
    0,
  );

  return {
    size: stat.size,
    animations,
    missingAnimations,
    extensionSummary: {
      used: json.extensionsUsed ?? [],
      required: json.extensionsRequired ?? [],
    },
    counts: {
      scenes: json.scenes?.length ?? 0,
      nodes: json.nodes?.length ?? 0,
      meshes: json.meshes?.length ?? 0,
      skins: json.skins?.length ?? 0,
      materials: json.materials?.length ?? 0,
      textures: json.textures?.length ?? 0,
      images: json.images?.length ?? 0,
      embeddedImages: (json.images ?? []).filter((image) => Number.isInteger(image.bufferView)).length,
      externalImages: (json.images ?? []).filter((image) => typeof image.uri === 'string').length,
      colorAttributes,
    },
  };
}

function printSummary(kind, filePath, asset) {
  if (!fs.existsSync(filePath)) {
    console.log(`  ${kind}: missing (${path.relative(process.cwd(), filePath)})`);
    return;
  }

  const expectedAnimations =
    kind === 'optimized' && asset.id !== 'hero'
      ? EXPECTED_ENEMY_OPTIMIZED_ANIMATIONS
      : EXPECTED_ANIMATIONS;
  const summary = summarizeGlb(filePath, expectedAnimations);
  const relPath = path.relative(process.cwd(), filePath);
  const animations = summary.animations.length > 0 ? summary.animations.join(', ') : 'none';
  const usedExtensions =
    summary.extensionSummary.used.length > 0 ? summary.extensionSummary.used.join(', ') : 'none';
  const requiredExtensions =
    summary.extensionSummary.required.length > 0
      ? summary.extensionSummary.required.join(', ')
      : 'none';
  const missingAnimations =
    summary.missingAnimations.length > 0 ? summary.missingAnimations.join(', ') : 'none';
  const textureState =
    summary.counts.images === 0 && summary.counts.textures === 0 && summary.counts.colorAttributes > 0
      ? `runtime-safe vertex colors (${summary.counts.colorAttributes} primitive(s))`
      : summary.counts.embeddedImages === 0 && summary.counts.externalImages > 0
      ? `external textures (${summary.counts.externalImages} image file(s))`
      : summary.counts.images === 0 && summary.counts.textures === 0
      ? 'textureless'
      : `${summary.counts.textures} texture(s), ${summary.counts.images} image(s), ${summary.counts.embeddedImages} embedded image(s)`;

  console.log(`  ${kind}: ${formatMb(summary.size)} (${relPath})`);
  console.log(`    animations: ${animations}`);
  console.log(`    missing expected animations: ${missingAnimations}`);
  console.log(`    extensionsUsed: ${usedExtensions}`);
  console.log(`    extensionsRequired: ${requiredExtensions}`);
  console.log(
    `    counts: scenes=${summary.counts.scenes}, nodes=${summary.counts.nodes}, meshes=${summary.counts.meshes}, skins=${summary.counts.skins}, materials=${summary.counts.materials}, textures=${summary.counts.textures}, images=${summary.counts.images}, embeddedImages=${summary.counts.embeddedImages}, externalImages=${summary.counts.externalImages}, colorAttributes=${summary.counts.colorAttributes}`,
  );
  console.log(`    texture state: ${textureState}`);
}

console.log('Phase 6 GLB inspection');
for (const asset of PHASE6_GLB_ASSETS) {
  console.log(`\n${asset.label}`);
  printSummary('source', getPhase6SourceGlbPath(asset), asset);
  printSummary('optimized', getPhase6OptimizedGlbPath(asset), asset);
}
