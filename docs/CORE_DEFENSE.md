# CORE_DEFENSE.md

## Purpose

This file defines Player Core, Enemy Core, win/loss rules, and Enemy Core defense logic for Sahib AI V1 quick rounds.

## Core concept

The match is Core-vs-Core.

- Player protects Player Core.
- Player attacks Enemy Core.
- Enemy pressure can force defend-vs-push decisions.
- Enemy Core should be attackable anytime, but not easy to destroy.

## Core HP

Starting prototype values:

| Core | HP |
|---|---:|
| Player Core | 1000 |
| Enemy Core | 1000 |

These are starting values and should be tuned after playtesting.

## Win/loss rules

| Situation | Result |
|---|---|
| Enemy Core destroyed | Player wins instantly |
| Player Core destroyed | Player loses instantly |
| 8-minute timer ends | Higher remaining Core HP percentage wins |
| Same Core HP percentage | Total Core damage dealt wins |
| Still tied | Draw/reduced reward |
| Sudden death | Not in V1 |

## Core destruction

Core destruction immediately ends the match.

Do not wait until the timer ends after a Core has been destroyed.

## Tie-breaker logic

If timer ends:
1. Compare remaining Core HP percentage.
2. Higher remaining Core HP percentage wins.
3. If same, compare total Core damage dealt.
4. If still tied, result is draw/reduced reward.
5. No sudden death in V1.

## Enemy Core attack

Enemy Core lightly shoots the hero while the hero is attacking or in range.

Starting behavior:
- Light/moderate damage.
- Should create pressure but not instantly kill hero.
- Starting value can be around 5 damage/second.
- Tune after playtesting.

## Enemy Core defense trigger

Enemy Core defense is HP-triggered, not location-triggered.

Do not use a separate hero-location trigger for Enemy Core defense. If the Enemy Core is taking damage, the hero is already there or in range.

## Enemy Core HP thresholds

Defense waves trigger once at:

| Enemy Core HP | Response |
|---|---|
| 75% | Light defense wave |
| 50% | Medium defense wave |
| 25% | Final defense wave |

Each threshold should trigger only once.

## Time as intensity modifier

Time phase modifies defense intensity.

| Time phase | Defense intensity |
|---|---|
| Early | Lighter |
| Mid | Medium |
| Final | Strongest |

HP threshold decides when the defense wave triggers. Time phase decides how strong that response is.

## Example defense wave logic

Starting examples for testing:

### 75% HP
- Early: 1 defender
- Mid: 1 defender + small support
- Final: 2 defenders

### 50% HP
- Early: 1-2 defenders
- Mid: 2 defenders
- Final: 2-3 defenders

### 25% HP
- Early: 2 defenders
- Mid: 2-3 defenders
- Final: 3+ defenders

Keep exact enemy mix simple and tune after testing.

## Core defense doors

- Defense enemies spawn from nearby enemy-base/Core defense doors.
- Use 2 side doors for V1.
- Optional third rear door can be added later if needed.
- These doors are separate from intersection doors.

## No forced gate system

Do not add:
- Core shield phases.
- Core invincibility.
- Requirement to clear intersections before damaging Core.
- Control nodes.
- Tower-lock systems.
- Mandatory checkpoint clearing.

The Enemy Core is always attackable, but defense pressure should make it risky.

## Interaction with rushing

If the player rushes through intersections and reaches Enemy Core:
- Enemy Core is attackable.
- Intersection enemies may still be behind/chasing.
- Core defense triggers only when HP thresholds are crossed.
- Enemy Core lightly attacks hero.
- The player can attempt a risky rush, but it should not be free/easy.

## Testing checklist

Core defense is acceptable if:
- Enemy Core can be damaged immediately.
- Enemy Core destruction ends match instantly.
- Player Core destruction ends match instantly.
- Timer-end rule works.
- HP threshold waves trigger once each.
- Threshold waves do not repeat accidentally.
- No shield/invincibility behavior exists.
- Core defense enemies spawn from correct Core defense doors.
- Draw/reduced reward works if all tie-breakers are equal.
