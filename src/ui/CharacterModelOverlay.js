import React, { useCallback, useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import { GLView } from "expo-gl";
import { Asset } from "expo-asset";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";

import { PHASE6_CHARACTER_MODEL_MODULES } from "../assets/characterModelModules.js";
import {
  CHARACTER_MODEL_ACTIONS,
  CHARACTER_MODEL_CLIPS
} from "../game/characterModels.js";
import {
  getCharacterModelDescriptors,
  getCharacterModelYawRadians,
  worldToViewportModelPoint
} from "../game/characterModelRuntime.js";

const MODEL_LAYER_Z_INDEX = 3;
const CAMERA_DEPTH = 100;
const CHARACTER_DEPTH_SCALE = 0.01;
const MAX_RENDERED_ENEMIES = 10;
const MAX_NEW_CHARACTER_INSTANCES_PER_FRAME = 1;
const MAX_POOLED_INSTANCES_PER_ASSET = 8;

export function CharacterModelOverlay({
  camera,
  enemies = [],
  hero,
  onReadyChange,
  viewport
}) {
  const latestRef = useRef({ camera, enemies, hero, viewport });
  const cleanupRef = useRef(null);

  latestRef.current = { camera, enemies, hero, viewport };

  useEffect(
    () => () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    },
    []
  );

  const handleContextCreate = useCallback(
    (gl) => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }

      let disposed = false;
      let frameId = null;
      let lastTime = Date.now();
      const instances = new Map();
      const instancePool = new Map();

      patchExpoGlPixelStorei(gl);

      const canvas = createExpoCanvas(gl);
      const renderer = new THREE.WebGLRenderer({
        canvas,
        context: gl,
        antialias: false,
        alpha: true,
        powerPreference: "high-performance"
      });
      renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight, false);
      renderer.setClearColor(0x000000, 0);
      renderer.shadowMap.enabled = false;
      renderer.sortObjects = true;

      const scene = new THREE.Scene();
      scene.background = null;
      const orthographicCamera = createOverlayCamera(latestRef.current.viewport);
      addCharacterLights(scene);

      const start = async () => {
        try {
          const templates = await loadCharacterTemplates();
          if (disposed) {
            return;
          }

          if (typeof onReadyChange === "function") {
            onReadyChange(true);
          }

          const renderFrame = () => {
            if (disposed) {
              return;
            }

            const now = Date.now();
            const deltaSeconds = Math.min((now - lastTime) / 1000, 0.1);
            lastTime = now;

            const latest = latestRef.current;
            updateOverlayCamera(orthographicCamera, latest.viewport);
            syncCharacterInstances(
              scene,
              instances,
              instancePool,
              templates,
              getVisibleDescriptors(latest)
            );

            for (const instance of instances.values()) {
              updateCharacterInstance(instance, latest.camera, latest.viewport, deltaSeconds);
            }

            renderer.render(scene, orthographicCamera);
            gl.endFrameEXP();
            frameId = requestAnimationFrame(renderFrame);
          };

          renderFrame();
        } catch (error) {
          if (typeof onReadyChange === "function") {
            onReadyChange(false);
          }
          console.warn("Character GLB overlay failed", error);
        }
      };

      start();

      cleanupRef.current = () => {
        disposed = true;
        if (frameId !== null) {
          cancelAnimationFrame(frameId);
        }
        if (typeof onReadyChange === "function") {
          onReadyChange(false);
        }
        for (const instance of instances.values()) {
          disposeCharacterInstance(scene, instance);
        }
        instances.clear();
        for (const pool of instancePool.values()) {
          for (const instance of pool) {
            disposeCharacterInstance(scene, instance);
          }
        }
        instancePool.clear();
        disposeScene(scene);
        renderer.dispose();
        cleanupRef.current = null;
      };
    },
    [onReadyChange]
  );

  return (
    <GLView
      key={`${Math.round(viewport.width)}x${Math.round(viewport.height)}`}
      onContextCreate={handleContextCreate}
      pointerEvents="none"
      style={[
        styles.overlay,
        {
          height: viewport.height,
          left: camera.offsetX,
          top: camera.offsetY,
          width: viewport.width
        }
      ]}
    />
  );
}

function getVisibleDescriptors({ camera, enemies, hero, viewport }) {
  const visibleEnemies = enemies
    .filter(isRenderableEnemy)
    .sort(
      (a, b) =>
        distanceToCameraCenter(a.position, camera, viewport) -
        distanceToCameraCenter(b.position, camera, viewport)
    )
    .slice(0, MAX_RENDERED_ENEMIES);

  return getCharacterModelDescriptors(hero, visibleEnemies);
}

function isRenderableEnemy(enemy) {
  return Boolean(enemy && (enemy.hp > 0 || (enemy.deathAnimationRemainingSeconds ?? 0) > 0));
}

