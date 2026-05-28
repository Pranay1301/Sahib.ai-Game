# Sahib AI V1 New Chat Handoff

Use this file when continuing Sahib AI in a new Codex chat. It is a compact handoff of the decisions and work completed so far. The detailed phase history remains in `docs/IMPLEMENTATION_STATUS.md`.

## Required Read Order

Before coding, read:
1. `AGENTS.md`
2. `docs/PHASE_PLAN.md`
3. `docs/IMPLEMENTATION_STATUS.md`
4. This file
5. `docs/MAIN_MAP_TEAM_HANDOFF.md` if the next work involves main/base map integration or another teammate using Codex
6. The phase-specific docs needed for the requested work:
   - Gameplay loop: `docs/QUICK_ROUNDS.md`
   - Map/collision/doors: `docs/MAP_LAYOUT.md`, `docs/MAP_BLOCKOUT_SPEC.md`
   - Hero/combat: `docs/HERO_COMBAT.md`
   - Enemies: `docs/ENEMY_LOGIC.md`
   - Walls: `docs/WALL_SYSTEM.md`
   - Core defense: `docs/CORE_DEFENSE.md`
   - Visuals: `docs/VISUAL_IDENTITY.md`
   - Three.js/mobile constraints: `docs/THREEJS_MOBILE_RULES.md`

Then inspect the repo before editing. Build one focused phase or subtask only.

## Current Architecture

- The active game is an Expo/React Native mobile landscape game.
- The current battlefield is 2.5D image-backed, not active Three.js runtime.
- Active map art: `map.png`.
- Active walk/collision mask source: `walkmask.png`.
- Generated walkmask data: `src/game/walkmaskGrid.js`.
- `walkmask.png` is Uday's source image and should not be edited by Codex unless explicitly requested.
- If Uday pastes a new generated mask, run only `node scripts/generateWalkmaskGrid.mjs`. The generator samples the source mask onto the active `map.png` canvas for runtime collision without rewriting `walkmask.png`.
- Movement uses the walkmask, hero body radius, and axis-slide fallback.
- Movement now uses small collision substeps so large ticks do not jump over blocked mask strips.
- Camera is a fixed zoomed image-map camera that follows the hero and clamps to map bounds.
- Current image-map camera zoom is `4.0`.
- Current hero movement speed is `90` world units/sec after zoom `4.0` tuning.
- Current enemy movement speeds are Alien Hunter `48`, Hunter Exosuit `36`, Heavy Brute `26`, and Breaker Bot `32`.
- Image camera scaling preserves the original `map.png` aspect ratio so world coordinates stay pixel-aligned with the visual map.
- Mobile controls are minimal:
  - Left joystick.
  - Right hold Fire button.
  - No bottom debug button row in the mobile play view.
- `Final Map.png` and earlier Three.js/asset work are reference/fallback only. Do not rebuild the map unless Uday explicitly asks.

## Important Decisions From Uday

- Continue phase by phase. Do not overbuild beyond V1.
- The game is for Android and iOS mobile landscape play.
- Use 2.5D image map for now because it gives the best final map look.
- Later we may zoom/adjust camera more, but do not change camera unless requested.
- Use `map.png` as the active visual map and walkmask-based logic for movement.
- Door collision blocking is not required. Doors are encounter/animation/spawn logic only.
- Phase 5/5B door logic is: randomized doors open, enemies spawn, no door-wall collision.
- All four enemy types now use guns/ranged attacks for presentation.
- Use the phrase "enemy behavior logic," not "enemy AI."
- External Three.js skills/repos are reference only; do not copy browser/WASD/mouse/DOM patterns into runtime.
- No multiplayer, no extra heroes, no extra enemy types, no quiz inside quick rounds, no advanced pathfinding in V1.

## Completed Phase Status

See `docs/IMPLEMENTATION_STATUS.md` for full detail. Short summary:

