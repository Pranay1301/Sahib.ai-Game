/**
 * ThreeBattlefield.js — 3D battlefield renderer for Sahib AI V1 quick rounds.
 *
 * Uses expo-gl + Three.js to render the V1 map blockout with:
 *  - 3D map geometry from MapBuilder (lanes, intersections, doors, blockers, cores)
 *  - Fixed rectangular isometric camera via CameraController
 *  - Dynamic hero marker and Core HP bars
 *
 * Camera rules (AGENTS.md):
 *  - Fixed landscape isometric camera
 *  - No manual zoom/rotation in V1
 *  - Centered full-map framing for the current Final Map visual target
 */
import React, { useCallback, useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import { GLView } from "expo-gl";
import * as THREE from "three";

import { FIXED_ISOMETRIC_CAMERA } from "../game/camera.js";
import { buildMap, updateMapObjects } from "../three/MapBuilder.js";
import { CameraController } from "../three/CameraController.js";

/** V1 gameplay camera: centered rectangular map view, no manual zoom/rotation. */
const DEFAULT_CAMERA_MODE = "fullmap";

export function ThreeBattlefield({ hero, match }) {
  const stateRef = useRef({ hero, match });
  const cleanupRef = useRef(null);

  useEffect(() => {
    stateRef.current = { hero, match };
  }, [hero, match]);

  useEffect(
    () => () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    },
    []
  );

  const handleContextCreate = useCallback((gl) => {
    if (cleanupRef.current) {
      cleanupRef.current();
    }

    patchExpoGlPixelStorei(gl);

    const canvas = createExpoCanvas(gl);
    const renderer = new THREE.WebGLRenderer({
      canvas,
      context: gl,
      antialias: true,
      alpha: false
    });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight, false);
    renderer.setClearColor(0x171019, 1);
    renderer.shadowMap.enabled = false;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x171019);
    scene.fog = new THREE.FogExp2(0x171019, 0.012);

    const aspect = gl.drawingBufferWidth / Math.max(1, gl.drawingBufferHeight);

    // ── Camera setup ──────────────────────────────────────────────
    const cameraController = new CameraController(DEFAULT_CAMERA_MODE);
    let camera;

    if (DEFAULT_CAMERA_MODE === "fullmap") {
      // Orthographic full-map overview for the mobile rectangle map target
      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
      camera.up.set(0, 0, -1);
      cameraController.applyFullMapBounds(camera, aspect);
    } else {
      // Perspective isometric follow camera
      camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 200);
    }

    // ── Build 3D map ──────────────────────────────────────────────
    const { dynamicObjects } = buildMap(scene);

    // ── Render loop ───────────────────────────────────────────────
    let frameId = null;
    let disposed = false;
    let lastTime = Date.now();

    const renderFrame = () => {
      if (disposed) return;

      const now = Date.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const state = stateRef.current;

      // Update dynamic objects (hero, HP bars)
      updateMapObjects(dynamicObjects, state.hero, state.match);

      // Update camera follow
      cameraController.update(camera, state.hero.position, dt);

      renderer.render(scene, camera);
      gl.endFrameEXP();
      frameId = requestAnimationFrame(renderFrame);
    };

    renderFrame();

    cleanupRef.current = () => {
      disposed = true;
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
      disposeScene(scene);
      renderer.dispose();
      cleanupRef.current = null;
    };
  }, []);

  return <GLView style={styles.glView} onContextCreate={handleContextCreate} />;
}

/* ── Expo GL compatibility ─────────────────────────────────────────── */

/**
 * Patch pixelStorei to suppress unsupported WebGL parameter warnings
 * that Three.js calls but expo-gl doesn't support.
 */
function patchExpoGlPixelStorei(gl) {
  if (!gl || gl.__sahibPixelStoreiPatched || typeof gl.pixelStorei !== "function") {
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
  gl.__sahibPixelStoreiPatched = true;
}

/**
 * Create a canvas-like object from expo-gl context for Three.js WebGLRenderer.
 */
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

/**
 * Recursively dispose all geometries and materials in a scene.
 */
function disposeScene(scene) {
  scene.traverse((object) => {
    if (object.geometry) {
      object.geometry.dispose();
    }

    if (object.material) {
      if (Array.isArray(object.material)) {
        for (const material of object.material) {
          material.dispose();
        }
      } else {
        object.material.dispose();
      }
    }
  });
}

const styles = StyleSheet.create({
  glView: {
    ...StyleSheet.absoluteFillObject
  }
});
