/**
 * MapBuilder.js — Constructs the 3D V1 map blockout from mapLayout.js data.
 */
import * as THREE from "three";
import {
  CENTER_DOORS, CENTER_ZONE, CORE_AREAS, ENEMY_CORE_POSITION,
  MAJOR_INTERSECTIONS, MAP_BLOCKERS, MAP_DOORS, MAP_LANES,
  PLAYER_CORE_POSITION, SIDE_ROUTES, WORLD_BOUNDS
} from "../game/mapLayout.js";
import {
  MAP_ART_WALLS,
  MAP_CHARACTER_STAGING,
  MAP_PROP_PLACEMENTS,
  MAP_TREE_CLUSTERS,
  findAssetReference
} from "../game/mapArt.js";
import { attachRuntimeMapAssets } from "./AssetModelLoader.js";
import { worldToThreePosition } from "../game/camera.js";

const SCALE = 0.025;
const PATH_H = 0.08;
const ROUTE_H = 0.09;
const INTX_H = 0.14;
const CENTER_H = 0.12;
const BLOCKER_H = 0.62;
const ART_WALL_H = 0.78;
const DOOR_H = 0.48;
const CORE_TOWER_H = 1.6;
const CORE_BASE_H = 0.38;
const HERO_H = 0.52;
const FLOOR_LINE_H = 0.012;
const TREE_TRUNK_H = 0.48;
const TREE_CANOPY_H = 0.62;

function mats() {
  return {
    ground: new THREE.MeshStandardMaterial({ color: 0x6b4a33, roughness: 0.96 }),
    lane: new THREE.MeshStandardMaterial({ color: 0x3a3d4c, roughness: 0.88 }),
    sideRoute: new THREE.MeshStandardMaterial({ color: 0x333747, roughness: 0.86 }),
    coreArea: new THREE.MeshStandardMaterial({ color: 0x34384a, roughness: 0.88 }),
    center: new THREE.MeshStandardMaterial({ color: 0x444356, roughness: 0.80 }),
    intx: new THREE.MeshStandardMaterial({ color: 0x424658, roughness: 0.82 }),
    floorLine: new THREE.MeshBasicMaterial({ color: 0x5f6173 }),
    blocker: new THREE.MeshStandardMaterial({ color: 0x34303a, roughness: 0.72, metalness: 0.12 }),
    artWall: new THREE.MeshStandardMaterial({ color: 0xd7c4ff, roughness: 0.54, metalness: 0.08, emissive: 0x1d102a, emissiveIntensity: 0.12 }),
    artWallCap: new THREE.MeshStandardMaterial({ color: 0xf2e9ff, roughness: 0.44, metalness: 0.12 }),
    artWallTrim: new THREE.MeshStandardMaterial({ color: 0xf09a43, roughness: 0.52, metalness: 0.16, emissive: 0x271007, emissiveIntensity: 0.22 }),
    door: new THREE.MeshStandardMaterial({ color: 0x5b202c, roughness: 0.55, metalness: 0.4, emissive: 0x1a0808, emissiveIntensity: 0.3 }),
    cDoor: new THREE.MeshStandardMaterial({ color: 0x5d4c30, roughness: 0.55, metalness: 0.4, emissive: 0x1a1508, emissiveIntensity: 0.3 }),
    pCore: new THREE.MeshStandardMaterial({ color: 0x4ea9d8, roughness: 0.38, metalness: 0.4, emissive: 0x1a4060, emissiveIntensity: 0.35 }),
    eCore: new THREE.MeshStandardMaterial({ color: 0xe25454, roughness: 0.38, metalness: 0.4, emissive: 0x601a1a, emissiveIntensity: 0.35 }),
    hero: new THREE.MeshStandardMaterial({ color: 0xf4d36f, roughness: 0.45, metalness: 0.22, emissive: 0x3d3418, emissiveIntensity: 0.4 }),
    heroDown: new THREE.MeshStandardMaterial({ color: 0xff8b82, roughness: 0.5, metalness: 0.14 }),
    treeTrunk: new THREE.MeshStandardMaterial({ color: 0x5c3b2c, roughness: 0.86 }),
    treeCanopy: new THREE.MeshStandardMaterial({ color: 0x8f2739, roughness: 0.8, emissive: 0x1a0508, emissiveIntensity: 0.08 }),
    treeCanopyDark: new THREE.MeshStandardMaterial({ color: 0x6f2030, roughness: 0.82, emissive: 0x140407, emissiveIntensity: 0.08 }),
    prop: new THREE.MeshStandardMaterial({ color: 0x252833, roughness: 0.6, metalness: 0.36 }),
    propAccent: new THREE.MeshStandardMaterial({ color: 0x66e08b, roughness: 0.4, metalness: 0.18, emissive: 0x10451f, emissiveIntensity: 0.45 }),
    enemyPreview: new THREE.MeshStandardMaterial({ color: 0x17191f, roughness: 0.45, metalness: 0.42, emissive: 0x3b0811, emissiveIntensity: 0.25 }),
    hpBack: new THREE.MeshBasicMaterial({ color: 0x171a20 }),
    frame: new THREE.MeshStandardMaterial({ color: 0x252028, roughness: 0.7, metalness: 0.25 }),
    cap: new THREE.MeshStandardMaterial({ color: 0x4a4652, roughness: 0.6, metalness: 0.3 })
  };
}

