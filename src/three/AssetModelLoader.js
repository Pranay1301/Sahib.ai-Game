import * as THREE from "three";
import { Asset } from "expo-asset";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { MODEL_MODULES, MODEL_PREVIEW_RULES, MODEL_TEXTURE_MODULES } from "../assets/modelModules.js";

const modelCache = new Map();
let textureUriMapPromise = null;

export async function attachRuntimeMapAssets(staticGroup) {
  const groups = [];
  staticGroup.traverse((object) => {
    if (object.type === "Group" && object.userData?.assetId && MODEL_MODULES[object.userData.assetId]) {
      groups.push(object);
    }
  });

  const counts = {
    surfaces: 0,
    walls: 0,
    doors: 0,
    trees: 0,
    props: 0
  };

  for (const group of groups) {
    const kind = group.userData.assetKind;
    try {
      if (kind === "surface" && counts.surfaces < MODEL_PREVIEW_RULES.maxSurfaceModels) {
        await attachSingleAsset(group, group.userData.assetTarget);
        counts.surfaces += 1;
      } else if (kind === "treeCluster") {
        counts.trees += await attachTreeClusterAssets(group, MODEL_PREVIEW_RULES.maxTreeModels - counts.trees);
      } else if (kind === "artWall" && counts.walls < MODEL_PREVIEW_RULES.maxWallModels) {
        await attachSingleAsset(group, group.userData.assetTarget);
        counts.walls += 1;
      } else if (kind === "door" && counts.doors < MODEL_PREVIEW_RULES.maxDoorModels) {
        await attachSingleAsset(group, group.userData.assetTarget);
        counts.doors += 1;
      } else if (kind === "prop" && counts.props < MODEL_PREVIEW_RULES.maxPropModels) {
        await attachSingleAsset(group, group.userData.assetTarget);
        counts.props += 1;
      }
    } catch (error) {
      group.userData.assetLoadError = String(error?.message || error);
    }
  }
}

async function attachSingleAsset(group, target) {
  if (group.userData.runtimeAssetAttached) return;
  const template = await loadModelTemplate(group.userData.assetId);
  const fitted = createFittedModel(template, target || defaultTargetFor(group), {
    uniformScale: !["artWall", "door", "surface"].includes(group.userData.assetKind)
  });

  for (const child of group.children) child.visible = false;
  fitted.name = `${group.name}_runtime_asset`;
  group.add(fitted);
  group.userData.runtimeAssetAttached = true;
}

async function attachTreeClusterAssets(group, remainingBudget) {
  if (group.userData.runtimeAssetAttached || remainingBudget <= 0) return 0;
  const template = await loadModelTemplate(group.userData.assetId);
  const treeTargets = group.children.slice(0, remainingBudget);

  for (const treeProxy of treeTargets) {
    const originalChildren = treeProxy.children.slice();
    const fitted = createFittedModel(template, group.userData.assetTarget || { width: 0.7, height: 1.3, depth: 0.7 }, {
      uniformScale: true
    });
    fitted.name = `${treeProxy.name || group.name}_runtime_tree`;
    for (const child of originalChildren) child.visible = false;
    treeProxy.add(fitted);
  }

  group.userData.runtimeAssetAttached = true;
  return treeTargets.length;
}

async function loadModelTemplate(assetId) {
  if (!modelCache.has(assetId)) {
    modelCache.set(assetId, loadModel(assetId));
  }
  return modelCache.get(assetId);
}

async function loadModel(assetId) {
  const moduleRef = MODEL_MODULES[assetId];
  if (!moduleRef) {
    throw new Error(`No Metro model module for ${assetId}`);
  }

  const asset = Asset.fromModule(moduleRef);
  await asset.downloadAsync();
  const uri = asset.localUri || asset.uri;
  if (!uri) {
    throw new Error(`No local URI for ${assetId}`);
  }

  const textureUriMap = await getTextureUriMap();
  const loader = new GLTFLoader(createModelLoadingManager(textureUriMap));

  return new Promise((resolve, reject) => {
    loader.load(
      uri,
      (gltf) => {
        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = false;
            child.receiveShadow = true;
            child.frustumCulled = true;
            child.material = createRuntimeMaterial(assetId, child.name);
          }
        });
        resolve(gltf.scene);
      },
      undefined,
      reject
    );
  });
}

