# Sahib AI V1 Implementation Status

## Phase 1

Implemented the Core quick-round shell as a mobile Expo/React Native scaffold.

Scope included:
- Match timer fixed at 8 minutes.
- Player Core and Enemy Core placeholders.
- Player Core HP: 1000.
- Enemy Core HP: 1000.
- Instant win when Enemy Core reaches 0 HP.
- Instant loss when Player Core reaches 0 HP.
- Timer-end result calculation:
  1. Higher remaining Core HP percentage wins.
  2. If tied, higher total Core damage dealt wins.
  3. If still tied, draw.
- Debug UI showing timer, status, Core HP, and Core damage dealt.
- Debug buttons for start, pause, reset, Core damage, and timer fast-forward.
- Automated tests for Phase 1 match rules.

Out of scope for this phase:
- Hero movement.
- Rifle combat.
- Hero death/respawn.
- Map blockout.
- Intersections and door randomization.
- Enemy behavior logic.
- Wall system.
- Core defense waves.
- Special weapon drops.
- Hearts and rewards.

## Phase 2

Implemented hero movement and rifle combat on top of the Phase 1 mobile shell.

Scope included:
- Hero placeholder with HP 100.
- Touch D-pad movement.
- Replaced D-pad with a medium left-side virtual joystick after mobile device testing showed the button stack was too low.
- Follow-camera placeholder within a larger test arena.
- Sahib AR-7 Tactical Rifle with M416-like fast firing cadence.
- Magazine size: 30 bullets.
- Fire rate: 11 bullets per second.
- Reload time: 1.8 seconds.
- Unlimited reserve ammo.
- Rifle damage to Enemy Core: 5 per bullet when in range.
- Manual reload control.
- Auto reload when the magazine is empty.
- Hero damage debug control.
- Hero downed state detection.
- Automated tests for movement, rifle damage, reload, and downed state.

Out of scope for this phase:
- Hero respawn timer.
- Enemy entities.
- Enemy damage to hero except debug damage.
- Map blockout.
- Intersections and door randomization.
- Wall system.
- Core pressure waves.
- Enemy Core defense waves.
- Hearts and rewards.

## Phase 3

Implemented the hero death and respawn loop.

Scope included:
- Hero death does not end the match.
- Hero enters a downed state at 0 HP.
- Downed hero cannot move, fire, or reload.
- Respawn timer: 5 seconds.
- Hero respawns near the Player Core.
- Hero HP is restored to 100 on respawn.
- Hero deaths are tracked.
- Score penalty hook is tracked for later reward scoring.
- Core state is unchanged by hero death or respawn.
- HUD shows respawn countdown, death count, and score penalty.
- Automated tests for respawn timing, combat lockout while downed, and Core state independence.

Out of scope for this phase:
- Enemy entities.
- Enemy damage to hero except debug damage.
- Map blockout.
- Intersections and door randomization.
- Wall system.
- Core pressure waves.
- Enemy Core defense waves.
- Hearts and rewards.

## Phase 4

Rebuilt the V1 map blockout as a full 3D scene with modular rendering and isometric camera.

### Phase 4 iteration 1 (original)
- Expo GL + Three.js dependency path for the 3D blockout renderer.
- Flat box/cylinder placeholders for map geometry.
- Fixed full-map orthographic camera for blockout validation.

### Phase 4 iteration 2 (3D upgrade)

Scope included:
- Modular `src/three/MapBuilder.js` constructs the full 3D map from `mapLayout.js` data.
- Modular `src/three/CameraController.js` implements fixed isometric follow and full-map modes.
- `ThreeBattlefield.js` rewritten to use `MapBuilder` and `CameraController` instead of inline geometry.
- Player Core remains on the left side.
- Enemy Core remains on the right side.
- Three walkable lanes: top, mid, and bottom.
- Side-route/base-approach placeholders matching the functional blockout image direction.
- Core areas are integrated into the lane layout instead of being isolated circular platforms.
- Both Core areas have top, mid, and bottom access points.
- Four major intersection zones.
- Intersection shapes are rounded-square/soft-diamond with ExtrudeGeometry and chamfered octagon profile.
- Open center fight/drop-zone as elliptical platform.
- Mechanical door slots for all 4 major intersections, 3 per intersection.
- Door slots rendered with dark frames, colored panels, and glowing slit indicators.
- Center perimeter door slots with gold-tinted materials.
- Door slots are placed off walkable exit paths.
- Perimeter blocker walls with metallic cap strips on top.
- Core towers with base platform, tapered tower body, cap antenna, and glowing ring.
- Hero marker with body cylinder, direction cone, and base glow ring.
- Health bars above both Cores.
- Fixed isometric perspective camera follows hero with smooth lerp easing.
- Full-map orthographic mode available via `CameraController` for blockout validation.
- Manual camera zoom and rotation are disabled for V1.
- Atmospheric fog for depth perception.
- Four-light setup: hemisphere, key directional, fill directional, ambient.
- Expo GL pixelStorei compatibility guard prevents unsupported Three.js unpack calls.
- App interruption auto-pauses a running match.
- Hero movement is constrained to walkable map routes.
- Side bypass terrain is blocked by map walkability, not hard gates.
- Virtual joystick uses measured page coordinates, clamped radius, dead zone, and light smoothing.
- All 31 automated tests pass (game logic, map layout, camera, joystick, match state).

### Phase 4 iteration 3 (asset-aware visual blockout)

