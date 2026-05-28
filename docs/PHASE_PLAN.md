# PHASE_PLAN.md

## Purpose

This file is the execution plan for building Sahib AI V1 quick rounds with Codex/GPT-5.5.

Use this file when starting implementation. Codex should plan first, inspect the repo, then implement one phase at a time. Do not jump directly into broad coding.

## How Codex should use this file

Before coding:
1. Read `AGENTS.md`.
2. Read this `PHASE_PLAN.md`.
3. Read the relevant supporting docs for the phase being implemented.
4. Inspect the repo and existing structure.
5. Propose a small implementation plan for the current phase.
6. Build only the current phase or requested subtask.
7. Run available build/lint/test commands.
8. Report what changed, what was tested, and what remains.

## Repo docs to reference

- `AGENTS.md` — durable repo rules and do-not-build list.
- `docs/QUICK_ROUNDS.md` — full quick-round gameplay rules.
- `docs/MAP_LAYOUT.md` — map, intersections, doors, geometry.
- `docs/MAP_BLOCKOUT_SPEC.md` — exact functional map/blockout source of truth.
- `docs/HERO_COMBAT.md` — hero weapon, HP, respawn, special weapon drops.
- `docs/ENEMY_LOGIC.md` — enemy roles, stats, behavior logic.
- `docs/WALL_SYSTEM.md` — wall tools, collision, controlled placement, pathing simplification.
- `docs/CORE_DEFENSE.md` — Core HP, win/loss, Enemy Core defense.
- `docs/REWARDS_BRIDGE.md` — rewards and base-building bridge.
- `docs/V1_SCOPE.md` — what is in/out of V1.
- `docs/VISUAL_IDENTITY.md` — art/asset direction.
- `docs/TASKS.md` — task checklist.

## Global V1 constraints

Do not build:
- Multiplayer.
- Multiple heroes.
- Extra enemies beyond the four locked enemy types.
- Mid-combat English quiz.
- Dash/Tactical Slide.
- Shock Grenade.
- Ultimate ability.
- Advanced behavior-based AI Director.
- Advanced dynamic pathfinding.
- League-style control nodes, tower gates, or forced clearing checkpoints.
- Enemy Core shield/invincibility phases.
- Gacha/lootbox gambling.
- Pay-to-win combat advantages.
- Final polished 3D before the core playable loop works.

## Build philosophy

- Build the smallest playable loop first.
- Use placeholder/blockout assets first.
- Keep systems modular.
- Keep enemy behavior simple and hard-coded.
- Use “enemy behavior logic,” not “enemy AI.”
- Prioritize testability over polish.
- Tune numbers after the first playable build.
- Do not rewrite working systems without a clear reason.

---

# Phase 0 — Repo inspection and setup

## Goal

Understand the existing codebase before making changes.

## Codex tasks

1. Inspect repo structure.
2. Identify engine/framework stack.
3. Identify existing game scene/component structure.
4. Identify build/test/lint commands.
5. Identify where gameplay constants should live.
6. Identify where docs should be placed.
7. Report any missing setup.

## Done when

- Codex can explain repo layout.
- Codex knows where to implement quick-round logic.
- Codex knows how to run/build/test the app.
- No code changes are made unless explicitly needed for setup.

---

# Phase 1 — Core quick-round shell

## Goal

Create the minimum 8-minute Core-vs-Core match shell.

## Latest confirmed rules

- Match duration: 8 minutes.
- Landscape/horizontal isometric format.
- Player wins instantly when Enemy Core is destroyed.
- Player loses instantly when Player Core is destroyed.
- If timer ends, higher remaining Core HP percentage wins.
- If still tied by HP percentage, total Core damage dealt wins.
- If still tied, draw/reduced reward.
- No sudden death in V1.

## Codex tasks

1. Create/load quick-round scene.
2. Add match timer.
3. Add Player Core and Enemy Core placeholder objects.
4. Add Core HP values:
   - Player Core: 1000 HP.
   - Enemy Core: 1000 HP.
5. Add win/loss/timer-end logic.
6. Add basic result state: win/loss/draw.
7. Add debug display for timer and Core HP.

## Done when

