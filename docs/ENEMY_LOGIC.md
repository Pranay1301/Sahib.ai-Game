# ENEMY_LOGIC.md

## Purpose

This file defines the V1 enemy roster, roles, stats, and behavior logic for Sahib AI quick rounds.

Use the phrase **enemy behavior logic**, not **enemy AI**, because no AI model or machine learning is used. Enemy behavior is hard-coded gameplay logic.

## V1 enemy roster

Exactly four enemy types exist in V1:

1. Fast Swarm Crawler / Alien Hunter
2. Hunter Exosuit Trooper
3. Heavy Alien Brute
4. Breaker Bot

Do not add extra enemy types in V1.

## Important role swap

The visual/gameplay role mapping was updated:

- The alien Fast Swarm Crawler visual/identity now becomes the main hero-pressure enemy.
- The Hunter Exosuit Trooper now becomes the Core/tower-pressure enemy.

Reason:
- The alien looks more intimidating and more fun to fight directly in PUBG/COD-style hero combat.
- The exosuit can function as a clearer Core/tower pressure unit.

## Updated weapon rule

All four V1 enemy types now use guns/ranged combat in fights.

This changes only the attack presentation and sprite/animation direction. It does not add new enemy types, new weapons as pickups, or extra combat systems.

Keep the current V1 damage values and role logic:
- Alien Hunter still pressures the hero.
- Hunter Exosuit still pressures Player Core/towers.
- Heavy Brute still pressures the hero and threatens walls.
- Breaker Bot still pressures the hero and prioritizes walls when walls exist.

The gun style should match each character identity:
- Alien Hunter uses an organic alien gun or bio-rifle.
- Hunter Exosuit uses a powered exosuit rifle/burst weapon.
- Heavy Brute uses a heavy oversized alien cannon or brute rifle.
- Breaker Bot uses an integrated mechanical breaker gun/tool cannon.

## Enemy role summary

| Enemy | Main role | Relationship with hero |
|---|---|---|
| Fast Swarm Crawler / Alien Hunter | Hero-pressure alien | Chases/rushes/shoots hero |
| Hunter Exosuit Trooper | Core/tower pressure | Mostly ignores hero and shoots Player Core/towers |
| Heavy Alien Brute | Heavy hero + wall pressure | Shoots hero, smashes or shoots walls if blocked |
| Breaker Bot | Wall breaker + hero pressure | Shoots hero, prioritizes walls if placed |

## Starting stats

These are prototype values and should be tuned after playtesting.

| Enemy | HP | Damage | Speed | Range | Main behavior |
|---|---:|---:|---:|---:|---|
| Fast Swarm Crawler / Alien Hunter | 30 | 6 per shot/burst hit | Fast | Short/medium gun range | Rushes and shoots hero |
| Hunter Exosuit Trooper | 100 | 8 per burst hit or Core/tower hit | Medium-fast | Medium gun range | Moves to Core/towers and shoots |
| Heavy Alien Brute | 220 | 20 heavy gun hit | Slow | Short/medium heavy gun range | Pressures hero/walls |
| Breaker Bot | 160 | 12 to hero / 40 to wall | Medium-slow | Short/medium breaker-gun range | Breaks walls, pressures hero |

## Enemy strength scaling

Enemy stats do not scale with time.

A Fast Swarm Crawler at minute 1 and minute 7 should have the same base stats. Difficulty increases through:
- more enemies
- faster pressure
- more overlap
- Core pressure waves
- HP-triggered Core defense waves

## Fast Swarm Crawler / Alien Hunter

### Role
Main hero-pressure alien.

### Behavior
- Actively chases the hero.
- Rushes aggressively.
- Shoots the hero with a short/medium-range alien gun in local intersection fights.
- Creates panic through fast movement and frequent ranged pressure.
- Forces player to shoot, move, and place tactical walls.

### Weapon identity
- Uses an organic alien gun or bio-rifle.
- Gun should feel aggressive and creature-like, not a clean military rifle.
- Damage stays 6 per shot/burst hit.

