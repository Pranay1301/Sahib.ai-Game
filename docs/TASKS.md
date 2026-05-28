# TASKS.md

## Purpose

This file gives a practical implementation order for Sahib AI V1 quick rounds.

## Development principle

Build the smallest playable loop first. Do not build everything at once.

## Phase 1: Core playable loop

Goal: player can enter a match, move, shoot, damage enemies/Core, and end match.

Tasks:
1. Set up quick-round scene.
2. Add landscape isometric camera.
3. Add hero movement.
4. Add rifle shooting.
5. Add reload/magazine.
6. Add Player Core and Enemy Core.
7. Add Core HP.
8. Add win/loss timer rules.
9. Add hero death/respawn.

Done when:
- player can play a basic 8-minute match
- Core destruction ends match
- timer-end logic works

## Phase 2: Intersections and doors

Goal: randomized 3-door encounters work.

Tasks:
1. Build blockout map with 4 major intersections.
2. Add rounded-square/soft-diamond intersection geometry.
3. Add 3 mechanical doors per intersection.
4. Add 8m trigger zones.
5. Add reusable Fisher-Yates door sequence randomizer.
6. Add anti-repeat first-door rule where possible.
7. Add optional seeded randomness for developer/testing mode.
8. Add 2-3 sec door sequence gap.
9. Add 20-sec per-intersection retrigger cooldown.
10. Add baseline enemy count table.

Done when:
- entering an intersection triggers all 3 doors
- order is random
- sequence does not spam repeatedly

## Phase 2B: Center fight/drop zone

Goal: center becomes a larger special intersection/drop zone.

Tasks:
1. Add open center trigger zone.
2. Add 3 mechanical center doors.
3. Place doors on perimeter/edge walls, not exit pathways.
4. Use same reusable door sequence randomizer as intersections.
5. Add anti-repeat first-door rule where possible.
6. Add optional seeded randomness for developer/testing mode.
7. Add 2-3 sec door sequence gap.
8. Spawn hero-pressure enemies from center doors.
9. Keep center area empty for movement, walls, and special weapon drop.
10. Add center event cooldown.

Done when:
- entering center triggers the center door event
- center doors do not block exits
- center remains open and spacious
- enemies can chase if player runs through

## Phase 3: Enemy behavior logic

Goal: four enemy types follow simple roles.

Tasks:
1. Add Alien Hunter hero-pressure behavior.
2. Add Hunter Exosuit Core/tower pressure behavior.
3. Add Heavy Brute hero/wall pressure behavior.
4. Add Breaker Bot wall-priority behavior.
5. Add starting enemy stats.
6. Add simple chase/attack behavior.
7. Add simple wall-blocked behavior.

Done when:
- enemies match documented roles
- no advanced behavior director exists
- enemy stats do not scale with time

## Phase 4: Wall system

Goal: wall tools work simply and reliably.

Tasks:
1. Add Block Wall as destructible collision object.
2. Removed. Sand Trap slow-zone mechanics are no longer active; Block Wall is the V1 tactical system.
3. Add controlled free placement.
5. Add green/red preview.
6. Add no-placement zones.
7. Add wall HP/damage.
8. Add enemy attacks wall if blocked.

Done when:
- walls block movement and bullets
- walls can be destroyed
- invalid placement is rejected
- no advanced dynamic pathfinding is needed

## Phase 5: Core pressure and Core defense

Goal: base-defense pressure exists.

Tasks:
1. Add time-based Core pressure waves.
2. Add Enemy Core HP threshold defense at 75/50/25%.
3. Add Core defense doors near Enemy Core.
4. Add Enemy Core light attack.
5. Add defense waves modified by time phase.

Done when:
- Core pressure creates defend-vs-push decision
- Enemy Core is hard but always attackable
- no shield/invincibility exists

## Phase 6: Special timed weapon drop

Goal: one special weapon drop creates dopamine spike.

Tasks:
1. Add Energy Burst Rifle pickup.
2. Drop at around 2:30 and 5:30.
3. Add 12-shot ammo.
4. Add higher damage.
5. Remove weapon after ammo ends.
6. Ensure it does not spawn beside Player Core or Enemy Core.

Done when:
- pickup is collectable
- ammo-limited
- does not replace default rifle permanently

## Phase 7: Hearts, rewards, and result screen

Goal: quick-round completion connects to progression.

Tasks:
1. Add 4-heart full-reward system.
2. Add heart consumption at match start.
3. Add 30-minute refill of all 4 hearts after depletion.
4. Add flat `BattleResult` output.
5. Add coins-only base reward values.
6. Use fixed base coins: Win 100, Draw 50, Loss 25.
7. Keep Pro 3x and duplicate claim protection in base-building, not quick-round combat.
8. Add quit/force-close behavior.

Done when:
- hearts work
- quick round returns a flat `BattleResult`
- base coins are correct
- result is clear

## Phase 8: Polish and tuning

Goal: make the loop feel good.

Tasks:
1. Tune enemy counts.
2. Tune HP/damage values.
3. Tune wall HP/refill.
4. Tune Core HP.
5. Add hit feedback.
6. Add simple audio cues.
7. Improve camera smoothing.
8. Replace placeholders gradually.

Do not start final 3D polish before the gameplay loop is working.