- Phase 1 complete: 8-minute Core-vs-Core match shell.
- Phase 2 complete: hero movement and Sahib AR-7 rifle basics, now tuned to a 30-round M416-like fast cadence.
- Phase 3 complete: hero death and 5-second respawn.
- Phase 4 complete: final 2.5D image map with walkmask collision.
- Phase 5 complete: 4 major intersection door encounters.
- Phase 5B complete: center zone door encounter.
- Phase 5/5B door placement correction complete: final 15 marked doors.
- Phase 6 mostly complete: four locked enemy types, behavior roles, typed spawns, enemy attacks, hero rifle priority against enemies, directional sprite rendering.
- Latest Phase 6 corrections complete: hero render size increased, joystick/fire multitouch works together, and route-mask fixes keep stair/intersection exits walkable.
- Phase 7 complete: match elapsed time now selects pressure phase, and door sequences use the documented enemy count table.
- Latest map correction complete: walkmask runtime grid samples the provided source mask against the map canvas, hero spawn moved to walkable floor, camera aspect scaling fixed, and movement collision substepped for smoother mask-following movement.
- Phase 8 complete: time-based Core pressure waves spawn Hunter Exosuit Troopers after opening/contact and send them toward Player Core through static lane waypoints without triggering intersection encounters.
- Phase 9 complete: V1 controlled free-placement Block Wall system with placement previews, charges/refill, movement blocking, bullet blocking, wall HP/damage/destruction, and enemy wall reactions.
- Phase 10 complete: Enemy Core lightly attacks the hero in range, HP-threshold defense waves trigger once at 75/50/25, and defense enemies spawn from two Enemy Core side doors without adding shields or gates.
- Phase 11 complete: timed Energy Burst Rifle pickups appear at 2:30 and 5:30, auto-collect in range, grant 12 high-power shots, then return to the default rifle when ammo ends.
- Phase 12 complete: local hearts and flat coins-only `BattleResult` output are implemented without Supabase/account mutation.
- Phase 13 complete: lightweight combat readability accents are implemented without rebuilding the map or replacing final assets; under-character halos were later disabled for the active GLB battlefield.
- Phase 14 complete: integration-level V1 loop tests cover heart consumption, win result, timer draw, no-heart reward behavior, and refill.
- Latest wall simplification complete: Sand Trap slow-zone mechanics are removed, and Block Wall is the only active tactical wall tool.

## Current Phase 6 Sprite State

Current Phase 6 sprite files:
- Raw/source generated files live in `assets/phase6/`.
- Runtime normalized sheets live in `assets/phase6/runtime/`.
- Runtime renderer expects:
  - Walk sheets: 8 direction rows x 6 frames.
  - Attack/shoot sheets: 8 direction rows x 4 frames.
  - Direction row order:
    1. down
    2. down_right
    3. right
    4. up_right
    5. up
    6. up_left
    7. left
    8. down_left
- `src/game/characterAnimation.js` defines these frame counts and direction rows.
- `scripts/normalizePhase6SpriteSheets.py` converts raw character images into mobile-safe runtime sprite sheets.

Uday plans to regenerate better high-quality character sheets because the current images can still feel less realistic. When new images arrive:
1. Preserve the raw images.
2. Put/replace them under `assets/phase6/` using the expected names.
3. Regenerate runtime sheets with `scripts/normalizePhase6SpriteSheets.py`.
4. Test animation bleed, direction rows, hero size, and joystick behavior on device.

Expected image names:
- `hero_walk.png`
- `hero_shoot.png`
- `alien_hunter_walk.png`
- `alien_hunter_attack.png`
- `hunter_exosuit_walk.png`
- `hunter_exosuit_attack.png`
- `heavy_brute_walk.png`
- `heavy_brute_attack.png`
- `breaker_bot_walk.png`
- `breaker_bot_attack.png`

## Current Phase 6 GLB State

Uday has added Meshy GLB character exports for the five locked V1 characters under `assets/phase6/`.

Use the merged-animation Meshy GLB file in each character folder as the source. The single `Character_output.glb` files contain only a tiny base animation and should not be used for gameplay.

Repeatable scripts:

```powershell
npm run optimize:phase6-glb
npm run inspect:phase6-glb
```

Optimized runtime-candidate files live in:

```text
assets/phase6/glb/hero.glb
assets/phase6/glb/alien_hunter.glb
assets/phase6/glb/hunter_exosuit.glb
assets/phase6/glb/heavy_brute.glb
assets/phase6/glb/breaker_bot.glb
```

Expected Meshy animation clips in the optimized GLBs:

```text
Dead
Idle_02
Running
Walk_Forward_While_Shooting
Walking
```

`Walk_Forward_While_Shooting` is the current available attack/shoot animation clip. There is no separate exact `Shoot` clip in the pasted GLBs.

The optimized GLBs are now registered as game character assets through:

```text
src/assets/characterModelModules.js
src/game/characterModels.js
src/game/characterModelRuntime.js
src/ui/CharacterModelOverlay.js
```

The optimizer is intentionally configured without Meshopt/Draco compression so the outputs do not require decoder wiring in the current Expo/React Native Three.js loader. Do not enable Meshopt/Draco unless the runtime loader is updated and tested on Android/iOS.

The optimized character GLBs must not reference runtime images/textures for Expo Android. `npm run inspect:phase6-glb` should report `textures=0`, `images=0`, `embeddedImages=0`, and `colorAttributes=1` for every optimized file in `assets/phase6/glb/`. The Meshy texture colors are sampled during optimization and baked into GLB `COLOR_0` vertex colors.

Important: the active map is still the 2.5D image-backed battlefield. `CharacterModelOverlay.js` draws animated GLB hero/enemy characters above the image map in a transparent `expo-gl` layer. The old 2D sprite-frame fallback is no longer rendered in the active battlefield, so it should not flash when the match starts.

Current GLB visual tuning:
- Hero target height: `46`.
- Enemy target height: `max(30, renderSize * 0.88)`.
- Under-character halo/circle markers are disabled in the active battlefield.
- Characters use baked Meshy vertex colors instead of temporary runtime color palettes or PNG texture loading.

## Current Controls And Playability Notes

- Hero movement speed has been slowed for better map scale.
- Enemy speeds have also been reduced.
- Hero render size was increased to make only the player more readable.
- Joystick has:
  - touch identity tracking
  - a control-zone guard
  - move-responder claiming disabled for stray touches
- Right Fire control is now also the aim pad:
  - Hold to fire.
  - Drag from the Fire button to set aim direction.
  - Rifle shots travel as projectiles and only damage targets they intersect.
  - Shots are blocked by walkmask walls.
- Phase 9 wall controls are active:
  - Compact B wall tool button sits beside the Fire control.
  - Select Block Wall.
  - Touch/drag on the battlefield to show a green/red wall ghost preview at that world position.
  - Release to place if the preview is valid.
  - Placement is controlled free placement in a limited range from the hero, not fixed sockets and not map-wide placement.
- Sand Trap is no longer active in code or UI.
- If Uday still sees joystick interference on a physical Android device, inspect React Native touch event behavior in `App.js` and strengthen the active-touch lock without changing the mobile UI shape.

## Current Combat And Pathing State

- Rifle auto-aim has been removed from runtime combat.
- `tickHeroCombat` emits projectile spawn requests instead of instant enemy/Core damage.
- `src/game/projectiles.js` owns projectile travel, enemy hit checks, Enemy Core hit checks, and walkmask wall blocking.
- `ImageBattlefield.js` renders active projectiles as short bullet streaks.
- Enemy behavior logic now requires a clear walkmask line before enemies shoot the hero or Player Core.
- When a hero-pressure enemy's direct chase line is blocked, `enemyBehavior.js` uses a lightweight coarse-grid route helper to find open walkable waypoints around the obstacle.
- This is simple route steering for V1 playability, not advanced flanking/cover behavior.
- `enemyBehavior.js` also runs a lightweight character separation pass after movement so enemies do not stack on each other or on the hero. This is collision spacing only, not advanced dynamic pathfinding.
- Player-built Phase 9 walls now plug into the same projectile/movement blocking model.
- `src/game/wallSystem.js` owns controlled free placement, charges, HP, collision segments, placement validation, and damage.
- `tickHeroCombat` receives active walls and blocks hero movement against them.
- `tickProjectiles` receives active walls and returns wall damage events when bullets hit placed walls.
- `tickEnemyBehavior` receives active walls; enemies attack walls when blocked.
- Wall damage hierarchy currently follows the V1 stats:
  - Alien Hunter: 7 wall damage.
  - Hunter Exosuit: 12 wall damage.
  - Heavy Brute: 24 wall damage.
  - Breaker Bot: 28 wall damage.