Scope included:
- Added `src/game/mapArt.js` as the asset-aware visual dressing layer for Phase 4.
- Used `public/assests/@assets.json` selections as the reference set for Base, Sci-Fi Essentials, and Tress assets.
- Kept runtime rendering as lightweight Three.js proxy geometry instead of loading full GLB/glTF models in this phase.
- Stored intended asset ids, paths, and formats on Three.js object `userData` for later GLB/glTF replacement.
- Added white/lilac sci-fi wall segments with orange trim to move the blockout toward `Final Map.png`.
- Added red tree cluster proxies in side pockets and around lane edges while keeping the center drop zone clear.
- Added sci-fi prop proxies for crates, desks, shelves, and satellite/base decoration.
- Added three enemy-base staging silhouettes as visual-only placeholders, not enemy behavior logic.
- Added floor panel line proxies for stronger modular-base readability.
- Added automated tests for map art asset references and center drop-zone clarity.
- All 34 automated tests pass.

### Phase 4 iteration 4 (full-map rectangular camera framing)

Scope included:
- Switched the active Three.js battlefield camera from close hero-follow perspective to fixed full-map orthographic/isometric framing.
- Kept manual zoom and rotation disabled.
- Adjusted full-map camera height/depth and margin so the whole rectangular map reads closer to `Final Map.png`.
- Reduced fog strength for clearer full-map readability.
- Expanded the outer ground plane and warmed it toward the sandy perimeter seen in the final map reference.
- Compact mobile debug/action controls so the battlefield receives more vertical screen space in landscape.
- Updated camera tests for the full-map isometric overview.
- All 34 automated tests pass.

### Phase 4 iteration 5 (final-map-inspired density pass)

Scope included:
- Expanded the asset-aware map art layer using `public/assests/@assets.json` references.
- Added a denser final-map-inspired outer wall frame, base enclosures, side-route pockets, intersection wall frames, and center-edge wall arcs.
- Added base-room and turret proxy geometry for both Core bases.
- Added more red-tree pocket clusters across side routes, center pockets, and outer route edges.
- Added more Sci-Fi prop proxies: lockers, health packs, chests, desks, shelves, and supply crates.
- Kept the center drop zone clear for Phase 5 door/drop work.
- Kept the implementation as mobile-safe Three.js proxy geometry with asset path metadata, not full GLB/glTF runtime loading yet.
- All 34 automated tests pass.

### Phase 4 iteration 6 (real GLB asset preview path)

Scope included:
- Added Expo/Metro asset extension support for `.glb`, `.gltf`, and `.bin` files.
- Added `expo-asset` so bundled 3D assets can resolve to runtime URIs on mobile.
- Added a small static Metro module map for selected Base and red-tree GLB assets.
- Added a texture URL resolver for Base GLB files that reference `Textures/colormap.png`.
- Added an async GLB preview loader that attaches real models to the existing map art groups after the proxy scene renders.
- Kept proxy geometry as the fallback if any model fails to load on device.
- Limited the real-model preview count for mobile performance.
- Sci-Fi Essentials props remain proxy-rendered for now because that pack uses `.gltf` plus external `.bin` and texture dependencies.
- All 34 automated tests pass.
- Expo Android export bundles successfully and includes the selected GLB assets.

### Phase 4 iteration 7 (mobile camera and spacious-route correction)

Scope included:
- Registered the full Base GLB pack in the Metro asset module map.
- Replaced Base GLB texture loads with a mobile-safe placeholder texture path to prevent `Textures/colormap.png` LogBox errors.
- Applied runtime materials to loaded GLB meshes so the game does not depend on web-style texture loading.
- Widened top, mid, and bottom walkable lanes.
- Widened core approach and side route areas for better mobile navigation.
- Widened major intersection functional bounds for wall placement and combat space.
- Moved mechanical door slots outward so wider routes remain open and doors stay off exits.
- Reduced runtime wall/tree visual footprint so corridors do not feel cramped.
- Switched the active camera from full-map top validation view to a lower fixed perspective follow camera closer to Kingshot-style gameplay.
- All 34 automated tests pass.
- Expo Android export bundles successfully and includes the full Base GLB pack plus selected red-tree GLB assets.

### Phase 4 iteration 8 (rectangular asset-backed map view)

Scope included:
- Restored the active camera to centered full-map mode so the battlefield reads as a rectangle instead of shifting behind the hero.
- Kept the full-map camera at a lower isometric angle instead of a flat top-down validation view.
- Added runtime Base GLB overlays for core floors, lane floors, corridor sections, side-route floor sections, major intersection floors, center floor, stairs, and gate doors.
- Added runtime door asset groups for major-intersection and center mechanical doors.
- Kept existing flat/proxy geometry underneath the assets so the map remains visible if a model is still loading.
- Added separate runtime asset budgets for surfaces, doors, walls, trees, and props.
- All 34 automated tests pass.
- Expo Android export bundles successfully and still includes the full Base GLB pack plus selected red-tree GLB assets.

### Phase 4 iteration 9 (full-screen mobile combat controls)

Scope included:
- Converted the landscape match screen to a full-screen battlefield layout.
- Moved the quick-round HUD into an absolute overlay so it no longer consumes map height.
- Removed the bottom debug/control bar from the mobile play screen.
- Kept only the left virtual joystick and a right-side hold Fire button for mobile combat.
- Fire now starts or restarts a match from READY/ENDED states and resumes from PAUSED, so the removed Start button is not required for normal mobile testing.
- Replaced the deprecated `SafeAreaView` wrapper with a normal full-screen `View`.
- All 35 automated tests pass.
- Expo Android export bundles successfully and includes the full Base GLB pack plus selected red-tree GLB assets.

### Phase 4 iteration 10 (image-backed 2.5D map trial)

