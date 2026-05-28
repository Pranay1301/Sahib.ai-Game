# Wall System PDF Notes

Source: wall.pdf
Converted: 2026-05-25

## Extracted Notes

Hardest parts of minin game dev + guifance for how to do it what not gto aand what t to rules

Yes. The wall system is the hardest part because it affects movement, shooting, enemy AI, pathfinding,
collision, and level design all at the same time.

The solution is not to remove it. The solution is to build it in layers, starting with the simplest working
version.

Why the wall system becomes hard

Problem                Why it is hard

Movement
                       The wall must stop hero/enemies from walking through it
blocking

Bullet blocking        Bullets must not pass through solid walls

Enemy pathing          Enemies need to know what to do if a wall blocks them

Turn Wall logic        Redirecting enemies can become complicated if done too â€œsmartâ€

Live placement         Player places walls during active combat, so the world changes instantly

                       Many edge cases: wall near door, wall near Core, wall trapping enemy, wall trapping
Testing
                       hero

The core issue is:

The map changes during combat, and enemy AI must react to that change.

That is why it can become difficult.



Best solution: build V1 wall system in 4 layers

Layer 1: Static collision wall

First, build walls as simple physical blockers.

Wall does only this:

    â€¢     blocks movement

    â€¢     blocks bullets

    â€¢     has HP

    â€¢     can be destroyed

No advanced pathfinding yet.

This is the first thing Codex/Uday should build.
Layer 2: Simple enemy reaction

If enemy path is blocked by wall, enemy does not need to become smart.

It follows this simple rule:

Enemy                          If wall blocks path

Alien hero-pressure enemy attacks wall or tries simple side movement

Core-pressure Exosuit          attacks wall if directly blocked

Heavy Brute                    smashes wall

Breaker Bot                    immediately targets and destroys wall

Hunter-style enemy             shoots wall or moves slightly around if simple route exists

The key V1 rule:

If blocked, attack the wall. Do not require perfect rerouting.

This avoids complex pathfinding.



Layer 3: Simple placement rules

Prevent broken situations by limiting where walls can be placed.

Rules:

Rule                                                 Reason

Cannot place wall directly on hero/enemy/Core prevents bugs

Cannot fully seal a door spawn                       prevents spawn trap bugs

Cannot fully surround Core                           prevents unfair defense

Must place on grid/socket points                     easier coding and testing

Green/red preview before placement                   clear UX

Limited wall charges                                 prevents spam

This is very important.

The wall should not be freeform anywhere. Use placement sockets or a simple grid.
Layer 4: Turn Wall as L-shaped blocker first

Do not make Turn Wall â€œintelligently redirect enemiesâ€ in V1.

Instead:

Turn Wall is simply an L-shaped wall piece.

Because of its shape, it naturally redirects movement without needing special AI.

That solves the problem.

Complex version                                  V1 version

AI understands Turn Wall and reroutes perfectly Turn Wall physically blocks paths like an L-shape

Dynamic pathing recalculates perfectly           Enemy attacks wall if blocked

Smart redirection system                         Shape itself creates redirection

This is the correct V1 approach.



The correct Codex instruction

Give Codex this exact principle:

Implement V1 wall system as simple destructible collision objects.



Walls must:

- block movement

- block bullets

- have HP

- be destroyable

- use valid placement sockets/grid

- show green/red placement preview



Do not implement advanced pathfinding or intelligent rerouting in V1.



If an enemy is blocked by a wall:

- Breaker Bot attacks the wall immediately
- Heavy Brute attacks the wall with high damage

- other enemies attack the wall or use simple steering if available



Turn Wall should be treated as an L-shaped wall piece, not a special AI redirection system.



Best technical approach

Use placement sockets

Instead of allowing the player to place walls anywhere, define approved placement spots inside
intersections and lanes.

Example:

Zone                 Wall sockets

Intersection center 4â€“6 possible sockets

Lane entrances       2â€“3 choke sockets

Near Core            limited defensive sockets

Door area            no-placement zone

This makes the wall system much easier.

The player still feels freedom because they choose from useful tactical points, but the developer avoids
chaos.



Wall placement should be semi-grid based

Use:

grid/snap placement, not freeform placement.

Why:

    â€¢   easier collision

    â€¢   easier enemy reaction

    â€¢   easier testing

    â€¢   fewer bugs

    â€¢   easier mobile controls

The player taps wall card, sees valid placement spots, then places.
What to avoid in V1

Do not do these now:

Avoid                                        Why

Fully freeform wall placement                too many collision/pathing bugs

Perfect enemy rerouting around every wall too slow to build

Complex maze-building                        breaks balance

Walls that stack/intersect                   creates bugs

Infinite wall spam                           destroys gameplay

Physics-based wall pushing                   unnecessary complexity



My recommended V1 wall rule

Use this:

Walls are tactical temporary blockers, not full base-building structures.

They should:

    â€¢   buy time

    â€¢   create cover

    â€¢   break line of sight

    â€¢   force enemies to hit or move around

    â€¢   not permanently solve the fight



Final solution

The wall system is hard only if we try to make it too smart.

The right V1 solution is:

Area         V1 solution

Placement snap/grid/socket-based

Collision    simple solid blocker
Area         V1 solution

Bullets      raycast stops at wall

Enemy AI     if blocked, attack wall

Turn Wall    L-shaped blocker

Pathfinding minimal/simple only

Testing      fixed valid wall zones

Balance      limited charges + HP

This keeps the unique wall mechanic without creating a 2-month technical problem.

Short final answer

Keep the wall system, but build it as:

socket-based destructible cover + simple enemy wall attack logic.

Do not build advanced dynamic pathfinding in V1.