export function buildMap(scene) {
  const m = mats();
  const sg = new THREE.Group();
  sg.name = "staticMap";

  // Lighting
  scene.add(new THREE.HemisphereLight(0xf5d8ff, 0x1b1020, 1.8));
  const key = new THREE.DirectionalLight(0xf6ead8, 2.2);
  key.position.set(-6, 12, 8);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xd8c8f6, 0.6);
  fill.position.set(5, 8, -4);
  scene.add(fill);
  scene.add(new THREE.AmbientLight(0x2a1832, 0.5));

  // Ground
  const gw = tl(WORLD_BOUNDS.width) + 30;
  const gd = tl(WORLD_BOUNDS.height) + 10;
  const ground = new THREE.Mesh(new THREE.BoxGeometry(gw, 0.06, gd), m.ground);
  ground.position.y = -0.03;
  sg.add(ground);

  // Core areas
  for (const a of CORE_AREAS) addEllipse(sg, a, PATH_H, m.coreArea);
  // Side routes
  for (const r of SIDE_ROUTES) addRect(sg, r, ROUTE_H, m.sideRoute);
  // Lanes
  for (const l of MAP_LANES) addRect(sg, l, PATH_H, m.lane);
  // Center
  addEllipse(sg, CENTER_ZONE, CENTER_H, m.center);
  // Intersections
  for (const ix of MAJOR_INTERSECTIONS) addSoftDiamond(sg, ix, INTX_H, m.intx);
  addFloorPanelLines(sg, m);
  addRuntimeBaseSurfaceOverlays(sg);
  // Blockers
  for (const b of MAP_BLOCKERS) {
    const bw = tl(b.width), bd = tl(b.height);
    const bm = new THREE.Mesh(new THREE.BoxGeometry(bw, BLOCKER_H, bd), m.blocker);
    setPos(bm, { x: b.x + b.width / 2, y: b.y + b.height / 2 }, BLOCKER_H / 2);
    sg.add(bm);
    const cp = new THREE.Mesh(new THREE.BoxGeometry(bw + 0.02, 0.04, bd + 0.02), m.cap);
    setPos(cp, { x: b.x + b.width / 2, y: b.y + b.height / 2 }, BLOCKER_H + 0.02);
    sg.add(cp);
  }
  for (const wall of MAP_ART_WALLS) addArtWall(sg, wall, m);
  for (const cluster of MAP_TREE_CLUSTERS) addTreeCluster(sg, cluster, m);
  for (const prop of MAP_PROP_PLACEMENTS) addPropProxy(sg, prop, m);
  for (const stage of MAP_CHARACTER_STAGING) addCharacterStage(sg, stage, m);
  // Doors
  for (const d of MAP_DOORS) addDoor(sg, d, m.door, m.frame);
  for (const d of CENTER_DOORS) addDoor(sg, d, m.cDoor, m.frame);

  scene.add(sg);
  attachRuntimeMapAssets(sg).catch((error) => {
    console.warn("Runtime map asset preview failed; using proxy map art.", error);
  });

  // Dynamic objects
  const dyn = addDynamic(scene, m);
  return { staticGroup: sg, dynamicObjects: dyn };
}

