import { createClient } from "@supabase/supabase-js";

export const BASE_SUPABASE_ENV_KEYS = Object.freeze({
  URL: "EXPO_PUBLIC_SUPABASE_URL",
  ANON_KEY: "EXPO_PUBLIC_SUPABASE_ANON_KEY"
});

export function getBaseSupabaseConfig(env = getProcessEnv()) {
  const supabaseUrl = normalizeEnvValue(env?.[BASE_SUPABASE_ENV_KEYS.URL]);
  const supabaseAnonKey = normalizeEnvValue(env?.[BASE_SUPABASE_ENV_KEYS.ANON_KEY]);

  return {
    supabaseUrl,
    supabaseAnonKey,
    configured: Boolean(supabaseUrl && supabaseAnonKey),
    missingKeys: [
      supabaseUrl ? null : BASE_SUPABASE_ENV_KEYS.URL,
      supabaseAnonKey ? null : BASE_SUPABASE_ENV_KEYS.ANON_KEY
    ].filter(Boolean)
  };
}

export function assertBaseSupabaseConfig(env = getProcessEnv()) {
  const config = getBaseSupabaseConfig(env);
  if (!config.configured) {
    throw new Error(`Missing Supabase config: ${config.missingKeys.join(", ")}`);
  }

  return config;
}

export function createBaseSupabaseClient({
  supabaseUrl,
  supabaseAnonKey,
  options = {}
} = {}) {
  const config = {
    supabaseUrl: normalizeEnvValue(supabaseUrl),
    supabaseAnonKey: normalizeEnvValue(supabaseAnonKey)
  };

  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    throw new Error("Supabase URL and anon key are required to create the base client");
  }

  return createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: false,
      persistSession: false,
      ...(options.auth ?? {})
    },
    ...options
  });
}

export function createBaseSupabaseClientFromEnv(env = getProcessEnv(), options = {}) {
  const config = assertBaseSupabaseConfig(env);
  return createBaseSupabaseClient({
    supabaseUrl: config.supabaseUrl,
    supabaseAnonKey: config.supabaseAnonKey,
    options
  });
}

export function createOptionalBaseSupabaseClient(env = getProcessEnv(), options = {}) {
  const config = getBaseSupabaseConfig(env);
  if (!config.configured) {
    return null;
  }

  return createBaseSupabaseClient({
    supabaseUrl: config.supabaseUrl,
    supabaseAnonKey: config.supabaseAnonKey,
    options
  });
}

function normalizeEnvValue(value) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function getProcessEnv() {
  return globalThis?.process?.env ?? {};
}