### Wall relationship
- Low/medium wall damage.
- If blocked, shoots/attacks wall or uses simple steering.

### Design feeling
“This alien is coming for me.”

## Hunter Exosuit Trooper

### Role
Core/tower-pressure enemy.

### Behavior
- Moves toward Player Core/towers.
- Mostly ignores hero unless blocked, attacked, or very close.
- Creates defend-vs-push tension.
- Pressures base with ranged burst fire while hero is fighting elsewhere.

### Weapon identity
- Uses a powered exosuit rifle or burst weapon.
- Gun should feel tactical, mechanical, and Core-pressure focused.
- Damage stays 8 per burst hit or Core/tower hit.

### Wall relationship
- Medium wall damage if blocked.
- If a wall blocks path to Core/tower, shoots/attacks wall.

### Visual identity
Human-piloted powered exosuit. Not a pure robot.

### Design feeling
“This enemy is trying to destroy my base.”

## Heavy Alien Brute

### Role
Heavy hero + wall pressure.

### Behavior
- Slow but dangerous.
- High HP.
- Shoots and pressures hero in local fights.
- Uses a heavy oversized gun with slow but powerful shots.
- Smashes or shoots walls if blocked.

### Weapon identity
- Uses a heavy alien cannon, brute rifle, or oversized organic firearm.
- Gun should feel slow, heavy, and powerful.
- Damage stays 20 per heavy gun hit.

### Wall relationship
- High wall damage.
- Should threaten walls and force repositioning.

### Design feeling
“This thing is slow, but if it reaches me, I am in trouble.”

## Breaker Bot

### Role
Wall breaker + hero pressure.

### Behavior
- Fully robotic AI enemy.
- Shoots hero normally if no wall exists.
- If wall is placed, prioritizes wall destruction.
- Punishes over-reliance on walls.

### Weapon identity
- Uses an integrated mechanical breaker gun or tool cannon.
- Gun should look like part weapon, part construction/demolition tool.
- Damage stays 12 to hero and 40 to wall.

### Wall relationship
- Very high wall damage.
- Should destroy walls faster than all other enemies.

### Visual identity
Fully robotic AI, no human pilot.

### Design feeling
“My wall is not safe anymore.”

## Chasing and following rules

If player runs through an intersection:
- Alien Hunter should chase and shoot hero.
- Brute can follow/pressure hero but may be slower.
- Breaker Bot can follow, shoot, or break walls if blocked.
- Hunter Exosuit mostly continues toward Player Core/towers and shoots them.

Do not build complex flanking or advanced pursuit logic in V1.

## Wall interaction rule

If enemy path is blocked:
- enemy shoots/attacks the wall, or
- uses simple steering if an obvious route exists.

Do not build advanced dynamic pathfinding.

## Enemy spawn contexts

### Local intersection fights
Main enemies:
- Alien Hunter
- Heavy Alien Brute
- Breaker Bot

These enemies mostly pressure the hero.

### Core pressure waves
Main enemy:
- Hunter Exosuit Trooper

These enemies mostly pressure Player Core/towers.

### Enemy Core defense
Use HP threshold waves from Core defense doors:
- 75%
- 50%
- 25%

Defense intensity depends on match phase.

## Do not add in V1
- Complex behavior-based AI Director.
- Smart flanking behavior.
- Cover-seeking enemy logic.
- Extra enemy types.
- Boss enemy.
- Flying enemies.
- Team tactics.
- Enemy stat scaling by time.

## Center fight zone enemy behavior

The center fight/drop zone has its own 3-door event.

Behavior rules:
- Center enemies mostly pressure the hero.
- Center should not rely on enemies walking from the four major intersections.
- If the player runs through the center, spawned enemies may chase/follow based on their normal behavior.
- Alien Hunter, Heavy Brute, and Breaker Bot are suitable for center pressure.
- Hunter Exosuit remains mainly Core/tower pressure unless specifically spawned as a defender.

Do not trigger inactive intersections automatically just because the player reaches the center or Enemy Core.
