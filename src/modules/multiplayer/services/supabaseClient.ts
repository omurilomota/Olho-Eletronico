import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Multiplayer] Supabase URL or ANON_KEY missing in .env');
}

export const supabase = createClient(
  supabaseUrl ?? '',
  supabaseAnonKey ?? '',
);

export const SESSION_CHANNEL_PREFIX = 'session:';
export const CURSOR_EVENT = 'cursor';
export const SCENARIO_EVENT = 'scenario';
export const PLAYBOOK_EVENT = 'playbook';
export const PLAYER_EVENT = 'player';