function distanceToCameraCenter(position, camera, viewport) {
  const x = position.x * camera.scale - camera.offsetX;
  const y = position.y * camera.scale - camera.offsetY;
  const centerX = viewport.width;
  const centerY = viewport.height;
  const dx = x - centerX * 0.5;
  const dy = y - centerY * 0.5;
  return dx * dx + dy * dy;
}

async function loadCharacterTemplates() {
  const entries = await Promise.all(
    Object.entries(PHASE6_CHARACTER_MODEL_MODULES).map(async ([assetId, moduleRef]) => {
      const asset = Asset.fromModule(moduleRef);
      await asset.downloadAsync();
      const uri = asset.localUri || asset.uri;
      if (!uri) {
        throw new Error(`No local URI for character model: ${assetId}`);
      }

      const gltf = await loadGltf(uri);
      prepareTemplateScene(gltf.scene, assetId);
      return [
        assetId,
        {
          scene: gltf.scene,
          animations: gltf.animations
        }
      ];
    })
  );

  return new Map(entries);
}

function loadGltf(uri) {
  const loader = new GLTFLoader();
  return new Promise((resolve, reject) => {
    loader.load(uri, resolve, undefined, reject);
  });
}

function prepareTemplateScene(scene, assetId) {
  scene.traverse((object) => {
    object.frustumCulled = false;
    if (object.isMesh) {
      object.castShadow = false;
      object.receiveShadow = false;
      object.renderOrder = MODEL_LAYER_Z_INDEX;
      object.material = createVertexColorMaterial(object.material);
    }
  });
}

function createVertexColorMaterial(material) {
  const materials = Array.isArray(material) ? material : [material];
  for (const item of materials) {
    item?.dispose?.();
  }

  return new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    toneMapped: false,
    transparent: true,
    vertexColors: true
  });
}

function syncCharacterInstances(scene, instances, instancePool, templates, descriptors) {
  const descriptorById = new Map(descriptors.map((descriptor) => [descriptor.id, descriptor]));

  for (const [id, instance] of instances.entries()) {
    if (!descriptorById.has(id)) {
      releaseCharacterInstance(scene, instancePool, instance);
      instances.delete(id);
    }
  }

  let createdThisFrame = 0;
  for (const descriptor of descriptors) {
    const existing = instances.get(descriptor.id);
    if (existing) {
      existing.descriptor = descriptor;
      continue;
    }

    const template = templates.get(descriptor.assetId);
    if (!template) {
      continue;
    }

    const pooled = acquireCharacterInstance(instancePool, descriptor);
    const instance =
      pooled ??
      (createdThisFrame < MAX_NEW_CHARACTER_INSTANCES_PER_FRAME
        ? createCharacterInstance(template, descriptor)
        : null);
    if (!instance) {
      continue;
    }

    if (!pooled) {
      createdThisFrame += 1;
    }

    activateCharacterInstance(scene, instance, descriptor);
    instances.set(descriptor.id, instance);
  }
}

function createCharacterInstance(template, descriptor) {
  const clone = cloneSkeleton(template.scene);
  const root = new THREE.Group();
  root.name = `${descriptor.id}_character_model`;
  root.renderOrder = MODEL_LAYER_Z_INDEX;
  clone.name = `${descriptor.id}_character_model_scene`;

  clone.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(clone);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const modelHeight = Math.max(0.001, size.y);

  clone.position.set(-center.x, -box.min.y, -center.z);
  root.add(clone);

  const mixer = new THREE.AnimationMixer(clone);
  const actions = new Map();
  for (const clip of template.animations) {
    actions.set(clip.name, mixer.clipAction(clip));
  }

  return {
    actions,
    animationRoot: clone,
    assetId: descriptor.assetId,
    currentAction: null,
    descriptor,
    mixer,
    modelHeight,
    root
  };
}

function acquireCharacterInstance(instancePool, descriptor) {
  const pool = instancePool.get(descriptor.assetId);
  return pool?.pop() ?? null;
}

function activateCharacterInstance(scene, instance, descriptor) {
  instance.descriptor = descriptor;
  instance.assetId = descriptor.assetId;
  instance.currentAction = null;
  instance.root.name = `${descriptor.id}_character_model`;
  instance.animationRoot.name = `${descriptor.id}_character_model_scene`;
  instance.root.visible = true;
  instance.mixer.stopAllAction();
  if (!instance.root.parent) {
    scene.add(instance.root);
  }
}

function releaseCharacterInstance(scene, instancePool, instance) {
  scene.remove(instance.root);
  instance.root.visible = false;
  instance.mixer.stopAllAction();
  instance.currentAction = null;

  const assetId = instance.assetId ?? instance.descriptor?.assetId;
  if (!assetId) {
    disposeCharacterInstance(scene, instance);
    return;
  }

  const pool = instancePool.get(assetId) ?? [];
  if (!instancePool.has(assetId)) {
    instancePool.set(assetId, pool);
  }

  if (pool.length < MAX_POOLED_INSTANCES_PER_ASSET) {
    pool.push(instance);
    return;
  }

  disposeCharacterInstance(scene, instance);
}

