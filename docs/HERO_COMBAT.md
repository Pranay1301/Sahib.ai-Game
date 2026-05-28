# HERO_COMBAT.md

## Purpose

This file defines the V1 hero combat system for Sahib AI quick rounds.

## Hero identity

| Item | Decision |
|---|---|
| Hero type | Futuristic Gulf/Saudi tactical commander |
| Camera | Landscape isometric |
| Combat feeling | PUBG/COD-style rifle pressure |
| Default weapon | Automatic tactical rifle |
| Not default | Laser blaster, magic weapon, one-shot energy gun |
| Ultimate | No ultimate in V1 |

## Default weapon

Suggested weapon name:
- Falcon-7 Tactical Rifle
- Sahib AR-7 Tactical Rifle

The rifle should feel like an original tactical assault rifle inspired by familiar PUBG/COD-style rifle behavior, with an M416-like fast firing cadence rather than a slow prototype rifle.

## Rifle starting stats

| Stat | V1 value |
|---|---:|
| Hero HP | 100 |
| Magazine size | 30 bullets |
| Reserve ammo | Unlimited |
| Damage per bullet to enemies | 10 |
| Damage per bullet to Enemy Core | 5 |
| Fire rate | 11 bullets/sec |
| Reload time | 1.8 seconds |
| Effective range | Medium-long isometric range |
| Spread | Slight spread while moving |
| Accuracy | Better when standing / slower movement |

These are starting prototype values and should be tuned after playtesting.

## Ammo logic

- Rifle uses a 30-round magazine.
- Reload happens when magazine is empty.
- Manual reload can be added if simple, but is not required for first prototype.
- Reserve ammo is unlimited in V1.
- No permanent out-of-ammo state.

## V1 hero actions

| Action | Status | Purpose |
|---|---|---|
| Rifle Fire | Keep | Main damage source |
| Block Wall | Keep | Straight tactical cover |
| Dash/Tactical Slide | Removed | Not in V1 |
| Shock Grenade | Removed | Not in V1 |
| Ultimate | Removed | Not in V1 |

## Wall/utility system

Hero has access to:
- Block Wall

The wall system is documented in `WALL_SYSTEM.md`.

## Timed special weapon drops

High-power weapons are allowed only as timed in-match pickups. They are not the default weapon.

### V1 special weapon: Energy Burst Rifle

| Stat | Value |
|---|---:|
| Availability | Timed pickup |
| Drop times | Around 2:30 and 5:30 |
| Ammo | 12 shots |
| Damage to enemies | 35 per shot |
| Damage to Enemy Core | 12 per shot |
| Reload | None |
| Ends when | Ammo is finished |

Purpose:
- Create dopamine spikes.
- Create comeback/clutch moments.
- Encourage movement toward pickup zones.
- Do not replace the main rifle/wall gameplay.

### Drop placement rules
- Do not spawn safely beside Player Core.
- Do not spawn directly beside Enemy Core.
- Prefer center/intersection-adjacent areas.
- Use visible pickup marker.
- Pickup should disappear if not collected after a short time, such as 20-30 seconds.

## Movement and combat feel

| Area | Decision |
|---|---|
| Movement | Smooth isometric movement |
| Shooting while moving | Allowed, with slight spread penalty |
| Reload while moving | Allowed |
| Wall placement while moving | Allowed with minimal interruption |
| Dash | Not in V1 |

Hero should feel mobile enough without requiring a dash ability.

## Death and respawn

| Event | Decision |
|---|---|
| Hero dies | 5-second respawn timer |
| Respawn location | Near Player Core |
| Match loss? | No, unless Player Core is destroyed |
| Death penalty | Time loss + score penalty |
| Heart loss on death | No |

## Hero score impact

Suggested score logic:
- Hero death penalty: -100 points per death.
- Survival bonus can be added if hero dies fewer times.
- Exact scoring can be tuned after testing.

## Do not add in V1
- Multiple heroes.
- Character classes.
- Dash/tactical slide.
- Shock Grenade.
- Ultimate ability.
- Multiple permanent guns.
- Large weapon inventory.
- Ammo pickups for default rifle.