export function updateMapObjects(dyn, hero, match) {
  const down = hero.status === "downed";
  setPos(dyn.hero, hero.position, HERO_H / 2 + 0.12);
  setPos(dyn.heroDowned, hero.position, HERO_H / 2 + 0.12);
  dyn.hero.visible = !down;
  dyn.heroDowned.visible = down;
  setHpBar(dyn.playerHpBar, cl(match.playerCoreHp / match.coreMaxHp, 0, 1));
  setHpBar(dyn.enemyHpBar, cl(match.enemyCoreHp / match.coreMaxHp, 0, 1));
}

function addDynamic(scene, m) {
  const pc = createCore(m.pCore);
  const ec = createCore(m.eCore);
  const h = createHero(m.hero);
  const hd = createHero(m.heroDown);
  const phb = createHpBar(m.pCore);
  const ehb = createHpBar(m.eCore);
  scene.add(pc, ec, h, hd, phb.root, ehb.root);
  setPos(pc, PLAYER_CORE_POSITION, 0);
  setPos(ec, ENEMY_CORE_POSITION, 0);
  setPos(phb.root, { x: PLAYER_CORE_POSITION.x, y: PLAYER_CORE_POSITION.y - 78 }, CORE_TOWER_H + 0.8);
  setPos(ehb.root, { x: ENEMY_CORE_POSITION.x, y: ENEMY_CORE_POSITION.y - 78 }, CORE_TOWER_H + 0.8);
  h.visible = true;
  hd.visible = false;
  return { playerCore: pc, enemyCore: ec, hero: h, heroDowned: hd, playerHpBar: phb, enemyHpBar: ehb };
}

function createCore(mat) {
  const g = new THREE.Group();
  const plat = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.25, 0.12, 32),
    new THREE.MeshStandardMaterial({ color: 0x252028, roughness: 0.7, metalness: 0.3 }));
  plat.position.set(0, 0.06, 0);
  g.add(plat);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.88, 1.0, CORE_BASE_H, 32), mat);
  base.position.y = CORE_BASE_H / 2 + 0.12;
  g.add(base);
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.68, CORE_TOWER_H, 24), mat);
  tower.position.y = CORE_BASE_H + CORE_TOWER_H / 2 + 0.12;
  g.add(tower);
  const capMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.36, 0.26, 24), mat);
  capMesh.position.y = CORE_BASE_H + CORE_TOWER_H + 0.13 + 0.12;
  g.add(capMesh);
  const ringColor = mat.color && typeof mat.color.getHex === "function" ? mat.color.getHex() : 0x4ea9d8;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.04, 8, 32), new THREE.MeshBasicMaterial({ color: ringColor }));
  ring.rotation.x = Math.PI / 2;
  ring.position.y = CORE_BASE_H + CORE_TOWER_H * 0.5 + 0.12;
  g.add(ring);
  return g;
}

function createHero(mat) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.35, HERO_H, 20), mat);
  body.position.y = HERO_H / 2;
  g.add(body);
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.20, 0.42, 12), mat);
  cone.rotation.z = -Math.PI / 2;
  cone.position.set(0.30, HERO_H * 0.4, 0);
  g.add(cone);
  const heroRingColor = mat.color && typeof mat.color.getHex === "function" ? mat.color.getHex() : 0xf4d36f;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.03, 8, 24), new THREE.MeshBasicMaterial({ color: heroRingColor }));
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.04;
  g.add(ring);
  return g;
}

function createHpBar(fillMat) {
  const root = new THREE.Group();
  const bw = 1.8;
  root.add(new THREE.Mesh(new THREE.BoxGeometry(bw + 0.1, 0.10, 0.18), new THREE.MeshBasicMaterial({ color: 0x171a20 })));
  const fill = new THREE.Mesh(new THREE.BoxGeometry(bw, 0.12, 0.14), fillMat);
  fill.position.y = 0.02;
  root.add(fill);
  return { root, fill, bw };
}

function setHpBar(bar, pct) {
  const c = cl(pct, 0, 1);
  bar.fill.scale.x = c;
  bar.fill.position.x = -bar.bw / 2 * (1 - c);
}

function addFloorPanelLines(parent, m) {
  const lineDepth = 0.018;
  const lineWidth = 0.018;
  const worldW = tl(WORLD_BOUNDS.width);
  const worldD = tl(WORLD_BOUNDS.height);

  for (let x = 120; x <= WORLD_BOUNDS.width - 120; x += 80) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(lineWidth, FLOOR_LINE_H, worldD * 0.72), m.floorLine);
    setPos(line, { x, y: WORLD_BOUNDS.height / 2 }, INTX_H + FLOOR_LINE_H);
    parent.add(line);
  }

  for (let y = 110; y <= WORLD_BOUNDS.height - 110; y += 72) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(worldW * 0.82, FLOOR_LINE_H, lineDepth), m.floorLine);
    setPos(line, { x: WORLD_BOUNDS.width / 2, y }, INTX_H + FLOOR_LINE_H);
    parent.add(line);
  }
}

