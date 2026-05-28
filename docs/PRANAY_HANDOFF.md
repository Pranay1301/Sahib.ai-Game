# Pranay Handoff - Main Base Kingdom Map

Date: 2026-05-26

This handoff is for Pranay and Pranay's Codex chat. Pranay is not continuing the quick-round mini game. The quick-round mini game is the protected playable combat module. Pranay's job is to build the main base kingdom map around it, using the same Expo/React Native repo and coding style.

## First Read Order

1. `AGENTS.md`
2. `README.md`
3. `docs/PRANAY_HANDOFF.md`
4. `docs/MAIN_MAP_TEAM_HANDOFF.md`
5. `docs/IMPLEMENTATION_STATUS.md`
6. `docs/NEW_CHAT_HANDOFF.md`

Read these for boundaries only. Do not start by editing the quick-round files.

## Ownership Boundary

Uday's current mini game is the quick-round combat map. Treat it as a completed module unless Uday explicitly asks for a mini-game fix.

Pranay owns:

- Main base kingdom map screen.
- Base/home UI around the quick-round.
- Kingdom/base buildings, layout, and progression presentation.
- Navigation from main base map into quick-round.
- Result/reward display after quick-round ends.
- Future base-building/progression files.

Pranay does not own:

- Quick-round combat loop.
- Mini-game map art and walkmask.
- Hero combat and bullets.
- Enemy behavior logic.
- Door encounters.
- Wall utilities.
- Quick-round Core-vs-Core match logic.

## Protected Mini-Game Files

Do not delete, rename, move, or rewrite these files for main map work:

```text
App.js
map.png
walkmask.png
src/ui/ImageBattlefield.js
src/ui/ThreeBattlefield.js
src/game/matchState.js
src/game/heroCombat.js
src/game/enemyBehavior.js
src/game/projectiles.js
src/game/doorEncounters.js
src/game/corePressure.js
src/game/coreDefense.js
src/game/specialWeapons.js
src/game/hearts.js
src/game/quickRoundResult.js
src/game/visualReadability.js
src/game/wallSystem.js
src/game/mapLayout.js
src/game/walkmaskGrid.js
src/game/imageCamera.js
src/game/characterAnimation.js
src/game/timePressure.js
src/game/joystick.js
src/game/constants.js
assets/phase5/
assets/phase6/
assets/phase9/
tests/doorEncounters.test.mjs
tests/enemyBehavior.test.mjs
tests/heroCombat.test.mjs
tests/projectiles.test.mjs
tests/coreDefense.test.mjs
tests/specialWeapons.test.mjs
tests/hearts.test.mjs
tests/quickRoundResult.test.mjs
tests/visualReadability.test.mjs
tests/v1QuickRoundLoop.test.mjs
tests/wallSystem.test.mjs
tests/mapLayout.test.mjs
tests/camera.test.mjs
tests/joystick.test.mjs
tests/timePressure.test.mjs
```

These files may be read to understand integration, but should not be changed for main base kingdom map work.

## Protected Mini-Game Behavior

The quick-round mini game currently includes:

- Landscape mobile quick-round.
- 2.5D image-backed battlefield.
- `map.png` visual map.
- `walkmask.png` collision source.
- Generated walkmask data in `src/game/walkmaskGrid.js`.
- Hero joystick movement.
- Right-side manual aim/fire.
- Projectile travel and wall/map bullet blocking.
- Door encounters for 4 intersections plus center zone.
- Four locked V1 enemy types.
- Enemy behavior logic and lightweight pathing.
- Player Core and Enemy Core win/loss rules.
- Enemy Core defense waves at 75/50/25 HP.
- Timed Energy Burst Rifle pickups.
- Local hearts and `BattleResult` output.
- Phase 9 tool: Block Wall only. Sand Trap slow-zone mechanics were removed so walls remain the main tactical system.

Do not change this behavior while building the main base kingdom map.

## Safe New File Areas For Main Map

Prefer adding new files in these locations:

```text
src/screens/MainBaseMapScreen.js
src/screens/ResultScreen.js
src/screens/QuickRoundScreen.js
src/ui/base/
src/ui/kingdom/
src/game/progression/
src/game/rewards/
src/game/baseMap/
assets/base/
assets/kingdom/
tests/mainBaseMap.test.mjs
tests/progression.test.mjs
tests/rewards.test.mjs
```

Use these folders so main map work does not collide with mini-game logic.

## App Routing Rule

`App.js` currently owns the quick-round mini game. If the main base kingdom map needs to become the first screen, modify `App.js` only as a small routing shell.

Allowed `App.js` change:

- Move the current quick-round JSX/state shell into `src/screens/QuickRoundScreen.js` as a mechanical refactor.
- Add a simple screen state in `App.js`, for example `main_base`, `quick_round`, and `result`.
- Render `MainBaseMapScreen` first.
- Start quick-round from the main base screen.
- Return a compact result object back to the base/result screen.

Not allowed:

- Rewriting quick-round logic while moving it.
- Changing quick-round coordinate systems.
- Changing `map.png`, `walkmask.png`, or generated walkmask logic.
- Combining main base map state with live quick-round combat state.
- Reading internal combat state from the base map during a match.