- Enemy direct attack damage values:
  - Alien Hunter: 4.
  - Hunter Exosuit: 5.
  - Heavy Brute: 12.
  - Breaker Bot: 8.

## Current Phase 7 Pressure State

- `src/game/timePressure.js` defines the four match pressure phases.
- Baseline door counts are active:
  - Opening/contact: 1,1,2.
  - Early fight: 2,2,2.
  - Mid fight: 3,3,3.
  - Final chaos: 4,4,4.
- An optional intense table exists for later debug/tuning but is not active by default.
- Door encounters capture the phase when a 3-door sequence starts and use that same table for all three doors in that sequence.
- Time changes enemy quantity only; enemy stats, enemy roles, door locations, and door count do not scale with time.

## Current Phase 8 Core Pressure State

- `src/game/corePressure.js` defines the Core-pressure wave scheduler.
- Core pressure is separate from local intersection fights and does not trigger door encounter zones.
- No Core pressure spawns before 0:45.
- Active wave tuning:
  - Early fight: 1 Hunter Exosuit every 35 seconds.
  - Mid fight: 2 Hunter Exosuits every 28 seconds.
  - Final chaos: 3 Hunter Exosuits every 20 seconds.
- Core-pressure enemies spawn from `CORE_PRESSURE_SPAWN_POINTS` in `src/game/mapLayout.js`.
- Core-pressure enemies use static lane route points from `CORE_PRESSURE_ROUTE_POINTS_BY_LANE_ID`; this is simple authored routing, not advanced dynamic pathfinding.
- Spawned Core-pressure enemies are appended to the existing enemy list, so current rifle damage, enemy behavior logic, rendering, and Player Core damage remain shared.
- Match restart resets Core-pressure state with hero and door encounter state.
- Enemy stats do not scale with time.

## Current Phase 10 Enemy Core Defense State

- `src/game/coreDefense.js` defines the Enemy Core defense system.
- Enemy Core defense is HP-threshold based, not location-triggered.
- Thresholds are 75%, 50%, and 25% Enemy Core HP.
- Each threshold fires once per match and resets on match restart.
- Defense intensity depends on the current match pressure phase from `src/game/timePressure.js`.
- Defense enemies spawn from `ENEMY_CORE_DEFENSE_DOORS` in `src/game/mapLayout.js`.
- The active defense doors are:
  - `enemy_core_defense_top_door`
  - `enemy_core_defense_bottom_door`
- Spawned defense enemies are appended into `doorEncounters.spawnedEnemies`, so existing enemy behavior, rifle projectiles, HP bars, and wall interactions continue to work.
- Enemy Core light attack starts from `ENEMY_CORE_ATTACK_POSITION`.
- Starting attack tuning:
  - Range: `190`
  - Damage: `5` per second
- Player-built Block Walls can block the Enemy Core light attack line.
- No Enemy Core shield, invincibility, hard gate, or forced clearing logic exists.

## Current Phase 11 Special Weapon State

- `src/game/specialWeapons.js` defines the timed pickup scheduler.
- Energy Burst Rifle data lives in `src/game/heroCombat.js`.
- Active drop times:
  - `150` seconds
  - `330` seconds
- Active drop points:
  - `center_energy_burst_drop`
  - `lower_intersection_energy_burst_drop`