function addRuntimeBaseSurfaceOverlays(parent) {
  addRuntimeAsset(parent, "player_core_floor_asset", "base_room_large_variation", PLAYER_CORE_POSITION, 235, 250, 0, 0.18);
  addRuntimeAsset(parent, "enemy_core_floor_asset", "base_room_large_variation", ENEMY_CORE_POSITION, 235, 250, 180, 0.18);

  addRuntimeAsset(parent, "top_lane_left_floor_asset", "base_template_floor_big", { x: 300, y: 158 }, 260, 120, 0, 0.12);
  addRuntimeAsset(parent, "top_lane_center_floor_asset", "base_corridor_wide", { x: 600, y: 158 }, 280, 120, 0, 0.12);
  addRuntimeAsset(parent, "top_lane_right_floor_asset", "base_template_floor_big", { x: 900, y: 158 }, 260, 120, 0, 0.12);

  addRuntimeAsset(parent, "mid_lane_left_floor_asset", "base_corridor_wide", { x: 300, y: 310 }, 260, 138, 0, 0.12);
  addRuntimeAsset(parent, "mid_lane_center_floor_asset", "base_template_floor_layer_raised", { x: 600, y: 310 }, 320, 138, 0, 0.14);
  addRuntimeAsset(parent, "mid_lane_right_floor_asset", "base_corridor_wide", { x: 900, y: 310 }, 260, 138, 0, 0.12);

  addRuntimeAsset(parent, "bottom_lane_left_floor_asset", "base_template_floor_big", { x: 300, y: 462 }, 260, 120, 0, 0.12);
  addRuntimeAsset(parent, "bottom_lane_center_floor_asset", "base_corridor_wide", { x: 600, y: 462 }, 280, 120, 0, 0.12);
  addRuntimeAsset(parent, "bottom_lane_right_floor_asset", "base_template_floor_big", { x: 900, y: 462 }, 260, 120, 0, 0.12);

  addRuntimeAsset(parent, "intersection_1_floor_asset", "base_corridor_wide_intersection", MAJOR_INTERSECTIONS[0].center, 210, 170, -8, 0.16);
  addRuntimeAsset(parent, "intersection_2_floor_asset", "base_corridor_wide_intersection", MAJOR_INTERSECTIONS[1].center, 210, 170, 8, 0.16);
  addRuntimeAsset(parent, "intersection_3_floor_asset", "base_corridor_wide_intersection", MAJOR_INTERSECTIONS[2].center, 210, 170, 8, 0.16);
  addRuntimeAsset(parent, "intersection_4_floor_asset", "base_corridor_wide_intersection", MAJOR_INTERSECTIONS[3].center, 210, 170, -8, 0.16);

  addRuntimeAsset(parent, "center_drop_floor_asset", "base_corridor_wide_intersection", CENTER_ZONE.center, 260, 220, 0, 0.16);
  addRuntimeAsset(parent, "player_top_side_floor_asset", "base_corridor_wide_corner", { x: 232, y: 134 }, 130, 150, -14, 0.13);
  addRuntimeAsset(parent, "player_bottom_side_floor_asset", "base_corridor_wide_corner", { x: 232, y: 486 }, 130, 150, 14, 0.13);
  addRuntimeAsset(parent, "enemy_top_side_floor_asset", "base_corridor_wide_corner", { x: 968, y: 134 }, 130, 150, 14, 0.13);
  addRuntimeAsset(parent, "enemy_bottom_side_floor_asset", "base_corridor_wide_corner", { x: 968, y: 486 }, 130, 150, -14, 0.13);

  addRuntimeAsset(parent, "top_center_stairs_asset", "base_stairs_wide", { x: 600, y: 76 }, 110, 60, 0, 0.18);
  addRuntimeAsset(parent, "bottom_center_stairs_asset", "base_stairs_wide", { x: 600, y: 544 }, 110, 60, 180, 0.18);
}

