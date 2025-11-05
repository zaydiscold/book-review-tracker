import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL_ENV_KEYS = ["VITE_SUPABASE_URL", "SUPABASE_URL"];
const SUPABASE_ANON_KEY_ENV_KEYS = ["VITE_SUPABASE_ANON_KEY", "SUPABASE_ANON_KEY"];

let cachedClient = null;
let cachedSettings = null;

function readEnvValue(keys) {
  for (const key of keys) {
    if (typeof import.meta !== "undefined" && import.meta.env && key in import.meta.env) {
      const value = import.meta.env[key];
      if (value) {
        return String(value);
      }
    }

    if (typeof process !== "undefined" && process.env && key in process.env) {
      const value = process.env[key];
      if (value) {
        return String(value);
      }
    }
  }

  return null;
}

function resolveSupabaseSettings() {
  if (cachedSettings) {
    return cachedSettings;
  }

  const url = readEnvValue(SUPABASE_URL_ENV_KEYS)?.trim() ?? "";
  const anonKey = readEnvValue(SUPABASE_ANON_KEY_ENV_KEYS)?.trim() ?? "";

  cachedSettings = {
    url: url || null,
    anonKey: anonKey || null
  };

  return cachedSettings;
}

export function isSupabaseConfigured() {
  const settings = resolveSupabaseSettings();
  return Boolean(settings.url && settings.anonKey);
}

export function getSupabaseClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const settings = resolveSupabaseSettings();
  if (!settings.url || !settings.anonKey) {
    return null;
  }

  cachedClient = createClient(settings.url, settings.anonKey, {
    auth: { persistSession: false }
  });

  return cachedClient;
}

export function resetSupabaseClient() {
  cachedClient = null;
  cachedSettings = null;
}
