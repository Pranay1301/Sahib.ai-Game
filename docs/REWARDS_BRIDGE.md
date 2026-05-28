# REWARDS_BRIDGE.md

## Purpose

This file defines the V1 bridge between quick-round results and base-building coins.

## Core Principle

Quick rounds produce `BattleResult`.

Base-building consumes `BattleResult`, blocks duplicate claims, applies Pro 3x if applicable, and writes final coins to the user's base economy.

Quick-round combat does not directly add coins to the user's wallet and does not write economy rows to Supabase.

## V1 Reward Types

Quick-round V1 rewards are coins only.

Do not implement these in quick-round rewards:
- gems
- resources
- English XP
- progression XP
- reward multipliers
- random building parts
- loot tables
- gacha-style rewards

## Base Coin Output

The quick round returns fixed base coin values:

| Outcome | Base coins |
|---|---:|
| Win | 100 |
| Draw | 50 |
| Loss | 25 |

These are base values before any Pro/subscription benefit.

Base-building later applies:

```js
finalCoins = user.is_pro ? battleResult.baseCoins * 3 : battleResult.baseCoins;
```

## Hearts And Access

Confirmed free model:
- Free users get 4 full-reward hearts.
- 1 heart = 1 full-reward quick match.
- After all 4 hearts are used, user waits 30 minutes.
- After 30 minutes, all 4 hearts refill together.

Pro/subscription ownership:
- Base-building/subscription owns Pro access rules.
- Pro should support unlimited/no-wait quick battles.
- Quick-round combat should not apply Pro 3x.

## BattleResult Contract

The current quick-round code produces a flat local `BattleResult` from `src/game/quickRoundResult.js` when a match ends.

Shape:

```js
{
  battleResultId: "local_battle_result_1",
  userId: null,
  outcome: "win" | "loss" | "draw",
  reason: "enemy_core_destroyed" | "player_core_destroyed" | "timer_core_hp_percent" | "timer_core_damage_dealt" | "timer_full_tie",
  baseCoins: 100,
  completedAt: "ISO timestamp",
  elapsedSeconds: 420,
  durationSeconds: 480,
  coreMaxHp: 1000,
  playerCoreHp: 1000,
  enemyCoreHp: 0,
  playerCoreDamageDealt: 1000,
  enemyCoreDamageDealt: 0
}
```

Required fields:
- `battleResultId`
- `userId`
- `outcome`
- `reason`
- `baseCoins`
- `completedAt`
- `elapsedSeconds`
- `durationSeconds`
- `coreMaxHp`
- `playerCoreHp`
- `enemyCoreHp`
- `playerCoreDamageDealt`
- `enemyCoreDamageDealt`

## Ownership Split

Uday / quick-round owns:
- combat
- match outcome
- match reason
- BattleResult adapter
- hearts/access signal for full-reward matches

Pranay / base-building owns:
- final coin claim
- Supabase economy writes
- Pro 3x
- duplicate claim protection
- base progression

Shared app layer owns:
- routing from base screen to quick round
- returning BattleResult to result/base screen

## Do Not Build In Quick Round

- Supabase economy writes.
- Duplicate reward claim tables.
- Final wallet mutation.
- Pro 3x multiplication.
- Gems/resources/XP rewards.
- Complex reward formulas or percentage multipliers.