function addRuntimeAsset(parent, id, assetId, center, width, depth, rotation = 0, height = 0.12) {
  const group = new THREE.Group();
  group.name = id;
  group.userData.assetId = assetId;
  group.userData.assetKind = "surface";
  group.userData.assetTarget = {
    width: tl(width),
    height,
    depth: tl(depth)
  };
  group.rotation.y = THREE.MathUtils.degToRad(-rotation);
  setPos(group, center, PATH_H + 0.025);
  parent.add(group);
  return group;
}

function addArtWall(parent, wall, m) {
  const group = new THREE.Group();
  group.name = wall.id;
  attachAssetUserData(group, wall.assetKey);
  group.userData.assetKind = "artWall";

  const w = tl(wall.width);
  const d = tl(wall.height);
  group.userData.assetTarget = { width: w, height: ART_WALL_H * 0.82, depth: Math.min(d, 0.28) };
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, ART_WALL_H, d), m.artWall);
  body.position.y = ART_WALL_H / 2;
  group.add(body);

  const cap = new THREE.Mesh(new THREE.BoxGeometry(w + 0.06, 0.08, d + 0.06), m.artWallCap);
  cap.position.y = ART_WALL_H + 0.04;
  group.add(cap);

  const trim = new THREE.Mesh(new THREE.BoxGeometry(w * 0.88, 0.08, d + 0.08), m.artWallTrim);
  trim.position.y = ART_WALL_H * 0.42;
  group.add(trim);

  group.rotation.y = THREE.MathUtils.degToRad(-(wall.rotation || 0));
  setPos(group, wall.center, 0.04);
  parent.add(group);
  return group;
}

function addTreeCluster(parent, cluster, m) {
  const seed = hashString(cluster.id);
  const group = new THREE.Group();
  group.name = cluster.id;
  attachAssetUserData(group, cluster.assetKey);
  group.userData.assetKind = "treeCluster";
  group.userData.assetTarget = { width: 0.58, height: 1.18, depth: 0.58 };

  for (let i = 0; i < cluster.count; i++) {
    const angle = (Math.PI * 2 * i) / cluster.count + (seed % 19) * 0.03;
    const ring = i === 0 ? 0 : cluster.radius * (0.34 + ((seed + i * 7) % 35) / 100);
    const pos = {
      x: cluster.center.x + Math.cos(angle) * ring,
      y: cluster.center.y + Math.sin(angle) * ring
    };
    const tree = createTreeProxy(m, seed + i, cluster.assetKey.includes("pine"));
    tree.name = `${cluster.id}_tree_${i + 1}`;
    const scale = 0.9 + ((seed + i * 11) % 28) / 100;
    tree.scale.setScalar(scale);
    tree.rotation.y = angle;
    setPos(tree, pos, 0.14);
    group.add(tree);
  }

  parent.add(group);
  return group;
}

function createTreeProxy(m, seed, pineLike) {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.10, TREE_TRUNK_H, 8), m.treeTrunk);
  trunk.position.y = TREE_TRUNK_H / 2;
  group.add(trunk);

  if (pineLike) {
    const lower = new THREE.Mesh(new THREE.ConeGeometry(0.34, TREE_CANOPY_H, 9), m.treeCanopyDark);
    lower.position.y = TREE_TRUNK_H + TREE_CANOPY_H * 0.32;
    group.add(lower);
    const upper = new THREE.Mesh(new THREE.ConeGeometry(0.25, TREE_CANOPY_H * 0.82, 9), m.treeCanopy);
    upper.position.y = TREE_TRUNK_H + TREE_CANOPY_H * 0.74;
    group.add(upper);
  } else {
    const canopy = new THREE.Mesh(new THREE.IcosahedronGeometry(0.36 + (seed % 5) * 0.015, 1), m.treeCanopy);
    canopy.scale.set(1.1, 0.78, 1.0);
    canopy.position.y = TREE_TRUNK_H + 0.32;
    group.add(canopy);
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(0.26, 1), m.treeCanopyDark);
    crown.position.set(0.15, TREE_TRUNK_H + 0.58, -0.06);
    group.add(crown);
  }

  return group;
}

