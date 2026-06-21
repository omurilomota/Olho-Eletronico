import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

function validateEnv(): { url: string; key: string } {
  if (!supabaseUrl || supabaseUrl.includes('SEU_PROJETO')) {
    throw new Error('[Multiplayer] VITE_SUPABASE_URL not configured in .env.local');
  }
  if (!supabaseKey || supabaseKey === 'sua_chave_aqui') {
    throw new Error('[Multiplayer] VITE_SUPABASE_PUBLISHABLE_KEY not configured in .env.local');
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
export const DRAG_EVENT = 'drag';

export async function dbCreateSession(id: string, name: string, createdBy: string) {
  const supabase = getSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).from('sessions').insert({ id, name, created_by: createdBy });
}

export async function dbGetSession(id: string) {
  const supabase = getSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).from('sessions').select('*').eq('id', id).single();
}

export async function dbDeleteSession(id: string) {
  const supabase = getSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).from('sessions').delete().eq('id', id);
}
