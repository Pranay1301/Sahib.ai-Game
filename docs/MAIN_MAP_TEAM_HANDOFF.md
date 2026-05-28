# Main Map Team Handoff

## Purpose

This file is for the teammate who will use Codex to build the main/base kingdom map. The quick-round mini game is a protected playable combat module and should not be continued, rebuilt, renamed, moved, or rewritten by the main map teammate.

The goal is to avoid merge errors, duplicated gameplay state, and accidental deletion of the completed mini-game context.

## First Read Order For Codex

Before editing, read:

1. `AGENTS.md`
2. `README.md`
3. `docs/PRANAY_HANDOFF.md`
4. `docs/MAIN_MAP_TEAM_HANDOFF.md`
5. `docs/IMPLEMENTATION_STATUS.md`
6. `docs/NEW_CHAT_HANDOFF.md`

Then inspect the repo before making changes.

## Current Boundary

The current app is the quick-round mini game. Treat it as a protected playable mode that the main/base kingdom map can launch.

Protected quick-round systems:

- Active visual map: `map.png`
- Active collision mask: `walkmask.png`
- Generated walkmask data: `src/game/walkmaskGrid.js`
- Active battlefield renderer: `src/ui/ImageBattlefield.js`
- Quick-round shell currently in `App.js`
- Match rules: `src/game/matchState.js`
- Hero combat: `src/game/heroCombat.js`
- Enemy behavior logic: `src/game/enemyBehavior.js`
- Door encounters: `src/game/doorEncounters.js`
- Core pressure: `src/game/corePressure.js`
- Enemy Core defense: `src/game/coreDefense.js`
- Timed special weapon drops: `src/game/specialWeapons.js`
- Hearts/result contract: `src/game/hearts.js`, `src/game/quickRoundResult.js`
- Projectile combat: `src/game/projectiles.js`
- Combat readability accents: `src/game/visualReadability.js`
- Wall tools: `src/game/wallSystem.js`
- Image-map camera: `src/game/imageCamera.js`
- Character animation: `src/game/characterAnimation.js`
- Touch controls: `src/game/joystick.js`

Do not rebuild these systems for the main map.

## Recommended Ownership

Uday/current mini-game work owns:

- Quick-round mini game.
- Combat loop.
- Doors.
- Enemy behavior logic.
- Walls.
- Core defense.
- Special weapon.
- Hearts/rewards/result flow.
- Quick-round tuning and fixes when Uday explicitly requests them.

Pranay/main map teammate owns:

- Main/base kingdom map screen.
- Base-building view.
- Building placement or upgrade UI.
- Navigation/menu around quick rounds.
- Entry point into quick round.
- Displaying rewards after quick round returns a result.
- Base progression presentation.

## Required Architecture

The main/base kingdom map should be a separate screen, not a rewrite of the quick-round map.

Recommended future structure:

```text
src/screens/MainBaseMapScreen.js
src/screens/QuickRoundScreen.js
src/screens/ResultScreen.js
src/game/quickRoundResult.js
src/game/progression/
src/game/rewards/
src/game/baseMap/
src/ui/base/
src/ui/kingdom/
assets/base/
assets/kingdom/
```

Prefer adding `src/screens/MainBaseMapScreen.js` first without touching quick-round files. If routing is required, move the current quick-round `App.js` gameplay shell into `src/screens/QuickRoundScreen.js` as a mechanical refactor only. Keep the move behavior-preserving and test it before adding main map features.

After that, `App.js` should only route between screens.

## Integration Contract

The main map should start a quick round by passing a small config object.

Example:

```js
startQuickRound({
  heroId: "sahib_commander",
  selectedLoadout: "default_rifle",
  rewardMode: "full_reward"
});
```

The quick round should return/hand off the local `BattleResult` object produced by `src/game/quickRoundResult.js`.

Example:

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

- `"win"`
- `"loss"`
- `"draw"`

Do not make the main map read internal quick-round state directly while a match is running. It should receive only the final result.

Base-building should consume `BattleResult`, block duplicate claims using `battleResultId`, apply Pro 3x if applicable, and then add coins to the user's economy. Quick round does not use Supabase and does not directly add coins to the account. Quick round does not return XP, gems, resources, reward multipliers, nested reward objects, or claim metadata.

## Do Not Touch Without Uday Approval

Avoid editing these files unless Uday explicitly asks for a mini-game change:

- `App.js`
- `map.png`
- `walkmask.png`
- `src/ui/ImageBattlefield.js`
- `src/ui/ThreeBattlefield.js`
- `src/game/mapLayout.js`
- `src/game/walkmaskGrid.js`
- `src/game/matchState.js`
- `src/game/heroCombat.js`
- `src/game/enemyBehavior.js`
- `src/game/projectiles.js`
- `src/game/doorEncounters.js`
- `src/game/corePressure.js`
- `src/game/coreDefense.js`
- `src/game/specialWeapons.js`
- `src/game/hearts.js`
- `src/game/quickRoundResult.js`
- `src/game/visualReadability.js`
- `src/game/wallSystem.js`
- `src/game/imageCamera.js`
- `src/game/characterAnimation.js`
- `src/game/timePressure.js`
- `src/game/joystick.js`
- `assets/phase5/`
- `assets/phase6/`
- `assets/phase9/`

If a change is unavoidable for routing, make it small, behavior-preserving, add tests, and explain the reason in the commit message.

## Main Map Rules

Main map work should:

- Use a separate UI screen.
- Use separate assets from the quick-round mini-map unless intentionally shared.
- Avoid changing quick-round coordinates.
- Avoid changing `map.png` or `walkmask.png`.
- Avoid duplicating quick-round match state.
- Avoid importing quick-round internals just to show base progression.
- Keep main map state separate from quick-round combat state.
- Keep base map assets in `assets/base/` or `assets/kingdom/`.

## What The Main Map Can Safely Add

Safe additions:

- `src/screens/MainBaseMapScreen.js`
- `src/screens/MainMapScreen.js`
- `src/screens/ResultScreen.js`
- `src/screens/QuickRoundScreen.js` if created by mechanical extraction only
- `src/ui/base/*`
- `src/ui/kingdom/*`
- `src/game/progression/*`
- `src/game/rewards/*`
- `src/game/baseMap/*`
- Base map assets under `assets/base/`
- Kingdom map assets under `assets/kingdom/`
- Main/base map tests under `tests/`

Prefer adding new files over modifying core quick-round files.

## Branch Workflow

Use a separate branch for main map work:

```text
feature/main-map
```

Keep main map work isolated. Do not mix quick-round gameplay edits into the main map branch.

Before merging, run:

```powershell
npm test
npx expo export --platform android --output-dir .expo-export-test
Remove-Item -LiteralPath ".expo-export-test" -Recurse -Force
```

## Codex Prompt For Main Map Teammate

Use this prompt at the start of his Codex chat:

```text
We are continuing Sahib AI from this repo. I am building the main base kingdom map, not continuing the quick-round mini game.

First read AGENTS.md, README.md, docs/PRANAY_HANDOFF.md, docs/MAIN_MAP_TEAM_HANDOFF.md, docs/IMPLEMENTATION_STATUS.md, and docs/NEW_CHAT_HANDOFF.md.

Do not rebuild or modify the working quick-round mini-game systems unless Uday explicitly asks. The current quick-round is the 2.5D image-backed combat map using map.png, walkmask.png, ImageBattlefield, projectile logic, enemy behavior logic, doorEncounters, corePressure, coreDefense, specialWeapons, hearts, quickRoundResult, and wallSystem.

Your task is to build the main/base kingdom map as a separate screen around the quick-round. Keep quick-round combat state separate. Add new files for main map UI/progression where possible. Use src/screens/MainBaseMapScreen.js, src/ui/base, src/ui/kingdom, src/game/progression, src/game/rewards, src/game/baseMap, assets/base, and assets/kingdom.

If routing is needed, first move the current quick-round shell into QuickRoundScreen as a mechanical refactor, run tests, then add MainBaseMapScreen. Do not change quick-round gameplay behavior during that move.

Before editing, inspect the repo and use graphify query for architecture context. After changes, run npm test, Android export, remove .expo-export-test, and run graphify update .
```

## Definition Of Safe Handoff

The repo is safe for the main map teammate when:

- `npm test` passes.
- Android export passes.
- `docs/IMPLEMENTATION_STATUS.md` is current.
- `docs/NEW_CHAT_HANDOFF.md` is current.
- `docs/PRANAY_HANDOFF.md` is current.
- This file is present.
- Quick-round protected-file boundary is clear.
- No temporary export folder is committed.
