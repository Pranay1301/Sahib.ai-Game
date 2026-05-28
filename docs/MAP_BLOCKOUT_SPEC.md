# MAP_BLOCKOUT_SPEC.md

## Purpose

This file is the coding source of truth for the V1 functional map blockout.

Use the approved functional blockout image as the visual reference, but use this document for exact gameplay logic. The image supports layout understanding; this spec defines what Codex/Uday must implement.

## Main rule

Do not let Codex invent a new map.

Build the V1 quick-round map as a functional blockout that preserves:
- left-side Player Core
- right-side Enemy Core
- 3-lane flow
- 4 major intersections
- open central fight/drop zone
- no direct bypass to either Core without passing through intersection/center danger zones
- mechanical doors placed on walls/edges, not inside exit paths
- spacious intersections for wall placement and hero combat

## Camera/reference angle

For coding, use a top-down/overhead functional blockout reference.

The final player camera can be landscape isometric, but map construction should use the top-down blockout to understand:
- walkable paths
- blocked terrain/walls
- Cores
- intersections
- doors
- center zone
- trigger zones
- wall sockets

## Core areas

Both Player Core and Enemy Core areas should feel similar to LoL/Dota-style base/core spaces:
- not circular isolated platforms
- accessible from three directions/pathways
- integrated with surrounding walls/terrain
- no random scattered stones/gems
- one clear Core object per side

Core visual placeholder:
- one large AI robot / drone-based Core / futuristic AI structure
- not a gem, crystal, stone, or fantasy object

## No direct Core bypass

There must be no path that allows a player to directly reach either Core without passing through the intended danger path.

Rules:
- Close side loopholes that bypass intersections/center danger.
- Core access must be routed through meaningful map flow.
- Player should be free to move, but routes must naturally pass through danger zones.
- No hard gates or control nodes are allowed; use map geometry to guide risk.

## Major intersections

V1 map has 4 major intersections.

Each major intersection:
- uses a rounded-square shape with slight diamond influence
- is spacious enough for hero movement and wall placement
- has four clear exit pathways
- has 3 mechanical enemy doors
- must not have doors blocking any of the four exits
- must not place doors directly on main path exits

Door placement:
- doors attach to perimeter walls/terrain edges
- doors sit near trees/walls/edge structures
- doors are parallel/integrated with terrain boundaries
- doors should create attacks from varied angles
- doors should not obstruct the player’s exit path

## Center fight/drop zone

The center is a larger special intersection/fight zone.

Confirmed center logic:
- Center has its own fight logic.
- Center should not rely on enemies walking from the four intersections.
- Center has 3 mechanical doors.
- Center doors use the same randomized sequence system as intersection doors.
- Center remains more spacious than normal intersections.
- Center is also the special weapon/drop zone.
- Center must stay open enough for movement, wall placement, and fights.

## Center door placement

Center doors must be placed on the inner/perimeter edge walls of the center arena.

Rules:
- 3 center doors total.
- Doors should be on center perimeter/edge walls.
- Doors must not be placed in the center’s four exit pathways.
- Doors must not block movement routes.
- Doors must not fill the open middle.
- Doors should visually feel built into the surrounding walls/terrain.
- Door order is randomized every event.
- Doors open in sequence with 2-3 second gaps.

## Center trigger

The center zone should trigger a center door event when:
- the hero enters the center trigger zone, or
- the hero collects the special weapon drop.

Recommended V1 behavior:
- center event uses the same sequence system as intersections
- all 3 center doors can open in randomized order
- enemies mostly pressure the hero
- if player runs through center, the event still triggers and enemies may chase
- use a cooldown to avoid repeated spam triggers

Starting value:
- center event cooldown: 25-30 seconds

## Special weapon drop zone

Special weapon drops should be located in the open center area.

Rules:
- keep the center clear
- no decorative objects in the center that block movement
- the drop marker should be visible
- no doors should block access to the drop
- no walls/terrain should clutter the main drop zone

## Door system summary

Use mechanical enemy doors, not magical portals.

Door rules:
- visible but not blocking route exits
- attached to walls/perimeter
- randomized order
- 2-3 seconds apart
- natural door animation/sound/glow only
- no formal warning UI

## Wall placement and map geometry

Map must support wall tools:
- Block Wall

Requirements:
- intersections and center must be spacious
- no one wall should close an entire area
- use socket/grid-based wall placement
- no-placement zones near doors and Core
- no wall should seal a door
- no wall should fully surround a Core

## Developer implementation checklist

Before coding final map behavior, confirm:
- Player Core and Enemy Core are opposite.
- 4 major intersections exist.
- Center zone exists and is open/spacious.
- Each major intersection has 3 doors.
- Center zone has 3 doors.
- No doors are placed on exit paths.
- No direct Core bypass exists.
- Core areas have three-direction access.
- Center drop zone is empty and readable.
- Doors are integrated into walls/terrain.
- Collision boundaries match visual walls.
- Wall placement sockets do not block exits/doors.

## Door randomization coding rule

All 3-door zones must use the same reusable door sequence randomizer.

Applies to:
- all 4 major intersections
- the center fight/drop zone

Rule:
1. Get the zone's 3 mechanical doors.
2. Shuffle the 3 doors using Fisher-Yates or equivalent unbiased shuffle.
3. Open the first door.
4. Wait 2-3 seconds.
5. Open the second door.
6. Wait 2-3 seconds.
7. Open the third door.

Additional requirements:
- Door order must regenerate every time the zone triggers.
- Door order must regenerate after hero death/respawn if the zone triggers again.
- Avoid using the same first door twice in a row for the same zone when possible.
- Testing/debug mode may use seeded randomness for reproducible sequences.
- Doors must stay on perimeter/edge walls and must not block exit pathways.
