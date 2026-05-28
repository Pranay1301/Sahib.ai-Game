import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateJoystickInput,
  getJoystickRadius,
  isPointInsideCircleControl,
  isPointInsideJoystickControl,
  smoothJoystickVector
} from "../src/game/joystick.js";

const LAYOUT = Object.freeze({
  x: 18,
  y: 120,
  width: 132,
  height: 132
});
const KNOB_SIZE = 54;

test("joystick radius uses the available base size minus knob size", () => {
  assert.equal(getJoystickRadius(LAYOUT, KNOB_SIZE), 39);
});

test("joystick returns neutral input inside the dead zone", () => {
  const input = calculateJoystickInput(
    { pageX: LAYOUT.x + LAYOUT.width / 2 + 2, pageY: LAYOUT.y + LAYOUT.height / 2 },
    LAYOUT,
    { knobSize: KNOB_SIZE, deadZone: 0.1 }
  );

  assert.deepEqual(input.vector, { x: 0, y: 0 });
  assert.deepEqual(input.knobOffset, { x: 0, y: 0 });
});

test("joystick clamps far pointer movement to the base radius", () => {
  const input = calculateJoystickInput(
    { pageX: LAYOUT.x + LAYOUT.width + 200, pageY: LAYOUT.y + LAYOUT.height / 2 },
    LAYOUT,
    { knobSize: KNOB_SIZE, deadZone: 0.1 }
  );

  assert.equal(input.radius, 39);
  assert.ok(input.vector.x <= 1);
  assert.ok(input.vector.x > 0.99);
  assert.equal(input.vector.y, 0);
  assert.equal(input.knobOffset.x, 39);
  assert.equal(input.knobOffset.y, 0);
});

test("joystick accepts movement inside its own control zone", () => {
  assert.equal(
    isPointInsideJoystickControl(
      { pageX: LAYOUT.x + LAYOUT.width / 2 + 70, pageY: LAYOUT.y + LAYOUT.height / 2 },
      LAYOUT
    ),
    true
  );
});

test("joystick rejects fire-side touches far outside its control zone", () => {
  assert.equal(
    isPointInsideJoystickControl(
      { pageX: LAYOUT.x + LAYOUT.width + 950, pageY: LAYOUT.y + LAYOUT.height / 2 },
      LAYOUT
    ),
    false
  );
});

test("fire control can accept a second touch while joystick touch remains in its zone", () => {
  const fireLayout = Object.freeze({
    x: 876,
    y: 376,
    width: 96,
    height: 96
  });
  const joystickTouch = {
    pageX: LAYOUT.x + LAYOUT.width / 2,
    pageY: LAYOUT.y + LAYOUT.height / 2
  };
  const fireTouch = {
    pageX: fireLayout.x + fireLayout.width / 2,
    pageY: fireLayout.y + fireLayout.height / 2
  };

  assert.equal(isPointInsideJoystickControl(joystickTouch, LAYOUT), true);
  assert.equal(isPointInsideCircleControl(fireTouch, fireLayout), true);
  assert.equal(isPointInsideJoystickControl(fireTouch, LAYOUT), false);
});

test("joystick smoothing moves toward the next vector without overshoot", () => {
  const vector = smoothJoystickVector({ x: 0, y: 0 }, { x: 1, y: -1 }, 0.45);

  assert.equal(vector.x, 0.45);
  assert.equal(vector.y, -0.45);
});
