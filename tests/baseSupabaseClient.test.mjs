import assert from "node:assert/strict";
import test from "node:test";

import {
  BASE_SUPABASE_ENV_KEYS,
  assertBaseSupabaseConfig,
  createBaseSupabaseClient,
  createOptionalBaseSupabaseClient,
  getBaseSupabaseConfig
} from "../src/base/baseSupabaseClient.js";

const SUPABASE_URL = "https://example.supabase.co";
const SUPABASE_ANON_KEY = "test_anon_key";

test("base Supabase config reads Expo public env keys without requiring secrets in tests", () => {
  const config = getBaseSupabaseConfig({
    [BASE_SUPABASE_ENV_KEYS.URL]: ` ${SUPABASE_URL} `,
    [BASE_SUPABASE_ENV_KEYS.ANON_KEY]: ` ${SUPABASE_ANON_KEY} `
  });

  assert.equal(config.supabaseUrl, SUPABASE_URL);
  assert.equal(config.supabaseAnonKey, SUPABASE_ANON_KEY);
  assert.equal(config.configured, true);
  assert.deepEqual(config.missingKeys, []);
});

test("base Supabase config reports missing app environment keys clearly", () => {
  const config = getBaseSupabaseConfig({});

  assert.equal(config.configured, false);
  assert.deepEqual(config.missingKeys, [
    BASE_SUPABASE_ENV_KEYS.URL,
    BASE_SUPABASE_ENV_KEYS.ANON_KEY
  ]);
  assert.throws(
    () => assertBaseSupabaseConfig({}),
    /Missing Supabase config: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY/
  );
});

test("optional base Supabase client stays null until project access is configured", () => {
  assert.equal(createOptionalBaseSupabaseClient({}), null);
});

test("base Supabase client can be created from configured V1 app values", () => {
  const client = createBaseSupabaseClient({
    supabaseUrl: SUPABASE_URL,
    supabaseAnonKey: SUPABASE_ANON_KEY
  });

  assert.equal(typeof client.from, "function");
  assert.equal(typeof client.rpc, "function");
  assert.throws(
    () => createBaseSupabaseClient({ supabaseUrl: SUPABASE_URL }),
    /Supabase URL and anon key are required/
  );
});
