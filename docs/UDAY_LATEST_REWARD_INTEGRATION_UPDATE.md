# UDAY_LATEST_REWARD_INTEGRATION_UPDATE.md

## Purpose

This correction updates only Phase 12 reward/result integration.

Do not rewrite working quick-round combat, enemies, map, walls, Core logic, GLB character rendering, or controls for this update.

## Latest Clean Rule

Quick rounds produce `BattleResult`.

Base-building consumes `BattleResult` and awards final coins.

Quick rounds do not directly award final coins to the base wallet.

## Final V1 Reward Rules

- Reward type: coins only.
- Win: 100 base coins.
- Draw: 50 base coins.
- Loss: 25 base coins.
- No gems.
- No resources.
- No English XP.
- No progression XP.
- No quick-round reward multipliers.
- Pro 3x is applied by base-building/subscription, not quick-round combat.
- Quick round should not write economy coins to Supabase.
- Base-building handles duplicate reward claims.

## BattleResult Type

```ts
type BattleResult = {
  battleResultId: string;
  userId: string | null;
  outcome: "win" | "loss" | "draw";
  reason: string;
  baseCoins: number;
  completedAt: string;
  elapsedSeconds: number;
  durationSeconds: number;
  coreMaxHp: number;
  playerCoreHp: number;
  enemyCoreHp: number;
  playerCoreDamageDealt: number;
  enemyCoreDamageDealt: number;
};
```

## Ownership

Uday / quick-round:
- Combat.
- Match result/outcome.
- BattleResult adapter.
- Hearts/full-reward access signal.

Pranay / base-building:
- Coin claim.
- Supabase economy writes.
- Pro 3x.
- Duplicate claim protection.
- Base progression.

Shared app layer:
- Navigation from base screen to quick round.
- Return from quick round to result/base screen.
