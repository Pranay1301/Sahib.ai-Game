# MAP_LAYOUT.md

## Purpose

This file defines the V1 quick-round map layout, intersections, door placement, and geometry principles.

## V1 map structure

V1 map should support:
- landscape-isometric combat
- Core-vs-Core objective
- 4 major intersections
- 3 enemy doors per major intersection
- free movement without hard gates
- wall placement and tactical cover
- readable combat from isometric camera

## Core positions

Starting concept:
- Player Core on one end of the map.
- Enemy Core on the opposite end.
- Hero starts near Player Core, slightly forward of base.
- Routes naturally lead through intersections toward Enemy Core.

Exact side/orientation can depend on map art, but gameplay should preserve clear opposing Core positions.

## Major intersections

Use 4 major intersections per V1 map.

Function:
- Create local fight zones.
- Trigger randomized 3-door encounters.
- Force danger through movement without hard locking the player.
- Create multi-angle combat pressure.

## Intersection shape

Confirmed shape:

> Rounded square with slight diamond influence.

Do not use:
- pure circle
- pure white diamond
- cramped square

Shape characteristics:
- mostly rounded-square for movement and spacing
- slight angled/chamfered sides for tactical sightlines
- enough interior space for hero movement
- open center for combat
- perimeter walls where doors can attach
- compatible with Block Wall placement

## Why this shape

Benefits:
- Better movement flow.
- Better wall placement.
- Better readability in isometric view.
- Better multi-angle combat.
- Better mechanical door attachment.
- Less awkward than a pure diamond.
- More tactical than a pure circle.

## Door placement

Each major intersection has 3 mechanical enemy doors.

Door positions:
- Front door
- Side door
- Rear/diagonal door

Rules:
- Doors attach to perimeter walls.
- Doors should not all be on the same side.
- Doors should create attacks from varied angles.
- Doors should be visible to the player.
- Player should not know which door opens first.

## Door sequence

When hero enters intersection trigger zone:
- all 3 doors open
- order is randomized every time
- doors open 2-3 seconds apart
- full sequence lasts about 5-7 seconds
- no formal warning system
- natural animation/sound/glow is enough

## Trigger zones

Starting V1 value:
- 8m radius around intersection center.

Rules:
- Trigger when hero enters the zone.
- Add 20-second cooldown per intersection.
- If player runs through, event still triggers.
- If player enters another intersection, that intersection can also trigger if its cooldown allows.

## Movement philosophy

Map should support freedom of movement:
- no hard gates
- no mandatory clearing
- no control nodes
- no tower locks
- player can run/dodge/escape

But routes should naturally pass through danger zones.

## Wall compatibility

Map geometry must support wall tools.

Requirements:
- enough open space for hero movement
- useful placement space for Block Wall
- no one wall should close entire intersection
- no-placement areas near doors
- no full Core sealing
- open areas should support tactical wall placement

## Recommended wall socket areas

| Area | Purpose |
|---|---|
| Lane entrances | create choke/control points |
| Inner intersection edges | cover and temporary safety |
| Open center edges | tactical positioning |
| Near Core approach | limited defense sockets |
| Near doors | restricted/no-placement zones |

## Avoid

Do not create:
- narrow spaces where one wall blocks everything
- intersections too small for movement
- doors too close to the center
- fully open spaces where walls are useless
- dead corners where enemies/pathing get stuck
- visual clutter that hides doors/enemies/walls

## Blockout-first rule

Build the map with simple blockout geometry first.

Do not wait for final art assets before testing:
- movement
- doors
- triggers
- wall sockets
- pathing
- Core pressure
- camera readability

## Center fight/drop zone

The center is a larger special intersection and the main special weapon/drop zone.

Rules:
- Center has 3 mechanical doors.
- Center doors are placed on inner/perimeter edge walls, not in the open middle.
- Center doors must not block any of the four exit pathways.
- Center doors use the same randomized sequence logic as intersection doors.
- Center should remain open, spacious, and readable.
- Do not place decorative clutter or objects in the center drop area.
- Center pressure should come from its own doors, not from enemies walking slowly from the four intersections.
- If player runs through center, the event still triggers and enemies may chase.

The center must be implemented as a functional fight/drop zone, not a free highway to the Enemy Core.
