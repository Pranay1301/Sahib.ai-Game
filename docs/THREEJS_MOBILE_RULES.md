# Three.js Mobile Rules

## Purpose

Sahib AI uses Three.js for a mobile Expo/React Native game. External Three.js skills and downloaded examples are reference material only. They must be adapted to the Sahib AI mobile runtime and V1 scope.

## Authority Order

When working on Sahib AI, follow this order:

1. `AGENTS.md`
2. `docs/PHASE_PLAN.md`
3. The relevant Sahib AI phase docs
4. `docs/MAP_BLOCKOUT_SPEC.md` for map geometry
5. This mobile Three.js rules file
6. External Three.js skill/reference files

If an external Three.js skill conflicts with the Sahib AI docs, the Sahib AI docs win.

## Runtime Rules

- Runtime is Expo/React Native plus `expo-gl` and Three.js.
- UI must be React Native, not browser DOM/HTML/CSS.
- Do not use `document.body`, DOM event listeners, or browser UI patterns in game code.
- Do not assume browser-only asset paths.
- Prefer `.glb` for runtime 3D assets.
- Keep mobile performance first: low-poly models, limited lights, limited draw calls, small textures.

## Controls

- Player movement is mobile joystick/touch only.
- Combat and tools are touch controls only.
- Do not add WASD, keyboard controls, mouse aim, pointer lock, or desktop-only controls.
- Do not add `OrbitControls`, manual zoom, or manual camera rotation in V1.
- Debug-only desktop controls require explicit approval and must not replace mobile controls.

## Camera

- V1 camera is fixed landscape isometric.
- No manual zoom or rotation in V1.
- Any Three.js camera pattern from external skills must be adapted to this fixed mobile camera rule.

## Map Visual Reference

- Use `Final Map.png` as the current visual target for 3D map art and asset placement.
- Use `docs/MAP_BLOCKOUT_SPEC.md` and `docs/MAP_LAYOUT.md` as the coding source of truth for playable geometry, routes, intersections, doors, and collision.
- If the image and docs conflict, preserve gameplay correctness from the docs and adapt the visual art around it.

## Allowed Use Of External Three.js Skills

Use external skills for:

- Scene organization.
- Three.js coordinate and transform patterns.
- Lighting and material references.
- GLB/GLTF loading references.
- Animation mixer references.
- Object pooling and performance ideas.
- Asset calibration and scale checks.

Do not use external skills for:

- Desktop gameplay mechanics.
- Browser DOM UI.
- WASD/mouse controls.
- Orbit camera controls.
- Dash/grenade/sudden-death mechanics.
- Heavy postprocessing before the playable loop is stable.
- Any V1 out-of-scope feature listed in `AGENTS.md`.