- Match starts.
- Timer counts down from 8 minutes.
- Cores can receive damage.
- Core destruction ends match instantly.
- Timer-end rules work.
- Result state displays correctly.

---

# Phase 2 — Hero movement and rifle combat

## Goal

Make the hero playable with basic rifle combat.

## Latest confirmed rules

- Hero is a futuristic Gulf/Saudi tactical commander.
- Hero HP: 100.
- Default weapon: automatic tactical rifle.
- Suggested rifle name: Falcon-7 Tactical Rifle or Sahib AR-7 Tactical Rifle.
- Magazine: 30 bullets.
- Reserve ammo: unlimited.
- Damage: 10 per bullet to enemies.
- Damage to Enemy Core: 5 per bullet.
- Fire rate: 11 bullets/sec for an M416-like fast tactical rifle feel.
- Reload: 1.8 seconds.
- No dash.
- No Shock Grenade.
- No ultimate.

## Codex tasks

1. Add hero placeholder.
2. Add movement controls.
3. Add fixed landscape-isometric camera following hero.
4. Add rifle fire.
5. Add magazine/reload.
6. Add damage application to enemies and Enemy Core.
7. Add simple hit feedback/debug damage numbers.
8. Add hero HP.
9. Add hero death state.

## Done when

- Hero moves smoothly.
- Hero can shoot.
- Rifle consumes magazine bullets.
- Reload works.
- Hero can damage Enemy Core.
- Hero HP can decrease.
- Hero death can be detected.

---

# Phase 3 — Hero respawn

## Goal

Add hero death/respawn without ending the match.

## Latest confirmed rules

- Hero death does not end match.
- Hero respawns after 5 seconds near Player Core.
- Death penalty is time loss + score penalty.
- No heart lost on hero death.

## Codex tasks

1. Add 5-second respawn timer.
2. Move hero to Player Core respawn point.
3. Restore hero HP after respawn.
4. Keep Core damage and enemies alive.
5. Add debug death count.
6. Add score penalty hook for later match stats/tuning.

## Done when

- Hero dies.
- Hero respawns after 5 seconds near Player Core.
- Match continues.
- Core states remain unchanged.

---

# Phase 4 — Map blockout and intersections

## Goal

Create V1 map blockout with 4 major intersections.

## Latest confirmed rules

- V1 map uses 4 major intersections.
- Intersections are danger zones, not locked checkpoints.
- No hard gates/control nodes.
- Intersection shape: rounded square with slight diamond influence.
- Each intersection supports 3 mechanical enemy doors.
- Player can run, dodge, escape, and choose paths.

## Codex tasks

1. Build placeholder map layout.
2. Add Player Core and Enemy Core locations.
3. Add 4 major intersection zones.
4. Use rounded-square/soft-diamond geometry.
5. Add perimeter-wall placeholder structure.
6. Add safe navigation routes between zones.
7. Add no hard gates.

## Done when

- Hero can move from Player Core toward Enemy Core.
- Map has 4 major intersections.
- Intersections have enough space for movement and later wall placement.
- No forced clear/checkpoint logic exists.

---

# Phase 5 — Mechanical enemy doors and randomized intersection encounters

## Goal

Add randomized 3-door encounter logic for each major intersection.

## Latest confirmed rules

- Use mechanical enemy doors, not magical portals.
- Each major intersection has 3 doors:
  - front
  - side
  - rear/diagonal
- Doors attach to perimeter walls.
- Hero entering intersection trigger zone activates the sequence.
- Trigger radius: about 8m.
- All 3 doors open in sequence.
- Door order is randomized every time.
- Doors open 2-3 seconds apart.
- Full sequence is about 5-7 seconds.
- 20-second cooldown per intersection.
- No formal warning system; natural door animation/sound/glow only.

## Codex tasks

1. Add 3 door objects per intersection.
2. Add trigger zone around each intersection.
3. Add 8m trigger radius constant.
4. Add reusable Fisher-Yates door sequence randomizer.
5. Add anti-repeat rule to avoid same first door twice in a row for the same intersection when possible.
6. Add optional seeded randomness for developer/testing mode.
7. Add 2-3 second sequence timing.
8. Add 20-second cooldown per intersection.
9. Spawn placeholder enemies from opened doors.
10. Add debug logs for door order and seed when debug mode is used.

