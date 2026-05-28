# QUICK_ROUNDS.md

## Purpose

Sahib AI V1 quick rounds are fast, dopamine-focused, landscape-isometric Core-vs-Core battles.

Quick rounds are pure combat/action. Do not place English quiz questions inside the battle. English learning/progression should sit outside the quick battle, likely in base-building/progression or post-match reporting.

## Core loop

Quick battle -> BattleResult -> base-building coin claim -> repeat.

Quick-round combat only produces the BattleResult. Base-building consumes it and awards final coins.

## Match format

- Camera/gameplay format: landscape/horizontal isometric.
- Match duration: 8 minutes.
- Player controls one hero.
- Objective: destroy Enemy Core while protecting Player Core.
- V1 map uses 4 major intersections.
- Intersections trigger randomized mechanical enemy-door encounters.
- Time increases pressure through enemy count, spawn frequency, and overlap.
- Enemy stats do not scale with time.

## Hearts and playtime

- Free users get 4 full-reward hearts.
- 1 heart = 1 full-reward quick match.
- After all 4 hearts are used, user waits 30 minutes.
- After 30 minutes, all 4 hearts refill together.
- Pro/subscription removes the wait and supports unlimited/no-wait quick battles.
- Pro 3x is applied by base-building/subscription after the quick round returns BattleResult.

## Win/loss rules

| Situation | Result |
|---|---|
| Enemy Core destroyed | Player wins instantly |
| Player Core destroyed | Player loses instantly |
| 8-minute timer ends | Higher remaining Core HP percentage wins |
| Same Core HP percentage | Total Core damage dealt wins |
| Still tied | Draw/reduced reward |
| Sudden death | Not in V1 |

## Match phases

| Phase | Time | Purpose |
|---|---:|---|
| Opening/contact | 0:00-0:45 | Exploration-to-contact, no base-defense panic |
| Early fight | 0:45-2:00 | First real pressure |
| Mid fight | 2:00-5:30 | Stronger map-control fights |
| Final chaos | 5:30-8:00 | Highest pressure and Core tension |

## Opening/contact rules

The first 45 seconds should feel like exploration-to-contact, similar to moving forward in a TDM match.

Rules:
- Player moves forward.
- Map curiosity begins.
- First intersection fight can trigger if player reaches it.
- No enemies should already be attacking Player Core.
- No heavy Core pressure.
- No direct Core rush.

## Map and movement philosophy

Quick rounds should preserve PUBG/TDM-style freedom of movement.

Rules:
- No hard gates.
- No control nodes.
- No League-style tower locks.
- No mandatory checkpoint clearing before moving deeper.
- Player can run, dodge, escape, and choose routes.
- Routes naturally pass through dangerous intersections.
- Running away does not remove danger; it relocates or stacks pressure.

## Intersection system

Intersections are danger zones, not locked checkpoints.

When the hero enters a major intersection:
1. That intersection's 3 nearby mechanical enemy doors become relevant.
2. All 3 doors open in sequence.
3. Door order is randomized every time.
4. Enemies spawn from different angles.
5. Local fight pressure begins.

## Intersection shape

Use a rounded square intersection with slight diamond influence.

Do not use:
- pure circle
- pure white diamond
- cramped square

Reasons:
- better movement flow
- better wall placement
- better readability in isometric view
- better multi-angle combat
- better door placement on perimeter walls

## Door system

Use mechanical enemy doors, not magical portals.

Each major intersection has 3 nearby enemy doors attached to perimeter walls.

Recommended door positions:
- Front door
- Side door
- Rear/diagonal door

Rules:
- Doors are visible on the map.
- Player knows the area is dangerous.
- Player does not know which door opens first.
- Doors open like mechanical blast doors / maze doors.
- No formal warning system in V1.
- Natural door animation/sound/glow is enough.

## Door sequence randomness

When an intersection is triggered:

| Rule | Decision |
|---|---|
| All 3 doors open | Yes |
| Simultaneous opening | No |
| Sequential opening | Yes |
| Fixed order | No |
| Randomized order every trigger | Yes |
| Gap between doors | 2-3 seconds |
| Full sequence duration | Around 5-7 seconds |

Example possible sequences:
- Side -> Front -> Rear
- Rear -> Side -> Front
- Front -> Rear -> Side

