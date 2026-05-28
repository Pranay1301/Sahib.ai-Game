import {
  WALKMASK_SOURCE_HEIGHT,
  WALKMASK_SOURCE_WIDTH,
  isWalkmaskPointWalkable
} from "./walkmaskGrid.js";

export const WORLD_BOUNDS = Object.freeze({
  width: WALKMASK_SOURCE_WIDTH,
  height: WALKMASK_SOURCE_HEIGHT
});

export const PLAYER_CORE_POSITION = Object.freeze({
  x: 505,
  y: 650
});

export const PLAYER_CORE_ATTACK_POSITION = Object.freeze({
  x: 562,
  y: 593
});

export const ENEMY_CORE_POSITION = Object.freeze({
  x: 1275,
  y: 250
});

export const ENEMY_CORE_ATTACK_POSITION = Object.freeze({
  x: 1255,
  y: 270
});

export const HERO_START_POSITION = Object.freeze({
  x: 610,
  y: 710
});

export const HERO_RESPAWN_POSITION = Object.freeze({
  x: 610,
  y: 710
});

export const INTERSECTION_TRIGGER_RADIUS = 80;

export const CORE_AREAS = Object.freeze([
  Object.freeze({
    id: "player_core_area",
    label: "Player Core Area",
    center: PLAYER_CORE_POSITION,
    width: 260,
    height: 240
  }),
  Object.freeze({
    id: "enemy_core_area",
    label: "Enemy Core Area",
    center: ENEMY_CORE_POSITION,
    width: 270,
    height: 220
  })
]);

export const MAP_LANES = Object.freeze([
  Object.freeze({
    id: "top_lane",
    label: "Top Lane",
    x: 620,
    y: 245,
    width: 650,
    height: 95
  }),
  Object.freeze({
    id: "mid_lane",
    label: "Mid Lane",
    x: 470,
    y: 385,
    width: 820,
    height: 125
  }),
  Object.freeze({
    id: "bottom_lane",
    label: "Bottom Lane",
    x: 500,
    y: 560,
    width: 720,
    height: 120
  })
]);

export const SIDE_ROUTES = Object.freeze([
  Object.freeze({
    id: "player_top_side_route",
    label: "Side Route",
    x: 360,
    y: 390,
    width: 210,
    height: 120
  }),
  Object.freeze({
    id: "player_bottom_side_route",
    label: "Side Route",
    x: 425,
    y: 585,
    width: 260,
    height: 180
  }),
  Object.freeze({
    id: "enemy_top_side_route",
    label: "Side Route",
    x: 1120,
    y: 180,
    width: 230,
    height: 120
  }),
  Object.freeze({
    id: "enemy_bottom_side_route",
    label: "Side Route",
    x: 1030,
    y: 400,
    width: 260,
    height: 190
  })
]);

export const CORE_ACCESS_POINTS = Object.freeze([
  Object.freeze({ id: "player_top_access", coreId: "player", laneId: "top_lane", point: { x: 473, y: 533 } }),
  Object.freeze({ id: "player_mid_access", coreId: "player", laneId: "mid_lane", point: PLAYER_CORE_ATTACK_POSITION }),
  Object.freeze({ id: "player_bottom_access", coreId: "player", laneId: "bottom_lane", point: { x: 535, y: 750 } }),
  Object.freeze({ id: "enemy_top_access", coreId: "enemy", laneId: "top_lane", point: { x: 1314, y: 224 } }),
  Object.freeze({ id: "enemy_mid_access", coreId: "enemy", laneId: "mid_lane", point: { x: 1255, y: 270 } }),
  Object.freeze({ id: "enemy_bottom_access", coreId: "enemy", laneId: "bottom_lane", point: { x: 1219, y: 279 } })
]);

export const CORE_PRESSURE_SPAWN_POINTS = Object.freeze([
  Object.freeze({ id: "enemy_top_pressure_spawn", laneId: "top_lane", point: { x: 1160, y: 216 } }),
  Object.freeze({ id: "enemy_mid_pressure_spawn", laneId: "mid_lane", point: { x: 1256, y: 272 } }),
  Object.freeze({ id: "enemy_bottom_pressure_spawn", laneId: "bottom_lane", point: { x: 1216, y: 472 } })
]);

