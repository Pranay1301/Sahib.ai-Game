// Static Metro asset map for runtime GLB previews.
// Base pack entries are intentionally complete so Phase 4 can swap visual
// pieces without revisiting Metro bundling.

export const MODEL_MODULES = Object.freeze({
  base_cables: require("../../public/assests/Base/Models/GLB format/cables.glb"),
  base_corridor: require("../../public/assests/Base/Models/GLB format/corridor.glb"),
  base_corridor_corner: require("../../public/assests/Base/Models/GLB format/corridor-corner.glb"),
  base_corridor_end: require("../../public/assests/Base/Models/GLB format/corridor-end.glb"),
  base_corridor_intersection: require("../../public/assests/Base/Models/GLB format/corridor-intersection.glb"),
  base_corridor_junction: require("../../public/assests/Base/Models/GLB format/corridor-junction.glb"),
  base_corridor_transition: require("../../public/assests/Base/Models/GLB format/corridor-transition.glb"),
  base_corridor_wide: require("../../public/assests/Base/Models/GLB format/corridor-wide.glb"),
  base_corridor_wide_corner: require("../../public/assests/Base/Models/GLB format/corridor-wide-corner.glb"),
  base_corridor_wide_end: require("../../public/assests/Base/Models/GLB format/corridor-wide-end.glb"),
  base_corridor_wide_intersection: require("../../public/assests/Base/Models/GLB format/corridor-wide-intersection.glb"),
  base_corridor_wide_junction: require("../../public/assests/Base/Models/GLB format/corridor-wide-junction.glb"),
  base_gate: require("../../public/assests/Base/Models/GLB format/gate.glb"),
  base_gate_door: require("../../public/assests/Base/Models/GLB format/gate-door.glb"),
  base_gate_door_window: require("../../public/assests/Base/Models/GLB format/gate-door-window.glb"),
  base_gate_lasers: require("../../public/assests/Base/Models/GLB format/gate-lasers.glb"),
  base_room_corner: require("../../public/assests/Base/Models/GLB format/room-corner.glb"),
  base_room_large: require("../../public/assests/Base/Models/GLB format/room-large.glb"),
  base_room_large_variation: require("../../public/assests/Base/Models/GLB format/room-large-variation.glb"),
  base_room_small: require("../../public/assests/Base/Models/GLB format/room-small.glb"),
  base_room_small_variation: require("../../public/assests/Base/Models/GLB format/room-small-variation.glb"),
  base_room_wide: require("../../public/assests/Base/Models/GLB format/room-wide.glb"),
  base_room_wide_variation: require("../../public/assests/Base/Models/GLB format/room-wide-variation.glb"),
  base_stairs: require("../../public/assests/Base/Models/GLB format/stairs.glb"),
  base_stairs_wide: require("../../public/assests/Base/Models/GLB format/stairs-wide.glb"),
  base_template_corner: require("../../public/assests/Base/Models/GLB format/template-corner.glb"),
  base_template_detail: require("../../public/assests/Base/Models/GLB format/template-detail.glb"),
  base_template_floor: require("../../public/assests/Base/Models/GLB format/template-floor.glb"),
  base_template_floor_big: require("../../public/assests/Base/Models/GLB format/template-floor-big.glb"),
  base_template_floor_detail: require("../../public/assests/Base/Models/GLB format/template-floor-detail.glb"),
  base_template_floor_detail_a: require("../../public/assests/Base/Models/GLB format/template-floor-detail-a.glb"),
  base_template_floor_layer: require("../../public/assests/Base/Models/GLB format/template-floor-layer.glb"),
  base_template_floor_layer_hole: require("../../public/assests/Base/Models/GLB format/template-floor-layer-hole.glb"),
  base_template_floor_layer_raised: require("../../public/assests/Base/Models/GLB format/template-floor-layer-raised.glb"),
  base_template_wall: require("../../public/assests/Base/Models/GLB format/template-wall.glb"),
  base_template_wall_corner: require("../../public/assests/Base/Models/GLB format/template-wall-corner.glb"),
  base_template_wall_detail_a: require("../../public/assests/Base/Models/GLB format/template-wall-detail-a.glb"),
  base_template_wall_half: require("../../public/assests/Base/Models/GLB format/template-wall-half.glb"),
  base_template_wall_stairs: require("../../public/assests/Base/Models/GLB format/template-wall-stairs.glb"),
  base_template_wall_top: require("../../public/assests/Base/Models/GLB format/template-wall-top.glb"),
  trees_tree_1: require("../../public/assests/Tress/GLB/Tree_1.glb"),
  trees_tree_4: require("../../public/assests/Tress/GLB/Tree_4.glb"),
  trees_tree_7: require("../../public/assests/Tress/GLB/Tree_7.glb"),
  trees_pine_2: require("../../public/assests/Tress/GLB/Pine_2.glb"),
  trees_pine_5: require("../../public/assests/Tress/GLB/Pine_5.glb")
});

export const MODEL_TEXTURE_MODULES = Object.freeze({
  "Textures/colormap.png": require("../../public/assests/Base/Models/GLB format/Textures/colormap.png"),
  "colormap.png": require("../../public/assests/Base/Models/GLB format/Textures/colormap.png")
});

export const MODEL_PREVIEW_RULES = Object.freeze({
  maxSurfaceModels: 24,
  maxWallModels: 34,
  maxDoorModels: 15,
  maxTreeModels: 44,
  maxPropModels: 8
});
