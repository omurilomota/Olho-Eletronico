import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function validateEnv(): { url: string; key: string } {
  if (!supabaseUrl || supabaseUrl.includes('SEU_PROJETO')) {
    throw new Error('[Multiplayer] VITE_SUPABASE_URL not configured in .env.local');
  }
  if (!supabaseKey || supabaseKey === 'sua_chave_aqui') {
    throw new Error('[Multiplayer] VITE_SUPABASE_ANON_KEY not configured in .env.local');
  }
  return { url: supabaseUrl, key: supabaseKey };
}

let _supabase: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!_supabase) {
    const env = validateEnv();
    _supabase = createClient(env.url, env.key, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }
  return _supabase;
}

export const SESSION_CHANNEL_PREFIX = 'session:';
export const CURSOR_EVENT = 'cursor';
export const SCENARIO_EVENT = 'scenario';
export const PLAYBOOK_EVENT = 'playbook';
export const PLAYER_EVENT = 'player';