Scope included:
- Switched the active battlefield view from the Three.js asset map to the generated `map.png` image.
- Rendered the image as a full-screen stretched battlefield so it covers the whole mobile landscape play area with no blank bars.
- Removed visible quick-round HUD text, range prompt text, and result text from the landscape play screen for this trial.
- Kept only the left joystick, right fire control, non-text Core HP bars, and a non-text hero marker.
- Added map-image collision blockers for visual tree beds, wall pockets, and room walls while preserving documented Core access and intersection exits.
- Added automated coverage for image-backed collision blockers.
- All 36 automated tests pass.
- Expo Android export bundles successfully and includes `map.png`.

### Phase 4 final (walkmask collision map)

Scope included:
- Adopted the new final diagonal `map.png` as the active Phase 4 battlefield.
- Generated `src/game/walkmaskGrid.js` from `walkmask.png` using `scripts/generateWalkmaskGrid.mjs`.
- Replaced temporary hand-authored collision blockers with mask-based collision sampling.
- Updated Player Core, Enemy Core, hero spawn/respawn, center zone, 4 major intersections, and door metadata to match the diagonal map.
- Hero movement now checks a small body radius against the walkmask so the center point cannot overlap wall/tree pixels.
- Movement still preserves axis-slide behavior when one direction is blocked.
- Door centers now sit on blocked mask pixels while documented intersection exits remain walkable.
- Kept the legacy Three.js/asset map path as inactive fallback metadata only.
- All 37 automated tests pass.
- Expo Android export bundles successfully and includes `map.png`.

Out of scope for this phase:
- Door opening animation/state.
- Randomized door sequence logic.
- Intersection trigger/cooldown logic.
- Enemy spawning.
- Enemy behavior logic.
- Wall placement sockets.
- Wall collision/destruction.
- Center special weapon drop.
- Hearts and rewards.

## Phase 5

Implemented mechanical door encounter logic for the 4 major intersections on top of the final 2.5D image-backed map.

Scope included:
- Added reusable door encounter state for the 4 major intersections.
- Added trigger detection from the existing intersection centers and trigger radii in `mapLayout.js`.
- Added randomized 3-door sequence generation with Fisher-Yates shuffle.
- Added anti-repeat first-door handling per intersection when possible.
- Added optional seeded randomness for reproducible tests/debug.
- Added fixed 2.5-second gaps between door openings.
- Added 20-second cooldown per intersection.
- Integrated door encounter ticking into the running match loop only.
- Match restart now resets door encounter state.
- Paused/non-running matches do not advance door timers.
- Added non-text door glow overlays on the 2.5D image map.
- Replaced the tiny red door signal with a transparent four-frame mechanical blast-door sprite sheet.
- Added `scripts/generateDoorSpriteSheet.mjs` so the Phase 5 door asset can be regenerated deterministically.
- Added temporary non-behaving enemy placeholder dots near opened doors.
- Added automated tests for trigger, timing, cooldown, randomization, anti-repeat, seeded mode, and paused behavior.
- Added automated coverage for the mechanical door sprite sheet dimensions and transparency.

Out of scope for this phase:
- Center/drop-zone door event.
- Real enemy behavior logic.
- Enemy HP/damage/chasing.
- Time-phase enemy count scaling.
- Core pressure waves.
- Wall placement and wall collision.
- 3D asset/map rebuild work.

## Phase 5B

Extended the reusable mechanical door encounter system to the center fight/drop zone.

Scope included:
- Added the center drop zone as a reusable door encounter zone alongside the 4 major intersections.
- Added center-specific 28-second cooldown.
- Reused the same Fisher-Yates door randomizer, anti-repeat first-door logic, seeded debug support, and 2.5-second door sequence timing.
- Center event triggers when the hero enters the center trigger zone.
- Center doors use the same mechanical door sprite animation and placeholder spawn markers as intersection doors.
- Added automated tests for center trigger, center cooldown, randomized 3-door center sequence, and retrigger after cooldown.

Out of scope for this phase:
- Final hand-marked door placement.
- Closed-door movement collision.
- Special weapon drop pickup.
- Real enemy behavior logic.
- Enemy HP/damage/chasing.

### Phase 5/5B door placement correction

Scope included:
- Replaced the temporary mechanical door coordinates with Uday's final marked 15-door layout.
- Preserved the documented Phase 5 rule: 3 doors per major intersection, 4 major intersections, 12 intersection doors total.
- Preserved the documented Phase 5B rule: 3 center fight/drop-zone doors.
- Adjusted the 4 intersection trigger centers and center trigger zone to align with the final 2.5D map art.
- Kept the existing randomized door sequence, anti-repeat first-door rule, cooldowns, animation timing, and placeholder enemy spawn markers.
- Updated map layout tests so exact marked doorway pixels can be used while still protecting walkable exits and the 3-door-per-zone rule.

Out of scope for this correction:
- Closed-door collision blocking.
- Enemy behavior logic.
- Wall placement/no-placement sockets.

## Phase 6

Implemented the first playable enemy behavior layer and 2D character sprites on top of the Phase 5/5B door encounter system.

Scope included:
- Generated small transparent four-frame sprite sheets from Uday's provided reference images for:
  - Hero commander with rifle.
  - Alien Hunter.
  - Hunter Exosuit Trooper.
  - Heavy Alien Brute.
  - Breaker Bot.
- Added `scripts/generateCharacterSpriteSheets.py` so the Phase 6 character sprite sheets can be regenerated deterministically from the local reference images.
- Added `src/game/enemyBehavior.js` as the V1 enemy behavior module.
- Locked Phase 6 to exactly the 4 documented V1 enemy types.
- Added starting V1 stats for HP, damage, movement speed, attack range, attack cooldown, collision radius, and render size.
- Replaced temporary door placeholder dots with typed enemy spawns.
- Door spawns now select enemy mixes based on documented roles:
  - Alien Hunter for hero pressure.
  - Heavy Brute for heavy hero pressure.
  - Breaker Bot as the wall-breaker/hero-pressure placeholder.
  - Hunter Exosuit as the Core-pressure unit.