## Done when

- Entering an intersection opens all 3 doors.
- Door order is random.
- Door sequence timing works.
- Re-entering during cooldown does not spam.
- After cooldown, intersection can trigger again.
- No formal warning UI appears.

---

# Phase 5B — Center fight/drop zone

## Goal

Add the center as a larger special intersection and drop zone.

## Latest confirmed rules

- Center has its own fight logic.
- Center should not rely on enemies walking from the four intersections.
- Center has 3 mechanical doors.
- Center doors use the same randomized sequence logic as intersections.
- Center doors are placed on inner/perimeter edge walls, not exit pathways.
- Center remains open and spacious for movement, wall placement, and the special weapon drop.
- If player runs through center, the event still triggers and enemies may chase.
- Center event should use a cooldown to prevent spam retriggers.

## Codex tasks

1. Add center trigger zone.
2. Add 3 center mechanical doors.
3. Place center doors away from all four exit pathways.
4. Use the same reusable door sequence randomizer as intersections.
5. Add anti-repeat first-door rule for the center zone when possible.
6. Support optional seeded randomness for testing/debugging.
7. Use 2-3 second door sequence gaps.
8. Spawn hero-pressure enemies from center doors.
9. Keep center drop zone empty and readable.
10. Add cooldown for center event.

## Done when

- Center event triggers when hero enters center.
- All 3 center doors can open in randomized sequence.
- Doors do not block exit paths.
- Center remains open for movement/walls/drop.
- Enemies pressure/chase hero if player runs through.

---

# Phase 6 — Enemy roster and basic behavior logic

## Goal

Implement the four locked enemy types with simple hard-coded behavior.

## Latest confirmed enemy roles

1. Fast Swarm Crawler / Alien Hunter
   - Main hero-pressure alien.
   - Chases/rushes/shoots hero.
   - Uses an organic alien gun or bio-rifle.

2. Hunter Exosuit Trooper
   - Core/tower pressure enemy.
   - Mostly ignores hero and moves toward Player Core/towers.
   - Uses a powered exosuit rifle/burst weapon.

3. Heavy Alien Brute
   - Heavy hero + wall pressure.
   - Shoots hero and smashes or shoots walls if blocked.
   - Uses a heavy alien cannon, brute rifle, or oversized organic firearm.

4. Breaker Bot
   - Wall breaker + hero pressure.
   - Shoots hero, prioritizes walls if placed.
   - Uses an integrated mechanical breaker gun/tool cannon.

All four V1 enemy types now use guns/ranged attacks. Keep the existing damage values and behavior roles; the weapon update changes presentation, animation, range feel, and effects rather than enemy roster or stat scaling.

## Starting stats

| Enemy | HP | Damage | Speed | Range |
|---|---:|---:|---:|---:|
| Alien Hunter | 30 | 6 per shot/burst hit | Fast | Short/medium gun |
| Hunter Exosuit | 100 | 8 per burst/core hit | Medium-fast | Medium |
| Heavy Brute | 220 | 20 heavy gun hit | Slow | Short/medium heavy gun |
| Breaker Bot | 160 | 12 hero / 40 wall | Medium-slow | Short/medium breaker gun |

## Codex tasks

1. Add enemy data/constants.
2. Add Alien Hunter chase/attack hero behavior.
3. Add Hunter Exosuit path-to-Player-Core behavior.
4. Add Heavy Brute attack hero/wall behavior.
5. Add Breaker Bot wall-priority behavior.
6. Add simple attack ranges and cooldowns.
7. Add enemy HP/damage.
8. Add simple death/despawn logic.

## Done when

- Each enemy spawns.
- Each enemy follows its assigned role.
- Enemy stats do not scale with time.
- No advanced behavior director exists.
- No complex flanking/cover-seeking exists.

---

# Phase 7 — Time phases and enemy count scaling

## Goal

Connect match time to pressure level and enemy count.

## Latest confirmed rules

Time controls:
- enemy count
- spawn frequency
- event overlap
- chaos level

Time does not control:
- exact door location
- enemy identity
- individual enemy strength
- number of doors

## Match phases