Rule: the player should know an intersection is dangerous, but should not be able to predict the door order.

## Trigger rules

- Hero entering an intersection trigger zone starts the door sequence.
- Starting trigger radius: 8m around the intersection center.
- Add a 20-second cooldown per intersection to prevent spam retriggers.
- If the player runs through the intersection, the event still triggers.
- Enemies may spawn behind/around the intersection and some may chase/follow depending on enemy type.

## Time + location spawn logic

| System | Controls |
|---|---|
| Player location | Which intersection door cluster activates |
| Time | Enemy count, spawn frequency, pressure/chaos |
| Core HP | Enemy Core defense waves |

Time does not decide exact door location. Location decides where danger appears.

## What time controls

Time controls:
- enemy count
- spawn frequency
- event overlap
- overall chaos

Time does not control:
- enemy identity
- individual enemy strength
- number of doors in an intersection event
- door sequence order

Main rule: time increases pressure through volume and frequency, not hidden enemy stat scaling.

## Enemy count baseline

Start with this table. Increase only if testing feels too easy.

| Phase | Time | Enemy count per door | Total from 3 doors |
|---|---:|---:|---:|
| Opening/contact | 0:00-0:45 | 1, 1, 2 | 4 |
| Early fight | 0:45-2:00 | 2, 2, 2 | 6 |
| Mid fight | 2:00-5:30 | 3, 3, 3 | 9 |
| Final chaos | 5:30-8:00 | 4, 4, 4 | 12 |

Optional more intense table for testing:

| Phase | Time | Enemy count per door | Total from 3 doors |
|---|---:|---:|---:|
| Opening/contact | 0:00-0:45 | 1, 2, 2 | 5 |
| Early fight | 0:45-2:00 | 2, 2, 3 | 7 |
| Mid fight | 2:00-5:30 | 3, 4, 4 | 11 |
| Final chaos | 5:30-8:00 | 4, 5, 5 | 14 |

## Spawn frequency

Enemy count = how many enemies come out per door/event.

Spawn frequency = how often a new pressure event/Core wave is allowed.

V1 should keep this simple:
- Location-triggered intersection events happen when player enters an intersection.
- Time-based Core pressure waves happen separately.
- Do not automatically spawn enemies from all intersections at once.

## Two-layer combat system

| Layer | Trigger | Purpose |
|---|---|---|
| Local intersection fights | Player movement/location | Hero pressure, PUBG-style fights |
| Core pressure waves | Time | Defend-vs-push pressure |

Intersection fights happen around the hero. Core pressure waves threaten the Player Core. These layers can overlap later in the match.

## Enemy roster

V1 has exactly four enemy types:

| Enemy | Type | Main role |
|---|---|---|
| Fast Swarm Crawler / Alien Hunter | Alien | Main hero-pressure enemy |
| Hunter Exosuit Trooper | Human-piloted exosuit | Core/tower pressure enemy |
| Heavy Alien Brute | Alien | Heavy hero + wall pressure |
| Breaker Bot | Full AI robot | Wall breaker + hero pressure |

Use “enemy behavior logic,” not “enemy AI,” because no AI model is used.

All four V1 enemies now use guns/ranged attacks in combat:
- Alien Hunter uses an organic alien gun or bio-rifle.
- Hunter Exosuit Trooper uses a powered exosuit rifle/burst weapon.
- Heavy Alien Brute uses a heavy alien cannon or brute rifle.
- Breaker Bot uses an integrated mechanical breaker gun/tool cannon.

This keeps existing enemy roles and damage values; it changes attack presentation, animation, and combat readability.

## Enemy targeting overview

| Enemy | Main target |
|---|---|
| Fast Swarm Crawler / Alien Hunter | Hero |
| Hunter Exosuit Trooper | Player Core/towers |
| Heavy Alien Brute | Hero, and walls if blocked |
| Breaker Bot | Hero, but prioritizes walls if placed |

## Core pressure waves

Core pressure waves:
- are time-based
- begin after opening/contact phase
- move toward Player Core/towers
- scale through count/frequency
- force defend-vs-push decisions

Hunter Exosuit Trooper is now the main Core/tower-pressure enemy after the role swap.

## If player rushes past intersections

