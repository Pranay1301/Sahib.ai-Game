import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  BASE_BACKEND_SCHEMA,
  BASE_BACKEND_TABLES,
  getForbiddenBackendFields
} from "../src/base/baseBackend.js";
import {
  BASE_BUILDING_IDS,
  BUILDING_STATES,
  LEARNING_TRACKS
} from "../src/base/baseConfig.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATION_PATH = path.resolve(
  __dirname,
  "../supabase/migrations/20260529000000_base_building_v1.sql"
);
const SQL = readFileSync(MIGRATION_PATH, "utf8");
const EXECUTABLE_SQL = SQL.replace(/^--.*$/gm, "");

test("Supabase migration implements the PDF and MD simple five-table V1 schema", () => {
  const createdTables = [...SQL.matchAll(/create table if not exists public\.([a-z_]+)/g)]
    .map((match) => match[1]);

  assert.deepEqual(createdTables, Object.values(BASE_BACKEND_TABLES));
  assert.doesNotMatch(SQL, /\buser_economy\b/);
  assert.doesNotMatch(SQL, /\buser_hearts\b/);
  assert.doesNotMatch(SQL, /\buser_skill_progress\b/);
  assert.doesNotMatch(SQL, /\bskill_progress\b/);
  assert.doesNotMatch(SQL, /\bsubscription_state\b/);
});

test("Supabase migration fields match the base backend schema model", () => {
  for (const [tableName, fields] of Object.entries(BASE_BACKEND_SCHEMA)) {
    const block = getCreateTableBlock(tableName);

    for (const field of fields) {
      assert.match(block, new RegExp(`\\b${field}\\b`), `${tableName} missing ${field}`);
    }
  }
});

test("Supabase migration preserves backend cost and scope guardrails", () => {
  for (const forbiddenField of getForbiddenBackendFields()) {
    assert.doesNotMatch(EXECUTABLE_SQL, new RegExp(`\\b${forbiddenField}\\b`));
  }

  assert.match(getCreateTableBlock(BASE_BACKEND_TABLES.USER_GAME_STATE), /coins integer not null default 0 check \(coins >= 0\)/);
  assert.match(getCreateTableBlock(BASE_BACKEND_TABLES.USER_GAME_STATE), /hearts_remaining integer not null default 4 check \(hearts_remaining between 0 and 4\)/);
  assert.match(getCreateTableBlock(BASE_BACKEND_TABLES.ACTIVE_UPGRADES), /user_id uuid primary key/);
  assert.match(getCreateTableBlock(BASE_BACKEND_TABLES.ACTIVE_UPGRADES), /timer_duration_minutes integer not null check \(timer_duration_minutes > 0\)/);
  assert.match(getCreateTableBlock(BASE_BACKEND_TABLES.BATTLE_REWARD_CLAIMS), /primary key \(user_id, battle_result_id\)/);
});

test("Supabase migration constrains documented IDs, states, language, and track values", () => {
  const fullSql = SQL.replace(/\s+/g, " ");

  for (const buildingId of Object.values(BASE_BUILDING_IDS)) {
    assert.match(fullSql, new RegExp(`'${buildingId}'`));
  }

  for (const state of Object.values(BUILDING_STATES)) {
    assert.match(fullSql, new RegExp(`'${state}'`));
  }

  for (const learningTrack of Object.values(LEARNING_TRACKS)) {
    assert.match(fullSql, new RegExp(`'${learningTrack}'`));
  }

  assert.match(fullSql, /language text not null default 'en' check \(language in \('en', 'ar'\)\)/);
  assert.match(fullSql, /level integer not null default 1 check \(level between 1 and 6\)/);
  assert.match(fullSql, /check \(to_level = from_level \+ 1\)/);
});

test("Supabase migration enables user-owned RLS on every base-building table", () => {
  for (const tableName of Object.values(BASE_BACKEND_TABLES)) {
    assert.match(SQL, new RegExp(`alter table public\\.${tableName} enable row level security;`));
    assert.match(SQL, new RegExp(`on public\\.${tableName}[\\s\\S]*?using \\(auth\\.uid\\(\\) = user_id\\)`));
  }

  assert.match(SQL, /battle_reward_claims_insert_own[\s\S]*?with check \(auth\.uid\(\) = user_id\)/);
  assert.match(SQL, /active_upgrades_delete_own[\s\S]*?using \(auth\.uid\(\) = user_id\)/);
});

function getCreateTableBlock(tableName) {
  const match = SQL.match(new RegExp(
    `create table if not exists public\\.${tableName} \\([\\s\\S]*?\\n\\);`
  ));

  assert.ok(match, `missing create table block for ${tableName}`);
  return match[0];
}
