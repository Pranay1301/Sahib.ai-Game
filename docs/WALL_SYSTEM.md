# WALL_SYSTEM.md

## Purpose

The wall system is one of Sahib AI V1's signature mechanics. It gives the hero tactical cover and limited path control during fast isometric quick-round combat.

It is also the most technically risky confirmed system because it affects:
- movement
- bullet blocking
- enemy behavior logic
- pathing
- collision
- map geometry
- combat readability

V1 must keep the wall system simple and buildable.

## Core V1 principle

Build walls as simple destructible collision objects first.

Do not build advanced dynamic pathfinding, maze-building, or intelligent rerouting in V1.

## Wall tools

| Tool | Type | Function |
|---|---|---|
| Block Wall | Wall | Straight cover wall; blocks bullets and movement |

## Confirmed starting values

| Item | Starting value |
|---|---:|
| Block Wall HP | 180 |
| Active wall charges | 3 |
| Charge refill | 1 charge every 10 seconds |

These values are starting defaults for prototype testing and should be tuned after the playable loop works.

## Wall placement

Wall placement should be instant and tactical.

Rules:
- Use green/red placement preview.
- Use controlled free placement in a limited range from the hero.
- Placement should feel Fortnite-style on mobile: select a wall tool, drag/touch the battlefield to preview, release to place.
- Do not allow unlimited map-wide placement.
- Do not allow placement on blocked walkmask floor.
- Do not allow placement directly on hero, enemies, Core, or doors.
- Do not allow placement that completely seals spawn doors.
- Do not allow placement that fully surrounds a Core.
- Do not allow walls to overlap/intersect other walls.
- Keep placement fast and readable.

## Why controlled free placement

The team decided Phase 9 should feel closer to Fortnite-style building instead of fixed socket placement.

Benefits:
- stronger player agency
- faster tactical reactions
- better wall placement feel
- no obvious debug sockets on the map

To keep V1 stable, free placement is still limited by build range and no-placement rules. This keeps the system tactical without allowing map-wide spam or impossible wall positions.

## Wall collision rules

Walls must:
- block hero movement
- block enemy movement
- block bullets/projectiles
- have HP
- be damageable
- be destroyable

No hero or enemy should shoot through solid walls.

## Turn Wall rule

Turn Wall is removed from the active V1 quick-round tool set.

## Sand Trap rule

Sand Trap is removed from the active V1 quick-round tool set.

Reason:
- Walls should be the main tactical system.
- Enemy pressure should be controlled through cover, bullet blocking, and destructible wall choices, not slow-zone mechanics.
- No active code should slow enemies through Sand Trap zones.

## Enemy behavior when blocked

Use simple enemy behavior logic.

| Enemy | If blocked by wall |
|---|---|
| Alien Hunter / Fast Swarm Crawler | Attacks wall or uses very simple steering if available |
| Hunter Exosuit Trooper | Attacks wall if directly blocked while moving to Core |
| Heavy Alien Brute | Smashes wall with high damage |
| Breaker Bot | Prioritizes wall and destroys it fastest |

Main rule:

If an enemy is blocked, attack the wall or use simple steering. Do not require perfect rerouting.

## Wall damage hierarchy

| Enemy | Wall damage |
|---|---|
| Alien Hunter / Fast Swarm Crawler | low/medium |
| Hunter Exosuit Trooper | medium if blocked |
| Heavy Alien Brute | high |
| Breaker Bot | very high |

## Map geometry requirements

The map and intersection geometry must support wall play.

Confirmed intersection shape:
- rounded square with slight diamond influence
- not pure circle
- not pure diamond
- doors attached to perimeter walls
- open center for movement
- chamfered/angled edges for tactical sightlines

Intersections should include:
- enough space for hero movement
- enough space for Block Wall placement
- enough open walkable floor for free wall placement near choke points
- open center for combat
- no single wall should close the entire intersection

## Recommended placement zones

| Zone | Placement rule |
|---|---|
| Intersection center | limited by range/no-placement rules; do not overcrowd |
| Lane entrances | useful free placement choke areas |
| Near door spawns | no-placement or limited placement by door radius |
| Near Player Core | limited defensive placement by Core radius |
| Near Enemy Core | limited placement by Core radius to avoid cheap Core lock |

## Technical implementation approach

Build in layers:

### Layer 1: Static collision
- wall blocks movement
- wall blocks bullets
- wall has HP
- wall can be destroyed

### Layer 2: Simple enemy reaction
- if blocked, enemy attacks wall
- Breaker Bot targets wall fastest
- Brute smashes wall strongly
- other enemies attack wall or use simple steering

### Layer 3: Placement restrictions
- controlled free placement
- limited build range from hero
- no-placement zones
- no overlap
- no Core/door sealing

### Layer 4: Tuning
- adjust wall HP
- adjust enemy wall damage
- adjust charge refill
- adjust placement range and wall footprint

## Do not build in V1

Do not build:
- unlimited map-wide wall placement
- perfect dynamic pathfinding
- complex maze-building
- wall stacking
- physics-based wall pushing
- enemies that intelligently solve every wall layout
- wall systems that allow players to fully lock the map
- infinite wall spam

## Codex implementation instruction

Use this principle:

> Implement V1 walls as controlled free-placement destructible cover objects. Walls block movement and bullets, have HP, and can be destroyed. If enemies are blocked, they attack the wall or use simple steering. Do not build advanced dynamic pathfinding in V1.

## Testing checklist

A wall-system change is acceptable only if:
- player cannot walk through walls
- enemies cannot walk through walls
- bullets stop at walls
- walls take damage
- walls can be destroyed
- Breaker Bot destroys walls fastest
- Heavy Brute damages walls strongly
- wall placement preview works
- invalid placement is rejected
- walls cannot overlap
- walls cannot seal doors
- walls cannot surround Core completely
- quick-round performance remains acceptable

## Center zone wall rules

The center fight/drop zone must remain open and useful for wall placement.

Rules:
- Do not place decorative clutter or blocking objects in the center.
- Keep the center spacious enough for hero movement and Block Wall placement.
- Center doors must be on perimeter/edge walls, not on exit pathways.
- Free placement in the center should support tactical cover without sealing exits.
- No single wall should close the entire center zone.
- No wall should block access to the special weapon drop.