async function getTextureUriMap() {
  if (!textureUriMapPromise) {
    textureUriMapPromise = Promise.all(
      Object.entries(MODEL_TEXTURE_MODULES).map(async ([path, moduleRef]) => {
        const textureAsset = Asset.fromModule(moduleRef);
        await textureAsset.downloadAsync();
        return [normalizeAssetPath(path), textureAsset.localUri || textureAsset.uri];
      })
    ).then((entries) => new Map(entries));
  }
  return textureUriMapPromise;
}

function createModelLoadingManager(textureUriMap) {
  const manager = new THREE.LoadingManager();
  manager.addHandler(/\.png(?:$|\?)/i, createPlaceholderTextureLoader());
  manager.addHandler(/(?:^|\/)Textures\/colormap\.png$/i, createPlaceholderTextureLoader());
  manager.addHandler(/(?:^|\/)colormap\.png$/i, createPlaceholderTextureLoader());
  manager.setURLModifier((url) => {
    const normalized = normalizeAssetPath(url);
    return textureUriMap.get(normalized) || textureUriMap.get(normalized.split("/").pop()) || url;
  });
  return manager;
}

function createPlaceholderTextureLoader() {
  return {
    load(_url, onLoad) {
      const texture = createSolidTexture([216, 196, 255, 255]);
      if (typeof onLoad === "function") {
        setTimeout(() => onLoad(texture), 0);
      }
      return texture;
    },
    setCrossOrigin() {
      return this;
    },
    setRequestHeader() {
      return this;
    }
  };
}

function createSolidTexture(rgba) {
  const texture = new THREE.DataTexture(new Uint8Array(rgba), 1, 1, THREE.RGBAFormat);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function createRuntimeMaterial(assetId, meshName = "") {
  if (assetId.startsWith("trees_")) {
    const isTrunk = /trunk|bark|wood/i.test(meshName);
    return new THREE.MeshStandardMaterial({
      color: isTrunk ? 0x5b3428 : 0x8f2739,
      roughness: 0.82,
      metalness: 0.04,
      emissive: isTrunk ? 0x000000 : 0x170306,
      emissiveIntensity: isTrunk ? 0 : 0.08
    });
  }

  const isGate = assetId.includes("gate");
  const isRoom = assetId.includes("room");
  const isFloorLike = assetId.includes("floor") || assetId.includes("corridor") || assetId.includes("stairs");
  const isDetail = /detail|trim|orange|emissive|door/i.test(meshName);
  const baseColor = isFloorLike ? 0x3f4355 : isGate ? 0xc9b6ee : isRoom ? 0xd8c8ff : 0xdfd1ff;

  return new THREE.MeshStandardMaterial({
    color: isDetail ? 0xef9441 : baseColor,
    roughness: 0.52,
    metalness: isDetail ? 0.18 : 0.08,
    emissive: isDetail ? 0x2d1205 : 0x160b24,
    emissiveIntensity: isDetail ? 0.18 : 0.08
  });
}

function normalizeAssetPath(url) {
  return String(url || "")
    .replace(/\\/g, "/")
    .replace(/^.*\/Textures\//, "Textures/")
    .split("?")[0]
    .split("#")[0];
}

function createFittedModel(template, target, options) {
  const root = template.clone(true);
  const container = new THREE.Group();
  root.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const safeSize = {
    x: Math.max(size.x, 0.001),
    y: Math.max(size.y, 0.001),
    z: Math.max(size.z, 0.001)
  };

  if (options?.uniformScale) {
    const scale = Math.min(
      target.width / safeSize.x,
      target.height / safeSize.y,
      target.depth / safeSize.z
    );
    root.scale.setScalar(scale);
    root.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
  } else {
    const scale = {
      x: target.width / safeSize.x,
      y: target.height / safeSize.y,
      z: target.depth / safeSize.z
    };
    root.scale.set(scale.x, scale.y, scale.z);
    root.position.set(-center.x * scale.x, -box.min.y * scale.y, -center.z * scale.z);
  }

  container.add(root);
  return container;
}

function defaultTargetFor(group) {
  if (group.userData.assetKind === "prop") {
    return { width: 1.1, height: 1.1, depth: 1.1 };
  }
  return { width: 1.4, height: 0.9, depth: 0.5 };
}