- Opening/contact: 0:00-0:45
- Early fight: 0:45-2:00
- Mid fight: 2:00-5:30
- Final chaos: 5:30-8:00

## Baseline enemy count table

- Opening/contact: 1,1,2 = 4 total
- Early fight: 2,2,2 = 6 total
- Mid fight: 3,3,3 = 9 total
- Final chaos: 4,4,4 = 12 total

## Codex tasks

1. Add phase calculation from match timer.
2. Add enemy count table.
3. Use enemy count table for intersection door spawns.
4. Add optional intense table behind debug flag/config if helpful.
5. Add debug display/log of current phase and spawn count.

## Done when

- Current phase is calculated correctly.
- Door events spawn correct enemy counts.
- Enemy stats remain unchanged across phases.
- Pressure increases through quantity, not stat changes.

---

# Phase 8 — Core pressure waves

## Goal

Add time-based Core pressure separate from local intersection fights.

## Latest confirmed rules

- Core pressure waves are separate from intersection fights.
- They pressure Player Core/towers.
- Hunter Exosuit Trooper is now the Core/tower-pressure enemy after role swap.
- Core pressure starts after opening/contact phase.
- Pressure scales through count/frequency, not stat scaling.

## Codex tasks

1. Add Core pressure wave scheduler.
2. Prevent Core pressure in first 45 seconds.
3. Spawn Hunter Exosuit Troopers or approved Core-pressure units.
4. Make them move toward Player Core/towers.
5. Tune wave counts by phase.
6. Ensure this does not trigger all intersections automatically.

## Done when

- Core pressure starts after 0:45.
- Core-pressure enemies move toward Player Core/towers.
- Player must decide push vs defend.
- Local intersection fights remain separate.

---

# Phase 9 — Wall system V1

## Goal

Add simple, reliable wall tools without advanced pathfinding.

## Latest confirmed rules

- Wall tool: Block Wall.
- Block Wall HP: 180.
- Sand Trap slow-zone mechanics removed from active V1.
- 3 active wall/tool charges.
- 1 charge refills every 10 seconds.
- Use controlled free placement in limited range from the hero.
- No unlimited map-wide placement.
- Walls block bullets and movement.
- If enemies are blocked, they attack wall or use simple steering.
- Do not build advanced dynamic pathfinding.
- Turn Wall is removed from the active V1 quick-round tool set.

## Codex tasks

1. Add controlled free placement.
2. Add green/red placement preview.
3. Add Block Wall.
4. Removed: Sand Trap slow zone is no longer active.
5. Add wall HP/damage/destruction.
6. Add collision blocking movement.
7. Add bullet blocking.
8. Add enemy blocked-by-wall reaction.
9. Add no-placement zones around doors/Core.

## Done when

- Player can place walls only in valid free-placement positions.
- Walls block movement and bullets.
- Walls take damage and can be destroyed.
- Breaker Bot destroys walls fastest.
- Brute damages walls strongly.
- Enemies do not require advanced pathfinding.
- No wall can seal doors or fully surround Core.

---

# Phase 10 — Enemy Core defense

## Goal

Make Enemy Core attackable anytime but not easy to destroy.

## Latest confirmed rules

- Enemy Core HP: 1000.
- Player Core HP: 1000.
- Enemy Core lightly shoots hero while attacked/in range.
- Enemy Core defense is HP-triggered, not location-triggered.
- Defense thresholds: 75%, 50%, 25%.
- Time phase modifies defense intensity.
- Defense enemies spawn from enemy-base/Core defense doors, preferably 2 side doors.
- No shield phases.
- No invincibility.
- No forced clearing/gate system.

## Codex tasks

1. Add Enemy Core light attack.
2. Add HP threshold trigger system.
3. Ensure each threshold fires once.
4. Add Core defense doors.
5. Spawn defense waves from doors.
6. Modify wave intensity by current phase.
7. Ensure Core remains always attackable.

## Done when

- Enemy Core can be damaged anytime.
- Threshold waves trigger at 75/50/25 once.
- Enemy Core shoots lightly.
- No shield/invincibility exists.
- Destroying Enemy Core wins instantly.

---

# Phase 11 — Timed special weapon drop

## Goal

Add one limited-ammo power pickup for dopamine/clutch moments.