function updateCharacterInstance(instance, camera, viewport, deltaSeconds) {
  const point = worldToViewportModelPoint(instance.descriptor.position, camera);
  const scale = instance.descriptor.targetHeight / instance.modelHeight;
  instance.root.position.set(
    point.x,
    viewport.height - point.y,
    point.y * CHARACTER_DEPTH_SCALE
  );
  instance.root.rotation.set(0, getCharacterModelYawRadians(instance.descriptor.facingVector), 0);
  instance.root.scale.setScalar(scale);
  instance.root.renderOrder = MODEL_LAYER_Z_INDEX + Math.round(point.y);
  setCharacterAction(instance, instance.descriptor.action);
  instance.mixer.update(deltaSeconds);
}

function setCharacterAction(instance, action) {
  const clipName = CHARACTER_MODEL_CLIPS[action] ?? CHARACTER_MODEL_CLIPS[CHARACTER_MODEL_ACTIONS.IDLE];
  if (instance.currentAction === clipName) {
    return;
  }

  const nextAction = instance.actions.get(clipName);
  if (!nextAction) {
    return;
  }

  stopOtherCharacterActions(instance, clipName);

  nextAction.reset();
  nextAction.enabled = true;
  nextAction.setEffectiveWeight(1);
  nextAction.setEffectiveTimeScale(1);
  if (action === CHARACTER_MODEL_ACTIONS.DEATH) {
    nextAction.setLoop(THREE.LoopOnce, 1);
    nextAction.clampWhenFinished = true;
  } else {
    nextAction.setLoop(THREE.LoopRepeat, Infinity);
    nextAction.clampWhenFinished = false;
  }
  nextAction.play();
  instance.currentAction = clipName;
}

function stopOtherCharacterActions(instance, nextClipName) {
  for (const [clipName, action] of instance.actions.entries()) {
    if (clipName === nextClipName) {
      continue;
    }

    action.stop();
    action.enabled = false;
    action.setEffectiveWeight(0);
  }
}

function createOverlayCamera(viewport) {
  const camera = new THREE.OrthographicCamera(
    0,
    Math.max(1, viewport.width),
    Math.max(1, viewport.height),
    0,
    -1000,
    1000
  );
  camera.position.set(0, 0, CAMERA_DEPTH);
  camera.lookAt(0, 0, 0);
  updateOverlayCamera(camera, viewport);
  return camera;
}

function updateOverlayCamera(camera, viewport) {
  camera.left = 0;
  camera.right = Math.max(1, viewport.width);
  camera.top = Math.max(1, viewport.height);
  camera.bottom = 0;
  camera.updateProjectionMatrix();
}

function addCharacterLights(scene) {
  scene.add(new THREE.HemisphereLight(0xffefff, 0x302338, 3.4));

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
  keyLight.position.set(-1.6, 3.2, 4.5);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x9be3ff, 1.6);
  rimLight.position.set(2.8, 2.1, 3.4);
  scene.add(rimLight);
}

function disposeCharacterInstance(scene, instance) {
  scene.remove(instance.root);
  instance.mixer.stopAllAction();
  instance.mixer.uncacheRoot(instance.animationRoot);
}

function disposeScene(scene) {
  scene.traverse((object) => {
    if (object.geometry) {
      object.geometry.dispose();
    }

    if (object.material) {
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) {
        material.dispose();
      }
    }
  });
}

function patchExpoGlPixelStorei(gl) {
  if (!gl || gl.__sahibCharacterPixelStoreiPatched || typeof gl.pixelStorei !== "function") {
    return;
  }

  const originalPixelStorei = gl.pixelStorei.bind(gl);
  const unsupportedParams = new Set(
    [
      gl.UNPACK_FLIP_Y_WEBGL,
      gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,
      gl.UNPACK_COLORSPACE_CONVERSION_WEBGL,
      0x9240,
      0x9241,
      0x9243
    ].filter((value) => typeof value === "number")
  );

  gl.pixelStorei = (pname, param) => {
    if (unsupportedParams.has(pname)) {
      return;
    }
    originalPixelStorei(pname, param);
  };
  gl.__sahibCharacterPixelStoreiPatched = true;
}

function createExpoCanvas(gl) {
  return {
    width: gl.drawingBufferWidth,
    height: gl.drawingBufferHeight,
    clientWidth: gl.drawingBufferWidth,
    clientHeight: gl.drawingBufferHeight,
    style: {},
    addEventListener: () => {},
    removeEventListener: () => {},
    getContext: () => gl
  };
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    zIndex: MODEL_LAYER_Z_INDEX
  }
});