If player runs through an intersection:
- the intersection event still triggers
- enemies spawn behind/around the intersection
- some enemies may chase/follow depending on type
- if player enters another intersection, that new intersection can also trigger
- no hard stop, but pressure can stack

## Hero combat summary

- Hero: futuristic Gulf/Saudi tactical commander.
- Default weapon: automatic tactical rifle.
- No dash/tactical slide in V1.
- No Shock Grenade in V1.
- No ultimate in V1.
- Hero actions: Rifle Fire + Wall System tools only.
- Hero HP: 100.
- Respawn: 5 seconds near Player Core.
- Death does not end match.
- Death penalty: time loss + score penalty; no heart lost on death.

## Timed special weapon drops

Special high-power weapons are allowed only as timed pickups.

V1 recommendation:
- One special weapon: Energy Burst Rifle.
- Drops around 2:30 and 5:30.
- 12 shots.
- 35 damage to enemies.
- 12 damage to Enemy Core.
- No reload.
- Disappears when ammo ends.

## Core defense summary

- Player Core HP: 1000.
- Enemy Core HP: 1000.
- Enemy Core lightly shoots hero while being attacked/in range.
- Enemy Core defense is HP-triggered, not location-triggered.
- Thresholds: 75%, 50%, 25% Enemy Core HP.
- Time phase modifies intensity: early light, mid medium, final strongest.
- Defense enemies spawn from nearby enemy-base/Core defense doors, preferably 2 side doors for V1.
- No shield phases or invincibility.

## Rewards and BattleResult

Quick-round rewards feed base-building through a flat BattleResult object.

V1 quick-round rewards are coins only:
- Win: 100 base coins.
- Draw: 50 base coins.
- Loss: 25 base coins.

Do not implement quick-round gems, resources, English XP, progression XP, or reward multipliers.

Quick-round combat does not directly award coins to the user's base wallet and does not write economy rows to Supabase.

Base-building consumes BattleResult, blocks duplicate claims, applies Pro 3x if applicable, and writes final coins.

## App behavior

- If match starts and player force-closes/quits, consume heart and likely count as loss.
- Single-player can allow pause.
- App interruption should auto-pause if possible.

## V1 exclusions

Do not add:
- multiplayer
- multiple heroes
- extra enemy types
- mid-combat English quiz
- advanced behavior-based AI Director
- advanced dynamic pathfinding
- League-style gates/control nodes
- enemy Core shield phases
- random item drops besides timed special weapon

## Center fight/drop zone

The center is a larger special intersection/fight zone, not just an empty shortcut.

Confirmed rules:
- The center has its own fight logic.
- The center should not rely on enemies walking from the four intersections, because that can be too slow.
- The center has 3 mechanical doors.
- Center doors use the same randomized sequence system as major intersections.
- Center doors open in randomized order with 2-3 second gaps.
- Center enemies mostly pressure the hero.
- If the player runs through the center, the center event still triggers and enemies may chase.
- The center remains open and spacious for movement, wall placement, and the special weapon drop.
- Do not place doors in the center’s four exit pathways.
- Do not place clutter/objects in the open center drop zone.

The center should behave like a bigger special intersection. The main difference is size and importance: it is the central fight/drop zone.

## Door sequence randomizer implementation

Use one reusable door sequence randomizer for both:
- the 4 major intersections
- the center fight/drop zone

Every zone has 3 mechanical doors. When the zone triggers, collect those 3 doors, shuffle them, and open them in the shuffled order with 2-3 seconds between doors.

Recommended implementation:
- Use Fisher-Yates shuffle or an equivalent unbiased array shuffle.
- For 3 doors, there are 6 possible orders:
  1. Front -> Side -> Rear
  2. Front -> Rear -> Side
  3. Side -> Front -> Rear
  4. Side -> Rear -> Front
  5. Rear -> Front -> Side
  6. Rear -> Side -> Front
- Regenerate the sequence every time the zone triggers.
- Regenerate after hero death/respawn if the same zone is triggered again.
- Avoid repeating the same first door twice in a row for the same zone when possible.
- In developer/testing mode, allow seeded randomness so the same encounter sequence can be reproduced while debugging.
- Normal gameplay should use normal randomness.

This is not complex enemy AI. It is a small reusable sequence randomizer.