- Enemies spawn near opened doors and are nudged onto walkable mask positions.
- Enemies move with simple walkmask-aware steering and axis-slide fallback.
- Alien Hunter, Heavy Brute, and Breaker Bot target the hero for V1 Phase 6 combat.
- Hunter Exosuit targets the Player Core instead of chasing the hero.
- Enemies use cooldown-based attacks against the hero or Player Core.
- Hero rifle shots now damage nearby enemies first, then only unused shots can damage the Enemy Core.
- Enemy HP bars render above enemy sprites.
- Hero marker now renders as a small animated commander sprite instead of a simple circle.
- Door encounter state persists spawned enemies instead of removing them as temporary markers.
- Added automated tests for enemy roster lock, door spawn typing, role selection, hero damage, Player Core pressure, rifle damage, and sprite-sheet dimensions/transparency.
- All 56 automated tests pass.
- Expo Android export bundles successfully and includes all Phase 6 sprite sheets.

Out of scope for this phase:
- Time-phase enemy count scaling.
- Advanced enemy pathfinding.
- Wall targeting against real player-placed walls.
- Enemy Core defense waves.
- Special weapon drops.
- Rewards/hearts economy.

### Phase 6 animation and weapon presentation upgrade

Scope included:
- Adopted Uday's 10 provided sprite sheets:
  - Hero walk.
  - Hero shoot.
  - Alien Hunter walk.
  - Alien Hunter attack.
  - Hunter Exosuit walk.
  - Hunter Exosuit attack.
  - Heavy Brute walk.
  - Heavy Brute attack.
  - Breaker Bot walk.
  - Breaker Bot attack.
- Added `scripts/normalizePhase6SpriteSheets.py` to convert the raw generated images into mobile-safe transparent runtime sheets.
- Preserved the raw generated images and wrote normalized runtime sheets under `assets/phase6/runtime/`.
- Normalized walk sheets to 8 directions x 6 frames at 128px cells.
- Normalized attack/shoot sheets to 8 directions x 4 frames at 128px cells.
- Added `src/game/characterAnimation.js` for direction-row mapping, walk frame timing, and one-shot attack frame timing.
- Updated the hero to track facing direction, movement animation time, and rifle attack animation time.
- Updated enemies to track facing direction and attack animation time.
- Updated the 2.5D renderer to use real directional walk and shooting animations instead of single-row placeholder sprites.
- Updated enemy attack ranges to short/medium gun ranges while preserving the current V1 damage values.
- Updated docs so all 4 V1 enemy types now use guns/ranged combat presentation:
  - Alien Hunter uses an organic alien gun or bio-rifle.
  - Hunter Exosuit uses a powered exosuit rifle/burst weapon.
  - Heavy Brute uses a heavy alien cannon/brute rifle.
  - Breaker Bot uses an integrated mechanical breaker gun/tool cannon.
- Added automated tests for the runtime sprite-sheet grid sizes, transparency, and 8-direction row mapping.
- All 58 automated tests pass.
- Expo Android export bundles successfully and includes all 10 Phase 6 runtime sprite sheets.

### Phase 6 mobile playability correction

Scope included:
- Regenerated the Phase 6 runtime sprite sheets with padded transparent cells to reduce neighboring-frame bleed during React Native image cropping.
- Kept the original raw generated character sheets untouched.
- Reduced the hero move speed from 190 to 118 world units per second.
- Reduced enemy movement speeds so travel feels larger and less frantic on the image-backed map.
- Reduced rendered hero/enemy sprite sizes for better 2.5D map readability.
- Added `src/game/imageCamera.js` for a fixed zoomed image-map camera that follows the hero and clamps to map bounds.
- Switched the 2.5D battlefield from full-map view to a zoomed hero-follow viewport.
- Added joystick touch identity tracking so a second touch on the Fire button does not redirect the movement joystick.
- Added automated coverage for the image-backed hero-follow camera.
- All 59 automated tests pass.
- Expo Android export bundles successfully with the updated runtime sprite sheets.

### Phase 6 joystick and hero readability correction

Scope included:
- Increased only the hero render size so the player character is easier to read against the zoomed 2.5D map.
- Added a joystick control-zone guard so touch events far outside the left joystick cannot update movement.
- Changed joystick responder claiming so movement is driven by touches that start on the joystick instead of stray move gestures.
- Added automated coverage for accepting joystick-zone touches and rejecting fire-side touches.

## Phase 7

Implemented time-pressure phases and Phase 7 enemy count scaling for door encounters.

Scope included:
- Added `src/game/timePressure.js` for documented match phase calculation:
  - Opening/contact: 0:00-0:45.
  - Early fight: 0:45-2:00.
  - Mid fight: 2:00-5:30.
  - Final chaos: 5:30-8:00.
- Added the baseline 3-door enemy count table:
  - Opening/contact: 1,1,2 = 4 total.
  - Early fight: 2,2,2 = 6 total.
  - Mid fight: 3,3,3 = 9 total.
  - Final chaos: 4,4,4 = 12 total.
