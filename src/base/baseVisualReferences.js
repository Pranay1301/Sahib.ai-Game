export const BASE_VISUAL_SOURCE_FOLDER = "../images";

export const BASE_VISUAL_REFERENCE_ASSETS = Object.freeze({
  baseLayoutReference: Object.freeze({
    sourceFile: "Land.png",
    assetPath: "assets/base/reference/base_layout_reference.png",
    width: 1672,
    height: 941,
    purpose: "Mood, camera, scale, and overall base composition"
  }),
  buildingSlotMap: Object.freeze({
    sourceFile: "Layout.png",
    assetPath: "assets/base/reference/building_slot_map.png",
    width: 1672,
    height: 941,
    purpose: "Fixed building placement and tap-zone reference"
  }),
  buildingLevelExamples: Object.freeze({
    sourceFile: "Buildings.png",
    assetPath: "assets/base/reference/building_level_examples.png",
    width: 1916,
    height: 821,
    purpose: "Building visual progression reference"
  }),
  emptyLandBackground: Object.freeze({
    sourceFile: "Empty Land.jpg",
    assetPath: "assets/base/reference/empty_land.jpg",
    width: 1024,
    height: 576,
    purpose: "Runtime base canvas background until final level art is wired"
  })
});

export const BASE_BUILDING_SOURCE_IMAGES = Object.freeze([
  "A_Build.png",
  "c_build.png",
  "d_build.png",
  "e_build.png",
  "f_build.png",
  "g_build.png",
  "h_build.png",
  "i_build.png",
  "j_build.png",
  "k_build.png",
  "l_build.png",
  "m_build.png",
  "n_build.png",
  "o_build.png",
  "01_Central Tower.png",
  "02_Spiral Twist Tower.png",
  "03_Neon Strip Tower.png",
  "04_Twin Peak Tower.png",
  "05_Spire Tower.png",
  "06_Diamond Edge Towe.png",
  "07_Hollow Core Tower.png",
  "08_Arc Wave Tower.png",
  "09_Cyber Stack Tower.png",
  "10_Quantum Spire Tower.png",
  "11_Tapered Edge Tower.png",
  "12_Dual Core Tower.png",
  "13_Twisted Glass Tower.png",
  "14_Offset Block Towers.png",
  "15_Spire Core Towers.png",
  "sport.png",
  "water.png"
]);

export function getBaseVisualReferenceAsset(referenceKey) {
  return BASE_VISUAL_REFERENCE_ASSETS[referenceKey] ?? null;
}

export function getBaseVisualSourcePath(fileName) {
  return `${BASE_VISUAL_SOURCE_FOLDER}/${fileName}`;
}
