# V1_SCOPE.md

## Purpose

This file defines what is included and excluded in Sahib AI V1 quick-round development. Use it to prevent overbuilding and keep the first playable loop focused.

## V1 primary goal

Build a playable, testable quick-round loop:

> 8-minute landscape-isometric Core-vs-Core battle with one hero, four enemy types, randomized 3-door intersection fights, wall tools, Core defense, timed special weapon drops, hearts, and coins-only BattleResult output.

## Included in V1

### Gameplay
- 8-minute quick-round matches.
- Landscape/horizontal isometric view.
- One controllable hero.
- One Player Core and one Enemy Core.
- 4 major intersections per V1 map.
- 3 mechanical enemy doors per major intersection.
- Randomized door opening order per intersection event.
- Time-based pressure scaling through enemy count/frequency.
- No enemy stat scaling by time.
- Core pressure waves.
- Enemy Core HP-threshold defense.
- Hero respawn after death.
- Coins-only BattleResult output.

### Hero
- Futuristic Gulf/Saudi tactical commander.
- Automatic tactical rifle.
- Wall system tool: Block Wall.
- Timed special weapon drop: Energy Burst Rifle.
- No dash.
- No Shock Grenade.
- No ultimate.

### Enemies
Exactly four enemy types:
1. Fast Swarm Crawler / Alien Hunter
2. Hunter Exosuit Trooper
3. Heavy Alien Brute
4. Breaker Bot

### Monetization / hearts
- Free users get 4 full-reward hearts.
- 1 heart = 1 full-reward quick match.
- After all 4 hearts are used, user waits 30 minutes.
- After 30 minutes, all 4 hearts refill together.
- Subscription/paywall removes/reduces the 30-minute wait and allows continuous/unlimited or much higher full-reward play.
- Exact Pro/Premium benefits are decided later with base-building/economy.

### Rewards
- Quick-round rewards connect to base-building through a flat `BattleResult`.
- V1 quick-round rewards are coins only.
- Base coin output: Win 100, Draw 50, Loss 25.
- Base-building consumes BattleResult, applies Pro 3x if applicable, blocks duplicate claims, and writes final coins.
- Avoid complex building-part reward logic in V1.
- Do not add quick-round gems, resources, English XP, progression XP, or reward multipliers.

## Explicitly excluded from V1

Do not build:
- Multiplayer.
- Multiple heroes.
- Extra enemy types beyond the locked four.
- Clans/alliance systems.
- Map creator.
- Advanced behavior-based AI Director.
- Advanced dynamic pathfinding.
- League-style tower gates/control nodes.
- Forced clearing checkpoints.
- Enemy Core shield/invincibility phases.
- Mid-combat English quiz interruptions.
- Gacha/lootbox gambling.
- Pay-to-win combat advantages.
- Fully polished final 3D before the playable loop works.
- Fully freeform wall placement.
- Complex rewards such as random building-part drops.
- Quick-round gems/resources/XP rewards.
- Quick-round Pro reward multipliers.
- Multiple special weapon types.
- Manual camera rotation or free zoom.

## Build philosophy

- Use placeholder/blockout assets first.
- Build one system at a time.
- Keep combat readable and testable.
- Prioritize a playable loop over visual polish.
- Keep mechanics simple enough for Codex/Uday to implement and test fast.
- Tune numbers after the first playable build.

## Definition of V1 success

V1 is successful if:
- The player can enter a quick round.
- The player can move, shoot, reload, and place walls.
- Intersections trigger randomized 3-door enemy encounters.
- Enemies follow their basic roles.
- Cores can take damage and determine win/loss.
- Enemy Core defense triggers at HP thresholds.
- Hero can die and respawn.
- Hearts are consumed/refilled correctly.
- A flat BattleResult is produced after match result.
- The game can run with placeholder assets.

## Center fight/drop zone included in V1

V1 includes a center fight/drop zone:
- larger than normal intersections
- open and spacious
- special weapon/drop zone
- 3 mechanical doors on perimeter/edge walls
- same randomized door sequence logic as intersections
- no doors blocking exit pathways
- no clutter inside the open center area
