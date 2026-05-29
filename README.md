# Sahib AI Mobile

Sahib AI is an Expo/React Native mobile landscape quick-round game. The current V1 runtime is a 2.5D image-backed battlefield using `map.png`, `walkmask.png`, generated walkmask logic, transparent character sprite sheets, projectile travel, door encounters, enemy behavior logic, and the Phase 9 wall utility system.

## Current State

- Active mode: V1 quick-round, Core-vs-Core mini game map.
- Active runtime: `App.js` + `src/ui/ImageBattlefield.js`.
- Active map: `map.png`.
- Active collision source: `walkmask.png` compiled into `src/game/walkmaskGrid.js`.
- Camera: fixed landscape image-map follow camera at zoom `2.4`.
- Controls: left joystick, right fire/aim button, Block Wall and Sand Trap buttons.
- Phase status: Phase 9 tuning complete; ready to continue toward Phase 10+ after testing.

## Setup

```bash
npm install
npm test
npm start
```

For base-building Supabase integration, copy `.env.example` to your local environment and set:

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

For Android testing:

```bash
npm run android
```

For bundle validation:

```bash
npx expo export --platform android --output-dir .expo-export-test
```

Delete `.expo-export-test/` after export checks.

## Important Docs

- `AGENTS.md` is the top-level Codex instruction file.
- `docs/PHASE_PLAN.md` tracks phase-by-phase scope.
- `docs/IMPLEMENTATION_STATUS.md` tracks what has already been built.
- `docs/NEW_CHAT_HANDOFF.md` is the continuation handoff for new Codex chats.
- `docs/PRANAY_HANDOFF.md` is the team handoff for Pranay.
- `docs/WALL_SYSTEM.md`, `docs/HERO_COMBAT.md`, `docs/ENEMY_LOGIC.md`, and `docs/MAP_LAYOUT.md` are the key gameplay references.

## Notes For Contributors

- Do not rebuild working systems.
- Do not switch the active runtime back to Three.js.
- Use the phrase "enemy behavior logic"; no AI model is used in battle.
- Keep V1 focused on the playable quick-round loop.
- After code changes, run `npm test`, Android export, and `graphify update .`.
