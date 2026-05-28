# AGENTS.md

## Project
Sahib AI is a mobile landscape-isometric action-strategy game with a fast V1 quick-round mode. The quick round is a Core-vs-Core battle loop focused on combat, tactical walls, enemy pressure, and rewards that later connect to base-building/progression.

## First instructions for Codex
- Inspect the repository before editing.
- Do not rewrite working systems unless necessary.
- Make the smallest clean change that moves the V1 playable loop forward.
- Build one focused system at a time.
- Use placeholder/blockout assets before final 3D polish.
- After changes, run the project’s available build/lint/test commands and report results.
- If commands are missing or fail due to missing setup, state that clearly and do not guess.

## Read these docs before editing quick-round gameplay
If these files exist, read the relevant ones before coding:
- `docs/QUICK_ROUNDS.md`
- `docs/MAP_LAYOUT.md`
- `docs/MAP_BLOCKOUT_SPEC.md`
- `docs/HERO_COMBAT.md`
- `docs/ENEMY_LOGIC.md`
- `docs/WALL_SYSTEM.md`
- `docs/CORE_DEFENSE.md`
- `docs/REWARDS_BRIDGE.md`
- `docs/V1_SCOPE.md`
- `docs/VISUAL_IDENTITY.md`
- `docs/THREEJS_MOBILE_RULES.md`
- `docs/TASKS.md`
- `docs/PHASE_PLAN.md`

If a requested change conflicts with these docs, stop and ask for clarification before implementing.

## V1 scope
Build the V1 playable quick-round loop first:
- 8-minute landscape-isometric Core-vs-Core match.
- Player controls one futuristic Gulf/Saudi tactical commander.
- Player uses an automatic tactical rifle plus the wall/utility system.
- The map has 4 major intersections.
- Intersections trigger randomized 3-door enemy encounters.
- The center is a larger special intersection/drop zone with its own 3 randomized mechanical doors placed away from exit paths.
- Time increases pressure through enemy count/frequency, not enemy stat scaling.
- Enemy Core defense is triggered by Core HP thresholds.
- Rewards are simple and bridge to base-building later.

## V1 do-not-build list
Do not add these in V1 unless explicitly requested:
- Multiplayer.
- Multiple heroes.
- Extra enemies beyond the four locked V1 enemy types.
- Clans/alliance systems.
- Map creator.
- Advanced behavior-based AI Director.
- Advanced dynamic pathfinding.
- League-style tower gates, control nodes, or forced clearing gates.
- Enemy Core shield/invincibility phases.
- Mid-combat English quiz interruptions.
- Gacha/lootbox gambling.
- Pay-to-win combat advantages.
- Final polished 3D before the core playable loop works.

## Quick-round locked rules
- Quick rounds are pure fast combat/action. No English quiz inside the quick battle.
- English learning/progression should sit outside quick rounds, likely in base-building/progression.
- Match duration is 8 minutes.
- Free users get 4 full-reward hearts.
- 1 heart = 1 full-reward quick match.
- After all 4 hearts are used, the user waits 30 minutes, then all 4 hearts refill together.
- Subscription/paywall is used to remove or reduce this 30-minute wait and allow continuous/unlimited or much higher full-reward play.
- Exact Pro/Premium tier details depend on base-building/economy design.

## Win/loss rules
- Player wins instantly when Enemy Core is destroyed.
- Player loses instantly when Player Core is destroyed.
- If 8-minute timer ends, higher remaining Core HP percentage wins.
- If Core HP percentage is equal, total Core damage dealt wins.
- If still tied, result is draw/reduced reward.
- No sudden death in V1.

## Map and movement
- Use `Final Map.png` as the current visual art/reference target for map work.
- Use `docs/MAP_BLOCKOUT_SPEC.md` and `docs/MAP_LAYOUT.md` as the coding/source-of-truth references for map geometry, routes, intersections, doors, and gameplay constraints.
- If `Final Map.png` visually conflicts with the map specs, follow the docs for gameplay/collision and use the image only as art direction.
- Keep PUBG/TDM-style freedom of movement.
- No hard gates, control nodes, mandatory checkpoint clearing, or League-style tower locks.
- Routes should naturally pass through dangerous intersections, but the player can run, dodge, escape, and choose paths.
- Running away does not remove danger; it relocates or stacks pressure.

