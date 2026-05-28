import {
  CENTER_DOORS,
  ENEMY_CORE_POSITION,
  HERO_COLLISION_RADIUS,
  MAP_DOORS,
  PLAYER_CORE_POSITION,
  WORLD_BOUNDS,
  getBodySamplePoints,
  isWalkableBody
} from "./mapLayout.js";

export const WALL_TOOL_TYPES = Object.freeze({
  BLOCK: "block_wall"
});

export const WALL_SYSTEM_CONFIG = Object.freeze({
  maxCharges: 3,
  chargeRefillSeconds: 10,
  placementRange: 210,
  placementSnapRadius: 74,
  placementPreviewRadius: 260,
  heroNoPlacementRadius: 46,
  enemyNoPlacementRadius: 40,
  coreNoPlacementRadius: 92,
  doorNoPlacementRadius: 42,
  wallOverlapPadding: 1
});

export const WALL_TOOL_CONFIGS = Object.freeze({
  [WALL_TOOL_TYPES.BLOCK]: Object.freeze({
    id: WALL_TOOL_TYPES.BLOCK,
    label: "Block Wall",
    shortLabel: "B",
    maxHp: 180,
    chargeCost: 1,
    renderWidth: 58,
    renderHeight: 32,
    segments: Object.freeze([
      Object.freeze({ offsetX: 0, offsetY: 0, length: 50, thickness: 12, rotationOffset: 0 })
    ])
  })
});

export const WALL_SPRITE_FRAME_COUNT = 4;
export const WALL_SPRITE_CELL_SIZE = 96;

export const WALL_PLACEMENT_SOCKETS = Object.freeze([
  createSocket("i1_north_cover", { x: 580, y: 390 }, -8),
  createSocket("i1_west_cover", { x: 496, y: 459 }, 12),
  createSocket("i1_south_cover", { x: 592, y: 467 }, -28),
  createSocket("i2_west_cover", { x: 780, y: 335 }, 14),
  createSocket("i2_north_cover", { x: 930, y: 240 }, 8),
  createSocket("i2_east_cover", { x: 974, y: 224 }, 90),
  createSocket("center_north_cover", { x: 850, y: 390 }, 7),
  createSocket("center_west_cover", { x: 798, y: 447 }, 90),
  createSocket("center_south_cover", { x: 930, y: 492 }, -8),
  createSocket("center_east_cover", { x: 984, y: 439 }, 90),
  createSocket("i3_west_cover", { x: 800, y: 602 }, 10),
  createSocket("i3_east_cover", { x: 950, y: 610 }, -8),
  createSocket("i3_south_cover", { x: 900, y: 680 }, 86),
  createSocket("i4_west_cover", { x: 1085, y: 415 }, -8),
  createSocket("i4_east_cover", { x: 1215, y: 430 }, 90),
  createSocket("i4_south_cover", { x: 1152, y: 492 }, 12),
  createSocket("player_mid_defense", { x: 615, y: 610 }, -18),
  createSocket("player_bottom_defense", { x: 563, y: 708 }, 86),
  createSocket("enemy_mid_cover", { x: 1242, y: 285 }, -12)
]);

const WALL_COLLISION_SAMPLE_STEP = 6;

export function createWallSystemState(overrides = {}) {
  return {
    selectedTool: null,
    charges: WALL_SYSTEM_CONFIG.maxCharges,
    refillRemainingSeconds: 0,
    activeWalls: [],
    nextWallId: 1,
    ...overrides
  };
}

export function selectWallTool(state, toolType) {
  if (!WALL_TOOL_CONFIGS[toolType]) {
    return state;
  }

  return {
    ...state,
    selectedTool: state.selectedTool === toolType ? null : toolType
  };
}

export function tickWallSystem(state, deltaSeconds) {
  const safeDelta = Math.max(0, Number(deltaSeconds) || 0);
  if (safeDelta === 0) {
    return state;
  }

  let changed = false;
  let charges = Math.max(0, Math.min(WALL_SYSTEM_CONFIG.maxCharges, state.charges));
  let refillRemainingSeconds = state.refillRemainingSeconds ?? 0;

  if (charges < WALL_SYSTEM_CONFIG.maxCharges) {
    refillRemainingSeconds =
      refillRemainingSeconds > 0
        ? refillRemainingSeconds - safeDelta
        : WALL_SYSTEM_CONFIG.chargeRefillSeconds - safeDelta;

    while (charges < WALL_SYSTEM_CONFIG.maxCharges && refillRemainingSeconds <= 0) {
      charges += 1;
      refillRemainingSeconds += WALL_SYSTEM_CONFIG.chargeRefillSeconds;
      changed = true;
    }

    if (charges >= WALL_SYSTEM_CONFIG.maxCharges) {
      refillRemainingSeconds = 0;
    }
  } else if (refillRemainingSeconds !== 0) {
    refillRemainingSeconds = 0;
    changed = true;
  }

  if (!changed && charges === state.charges && refillRemainingSeconds === state.refillRemainingSeconds) {
    return state;
  }

  return {
    ...state,
    charges,
    refillRemainingSeconds
  };
}