- Pickups auto-collect when the hero is within `36` world units.
- Uncollected pickups expire after `30` seconds.
- Energy Burst Rifle tuning:
  - Ammo: `12`
  - Enemy damage: `35`
  - Enemy Core damage: `12`
  - Reload: none
- The default Sahib AR-7 rifle magazine is preserved while Energy Burst is active.
- When Energy Burst ammo reaches `0`, the hero returns to the default rifle.
- Hero death/respawn clears the special weapon and returns to the default rifle.
- `ImageBattlefield.js` renders active pickups as compact non-text blue/gold markers.

## Current Phase 12 Hearts And Result State

- `src/game/hearts.js` defines local full-reward heart state.
- Free heart tuning:
  - Max hearts: `4`
  - Refill: `30` minutes
  - Refill behavior: all 4 hearts refill together
- Starting a full-reward quick round consumes 1 heart.
- If hearts are 0, the local access mode can still be `no_full_reward`, but `baseCoins` are 0.
- `src/game/quickRoundResult.js` creates the local `BattleResult`.
- `matchState.js` now includes:
  - `matchId`
  - `enemiesKilled`
- `projectiles.js` reports `enemyKills` so match state can track defeated enemies.
- Current `BattleResult` includes:
  - `battleResultId`
  - `userId`
  - `outcome`
  - `reason`
  - `baseCoins`
  - `completedAt`
  - `elapsedSeconds`
  - `durationSeconds`
  - `coreMaxHp`
  - `playerCoreHp`
  - `enemyCoreHp`
  - `playerCoreDamageDealt`
  - `enemyCoreDamageDealt`
- Quick round does not use Supabase and does not add coins to the user account.
- Quick round does not output XP, gems, resources, reward multipliers, nested reward objects, or claim metadata.
- Fixed base coin output is Win `100`, Draw `50`, Loss `25`.
- Future base-building should consume the `BattleResult`, block duplicate claims, apply Pro 3x if applicable, then mutate the user's base economy.
- `App.js` currently shows a compact local result overlay after match end.

## Current Phase 13 Visual Readability State

- `src/game/visualReadability.js` defines combat readability accents.
- `ImageBattlefield.js` currently uses the special pickup accent.
- Hero/enemy under-character halo circles are disabled in the active battlefield because the GLB character overlay now supplies the visible characters.
- Enemy accent colors are intentionally distinct per locked V1 enemy type.
- This is a lightweight testing/readability pass only.
- No map rebuild, active Three.js runtime change, final character art replacement, or new heavy asset pipeline was added.

## Current Phase 14 Readiness State

- `tests/v1QuickRoundLoop.test.mjs` covers the core V1 quick-round readiness flow.
- Covered flows:
  - heart consumed -> match win -> local `BattleResult`
  - timer end -> draw `BattleResult`
  - 0 hearts -> no-full-reward zero-coin result
  - 30-minute refill -> all hearts restored
- No gameplay numbers were tuned in Phase 14.
- Numeric tuning should happen only after physical-device playtesting.

## Tests And Build Commands

Run after code changes:

```powershell
npm test
npx expo export --platform android --output-dir .expo-export-test
```

After successful export, remove the temporary folder:

```powershell
Remove-Item -LiteralPath ".expo-export-test" -Recurse -Force
```

To test on device:

```powershell
npx expo start -c
```

## Current Known Next Work

Most likely next task:
- Push/share this branch or hand it to Pranay for main/base kingdom map work.
- Replace/regenerate Phase 6 character sprite sheets with higher-quality directional walk/shoot frames when Uday provides final images.
- Run physical-device playtesting and tune numbers based on observed issues.

Upcoming planned phases from `docs/PHASE_PLAN.md`:
- Phase 10-14 are complete in the current local quick-round module.

## New Chat Operating Rules

- Always inspect before editing.
- Do not rewrite working systems.
- Keep changes small and testable.
- Implement one phase or one focused correction at a time.
- If docs conflict with a new request, ask Uday before coding.
- Report:
  - what changed
  - what passed
  - what failed
  - what remains