- Added the optional intense count table behind an explicit option for later debug/tuning.
- Door encounters now capture the current pressure phase when the sequence starts and use that phase's count table for all three doors in that sequence.
- Door spawn logic now supports variable per-door counts while preserving the same door/role-based enemy type pattern.
- Enemy stats, enemy roles, door locations, and the number of doors remain unchanged by time.
- Door signal metadata records phase id, sequence index, and spawn count for debug inspection without adding visible mobile text to the play screen.
- The React Native match loop now passes elapsed match time into door encounter ticking.
- Added automated tests for phase breakpoints, baseline/intense count tables, final-chaos 12-enemy sequences, and variable-count door spawns.
- All 69 automated tests pass.

Out of scope for this phase:
- Core pressure waves.
- Enemy Core defense waves.
- Wall system.
- Special weapon drops.
- Hearts and rewards.

### Walkmask alignment and movement correction

Scope included:
- Updated `scripts/generateWalkmaskGrid.mjs` so it can read Uday's provided `walkmask.png` source without editing the image file, even when the source mask canvas differs from `map.png`.
- The generated runtime grid is sampled onto the active `map.png` canvas so gameplay/world coordinates stay aligned while the source mask remains untouched.
- Changed walkmask grid generation from single-center-pixel sampling to majority sampling per cell, reducing wall-highlight noise from detailed masks.
- Updated image camera scaling so the active map preserves its original image aspect ratio on every device viewport.
- Moved hero start/respawn to an actually walkable floor position beside the Player Core.
- Added a separate walkable Player Core attack target so Core-pressure enemies target reachable floor instead of the blocked Core statue art.
- Realigned several intersection exit metadata points to the nearest body-walkable floor centers on the normalized mask.
- Added movement collision substeps so large ticks cannot tunnel across blocked mask strips and sliding feels smoother near route edges.
- Added automated coverage that generated `WORLD_BOUNDS` stays locked to the active `map.png` canvas size.
- All 70 automated tests pass.

## Phase 8

Implemented time-based Core pressure waves separate from local intersection fights.

Scope included:
- Added `src/game/corePressure.js` as a dedicated Core-pressure scheduler.
- Core pressure is blocked during opening/contact and starts only at or after 0:45.
- Waves spawn Hunter Exosuit Troopers only, preserving the locked V1 enemy roster.
- Waves spawn from enemy-side top, mid, and bottom lane access points, then use simple static lane waypoints plus existing enemy behavior logic to move toward the Player Core attack position.
- Wave count and frequency scale by match phase:
  - Early fight: 1 Hunter Exosuit every 35 seconds.
  - Mid fight: 2 Hunter Exosuits every 28 seconds.
  - Final chaos: 3 Hunter Exosuits every 20 seconds.
- Enemy stats do not scale with time.
- Core-pressure enemies are appended to the existing spawned enemy list so current rifle damage, enemy movement, sprite rendering, and Player Core damage systems keep working.
- Match restart resets Core-pressure state alongside hero and door encounter state.
- Local door/intersection triggers remain location-based and are not automatically fired by the Core-pressure scheduler.
- Added automated tests for opening-contact lockout, wave timing, phase counts, stat stability, spawn point walkability, static route movement, lane cycling, and paused behavior.
- All 78 automated tests pass.

Out of scope for this phase:
- Enemy Core HP-threshold defense waves.
- Wall placement/wall targeting.
- Special weapon drops.
- Hearts and rewards.

### Core combat correction after Phase 8

Scope included:
- Removed the runtime nearest-enemy rifle auto-aim/damage path.
- Hero rifle fire now creates travelling projectile objects instead of applying instant target damage.
- Right-side Fire control now also acts as an aim pad: dragging on the Fire button sets the hero's shot direction while holding fire.
- Rifle projectiles damage enemies only when the projectile path intersects the enemy collision body.
- Rifle projectiles can miss if the aim line does not intersect an enemy or the Enemy Core.
- Rifle projectiles are blocked by non-walkable walkmask pixels, so shots do not pass through map walls.
- Projectile travel is rendered as a short yellow bullet streak on the 2.5D battlefield.
- Enemy attacks now require a clear walkmask line to the final target instead of shooting through blocked terrain.
- Hero-pressure enemies now use a lightweight coarse-grid route helper when a direct chase line is blocked, allowing them to move around map obstacles and continue chasing.
- Core-pressure authored lane routes remain intact and continue to use their static waypoint logic.
- Added automated coverage for projectile hits, misses, wall blocking, and enemy rerouting around blocked walkmask paths.
- All 81 automated tests pass.

Out of scope for this correction:
- Player-built wall collision, because Phase 9 wall entities do not exist yet.
- Advanced flanking, cover seeking, or behavior-director logic.
- Recoil/spread tuning beyond aim-direction projectile checks.

## Phase 9

Implemented the first V1 wall system layer using the converted wall PDF notes and the supplied wall reference image. This initial socket-based placement flow is retained here as history and is superseded by the controlled free-placement correction below.

Scope included:
- Converted `wall.pdf` into `docs/WALL_PDF_NOTES.md` for the local Phase 9 implementation reference.
- Added deterministic transparent Phase 9 runtime sprite sheets for:
  - Block Wall.
  - Turn Wall.
  - Sand Trap.