export function placeSelectedWallTool(state, worldPoint, context = {}) {
  const toolType = state.selectedTool;
  if (!toolType) {
    return {
      wallSystem: state,
      placed: false,
      reason: "no_tool_selected"
    };
  }

  return placeWallToolAtPosition(state, toolType, worldPoint, context);
}

export function placeWallToolAtPosition(state, toolType, position, context = {}) {
  const candidate = createFreePlacementCandidate(toolType, position, context);
  const validation = validatePlacement(state, toolType, candidate, context);
  if (!validation.valid) {
    return {
      wallSystem: state,
      placed: false,
      reason: validation.reason,
      placement: candidate
    };
  }

  return addPlacementToState(state, toolType, candidate);
}

export function placeWallToolAtSocket(state, toolType, socketId, context = {}) {
  const socket = getPlacementSocketById(socketId);
  const validation = validatePlacement(state, toolType, socket, context);
  if (!validation.valid) {
    return {
      wallSystem: state,
      placed: false,
      reason: validation.reason,
      socket
    };
  }

  return addPlacementToState(state, toolType, socket);
}

function addPlacementToState(state, toolType, placement) {
  const config = WALL_TOOL_CONFIGS[toolType];
  const nextWallId = state.nextWallId + 1;
  const id = `${toolType}_${state.nextWallId}`;
  const charges = Math.max(0, state.charges - config.chargeCost);
  const basePlaced = {
    id,
    type: toolType,
    socketId: placement.id ?? null,
    position: { ...placement.position },
    rotation: placement.rotation,
    animationTimeSeconds: 0
  };

  const nextState = {
    ...state,
    charges,
    nextWallId,
    activeWalls: [
      ...state.activeWalls,
      {
        ...basePlaced,
        hp: config.maxHp,
        maxHp: config.maxHp
      }
    ]
  };

  return {
    wallSystem: {
      ...nextState,
      refillRemainingSeconds:
        state.charges >= WALL_SYSTEM_CONFIG.maxCharges && charges < WALL_SYSTEM_CONFIG.maxCharges
          ? WALL_SYSTEM_CONFIG.chargeRefillSeconds
          : nextState.refillRemainingSeconds
    },
    placed: true,
    reason: null,
    placement
  };
}

export function validatePlacement(state, toolType, socket, context = {}) {
  if (!socket) {
    return invalid("missing_placement");
  }

  const config = WALL_TOOL_CONFIGS[toolType];
  if (!config) {
    return invalid("unknown_tool");
  }

  if (Array.isArray(socket.allowedTools) && !socket.allowedTools.includes(toolType)) {
    return invalid("tool_not_allowed");
  }

  if (state.charges < config.chargeCost) {
    return invalid("no_charges");
  }

  if (
    context.heroPosition &&
    distanceBetween(socket.position, context.heroPosition) > WALL_SYSTEM_CONFIG.placementRange
  ) {
    return invalid("too_far");
  }

  if (!isPlacementOnWalkableFloor(toolType, socket)) {
    return invalid("not_walkable");
  }

  if (
    context.heroPosition &&
    distanceBetween(socket.position, context.heroPosition) < WALL_SYSTEM_CONFIG.heroNoPlacementRadius
  ) {
    return invalid("hero_too_close");
  }

  for (const enemy of context.enemies ?? []) {
    if (enemy.hp > 0 && distanceBetween(socket.position, enemy.position) < WALL_SYSTEM_CONFIG.enemyNoPlacementRadius) {
      return invalid("enemy_too_close");
    }
  }

  if (
    distanceBetween(socket.position, PLAYER_CORE_POSITION) < WALL_SYSTEM_CONFIG.coreNoPlacementRadius ||
    distanceBetween(socket.position, ENEMY_CORE_POSITION) < WALL_SYSTEM_CONFIG.coreNoPlacementRadius
  ) {
    return invalid("core_too_close");
  }

  for (const door of [...MAP_DOORS, ...CENTER_DOORS]) {
    if (distanceBetween(socket.position, door.center) < WALL_SYSTEM_CONFIG.doorNoPlacementRadius) {
      return invalid("door_too_close");
    }
  }

  if (
    socket.id &&
    state.activeWalls.some((wall) => wall.socketId === socket.id)
  ) {
    return invalid("socket_occupied");
  }

  if (wouldOverlapActiveWall(toolType, socket, state.activeWalls)) {
    return invalid("wall_overlap");
  }

  return {
    valid: true,
    reason: null
  };
}

