/**
 * CameraController.js — Fixed landscape isometric camera that follows the hero.
 * No manual zoom/rotation in V1 per AGENTS.md.
 * Works inside expo-gl (no DOM dependencies).
 */
import * as THREE from "three";
import {
  worldToThreePosition,
  getFullMapOrthographicBounds,
  getFullMapCameraUp,
  getFullMapCameraPosition,
  getFullMapCameraTarget
} from "../game/camera.js";

const ISO_HEIGHT = 10.5;
const ISO_DISTANCE = 15.5;
const LERP_SPEED = 4.0;
const ISO_ANGLE = Math.PI / 4; // 45 degrees

export class CameraController {
  /**
   * @param {string} mode - "follow" or "fullmap"
   */
  constructor(mode = "follow") {
    this.mode = mode;
    this._targetPos = new THREE.Vector3();
    this._currentPos = new THREE.Vector3();
    this._lookTarget = new THREE.Vector3();
    this._initialized = false;
  }

  /** Set to follow mode (isometric follow hero) */
  setFollowMode() {
    this.mode = "follow";
    this._initialized = false;
  }

  /** Set to full-map overview (debug/blockout validation) */
  setFullMapMode() {
    this.mode = "fullmap";
  }

  /**
   * Apply full-map framing to an orthographic camera.
   * @param {THREE.OrthographicCamera} camera
   * @param {number} aspect
   */
  applyFullMapBounds(camera, aspect) {
    const bounds = getFullMapOrthographicBounds(aspect);
    camera.left = bounds.left;
    camera.right = bounds.right;
    camera.top = bounds.top;
    camera.bottom = bounds.bottom;
    camera.updateProjectionMatrix();

    const pos = getFullMapCameraPosition();
    const tgt = getFullMapCameraTarget();
    const up = getFullMapCameraUp();
    camera.position.set(pos.x, pos.y, pos.z);
    // Remove camera roll so the Player Core -> Enemy Core axis stays level on screen.
    camera.up.set(up.x, up.y, up.z);
    camera.lookAt(tgt.x, tgt.y, tgt.z);
  }

  /**
   * Update camera to follow hero position each frame.
   * @param {THREE.Camera} camera
   * @param {object} heroPosition - { x, y } in world units
   * @param {number} deltaSeconds
   */
  update(camera, heroPosition, deltaSeconds) {
    if (this.mode === "fullmap") {
      // Full-map mode is static, applied once via applyFullMapBounds
      return;
    }

    const focus = worldToThreePosition(heroPosition, 0);

    // Target position: behind and above hero at isometric angle
    this._targetPos.set(
      focus.x - ISO_DISTANCE * Math.cos(ISO_ANGLE),
      ISO_HEIGHT,
      focus.z + ISO_DISTANCE * Math.sin(ISO_ANGLE)
    );

    this._lookTarget.set(focus.x, 0.5, focus.z);

    if (!this._initialized) {
      this._currentPos.copy(this._targetPos);
      camera.position.copy(this._currentPos);
      this._initialized = true;
    } else {
      // Smooth lerp follow
      const t = 1 - Math.exp(-LERP_SPEED * Math.max(0, deltaSeconds));
      this._currentPos.lerp(this._targetPos, t);
      camera.position.copy(this._currentPos);
    }

    camera.lookAt(this._lookTarget);
  }
}
