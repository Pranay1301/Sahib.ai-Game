import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));

export const REPO_ROOT = path.resolve(scriptDir, '..');
export const PHASE6_ASSET_ROOT = path.join(REPO_ROOT, 'assets', 'phase6');
export const PHASE6_GLB_OUTPUT_DIR = path.join(PHASE6_ASSET_ROOT, 'glb');

export const MESHY_SOURCE_SUBDIR = 'Meshy_AI_Use_the_uploaded_refe_biped';
export const MESHY_MERGED_ANIMATION_FILE =
  'Meshy_AI_Use_the_uploaded_refe_biped_Meshy_AI_Meshy_Merged_Animations.glb';

export const PHASE6_GLB_ASSETS = [
  {
    id: 'hero',
    label: 'Hero',
    sourceFolder: 'hero',
    outputFile: 'hero.glb',
  },
  {
    id: 'alien_hunter',
    label: 'Alien Hunter',
    sourceFolder: 'Alien Hunter',
    outputFile: 'alien_hunter.glb',
  },
  {
    id: 'hunter_exosuit',
    label: 'Hunter Exosuit',
    sourceFolder: 'Hunter Exosuit',
    outputFile: 'hunter_exosuit.glb',
  },
  {
    id: 'heavy_brute',
    label: 'Heavy Brute',
    sourceFolder: 'Heavy Brute',
    outputFile: 'heavy_brute.glb',
  },
  {
    id: 'breaker_bot',
    label: 'Breaker Bot',
    sourceFolder: 'Breaker Bot',
    outputFile: 'breaker_bot.glb',
  },
];

export function getPhase6SourceGlbPath(asset) {
  return path.join(
    PHASE6_ASSET_ROOT,
    asset.sourceFolder,
    MESHY_SOURCE_SUBDIR,
    MESHY_MERGED_ANIMATION_FILE,
  );
}

export function getPhase6OptimizedGlbPath(asset) {
  return path.join(PHASE6_GLB_OUTPUT_DIR, asset.outputFile);
}