- Added `scripts/generateWallSpriteSheets.mjs` so wall frames can be regenerated without editing Uday's supplied reference image.
- Added `src/game/wallSystem.js` for wall tool data, initial sockets, charges, HP, collision geometry, placement validation, damage, and sand slow zones.
- Implemented the initial socket/grid placement flow with green/red placement preview markers.
- Added no-placement validation around hero, enemies, Cores, doors, occupied sockets, overlapping walls, and overlapping sand traps.
- Added 3 shared wall/tool charges and 1 charge refill every 10 seconds.
- Added Block Wall with 180 HP as a straight movement/bullet blocker.
- Added Turn Wall with 150 HP as an L-shaped physical blocker.
- Added Sand Trap as a 5-second non-blocking slow zone with 45% slow.
- Integrated wall collision into hero movement so the hero cannot walk through placed walls.
- Integrated wall collision into projectile travel so rifle bullets stop at placed walls and damage them.
- Integrated wall collision into enemy behavior logic so enemies attack walls when the wall blocks their target line.
- Breaker Bot and Heavy Brute now use their documented wall-damage hierarchy against placed walls.
- Sand Trap slows enemies without blocking movement or bullets.
- Added compact mobile wall tool buttons beside the Fire control and initial tap-to-socket placement in the active 2.5D battlefield.
- Added wall, sand trap, HP, and placement-preview rendering to `ImageBattlefield.js`.
- Added automated tests for tool values, placement, socket preview validity, charges/refill, generated asset dimensions, wall blocking, wall damage/destruction, sand trap slow, projectile wall blocking, hero wall collision, and enemy wall damage behavior.
- All 93 automated tests pass.

Out of scope for this initial pass:
- Controlled free placement, added in the correction below.
- Advanced dynamic pathfinding or perfect enemy rerouting around player-built walls.
- Complex maze prevention beyond V1 no-placement restrictions.
- Final polished wall art beyond the current transparent 2D frames.

### Phase 9 placement UX correction

Scope included:
- Superseded by the controlled free-placement correction below.
- Changed the image battlefield camera zoom from `1.65` to `2.0`.
- Reduced the Block Wall, Turn Wall, and Sand Trap footprint slightly so placed utilities feel less bulky on narrow lanes.
- Replaced circular placement markers with actual wall/trap ghost previews using the Phase 9 wall sprites.
- The intermediate UX still used nearby sockets around the hero before the controlled free-placement correction.
- The intermediate V1 socket/grid placement rule was replaced by the live touch/drag/release placement flow below.
- Added test coverage for the updated zoom value, smaller tool footprint, and nearby-preview radius.
- All 93 automated tests pass.

### Phase 9 controlled free-placement correction

Scope included:
- Updated the Phase 9 wall rule from fixed socket placement to controlled Fortnite-style free placement.
- The live mobile flow is now:
  - Select B or S.
  - Touch/drag on the battlefield to show a wall/trap ghost preview at that world position.
  - Release to place if the preview is valid.
- Placement is not map-wide. It is limited to 210 world units from the hero.
- Free placement still rejects:
  - blocked/non-walkable placement centers
  - placement too close to hero
  - placement too close to enemies
  - placement too close to Player Core or Enemy Core
  - placement too close to doors
  - overlapping walls
  - overlapping sand traps
- Wall rotation is derived from the hero-to-placement direction so cover naturally faces the placement action.
- Removed socket preview rendering from the active battlefield.
- Kept the old socket helper available for tests/internal setup, but the live touch path uses free placement.
- Updated wall-system tests from socket placement expectations to free-placement expectations.
- Updated `AGENTS.md`, `docs/WALL_SYSTEM.md`, `docs/PHASE_PLAN.md`, and handoff docs so future work does not revert Phase 9 to sockets.
- All 93 automated tests pass.

### Phase 9 tuning update

Scope included:
- Changed the active image battlefield camera zoom from `2.0` to `2.4`.
- Reduced the hero collision radius from `10` to `8`.
- Reduced enemy collision radii:
  - Alien Hunter: `8` to `7`.
  - Hunter Exosuit: `9` to `8`.
  - Heavy Brute: `11` to `9`.
  - Breaker Bot: `9` to `8`.
- Removed Turn Wall from the active V1 quick-round tool set.
- Kept active wall controls to Block Wall and Sand Trap at this point in the phase history.
- Reduced Block Wall footprint to `62 x 34`, with collision segment `62` length and `16` thickness.
- Reduced Sand Trap footprint to `64 x 52`, with effect radius `32`.

### Camera, Rifle, And Door Readability Tuning

Scope included:
- Changed the active image battlefield camera zoom from `2.4` to `4.0`.
- Kept the default rifle at a 30-round magazine, but tuned it to an M416-like fast cadence with `11` bullets/sec and `1.8` second reload.
- Increased rifle projectile speed from `720` to `900` so the faster firing rhythm feels more immediate.
- Reduced mechanical door signal rendering scale so doors stay readable but smaller at the tighter camera zoom.

### Zoom 4 Movement Tuning

Scope included:
- Reduced hero movement speed from `118` to `90` world units/sec so movement feels controlled at camera zoom `4.0`.
- Reduced enemy movement speeds for the tighter camera view:
  - Alien Hunter: `64` to `48`.
  - Hunter Exosuit: `48` to `36`.
  - Heavy Brute: `34` to `26`.
  - Breaker Bot: `42` to `32`.
- Kept collision radii, attack ranges, damage, pathing, wall reactions, and spawn logic unchanged.

### Phase 9 tactical wall simplification update

Scope included:
- Removed Sand Trap from the active V1 quick-round tool set.
- Block Wall is now the only active wall/tool button beside Fire.
- Removed slow-zone state from `src/game/wallSystem.js`.
- Removed Sand Trap rendering and placement previews from `src/ui/ImageBattlefield.js`.
- Removed Sand Trap speed-multiplier handling from enemy behavior logic.
- Kept the shared 3-charge and 10-second refill rules for Block Wall.
- Kept destructible wall collision for hero movement, enemy movement, projectile blocking, wall damage, and enemy wall attacks.
- Added/updated automated tests so Phase 9 now expects Block Wall as the only active tactical wall system.

### Main base kingdom map handoff update