function addPropProxy(parent, prop, m) {
  const group = new THREE.Group();
  group.name = prop.id;
  attachAssetUserData(group, prop.assetKey);
  group.userData.assetKind = "prop";
  group.userData.assetTarget = getPropAssetTarget(prop);

  if (prop.role?.startsWith("turret")) {
    addTurretProxy(group, m, prop.role.includes("enemy"));
  } else if (prop.role?.startsWith("base_room")) {
    addBaseRoomProxy(group, m, prop.role.includes("enemy"));
  } else if (prop.assetKey.includes("satelliteDish")) {
    addSatelliteProxy(group, m);
  } else if (prop.assetKey.includes("desk")) {
    addDeskProxy(group, m);
  } else if (prop.assetKey.includes("shelves")) {
    addShelvesProxy(group, m);
  } else if (prop.assetKey.includes("healthPack")) {
    addHealthPackProxy(group, m);
  } else if (prop.assetKey.includes("locker")) {
    addLockerProxy(group, m);
  } else {
    addCrateProxy(group, m);
  }

  group.scale.setScalar(prop.scale || 1);
  group.rotation.y = THREE.MathUtils.degToRad(-(prop.rotation || 0));
  setPos(group, prop.center, 0.16);
  parent.add(group);
  return group;
}

function getPropAssetTarget(prop) {
  if (prop.role?.startsWith("base_room")) {
    return { width: 1.75, height: 1.35, depth: 1.75 };
  }
  if (prop.role?.startsWith("turret")) {
    return { width: 0.95, height: 0.92, depth: 0.95 };
  }
  return { width: 0.72, height: 0.72, depth: 0.72 };
}

function addBaseRoomProxy(group, m, isEnemy) {
  const baseMat = isEnemy ? m.eCore : m.pCore;
  const room = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.95, 0.30, 18), m.frame);
  room.position.y = 0.15;
  group.add(room);
  const deck = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.68, 0.34, 18), m.artWall);
  deck.position.y = 0.44;
  group.add(deck);
  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.26, 0.62, 18), baseMat);
  beacon.position.y = 0.88;
  group.add(beacon);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.20, 18, 10), baseMat);
  cap.position.y = 1.21;
  group.add(cap);
}

function addTurretProxy(group, m, isEnemy) {
  const accentMat = isEnemy ? m.eCore : m.pCore;
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.50, 0.16, 18), m.frame);
  pad.position.y = 0.08;
  group.add(pad);
  const turret = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.26, 0.38, 14), m.prop);
  turret.position.y = 0.35;
  group.add(turret);
  const barrel = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.08, 0.12), accentMat);
  barrel.position.set(0.24, 0.50, 0);
  group.add(barrel);
}

function addCrateProxy(group, m) {
  const crate = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.34, 0.38), m.prop);
  crate.position.y = 0.17;
  group.add(crate);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.045, 0.40), m.propAccent);
  stripe.position.y = 0.34;
  group.add(stripe);
}

function addHealthPackProxy(group, m) {
  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.16, 0.24), m.prop);
  pack.position.y = 0.16;
  group.add(pack);
  const crossA = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.025, 0.055), m.propAccent);
  crossA.position.y = 0.25;
  group.add(crossA);
  const crossB = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.026, 0.18), m.propAccent);
  crossB.position.y = 0.255;
  group.add(crossB);
}

function addLockerProxy(group, m) {
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.70, 0.24), m.prop);
  body.position.y = 0.35;
  group.add(body);
  const line = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.58, 0.25), m.propAccent);
  line.position.set(0.08, 0.38, 0);
  group.add(line);
}

function addDeskProxy(group, m) {
  const top = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.10, 0.34), m.prop);
  top.position.y = 0.36;
  group.add(top);
  const screen = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.20, 0.035), m.propAccent);
  screen.position.set(0.16, 0.50, -0.12);
  screen.rotation.x = THREE.MathUtils.degToRad(-12);
  group.add(screen);
}

function addShelvesProxy(group, m) {
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.86, 0.18), m.prop);
  body.position.y = 0.43;
  group.add(body);
  const glow = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.10, 0.20), m.propAccent);
  glow.position.y = 0.62;
  group.add(glow);
}

function addSatelliteProxy(group, m) {
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.18, 16), m.prop);
  base.position.y = 0.09;
  group.add(base);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.48, 8), m.prop);
  mast.position.y = 0.40;
  group.add(mast);
  const dish = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.18, 24, 1, true), m.propAccent);
  dish.rotation.x = THREE.MathUtils.degToRad(58);
  dish.position.set(0.0, 0.72, -0.12);
  group.add(dish);
}