## Latest confirmed rules

- Special weapons are timed pickups only.
- Default weapon remains tactical rifle.
- Start with Energy Burst Rifle only.
- Drop around 2:30 and 5:30.
- 12 shots.
- 35 damage to enemies.
- 12 damage to Enemy Core.
- No reload.
- Disappears when ammo ends.
- Do not spawn beside Player Core or Enemy Core.

## Codex tasks

1. Add pickup spawn times.
2. Add pickup placement near center/intersection-adjacent zones.
3. Add collect interaction.
4. Temporarily swap to Energy Burst Rifle.
5. Track 12 shots.
6. Remove special weapon when ammo ends.
7. Return to default rifle.

## Done when

- Special pickup appears at correct times.
- Hero can collect it.
- Ammo is limited.
- Weapon disappears after ammo ends.
- It does not replace the main rifle permanently.

---

# Phase 12 — Hearts, rewards, and result flow

## Goal

Add quick-round play economy and result/reward output.

## Latest confirmed rules

- Free users get 4 full-reward hearts.
- 1 heart = 1 full-reward quick match.
- After all 4 hearts are used, wait 30 minutes.
- After 30 minutes, all 4 hearts refill together.
- Pro/subscription removes the wait and supports unlimited/no-wait quick battles.
- Quick-round rewards are coins only.
- Win = 100 base coins.
- Draw = 50 base coins.
- Loss = 25 base coins.
- Do not add quick-round gems, resources, English XP, progression XP, or reward multipliers.
- Pro 3x is applied later by base-building/subscription, not by quick-round combat.
- Quick round produces `BattleResult`; base-building consumes it, blocks duplicate claims, and writes final coins.

## Codex tasks

1. Add heart state.
2. Consume 1 heart when full-reward match starts.
3. Start 30-minute refill timer when hearts reach 0.
4. Refill all 4 hearts after timer.
5. Add result screen.
6. Add `BattleResult` adapter from ended match state.
7. Add fixed coins-only base output.
8. Add quit/force-close handling.
9. Add placeholder handoff bridge to base-building.

## Done when

- Hearts are consumed correctly.
- All 4 refill together after 30 minutes.
- Match result exposes the correct fixed base coins.
- Quit/force-close consumes heart if match started.
- Reward bridge is flat, coins-only, and testable.

---

# Phase 13 — Visual/blockout upgrade pass

## Goal

Improve visual readability without delaying the playable loop.

## Latest confirmed visual rules

- World: surreal pink/purple alien environment.
- Buildings: realistic Gulf/Saudi/Dubai/KAFD-inspired futuristic structures.
- Aliens: darker organic alien look, distinct from world, no crystals.
- Robots/exosuits: black/gunmetal with red/purple warning accents.
- Hunter Exosuit is human-piloted but Core-pressure role.
- Breaker Bot is fully robotic, no human pilot.
- Doors are mechanical blast/sliding doors, not magical portals.

## Codex tasks

1. Keep placeholders if final assets are not ready.
2. Ensure enemy silhouettes are readable.
3. Ensure doors are visually clear.
4. Ensure walls are visually clear.
5. Ensure Core HP and match state are readable.
6. Do not add final heavy 3D assets until performance is acceptable.

## Done when

- Combat elements are readable.
- Placeholder assets support testing.
- No final-asset dependency blocks gameplay.

---

# Phase 14 — Testing and tuning

## Goal

Balance and stabilize the playable V1 loop.

## Codex tasks

1. Test 8-minute match flow.
2. Test every win/loss path.
3. Test every phase.
4. Test intersection triggers.
5. Test randomized door order.
6. Test wall placement and destruction.
7. Test enemy roles.
8. Test Core defense thresholds.
9. Test hero respawn.
10. Test hearts/refill.
11. Test special weapon drops.
12. Track performance.

## Tune after testing

Tune only after the system works:
- hero HP
- enemy HP/damage/speed
- Core HP
- wall HP
- enemy count table
- Core defense waves
- special weapon damage/ammo
- reward amounts
- heart/subscription pressure

## Done when

- A full V1 quick round can be played repeatedly.
- No core system breaks the loop.
- The game is fun enough to test with real users.
- The implementation matches docs.