export function getFreePlacementPreview(state, worldPoint, context = {}) {
  const toolType = state.selectedTool;
  if (!toolType) {
    return null;
  }

  const placement = createFreePlacementCandidate(toolType, worldPoint, context);
  const validation = validatePlacement(state, toolType, placement, context);
  return {
    ...placement,
    toolType,
    valid: validation.valid,
    reason: validation.reason
  };
}

export function getPlacementSocketStates(state, context = {}) {
  const toolType = state.selectedTool;
  return WALL_PLACEMENT_SOCKETS.map((socket) => {
    if (!toolType) {
      return {
        ...socket,
        valid: false,
        reason: "no_tool_selected"
      };
    }

    const validation = validatePlacement(state, toolType, socket, context);
    return {
      ...socket,
      valid: validation.valid,
      reason: validation.reason
    };
  });
}

export function applyWallDamageEvents(state, damageEvents) {
  if (!Array.isArray(damageEvents) || damageEvents.length === 0) {
    return state;
  }

  const damageByWallId = new Map();
  for (const event of damageEvents) {
    const amount = Math.max(0, Number(event.amount) || 0);
    if (!event.wallId || amount <= 0) {
      continue;
    }
    damageByWallId.set(event.wallId, (damageByWallId.get(event.wallId) ?? 0) + amount);
  }

  if (damageByWallId.size === 0) {
    return state;
  }

  let changed = false;
  const activeWalls = state.activeWalls
    .map((wall) => {
      const damage = damageByWallId.get(wall.id) ?? 0;
      if (damage <= 0) {
        return wall;
      }

      changed = true;
      return {
        ...wall,
        hp: Math.max(0, wall.hp - damage)
      };
    })
    .filter((wall) => wall.hp > 0);

  if (!changed && activeWalls.length === state.activeWalls.length) {
    return state;
  }

  return {
    ...state,
    activeWalls
  };
}

export function getNearestPlacementSocket(point, toolType, maxDistance = WALL_SYSTEM_CONFIG.placementSnapRadius) {
  let bestSocket = null;
  let bestDistance = Infinity;

  for (const socket of WALL_PLACEMENT_SOCKETS) {
    if (toolType && !socket.allowedTools.includes(toolType)) {
      continue;
    }

    const distance = distanceBetween(point, socket.position);
    if (distance <= maxDistance && distance < bestDistance) {
      bestSocket = socket;
      bestDistance = distance;
    }
  }

  return bestSocket;
}

export function getPlacementSocketById(socketId) {
  return WALL_PLACEMENT_SOCKETS.find((socket) => socket.id === socketId) ?? null;
}

export function getWallSegments(walls) {
  return (walls ?? [])
    .filter((wall) => wall.hp > 0)
    .flatMap((wall) => getWallSegmentsForPlacement(wall.type, wall));
}

export function getWallSegmentsForPlacement(toolType, placement) {
  const config = WALL_TOOL_CONFIGS[toolType];
  if (!config || !Array.isArray(config.segments)) {
    return [];
  }

  return config.segments.map((segment, index) => {
    const rotation = placement.rotation + segment.rotationOffset;
    const rotationRadians = degreesToRadians(placement.rotation);
    const offset = rotateVector({ x: segment.offsetX, y: segment.offsetY }, rotationRadians);
    return {
      id: `${placement.id ?? placement.socketId}_segment_${index}`,
      wallId: placement.id,
      type: toolType,
      position: {
        x: placement.position.x + offset.x,
        y: placement.position.y + offset.y
      },
      rotation,
      length: segment.length,
      thickness: segment.thickness
    };
  });
}

export function isPointBlockedByWalls(point, walls, radius = 0) {
  if (!Array.isArray(walls) || walls.length === 0) {
    return false;
  }

  return getBodySamplePoints(point, Math.max(0, radius)).some((sample) => getWallHitAtPoint(sample, walls, 0));
}

export function doesSegmentHitWall(start, end, walls, radius = 0) {
  if (!Array.isArray(walls) || walls.length === 0) {
    return null;
  }

  const distance = distanceBetween(start, end);
  const steps = Math.max(1, Math.ceil(distance / WALL_COLLISION_SAMPLE_STEP));

  for (let step = 0; step <= steps; step += 1) {
    const point = {
      x: start.x + ((end.x - start.x) * step) / steps,
      y: start.y + ((end.y - start.y) * step) / steps
    };
    const hit = getWallHitAtPoint(point, walls, radius);
    if (hit) {
      return {
        ...hit,
        point
      };
    }
  }

  return null;
}

export function getWallHitAtPoint(point, walls, radius = 0) {
  for (const wall of walls ?? []) {
    if (wall.hp <= 0) {
      continue;
    }

    const segment = getWallSegmentsForPlacement(wall.type, wall).find((candidate) =>
      isPointInWallSegment(point, candidate, radius)
    );
    if (segment) {
      return {
        wall,
        wallId: wall.id,
        segment
      };
    }
  }

  return null;
}