Scope included:
- Clarified that Pranay is building the main base kingdom map, not continuing the quick-round mini game.
- Marked the quick-round mini game as a protected playable module.
- Listed protected quick-round files, assets, and tests that should not be deleted, renamed, moved, or rewritten for main map work.
- Added safe main map file areas such as `src/screens/MainBaseMapScreen.js`, `src/ui/base/`, `src/ui/kingdom/`, `src/game/progression/`, `src/game/rewards/`, `src/game/baseMap/`, `assets/base/`, and `assets/kingdom/`.
- Documented that any `App.js` change for main map routing must be a small behavior-preserving shell/refactor, keeping quick-round state separate from base map state.

## Phase 10

Implemented Enemy Core defense on top of the current 2.5D image-backed quick-round loop.

Scope included:
- Added `src/game/coreDefense.js` as a dedicated Enemy Core defense module, separate from time-based Core pressure.
- Added Enemy Core attack origin metadata and two Enemy Core defense side-door spawn points in `src/game/mapLayout.js`.
- Enemy Core lightly damages the hero at 5 damage/second while the hero is in range.
- Player-built Block Walls can stop the Enemy Core light attack line.
- Added HP-threshold defense triggers at 75%, 50%, and 25% Enemy Core HP.
- Each threshold fires only once per match.
- Defense wave intensity is selected from the current match pressure phase.
- Defense enemies spawn from the two Enemy Core defense doors and are appended into the existing enemy behavior list.
- Defense waves use only the locked V1 enemy roster.
- The Enemy Core remains attackable at all times; no shields, invincibility, hard gates, or forced clearing were added.
- Added temporary mechanical door glow signals for triggered Enemy Core defense doors.
- Match restart resets Enemy Core defense state.
- Added automated tests for defense doors, one-shot threshold triggers, phase-based intensity, Core attack range, and wall-blocked Core attack.

Out of scope for this phase:
- Timed special weapon pickup.
- Hearts, rewards, and result flow.
- Final animation/sound polish for the Enemy Core attack.

## Phase 11

Implemented the timed Energy Burst Rifle pickup.

Scope included:
- Added `src/game/specialWeapons.js` as the dedicated timed pickup/drop module.
- Added Energy Burst Rifle data to `src/game/heroCombat.js`.
- Drop times are 2:30 and 5:30.
- Drop locations are walkable center/intersection-adjacent points, not beside Player Core or Enemy Core.
- Pickups auto-collect when the hero moves into pickup range.
- Uncollected pickups expire after 30 seconds.
- Collecting the pickup temporarily equips the Energy Burst Rifle.
- Energy Burst Rifle has 12 shots, no reload, 35 damage to enemies, and 12 damage to Enemy Core.
- The default Sahib AR-7 rifle magazine is not consumed while the special weapon is active.
- When Energy Burst ammo reaches 0, the hero automatically returns to the default rifle.
- Hero death/respawn clears the special weapon and returns to the default rifle.
- Added a compact non-text pickup marker to the 2.5D battlefield.
- Match restart resets special weapon drop state.
- Added automated tests for drop timing, walkable placement, pickup collection, pickup expiry, stronger projectile data, ammo limit, and return to the default rifle.

Out of scope for this phase:
- Final pickup art/sound effects.
- Reward/economy integration.
- Multiple special weapons or a weapon inventory.

## Phase 12

Implemented local hearts, rewards, and result output for the quick-round loop.

Scope included:
- Added `src/game/hearts.js` for full-reward heart state.
- Free heart tuning is 4 hearts.
- Starting a full-reward quick round consumes 1 heart.
- When hearts reach 0, a 30-minute refill timer starts.
- After 30 minutes, all 4 hearts refill together.
- Added an unlimited full-reward flag path for future subscription/pro testing without adding subscription UI.
- If no hearts are available, the local access mode can still be `no_full_reward`, but the resulting `baseCoins` are 0.
- Added `matchId` to match state.
- Added `enemiesKilled` tracking to match state for future analytics, but it is no longer part of the V1 reward contract.
- Projectile kills still report `enemyKills` for match state tracking.
- Added `src/game/quickRoundResult.js` for the formal local `BattleResult` object.
- Latest reward integration correction changed `BattleResult` to a flat coins-only object with `battleResultId`, `userId`, `outcome`, `reason`, `baseCoins`, `completedAt`, `elapsedSeconds`, `durationSeconds`, `coreMaxHp`, `playerCoreHp`, `enemyCoreHp`, `playerCoreDamageDealt`, and `enemyCoreDamageDealt`.
- Quick round does not mutate Supabase or directly add coins to a user account.
- Quick round no longer outputs gems, resources, English XP, progression XP, nested reward objects, quick-round Pro multipliers, or percentage reward multipliers.
- Fixed base coin output is:
  - Win: 100
  - Draw: 50
  - Loss: 25
- Added a compact in-app result overlay showing outcome, base coins, and hearts.
- Match restart clears the previous result and consumes/assigns the next reward mode.
- Added automated tests for hearts, refill, no-full-reward mode, flat BattleResult shape, fixed base coins, and zero-coin mode.

Out of scope for this phase:
- Supabase persistence.
- Duplicate claim blocking in a backend table.
- Applying Pro 3x to the user account.
- Main base/result screen routing.

## Phase 13

Implemented a lightweight visual readability pass without rebuilding the map or replacing final assets.

Scope included:
- Added `src/game/visualReadability.js` for reusable combat readability accent colors.
- Added distinct readability accents for all four locked V1 enemy types.
- Added a stronger hero readability halo behind the hero sprite.
- Added enemy readability halos behind enemy sprites so silhouettes stand out better against the pink/purple map.
- Reused the pickup accent for the Energy Burst Rifle marker.
- Kept all existing 2.5D map art, walkmask collision, sprite sheets, and gameplay logic intact.
- Added automated tests to protect enemy/hero/pickup readability accent coverage.