If routing is not needed yet, build `MainBaseMapScreen.js` standalone and leave `App.js` unchanged.

## Integration Contract

The main base map should treat the quick-round as a separate playable mode.

Start quick-round with a small config object:

```js
{
  heroId: "sahib_commander",
  selectedLoadout: "default_rifle",
  rewardMode: "full_reward"
}
```

Quick-round now produces a local `BattleResult` object from `src/game/quickRoundResult.js`:

```js
{
  battleResultId: "local_battle_result_1",
  userId: null,
  outcome: "win",
  reason: "enemy_core_destroyed",
  baseCoins: 100,
  completedAt: "ISO timestamp",
  elapsedSeconds: 420,
  durationSeconds: 480,
  coreMaxHp: 1000,
  playerCoreHp: 1000,
  enemyCoreHp: 0,
  playerCoreDamageDealt: 1000,
  enemyCoreDamageDealt: 0
}
```

Allowed `outcome` values:

```text
win
loss
draw
```

Do not make the base map depend on quick-round internals beyond this boundary.

Base-building should consume the `BattleResult`, block duplicate claims using `battleResultId`, apply Pro 3x if applicable, and then add coins to the user economy. Quick round does not use Supabase and does not directly add coins to the account. Quick round does not return XP, gems, resources, reward multipliers, nested reward objects, or claim metadata.

## Main Base Kingdom Map Direction

Build the main map as a separate mobile screen using the same framework:

- Expo.
- React Native.
- Landscape-first layout.
- Existing component and state style.
- Image-backed or 2D layered UI is acceptable for V1.
- Keep the first version simple and stable.

Suggested first pass:

1. Add `src/screens/MainBaseMapScreen.js`.
2. Add a basic kingdom/base background layer.
3. Add building slots or placeholder building nodes.
4. Add a clear quick-round entry button.
5. Add resource/status UI placeholders.
6. Add `src/game/progression/` for future base data.
7. Add tests for pure progression/reward helpers.

Do not add multiplayer, clans, gacha, or pay-to-win combat logic.

## Asset Rules

Mini-game assets are protected:

```text
map.png
walkmask.png
assets/phase5/
assets/phase6/
assets/phase9/
```

Main base kingdom assets should go under:

```text
assets/base/
assets/kingdom/
```

Use new names that clearly belong to the base map, for example:

```text
assets/base/base_map_background.png
assets/base/building_core.png
assets/base/building_barracks.png
assets/base/building_lab.png
```

## Docs To Update During Main Map Work

When Pranay adds main map work, update:

```text
docs/MAIN_MAP_TEAM_HANDOFF.md
docs/IMPLEMENTATION_STATUS.md
README.md
```

Do not erase mini-game phase history from:

```text
docs/PHASE_PLAN.md
docs/NEW_CHAT_HANDOFF.md
docs/WALL_SYSTEM.md
docs/ENEMY_LOGIC.md
docs/HERO_COMBAT.md
```

## Graphify

Before broad repo edits, use graphify:

```bash
graphify query "main base map architecture"
graphify query "quick round protected files"
graphify path "App.js" "ImageBattlefield.js"
```

After code changes:

```bash
graphify update .
```

## Validation Checklist

Before committing or handing work back:

```bash
npm test
npx expo export --platform android --output-dir .expo-export-test
```

Then remove export output:

```powershell
Remove-Item -LiteralPath ".expo-export-test" -Recurse -Force
```

The quick-round tests must still pass after main map work.

## Codex Prompt For Pranay

Use this prompt when Pranay starts a new Codex chat:

```text
We are continuing Sahib AI from this repo. I am building the main base kingdom map, not continuing the quick-round mini game.

First read AGENTS.md, README.md, docs/PRANAY_HANDOFF.md, docs/MAIN_MAP_TEAM_HANDOFF.md, docs/IMPLEMENTATION_STATUS.md, and docs/NEW_CHAT_HANDOFF.md.

The quick-round mini game is a protected completed module. Do not delete, rename, move, or rewrite App.js quick-round logic, map.png, walkmask.png, ImageBattlefield, matchState, heroCombat, enemyBehavior, projectiles, doorEncounters, corePressure, coreDefense, specialWeapons, hearts, quickRoundResult, wallSystem, mapLayout, walkmaskGrid, imageCamera, characterAnimation, joystick, or the assets under assets/phase5, assets/phase6, and assets/phase9 unless Uday explicitly asks.

Build the main base kingdom map in separate files using the same Expo/React Native framework. Prefer adding src/screens/MainBaseMapScreen.js, src/ui/base, src/ui/kingdom, src/game/progression, src/game/rewards, src/game/baseMap, assets/base, and assets/kingdom.

If routing is required, make App.js only a small routing shell and mechanically move the existing quick-round shell into src/screens/QuickRoundScreen.js without changing gameplay behavior. Keep quick-round state separate from base map state. The base map should start quick-round with a small config object and receive only a final result object.

Before editing, inspect the repo and use graphify query for architecture context. After changes, run npm test, Android export, remove .expo-export-test, and run graphify update .
```