export const ENEMY_CORE_DEFENSE_DOORS = Object.freeze([
  Object.freeze({
    id: "enemy_core_defense_top_door",
    role: "top_side",
    label: "Core Defense Top",
    center: { x: 1160, y: 216 },
    width: 78,
    height: 16,
    rotation: 0
  }),
  Object.freeze({
    id: "enemy_core_defense_bottom_door",
    role: "bottom_side",
    label: "Core Defense Bottom",
    center: { x: 1216, y: 472 },
    width: 78,
    height: 16,
    rotation: 0
  })
]);

export const MAP_ROUTE_LABELS = Object.freeze([
  Object.freeze({ id: "left_side_route_label", label: "SIDE", position: { x: 470, y: 430 } }),
  Object.freeze({ id: "right_side_route_label", label: "SIDE", position: { x: 1170, y: 430 } })
]);

export const CENTER_ZONE = Object.freeze({
  id: "center_drop_zone",
  label: "Center Drop Zone",
  center: { x: 895, y: 445 },
  width: 260,
  height: 240,
  triggerRadius: 120,
  doors: Object.freeze([
    Object.freeze({
      id: "center_north_door",
      zoneId: "center_drop_zone",
      role: "north",
      label: "N",
      center: { x: 901, y: 350 },
      width: 78,
      height: 16,
      rotation: 0
    }),
    Object.freeze({
      id: "center_east_door",
      zoneId: "center_drop_zone",
      role: "east",
      label: "E",
      center: { x: 996, y: 429 },
      width: 70,
      height: 16,
      rotation: 90
    }),
    Object.freeze({
      id: "center_south_door",
      zoneId: "center_drop_zone",
      role: "south",
      label: "S",
      center: { x: 902, y: 502 },
      width: 78,
      height: 16,
      rotation: 0
    })
  ])
});

export const MAJOR_INTERSECTIONS = Object.freeze([
  createIntersection({
    id: "intersection_1",
    shortLabel: "I-1",
    label: "Major Intersection 1",
    center: { x: 590, y: 415 },
    rotation: -8,
    exits: [
      { id: "northwest_exit", point: { x: 570, y: 400 } },
      { id: "east_exit", point: { x: 670, y: 420 } },
      { id: "south_exit", point: { x: 517, y: 517 } },
      { id: "southwest_exit", point: { x: 457, y: 547 } }
    ],
    doors: [
      {
        role: "front",
        label: "Front",
        center: { x: 639, y: 342 },
        width: 78,
        height: 16,
        rotation: 0
      },
      {
        role: "side",
        label: "Side",
        center: { x: 527, y: 399 },
        width: 70,
        height: 16,
        rotation: 90
      },
      {
        role: "rear_diagonal",
        label: "Rear",
        center: { x: 603, y: 487 },
        width: 78,
        height: 16,
        rotation: 0
      }
    ]
  }),
  createIntersection({
    id: "intersection_2",
    shortLabel: "I-2",
    label: "Major Intersection 2",
    center: { x: 930, y: 240 },
    rotation: 8,
    exits: [
      { id: "west_exit", point: { x: 726, y: 366 } },
      { id: "center_exit", point: { x: 764, y: 326 } },
      { id: "east_exit", point: { x: 814, y: 370 } },
      { id: "north_exit", point: { x: 870, y: 240 } }
    ],
    doors: [
      {
        role: "front",
        label: "Front",
        center: { x: 899, y: 177 },
        width: 78,
        height: 16,
        rotation: 0
      },
      {
        role: "side",
        label: "Side",
        center: { x: 990, y: 243 },
        width: 70,
        height: 16,
        rotation: 90
      },
      {
        role: "rear_diagonal",
        label: "Rear",
        center: { x: 904, y: 301 },
        width: 78,
        height: 16,
        rotation: 0
      }
    ]
  }),
  createIntersection({
    id: "intersection_3",
    shortLabel: "I-3",
    label: "Major Intersection 3",
    center: { x: 925, y: 635 },
    rotation: 8,
    exits: [
      { id: "west_exit", point: { x: 820, y: 600 } },
      { id: "east_exit", point: { x: 920, y: 600 } },
      { id: "south_exit", point: { x: 870, y: 676 } },
      { id: "center_exit", point: { x: 870, y: 640 } }
    ],
    doors: [
      {
        role: "front",
        label: "Front",
        center: { x: 889, y: 567 },
        width: 78,
        height: 16,
        rotation: 0
      },
      {
        role: "side",
        label: "Side",
        center: { x: 981, y: 621 },
        width: 70,
        height: 16,
        rotation: 90
      },
      {
        role: "rear_diagonal",
        label: "Rear",
        center: { x: 897, y: 712 },
        width: 78,
        height: 16,
        rotation: 0
      }
    ]
  }),
  createIntersection({
    id: "intersection_4",
    shortLabel: "I-4",
    label: "Major Intersection 4",
    center: { x: 1135, y: 435 },
    rotation: -8,
    exits: [
      { id: "west_exit", point: { x: 1118, y: 402 } },
      { id: "east_exit", point: { x: 1216, y: 406 } },
      { id: "center_exit", point: { x: 1166, y: 444 } },
      { id: "south_exit", point: { x: 1218, y: 534 } }
    ],
    doors: [
      {
        role: "front",
        label: "Front",
        center: { x: 1154, y: 371 },
        width: 78,
        height: 16,
        rotation: 0
      },
      {
        role: "side",
        label: "Side",
        center: { x: 1066, y: 429 },
        width: 70,
        height: 16,
        rotation: 90
      },
      {
        role: "rear_diagonal",
        label: "Rear",
        center: { x: 1154, y: 499 },
        width: 78,
        height: 16,
        rotation: 0
      }
    ]
  })
]);