Out of scope for this phase:
- Final polished character art replacement.
- Final pickup/door/core VFX.
- Rebuilding the map or returning to active Three.js runtime.

## Phase 14

Added V1 loop readiness coverage and completed the current phase set through testing.

Scope included:
- Added integration-level V1 quick-round loop tests in `tests/v1QuickRoundLoop.test.mjs`.
- Covered a full win-result flow:
  - heart consumption
  - Enemy Core destruction
  - ended match state
  - flat local `BattleResult`
  - fixed base coin output
- Covered timer-end draw result flow and fixed draw coins.
- Covered no-heart zero-coin behavior and all-hearts-together refill behavior.
- Re-ran the full automated test suite and Android export after completing Phase 10-14.

Tuning notes:
- No numeric tuning was changed in Phase 14.
- Current values should be tuned only after physical-device playtesting.

Remaining future work:
- Supabase/base economy claim persistence.
- Main/base kingdom map routing and result consumption.
- Final character sprite replacement when Uday provides final assets.
- Physical Android/iOS playtest tuning for enemy counts, wall HP, Core defense, pickup value, and reward amounts.

## Phase 6 GLB Asset Optimization Pipeline

Set up a repeatable optimization path for Meshy GLB character exports.

Scope included:
- Added `@gltf-transform/cli` as a dev dependency.
- Added `scripts/phase6GlbManifest.mjs` to define the five locked Phase 6 character GLB sources and optimized output names.
- Added `scripts/optimizePhase6Glbs.mjs`.
- Added `scripts/inspectPhase6Glbs.mjs`.
- Added `src/assets/characterModelModules.js` to register the optimized GLBs with Metro.
- Added `src/game/characterModels.js` to map the hero and four locked enemy types to the available Meshy animation clips.
- Added `src/game/characterModelRuntime.js` for pure action/position/yaw mapping between gameplay state and GLB character rendering.
- Added `src/ui/CharacterModelOverlay.js`, a transparent `expo-gl` layer that draws animated GLB characters above the existing 2.5D image map.
- Added npm scripts:
  - `npm run optimize:phase6-glb`
  - `npm run inspect:phase6-glb`
- Optimized the Meshy merged-animation GLBs into `assets/phase6/glb/` while leaving Uday's original Meshy export folders untouched.
- Optimization intentionally avoids Meshopt/Draco compression because the current Expo/React Native Three.js runtime does not wire those decoders yet.
- Optimization now bakes the Meshy texture colors into GLB vertex colors after compression because Expo/React Native Three.js cannot safely load embedded GLB texture payloads or external character texture PNGs on Android.
- The optimized GLBs keep natural character color variation through `COLOR_0` vertex color attributes, not runtime image textures.
- Optimized outputs preserve the expected Meshy animation clips:
  - `Dead`
  - `Idle_02`
  - `Running`
  - `Walk_Forward_While_Shooting`
  - `Walking`
- Optimized outputs do not require decoder-only GLTF extensions and must report `textures=0`, `images=0`, `embeddedImages=0`, and `colorAttributes=1` in `npm run inspect:phase6-glb`.
- `ImageBattlefield.js` now keeps `map.png` as the active image-backed map and overlays GLB hero/enemy characters at the same camera/world positions.
- Sprite character frames are no longer rendered by `ImageBattlefield.js`; the active quick-round character path is the GLB overlay only.
- Added `tests/characterModels.test.mjs` to verify GLB existence, animation clips, no required GLB extensions, no runtime textures/images, baked vertex colors, and size limits.

Current optimized GLB files:
- `assets/phase6/glb/hero.glb`
- `assets/phase6/glb/alien_hunter.glb`
- `assets/phase6/glb/hunter_exosuit.glb`
- `assets/phase6/glb/heavy_brute.glb`
- `assets/phase6/glb/breaker_bot.glb`

Current vertex-color-baked size results:
- Hero: 8.18 MB -> 2.34 MB.
- Alien Hunter: 10.07 MB -> 2.47 MB.
- Hunter Exosuit: 28.13 MB -> 2.57 MB.
- Heavy Brute: 30.86 MB -> 2.67 MB.
- Breaker Bot: 24.49 MB -> 2.64 MB.

Important runtime note:
- The active map remains the 2.5D image-backed runtime. Character rendering now uses the active GLB overlay path without showing the old 2D sprite-frame fallback.
- `CharacterModelOverlay.js` renders baked vertex colors with `MeshBasicMaterial`, so character rendering does not trigger any GLB texture loading path.
- Current GLB character render sizes are tuned for the zoomed image map: hero target height `46`, enemy target height `max(30, renderSize * 0.88)`.
- The old under-character readability halos are disabled in the active battlefield so the GLB models sit directly on the map without visible circle markers.

## Character Collision And Enemy Damage Tuning

Scope included:
- Added a lightweight post-move separation pass in `src/game/enemyBehavior.js`.
- Enemies are pushed apart from each other and from the hero if their collision bodies overlap.
- Separation still respects the walkmask and active Block Walls.
- Reduced enemy attack damage for softer physical-device playtesting:
  - Alien Hunter damage `6 -> 4`, wall damage `10 -> 7`.
  - Hunter Exosuit damage `8 -> 5`, wall damage `18 -> 12`.
  - Heavy Brute damage `20 -> 12`, wall damage `36 -> 24`.
  - Breaker Bot damage `12 -> 8`, wall damage `40 -> 28`.
- Breaker Bot still damages walls faster than Heavy Brute.