## Intersection and door system
- V1 map uses 4 major intersections.
- Each major intersection uses a rounded-square shape with slight diamond influence.
- Intersections are danger zones, not locked checkpoints.
- Use mechanical enemy doors, not magical portals.
- Each major intersection has 3 nearby enemy doors attached to perimeter walls.
- Door positions should be varied: front, side, rear/diagonal.
- When the hero enters an intersection trigger zone, all 3 doors open in sequence.
- Door order must be randomized every time.
- Use a reusable Fisher-Yates/equivalent door sequence randomizer for intersections and the center; avoid repeating the same first door twice in a row when possible, and support seeded randomness for debug mode.
- Doors open 2–3 seconds apart; full sequence is about 5–7 seconds.
- Use about 8m trigger radius around the intersection center as V1 starting value.
- Add 20-second cooldown per intersection to prevent spam retriggers.
- No formal warning system in V1. Natural door animation/sound/glow is enough.
- If the player runs through an intersection, the event still triggers and enemies may spawn behind/around the intersection.

## Time and enemy pressure
- Time controls pressure: enemy count, spawn frequency, event overlap, and chaos level.
- Time does not control exact door location, enemy identity, individual enemy strength, or number of doors.
- Enemy stats do not scale with time.
- Difficulty increases through more enemies, faster pressure, and overlap.

### Match phases
- Opening/contact: 0:00–0:45
- Early fight: 0:45–2:00
- Mid fight: 2:00–5:30
- Final chaos: 5:30–8:00

### Baseline enemy count per 3-door intersection sequence
Start with this table and tune only after playtesting:
- Opening/contact: 1,1,2 = 4 total
- Early fight: 2,2,2 = 6 total
- Mid fight: 3,3,3 = 9 total
- Final chaos: 4,4,4 = 12 total

Optional more intense test table:
- Opening/contact: 1,2,2 = 5 total
- Early fight: 2,2,3 = 7 total
- Mid fight: 3,4,4 = 11 total
- Final chaos: 4,5,5 = 14 total

## Enemy roster and roles
Use the phrase “enemy behavior logic,” not “enemy AI,” because no AI model is used.

V1 has exactly four enemy types:
1. Fast Swarm Crawler / Alien Hunter: main hero-pressure alien; chases/rushes/shoots hero with an organic alien gun or bio-rifle.
2. Hunter Exosuit Trooper: Core/tower pressure; mostly ignores hero and moves toward Player Core/towers while using a powered exosuit rifle/burst weapon.
3. Heavy Alien Brute: heavy hero/wall threat; shoots hero with a heavy alien cannon/brute rifle and smashes or shoots walls if blocked.
4. Breaker Bot: wall breaker plus hero pressure; uses an integrated mechanical breaker gun/tool cannon and prioritizes destroying walls if placed.

## Hero combat
- Hero is a futuristic Gulf/Saudi tactical commander.
- Default weapon is an automatic tactical rifle, not a default laser/magic/one-shot weapon.
- Suggested rifle name: Falcon-7 Tactical Rifle or Sahib AR-7 Tactical Rifle.
- Hero HP: 100.
- Magazine: 30 rounds.
- Reserve ammo: unlimited in V1.
- Damage: 10 per bullet to enemies.
- Damage to Enemy Core: 5 per bullet.
- Fire rate: 11 bullets/sec for an M416-like fast tactical rifle feel.
- Reload: 1.8 seconds.
- Hero actions: Rifle Fire + Wall System tools only.
- No dash/tactical slide in V1.
- No Shock Grenade in V1.
- No ultimate in V1.
- Hero death does not end match.
- Hero respawns after 5 seconds near Player Core.
- Death penalty is time loss + score penalty; no heart lost on death.

## Timed special weapon drops
- Special high-power weapons are allowed only as timed in-match pickups, not default weapons.
- Start with one special weapon: Energy Burst Rifle.
- Drop timing starting values: around 2:30 and 5:30.
- Limited ammo; disappears when ammo ends.
- Energy Burst Rifle starting values: 12 shots, 35 damage to enemies, 12 damage to Enemy Core, no reload.

