# Sahib AI Asset Selection

## Purpose

This folder keeps only the model format selected for Sahib AI runtime/source use from each imported asset pack. Preview images, licenses, and required textures are preserved.

## Selected Formats

| Pack | Kept format | Reason |
|---|---|---|
| `Base` | `Models/GLB format` | GLB is preferred for Three.js and mobile runtime use. |
| `Sci-Fi Essentials Kit[Standard]` | `glTF` | No GLB version was provided; glTF is the best Three.js-native available format. |
| `Tress` | `GLB` | FBX tree sources were converted to GLB for Three.js/mobile use. |

## Tree Pack Scope

Only red/pink tree usage is intended for Sahib AI.

Kept tree models:
- `GLB/Tree_*.glb`
- `GLB/Pine_*.glb`

The converted tree GLB materials were tinted directly:
- Bark material: brown.
- Tree leaf material: red.
- Pine leaf material: dark red.

Kept tree textures:
- `Tree_Bark.jpg`
- `Color Variations/Leaves_Red.png`
- `Color Variations/Leaves_DarkRed.png`
- `Color Variations/Leaves_Pink.png`
- `Color Variations/Pine_Leaves_Red.png`

Removed tree sources:
- Birch models.
- Dead tree models.
- Blend source files.
- OBJ copies.
- FBX source files after successful GLB conversion.
- Non-red/yellow/green/blue/cyan/purple leaf texture variants.

## Runtime Notes

- Prefer loading GLB assets directly.
- Tree assets are already converted to GLB.
- Keep the Sci-Fi Essentials glTF pack as glTF until specific props are selected; converting every prop to standalone GLB duplicates shared textures and creates oversized files.
- Do not add additional model formats for the same pack unless there is a specific conversion or debugging reason.