export function distanceBetween(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function createSocket(id, position, rotation, allowedTools = Object.values(WALL_TOOL_TYPES)) {
  return Object.freeze({
    id,
    position: Object.freeze({ ...position }),
    rotation,
    allowedTools: Object.freeze([...allowedTools])
  });
}

function createFreePlacementCandidate(toolType, position, context = {}) {
  if (!position || !Number.isFinite(position.x) || !Number.isFinite(position.y)) {
    return null;
  }

  const rawRotation = Number.isFinite(context.rotation)
    ? context.rotation
    : getCoverRotationFromHero(position, context.heroPosition);

  return {
    id: null,
    position: clampWorldPoint(position),
    rotation: normalizeDegrees(rawRotation)
  };
}

function getCoverRotationFromHero(position, heroPosition) {
  if (!heroPosition) {
    return 0;
  }

  const vector = {
    x: position.x - heroPosition.x,
    y: position.y - heroPosition.y
  };

  if (vector.x === 0 && vector.y === 0) {
    return 0;
  }

  return (Math.atan2(vector.y, vector.x) * 180) / Math.PI + 90;
}

function isPlacementOnWalkableFloor(toolType, placement) {
  if (!placement?.position) {
    return false;
  }

  return isWalkableBody(placement.position, HERO_COLLISION_RADIUS);
}

function wouldOverlapActiveWall(toolType, socket, activeWalls) {
  const candidate = {
    id: "candidate",
    socketId: socket.id,
    type: toolType,
    position: socket.position,
    rotation: socket.rotation
  };
  const candidateSegments = getWallSegmentsForPlacement(toolType, candidate);

  for (const wall of activeWalls) {
    for (const candidateSegment of candidateSegments) {
      for (const activeSegment of getWallSegmentsForPlacement(wall.type, wall)) {
        if (doWallSegmentsOverlap(candidateSegment, activeSegment)) {
          return true;
        }
      }
    }
  }

  return false;
}

function doWallSegmentsOverlap(a, b) {
  const aCorners = getSegmentCorners(a);
  const bCorners = getSegmentCorners(b);

  if (aCorners.some((corner) => isPointInWallSegment(corner, b, 0))) {
    return true;
  }
  if (bCorners.some((corner) => isPointInWallSegment(corner, a, 0))) {
    return true;
  }

  return (
    distanceBetween(a.position, b.position) <
    Math.min(a.length, b.length) * 0.28 + WALL_SYSTEM_CONFIG.wallOverlapPadding
  );
}

function getSegmentCorners(segment) {
  const rotation = degreesToRadians(segment.rotation);
  const along = rotateVector({ x: 1, y: 0 }, rotation);
  const across = rotateVector({ x: 0, y: 1 }, rotation);
  const halfLength = segment.length / 2;
  const halfThickness = segment.thickness / 2;

  return [
    addVectors(addVectors(segment.position, scaleVector(along, halfLength)), scaleVector(across, halfThickness)),
    addVectors(addVectors(segment.position, scaleVector(along, halfLength)), scaleVector(across, -halfThickness)),
    addVectors(addVectors(segment.position, scaleVector(along, -halfLength)), scaleVector(across, halfThickness)),
    addVectors(addVectors(segment.position, scaleVector(along, -halfLength)), scaleVector(across, -halfThickness))
  ];
}

function isPointInWallSegment(point, segment, expansion = 0) {
  const rotation = degreesToRadians(-segment.rotation);
  const local = rotateVector(
    {
      x: point.x - segment.position.x,
      y: point.y - segment.position.y
    },
    rotation
  );

  return (
    Math.abs(local.x) <= segment.length / 2 + expansion &&
    Math.abs(local.y) <= segment.thickness / 2 + expansion
  );
}

function invalid(reason) {
  return {
    valid: false,
    reason
  };
}

function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function normalizeDegrees(degrees) {
  const normalized = degrees % 360;
  return normalized < -180 ? normalized + 360 : normalized > 180 ? normalized - 360 : normalized;
}

function rotateVector(vector, radians) {
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return {
    x: vector.x * cos - vector.y * sin,
    y: vector.x * sin + vector.y * cos
  };
}

function addVectors(a, b) {
  return {
    x: a.x + b.x,
    y: a.y + b.y
  };
}

function scaleVector(vector, amount) {
  return {
    x: vector.x * amount,
    y: vector.y * amount
  };
}

export function clampWorldPoint(point) {
  return {
    x: Math.max(0, Math.min(WORLD_BOUNDS.width, point.x)),
    y: Math.max(0, Math.min(WORLD_BOUNDS.height, point.y))
  };
}