## Core defense
- Player Core HP: 1000 starting value.
- Enemy Core HP: 1000 starting value.
- Enemy Core lightly shoots hero while being attacked/in range.
- Enemy Core defense is HP-triggered, not location-triggered.
- Defense thresholds: 75%, 50%, 25% Enemy Core HP.
- Time phase modifies defense intensity: early light, mid medium, final strongest.
- Defense enemies spawn from nearby enemy-base/Core defense doors, preferably 2 side doors for V1.
- No shield phases or invincibility.

## Wall system implementation rules
This is the most technically risky confirmed feature. Keep it simple in V1.
- Wall tool: Block Wall.
- Block Wall: straight cover wall; blocks bullets and movement.
- Sand Trap slow-zone mechanics are removed from active V1; walls are the main tactical system.
- Block Wall HP: 180 starting value.
- Wall placement: instant tactical placement with green/red preview.
- Placement method: controlled free placement in a limited range from the hero, Fortnite-style for mobile.
- Free placement must still reject blocked walkmask points, hero/enemy/Core/door overlap, wall overlap, and out-of-range placement.
- Wall/tool charges: 3 active charges/cards.
- Refill: 1 charge every 10 seconds.
- Walls block movement and bullets. No shooting through solid walls.
- If enemies are blocked, they attack the wall or use simple steering.
- Do not implement advanced dynamic pathfinding in V1.
- Build walls as simple destructible collision objects first.

## Rewards and economy bridge
- Quick-round rewards must feed base-building.
- V1 quick-round rewards are coins only.
- Quick rounds produce a flat `BattleResult`; base-building consumes it and awards coins.
- Fixed V1 base coin output: Win = 100, Draw = 50, Loss = 25.
- Do not implement quick-round gems, resources, English XP, progression XP, or reward multipliers.
- Pro 3x is applied by base-building/subscription after consuming `BattleResult`, not by quick-round combat.
- Quick round must not directly write economy coins to Supabase.
- Base-building owns duplicate claim protection.
- Required `BattleResult` fields: `battleResultId`, `userId`, `outcome`, `reason`, `baseCoins`, `completedAt`, `elapsedSeconds`, `durationSeconds`, `coreMaxHp`, `playerCoreHp`, `enemyCoreHp`, `playerCoreDamageDealt`, `enemyCoreDamageDealt`.

## Camera and app behavior
- Fixed landscape isometric camera follows hero.
- No manual zoom/rotation in V1.
- If match starts and player force-closes/quits, consume heart and likely count as loss.
- Single-player can allow pause.
- App interruption should auto-pause if possible.

## External Three.js skills and references
- External Three.js skills and downloaded example repos are reference material only.
- Sahib AI is a mobile Expo/React Native game using Three.js through `expo-gl`, not a browser-only web game.
- Use external Three.js skills only for scene setup, coordinates, cameras, lights, materials, GLB/GLTF loading, animation, and performance patterns.
- Do not copy browser DOM UI, `window`/`document` game logic, WASD movement, mouse aim, pointer lock, OrbitControls, manual zoom/rotation, or desktop-only input patterns into runtime gameplay.
- Player control must remain mobile joystick/touch unless explicitly approved otherwise.
- If external Three.js guidance conflicts with `docs/THREEJS_MOBILE_RULES.md` or any Sahib AI gameplay doc, the Sahib AI docs win.

## Visual identity rules
- World: surreal pink/purple alien environment.
- Buildings: realistic Gulf/Saudi/Dubai/KAFD-inspired futuristic structures.
- Aliens: darker organic alien look, visually distinct from pink world, no crystals.
- Robots/exosuits: black/gunmetal with red/purple warning accents.
- Hunter Exosuit is a human-piloted powered suit/exosuit but now has Core-pressure role.
- Breaker Bot is fully robotic AI wall-breaker with no human pilot.

## Definition of done for V1 quick-round work
A change is done only if:
- The game still builds/runs.
- The quick-round loop is playable with placeholder assets.
- Win/loss conditions work.
- Hearts are consumed/refilled according to the confirmed rules.
- Door sequence randomization works.
- Wall placement blocks movement/bullets and walls can be destroyed.
- Enemy behavior matches the documented roles.
- No out-of-scope V1 features were added.
- The implementation is documented or the relevant docs are updated.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, invoke the `skill` tool with `skill: "graphify"` before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
