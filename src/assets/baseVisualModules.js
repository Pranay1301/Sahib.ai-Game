// Static Metro image map for the base-building visual references.
// Product logic remains in the MD-backed base modules; these files provide
// runtime art references from the sibling images folder.

export const BASE_VISUAL_IMAGE_MODULES = Object.freeze({
  baseLayoutReference: require("../../assets/base/reference/base_layout_reference.png"),
  buildingSlotMap: require("../../assets/base/reference/building_slot_map.png"),
  buildingLevelExamples: require("../../assets/base/reference/building_level_examples.png"),
  emptyLandBackground: require("../../assets/base/reference/empty_land.jpg")
});