export const MAP_DOORS = Object.freeze(
  MAJOR_INTERSECTIONS.flatMap((intersection) => intersection.doors)
);

export const CENTER_DOORS = CENTER_ZONE.doors;

export const MAP_BLOCKERS = Object.freeze([]);
export const MAP_COLLISION_BLOCKERS = Object.freeze([]);
export const HERO_COLLISION_RADIUS = 8;

export function isWalkablePoint(point) {
  if (
    point.x < 0 ||
    point.y < 0 ||
    point.x > WORLD_BOUNDS.width ||
    point.y > WORLD_BOUNDS.height
  ) {
    return false;
  }

  return isWalkmaskPointWalkable(point);
}

export function isWalkableBody(point, radius = HERO_COLLISION_RADIUS) {
  return getBodySamplePoints(point, radius).every(isWalkablePoint);
}

export function getBodySamplePoints(point, radius = HERO_COLLISION_RADIUS) {
  const diagonal = radius * 0.7;
  return [
    point,
    { x: point.x + radius, y: point.y },
    { x: point.x - radius, y: point.y },
    { x: point.x, y: point.y + radius },
    { x: point.x, y: point.y - radius },
    { x: point.x + diagonal, y: point.y + diagonal },
    { x: point.x - diagonal, y: point.y + diagonal },
    { x: point.x + diagonal, y: point.y - diagonal },
    { x: point.x - diagonal, y: point.y - diagonal }
  ];
}

export function isDoorBlockingWalkablePath(door) {
  return isWalkablePoint(door.center);
}

export function getIntersectionById(id) {
  return MAJOR_INTERSECTIONS.find((intersection) => intersection.id === id) || null;
}

export function isPointInRect(point, rect) {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

export function isPointInEllipse(point, area) {
  const halfWidth = area.width / 2;
  const halfHeight = area.height / 2;
  const dx = (point.x - area.center.x) / halfWidth;
  const dy = (point.y - area.center.y) / halfHeight;

  return dx * dx + dy * dy <= 1;
}

export function isPointInSoftDiamond(point, intersection) {
  const halfWidth = intersection.width / 2;
  const halfHeight = intersection.height / 2;
  const dx = Math.abs(point.x - intersection.center.x);
  const dy = Math.abs(point.y - intersection.center.y);

  return dx <= halfWidth && dy <= halfHeight && dx / halfWidth + dy / halfHeight <= 1.35;
}

export function isPointInCollisionBlocker(point, blocker) {
  if (blocker.type === "ellipse") {
    return isPointInEllipse(point, blocker);
  }

  return isPointInRect(point, blocker);
}

function createIntersection({ id, shortLabel, label, center, rotation, exits, doors }) {
  return Object.freeze({
    id,
    shortLabel,
    label,
    center,
    width: 230,
    height: 185,
    rotation,
    triggerRadius: INTERSECTION_TRIGGER_RADIUS,
    exits: Object.freeze(
      exits.map((exit) =>
        Object.freeze({
          id: `${id}_${exit.id}`,
          point: Object.freeze({ ...exit.point })
        })
      )
    ),
    doors: Object.freeze(
      doors.map((door) =>
        Object.freeze({
          ...door,
          id: `${id}_${door.role}_door`,
          zoneId: id
        })
      )
    )
  });
}