function addCharacterStage(parent, stage, m) {
  const group = new THREE.Group();
  group.name = stage.id;
  attachAssetUserData(group, stage.assetKey);

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.58, 12), m.enemyPreview);
  body.position.y = 0.31;
  group.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 8), m.enemyPreview);
  head.position.y = 0.72;
  group.add(head);
  const eye = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.045, 0.05), m.door);
  eye.position.set(0, 0.72, -0.14);
  group.add(eye);

  group.rotation.y = stage.center.x < WORLD_BOUNDS.width / 2 ? Math.PI / 2 : -Math.PI / 2;
  setPos(group, stage.center, 0.16);
  parent.add(group);
  return group;
}

function addDoor(parent, door, mat, frameMat) {
  const w = tl(door.width), d = tl(door.height);
  addRuntimeDoorAsset(parent, door, w, d);

  const f = new THREE.Mesh(new THREE.BoxGeometry(w + 0.06, DOOR_H + 0.04, d + 0.06), frameMat);
  f.rotation.y = THREE.MathUtils.degToRad(-(door.rotation || 0));
  setPos(f, door.center, DOOR_H / 2 + 0.02);
  parent.add(f);
  const dm = new THREE.Mesh(new THREE.BoxGeometry(w, DOOR_H, d), mat);
  dm.rotation.y = THREE.MathUtils.degToRad(-(door.rotation || 0));
  setPos(dm, door.center, DOOR_H / 2 + 0.04);
  parent.add(dm);
  const slitColor = mat.emissive && typeof mat.emissive.getHex === "function" ? mat.emissive.getHex() : 0xff4444;
  const slit = new THREE.Mesh(new THREE.BoxGeometry(w * 0.7, 0.04, d * 0.3),
    new THREE.MeshBasicMaterial({ color: slitColor }));
  slit.rotation.y = THREE.MathUtils.degToRad(-(door.rotation || 0));
  setPos(slit, door.center, DOOR_H * 0.65 + 0.04);
  parent.add(slit);
}

function addRuntimeDoorAsset(parent, door, width, depth) {
  const group = new THREE.Group();
  group.name = `${door.id}_runtime_gate_asset`;
  group.userData.assetId = door.zoneId === CENTER_ZONE.id ? "base_gate_lasers" : "base_gate_door";
  group.userData.assetKind = "door";
  group.userData.assetTarget = {
    width: Math.max(width + 0.18, 0.72),
    height: DOOR_H,
    depth: Math.max(depth + 0.14, 0.20)
  };
  group.rotation.y = THREE.MathUtils.degToRad(-(door.rotation || 0));
  setPos(group, door.center, 0.07);
  parent.add(group);
  return group;
}

function addRect(parent, item, h, mat) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(tl(item.width), h, tl(item.height)), mat);
  setPos(m, { x: item.x + item.width / 2, y: item.y + item.height / 2 }, h / 2);
  parent.add(m);
  return m;
}

function addEllipse(parent, item, h, mat) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, h, 48), mat);
  m.scale.set(tl(item.width) / 2, 1, tl(item.height) / 2);
  setPos(m, item.center, h / 2);
  parent.add(m);
  return m;
}

function addSoftDiamond(parent, item, h, mat) {
  const shape = new THREE.Shape();
  const w = tl(item.width), d = tl(item.height);
  const cx = w * 0.2, cz = d * 0.2;
  const pts = [
    [-w/2+cx, -d/2], [w/2-cx, -d/2], [w/2, -d/2+cz], [w/2, d/2-cz],
    [w/2-cx, d/2], [-w/2+cx, d/2], [-w/2, d/2-cz], [-w/2, -d/2+cz]
  ];
  shape.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) shape.lineTo(pts[i][0], pts[i][1]);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false });
  geo.rotateX(Math.PI / 2);
  const m = new THREE.Mesh(geo, mat);
  m.rotation.y = THREE.MathUtils.degToRad(-(item.rotation || 0));
  setPos(m, item.center, h);
  m.name = item.id;
  parent.add(m);
  return m;
}

function setPos(obj, wp, h) {
  const p = worldToThreePosition(wp, h);
  obj.position.set(p.x, p.y, p.z);
}

function attachAssetUserData(object, assetKey) {
  const asset = findAssetReference(assetKey);
  object.userData.assetKey = assetKey;

  if (asset) {
    object.userData.assetId = asset.id;
    object.userData.assetPath = asset.path;
    object.userData.assetFormat = asset.format;
  }
}

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function tl(v) { return v * SCALE; }
function cl(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }
