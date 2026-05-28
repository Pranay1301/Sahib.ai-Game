/**
 * Asset-aware visual dressing for the Phase 4 map blockout.
 *
 * These references come from public/assests/@assets.json. The current
 * Phase 4 renderer uses lightweight Three.js proxy geometry and stores
 * the intended asset id/path in userData, so gameplay and Expo bundling
 * stay stable until the dedicated GLB/glTF loading pass.
 */

export const MAP_ASSET_LIBRARY = Object.freeze({
  base: Object.freeze({
    wall: assetRef(
      "base_template_wall",
      "Base template wall",
      "glb",
      "public/assests/Base/Models/GLB format/template-wall.glb"
    ),
    wallCorner: assetRef(
      "base_template_wall_corner",
      "Base template wall corner",
      "glb",
      "public/assests/Base/Models/GLB format/template-wall-corner.glb"
    ),
    gateDoor: assetRef(
      "base_gate_door",
      "Base gate door",
      "glb",
      "public/assests/Base/Models/GLB format/gate-door.glb"
    ),
    gateLarge: assetRef(
      "base_gate",
      "Base gate",
      "glb",
      "public/assests/Base/Models/GLB format/gate.glb"
    ),
    roomWide: assetRef(
      "base_room_wide",
      "Base room wide",
      "glb",
      "public/assests/Base/Models/GLB format/room-wide.glb"
    ),
    roomLarge: assetRef(
      "base_room_large",
      "Base room large",
      "glb",
      "public/assests/Base/Models/GLB format/room-large.glb"
    ),
    stairsWide: assetRef(
      "base_stairs_wide",
      "Base stairs wide",
      "glb",
      "public/assests/Base/Models/GLB format/stairs-wide.glb"
    ),
    floorPanel: assetRef(
      "base_template_floor",
      "Base template floor",
      "glb",
      "public/assests/Base/Models/GLB format/template-floor.glb"
    )
  }),
  sciFi: Object.freeze({
    crate: assetRef(
      "sci_fi_prop_crate",
      "Sci-Fi prop crate",
      "gltf",
      "public/assests/Sci-Fi Essentials Kit[Standard]/glTF/Prop_Crate.gltf"
    ),
    crateLarge: assetRef(
      "sci_fi_prop_crate_large",
      "Sci-Fi large crate",
      "gltf",
      "public/assests/Sci-Fi Essentials Kit[Standard]/glTF/Prop_Crate_Large.gltf"
    ),
    deskMedium: assetRef(
      "sci_fi_prop_desk_medium",
      "Sci-Fi medium desk",
      "gltf",
      "public/assests/Sci-Fi Essentials Kit[Standard]/glTF/Prop_Desk_Medium.gltf"
    ),
    healthPack: assetRef(
      "sci_fi_health_pack",
      "Sci-Fi health pack",
      "gltf",
      "public/assests/Sci-Fi Essentials Kit[Standard]/glTF/Prop_HealthPack.gltf"
    ),
    chest: assetRef(
      "sci_fi_prop_chest",
      "Sci-Fi chest",
      "gltf",
      "public/assests/Sci-Fi Essentials Kit[Standard]/glTF/Prop_Chest.gltf"
    ),
    satelliteDish: assetRef(
      "sci_fi_prop_satellite_dish",
      "Sci-Fi satellite dish",
      "gltf",
      "public/assests/Sci-Fi Essentials Kit[Standard]/glTF/Prop_SatelliteDish.gltf"
    ),
    locker: assetRef(
      "sci_fi_prop_locker",
      "Sci-Fi locker",
      "gltf",
      "public/assests/Sci-Fi Essentials Kit[Standard]/glTF/Prop_Locker.gltf"
    ),
    shelvesWideTall: assetRef(
      "sci_fi_prop_shelves_wide_tall",
      "Sci-Fi wide shelves tall",
      "gltf",
      "public/assests/Sci-Fi Essentials Kit[Standard]/glTF/Prop_Shelves_WideTall.gltf"
    ),
    shelvesWideShort: assetRef(
      "sci_fi_prop_shelves_wide_short",
      "Sci-Fi wide shelves short",
      "gltf",
      "public/assests/Sci-Fi Essentials Kit[Standard]/glTF/Prop_Shelves_WideShort.gltf"
    ),
    enemyEyeDrone: assetRef(
      "sci_fi_enemy_eye_drone",
      "Sci-Fi eye drone",
      "gltf",
      "public/assests/Sci-Fi Essentials Kit[Standard]/glTF/Enemy_EyeDrone.gltf"
    ),
    enemyQuadShell: assetRef(
      "sci_fi_enemy_quad_shell",
      "Sci-Fi quad shell",
      "gltf",
      "public/assests/Sci-Fi Essentials Kit[Standard]/glTF/Enemy_QuadShell.gltf"
    ),
    rifle: assetRef(
      "sci_fi_gun_rifle",
      "Sci-Fi rifle",
      "gltf",
      "public/assests/Sci-Fi Essentials Kit[Standard]/glTF/Gun_Rifle.gltf"
    )
  }),
  trees: Object.freeze({
    tree1: assetRef(
      "trees_tree_1",
      "Red tree 1",
      "glb",
      "public/assests/Tress/GLB/Tree_1.glb"
    ),
    tree4: assetRef(
      "trees_tree_4",
      "Red tree 4",
      "glb",
      "public/assests/Tress/GLB/Tree_4.glb"
    ),
    tree7: assetRef(
      "trees_tree_7",
      "Red tree 7",
      "glb",
      "public/assests/Tress/GLB/Tree_7.glb"
    ),
    pine2: assetRef(
      "trees_pine_2",
      "Dark red pine 2",
      "glb",
      "public/assests/Tress/GLB/Pine_2.glb"
    ),
    pine5: assetRef(
      "trees_pine_5",
      "Dark red pine 5",
      "glb",
      "public/assests/Tress/GLB/Pine_5.glb"
    )
  })
});

export const MAP_ART_WALLS = Object.freeze([
  artWall("outer_top_left_wall", 168, 66, 210, 18, 0, "base.wall"),
  artWall("outer_top_mid_left_wall", 398, 66, 170, 18, 0, "base.wall"),
  artWall("outer_top_bridge_left", 510, 82, 84, 18, 90, "base.wall"),
  artWall("outer_top_gate", 600, 66, 94, 20, 0, "base.gateLarge"),
  artWall("outer_top_bridge_right", 690, 82, 84, 18, 90, "base.wall"),
  artWall("outer_top_mid_right_wall", 802, 66, 170, 18, 0, "base.wall"),
  artWall("outer_top_right_wall", 1032, 66, 210, 18, 0, "base.wall"),
  artWall("outer_bottom_left_wall", 168, 554, 210, 18, 0, "base.wall"),
  artWall("outer_bottom_mid_left_wall", 398, 554, 170, 18, 0, "base.wall"),
  artWall("outer_bottom_bridge_left", 510, 538, 84, 18, 90, "base.wall"),
  artWall("outer_bottom_gate", 600, 554, 94, 20, 0, "base.gateLarge"),
  artWall("outer_bottom_bridge_right", 690, 538, 84, 18, 90, "base.wall"),
  artWall("outer_bottom_mid_right_wall", 802, 554, 170, 18, 0, "base.wall"),
  artWall("outer_bottom_right_wall", 1032, 554, 210, 18, 0, "base.wall"),

  artWall("player_base_north_wall", 130, 178, 236, 18, 0, "base.wall"),
  artWall("player_base_south_wall", 130, 442, 236, 18, 0, "base.wall"),
  artWall("player_base_west_upper_wall", 44, 240, 18, 118, 0, "base.wall"),
  artWall("player_base_west_lower_wall", 44, 380, 18, 118, 0, "base.wall"),
  artWall("player_base_north_inner_curve", 232, 148, 96, 18, -28, "base.wall"),
  artWall("player_base_south_inner_curve", 232, 472, 96, 18, 28, "base.wall"),
  artWall("player_base_top_gate", 266, 178, 66, 18, 0, "base.gateDoor"),
  artWall("player_base_bottom_gate", 266, 442, 66, 18, 0, "base.gateDoor"),
  artWall("player_core_room_north", 112, 236, 118, 18, 0, "base.wall"),
  artWall("player_core_room_south", 112, 384, 118, 18, 0, "base.wall"),

  artWall("enemy_base_north_wall", 1070, 178, 236, 18, 0, "base.wall"),
  artWall("enemy_base_south_wall", 1070, 442, 236, 18, 0, "base.wall"),
  artWall("enemy_base_east_upper_wall", 1156, 240, 18, 118, 0, "base.wall"),
  artWall("enemy_base_east_lower_wall", 1156, 380, 18, 118, 0, "base.wall"),
  artWall("enemy_base_north_inner_curve", 968, 148, 96, 18, 28, "base.wall"),
  artWall("enemy_base_south_inner_curve", 968, 472, 96, 18, -28, "base.wall"),
  artWall("enemy_base_top_gate", 934, 178, 66, 18, 0, "base.gateDoor"),
  artWall("enemy_base_bottom_gate", 934, 442, 66, 18, 0, "base.gateDoor"),
  artWall("enemy_core_room_north", 1088, 236, 118, 18, 0, "base.wall"),
  artWall("enemy_core_room_south", 1088, 384, 118, 18, 0, "base.wall"),

  artWall("player_upper_route_outer", 286, 116, 150, 18, -22, "base.wall"),
  artWall("player_upper_route_inner", 342, 180, 120, 18, 60, "base.wall"),
  artWall("player_upper_route_return", 292, 242, 125, 18, 8, "base.wall"),
  artWall("player_lower_route_outer", 286, 504, 150, 18, 22, "base.wall"),
  artWall("player_lower_route_inner", 342, 440, 120, 18, -60, "base.wall"),
  artWall("player_lower_route_return", 292, 378, 125, 18, -8, "base.wall"),
  artWall("enemy_upper_route_outer", 914, 116, 150, 18, 22, "base.wall"),
  artWall("enemy_upper_route_inner", 858, 180, 120, 18, -60, "base.wall"),
  artWall("enemy_upper_route_return", 908, 242, 125, 18, -8, "base.wall"),
  artWall("enemy_lower_route_outer", 914, 504, 150, 18, -22, "base.wall"),
  artWall("enemy_lower_route_inner", 858, 440, 120, 18, 60, "base.wall"),
  artWall("enemy_lower_route_return", 908, 378, 125, 18, 8, "base.wall"),

  artWall("i1_north_frame", 405, 166, 110, 16, 0, "base.wall"),
  artWall("i1_west_frame", 338, 218, 94, 16, 70, "base.wall"),
  artWall("i1_south_frame", 408, 278, 100, 16, 0, "base.wall"),
  artWall("i2_north_frame", 795, 166, 110, 16, 0, "base.wall"),
  artWall("i2_east_frame", 862, 218, 94, 16, -70, "base.wall"),
  artWall("i2_south_frame", 792, 278, 100, 16, 0, "base.wall"),
  artWall("i3_north_frame", 408, 342, 100, 16, 0, "base.wall"),
  artWall("i3_west_frame", 338, 402, 94, 16, -70, "base.wall"),
  artWall("i3_south_frame", 405, 454, 110, 16, 0, "base.wall"),
  artWall("i4_north_frame", 792, 342, 100, 16, 0, "base.wall"),
  artWall("i4_east_frame", 862, 402, 94, 16, 70, "base.wall"),
  artWall("i4_south_frame", 795, 454, 110, 16, 0, "base.wall"),

  artWall("center_north_curve_left", 512, 226, 116, 16, -18, "base.wall"),
  artWall("center_north_curve_right", 688, 226, 116, 16, 18, "base.wall"),
  artWall("center_mid_left_pin", 466, 310, 78, 16, 90, "base.wall"),
  artWall("center_mid_right_pin", 734, 310, 78, 16, 90, "base.wall"),
  artWall("center_south_curve_left", 512, 394, 116, 16, 18, "base.wall"),
  artWall("center_south_curve_right", 688, 394, 116, 16, -18, "base.wall"),
  artWall("center_tree_pocket_north_left", 530, 170, 78, 16, 72, "base.wall"),
  artWall("center_tree_pocket_north_right", 670, 170, 78, 16, -72, "base.wall"),
  artWall("center_tree_pocket_south_left", 530, 450, 78, 16, -72, "base.wall"),
  artWall("center_tree_pocket_south_right", 670, 450, 78, 16, 72, "base.wall")
]);

export const MAP_TREE_CLUSTERS = Object.freeze([
  treeCluster("player_upper_outer_grove", "trees.tree4", 170, 104, 6, 44),
  treeCluster("player_upper_route_grove", "trees.tree7", 282, 132, 7, 48),
  treeCluster("player_inner_upper_grove", "trees.pine5", 356, 202, 5, 38),
  treeCluster("player_mid_route_grove", "trees.tree1", 300, 312, 6, 44),
  treeCluster("player_inner_lower_grove", "trees.pine2", 356, 418, 5, 38),
  treeCluster("player_lower_route_grove", "trees.tree4", 282, 488, 7, 48),
  treeCluster("player_lower_outer_grove", "trees.pine5", 170, 516, 6, 44),

  treeCluster("center_northwest_outer_trees", "trees.tree7", 500, 126, 6, 44),
  treeCluster("center_northwest_inner_trees", "trees.tree4", 536, 184, 6, 42),
  treeCluster("center_northeast_inner_trees", "trees.tree1", 664, 184, 6, 42),
  treeCluster("center_northeast_outer_trees", "trees.tree7", 700, 126, 6, 44),
  treeCluster("center_southwest_inner_trees", "trees.pine5", 536, 436, 6, 42),
  treeCluster("center_southwest_outer_trees", "trees.pine2", 500, 494, 6, 44),
  treeCluster("center_southeast_inner_trees", "trees.tree4", 664, 436, 6, 42),
  treeCluster("center_southeast_outer_trees", "trees.pine5", 700, 494, 6, 44),

  treeCluster("enemy_upper_outer_grove", "trees.tree7", 1030, 104, 6, 44),
  treeCluster("enemy_upper_route_grove", "trees.tree4", 918, 132, 7, 48),
  treeCluster("enemy_inner_upper_grove", "trees.pine2", 844, 202, 5, 38),
  treeCluster("enemy_mid_route_grove", "trees.tree1", 900, 312, 6, 44),
  treeCluster("enemy_inner_lower_grove", "trees.pine5", 844, 418, 5, 38),
  treeCluster("enemy_lower_route_grove", "trees.tree7", 918, 488, 7, 48),
  treeCluster("enemy_lower_outer_grove", "trees.pine2", 1030, 516, 6, 44)
]);

export const MAP_PROP_PLACEMENTS = Object.freeze([
  prop("player_core_command_room", "base.roomLarge", 112, 310, 1.12, 0, "base_room_player"),
  prop("player_upper_watch_turret", "base.roomWide", 78, 126, 0.88, 0, "turret_player"),
  prop("player_lower_watch_turret", "base.roomWide", 78, 494, 0.88, 0, "turret_player"),
  prop("player_satellite_array", "sciFi.satelliteDish", 104, 378, 1.1, -16, "player_base"),
  prop("player_supply_crates", "sciFi.crateLarge", 168, 468, 0.9, 8, "player_base"),
  prop("player_blue_ammo_bank", "sciFi.crateLarge", 190, 404, 0.72, 0, "player_base"),
  prop("player_console_bank", "sciFi.shelvesWideTall", 148, 250, 0.85, 90, "player_base"),
  prop("player_health_station", "sciFi.healthPack", 210, 246, 0.8, 10, "player_base"),

  prop("intersection_1_table", "sciFi.deskMedium", 410, 252, 0.78, -12, "intersection_detail"),
  prop("intersection_1_crate", "sciFi.crate", 352, 188, 0.76, 12, "intersection_detail"),
  prop("intersection_1_locker", "sciFi.locker", 450, 190, 0.72, -22, "intersection_detail"),
  prop("intersection_1_chest", "sciFi.chest", 375, 285, 0.68, 8, "intersection_detail"),
  prop("intersection_2_table", "sciFi.deskMedium", 790, 252, 0.78, 12, "intersection_detail"),
  prop("intersection_2_crate", "sciFi.crate", 846, 188, 0.76, -12, "intersection_detail"),
  prop("intersection_2_locker", "sciFi.locker", 750, 190, 0.72, 22, "intersection_detail"),
  prop("intersection_2_chest", "sciFi.chest", 825, 285, 0.68, -8, "intersection_detail"),
  prop("intersection_3_crates", "sciFi.crateLarge", 365, 460, 0.78, 14, "intersection_detail"),
  prop("intersection_3_console", "sciFi.shelvesWideShort", 455, 430, 0.74, -18, "intersection_detail"),
  prop("intersection_3_health", "sciFi.healthPack", 395, 394, 0.7, 16, "intersection_detail"),
  prop("intersection_4_crates", "sciFi.crateLarge", 835, 460, 0.78, -14, "intersection_detail"),
  prop("intersection_4_console", "sciFi.shelvesWideShort", 745, 430, 0.74, 18, "intersection_detail"),
  prop("intersection_4_health", "sciFi.healthPack", 805, 394, 0.7, -16, "intersection_detail"),
  prop("center_top_supply", "sciFi.crate", 600, 190, 0.72, 0, "center_edge_detail"),
  prop("center_bottom_supply", "sciFi.crate", 600, 430, 0.72, 0, "center_edge_detail"),

  prop("enemy_core_command_room", "base.roomLarge", 1088, 310, 1.12, 180, "base_room_enemy"),
  prop("enemy_upper_watch_turret", "base.roomWide", 1122, 126, 0.88, 0, "turret_enemy"),
  prop("enemy_lower_watch_turret", "base.roomWide", 1122, 494, 0.88, 0, "turret_enemy"),
  prop("enemy_console_bank", "sciFi.shelvesWideTall", 1052, 250, 0.85, -90, "enemy_base"),
  prop("enemy_supply_crates", "sciFi.crateLarge", 1032, 468, 0.9, -8, "enemy_base"),
  prop("enemy_red_ammo_bank", "sciFi.crateLarge", 1010, 404, 0.72, 0, "enemy_base"),
  prop("enemy_defense_locker", "sciFi.locker", 1034, 214, 0.82, -8, "enemy_base")
]);

export const MAP_CHARACTER_STAGING = Object.freeze([
  characterStage("enemy_staging_drone", "sciFi.enemyEyeDrone", 1014, 325, "enemy_preview"),
  characterStage("enemy_staging_quad_left", "sciFi.enemyQuadShell", 1054, 292, "enemy_preview"),
  characterStage("enemy_staging_quad_right", "sciFi.enemyQuadShell", 1092, 350, "enemy_preview")
]);

export function getReferencedAssetPaths() {
  return getFlatAssetRefs().map((asset) => asset.path);
}

export function findAssetReference(assetKey) {
  const parts = assetKey.split(".");
  let cursor = MAP_ASSET_LIBRARY;

  for (const part of parts) {
    cursor = cursor?.[part];
  }

  return cursor?.path ? cursor : null;
}

function getFlatAssetRefs() {
  const refs = [];

  function visit(value) {
    if (!value || typeof value !== "object") return;
    if (typeof value.path === "string") {
      refs.push(value);
      return;
    }
    for (const child of Object.values(value)) {
      visit(child);
    }
  }

  visit(MAP_ASSET_LIBRARY);
  return refs;
}

function assetRef(id, name, format, path) {
  return Object.freeze({ id, name, format, path });
}

function artWall(id, x, y, width, height, rotation, assetKey) {
  return Object.freeze({
    id,
    center: Object.freeze({ x, y }),
    width,
    height,
    rotation,
    assetKey
  });
}

function treeCluster(id, assetKey, x, y, count, radius) {
  return Object.freeze({
    id,
    assetKey,
    center: Object.freeze({ x, y }),
    count,
    radius
  });
}

function prop(id, assetKey, x, y, scale, rotation, role) {
  return Object.freeze({
    id,
    assetKey,
    center: Object.freeze({ x, y }),
    scale,
    rotation,
    role
  });
}

function characterStage(id, assetKey, x, y, role) {
  return Object.freeze({
    id,
    assetKey,
    center: Object.freeze({ x, y }),
    role
  });
}
