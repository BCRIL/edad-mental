// db.js - shared database logic (v3.0)
const SUPABASE_URL = 'https://owfppbdauqmghpmqrgse.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93ZnBwYmRhdXFtZ2hwbXFyZ3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNjYyNDEsImV4cCI6MjA4OTk0MjI0MX0.AiW5Pmc8mSqa0Rx-EmWk5nzSrTDqCl99eKLnQg7v9Fw';

let _supabase = null;

function getSupabaseClient() {
    if (_supabase) return _supabase;
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
            auth: { persistSession: false }
        });
    }
    return _supabase;
}

// ── Security: sanitize player name ──
function sanitizeName(name) {
    if (typeof name !== 'string') return '';
    return name
        .trim()
        .replace(/[<>"'&\/\\]/g, '')  // strip XSS-dangerous chars
        .substring(0, 20);             // max 20 chars
}

// ── Save a ranking entry ──
async function saveRanking(data) {
    const client = getSupabaseClient();
    if (!client) return { message: "Supabase no disponible." };
    // Sanitize
    data.player_name = sanitizeName(data.player_name);
    if (!data.player_name) return { message: "Nombre inválido." };
    try {
        const { error } = await client.from('rankings').insert([data]);
        return error;
    } catch (err) {
        return err;
    }
}

// ── Get top 100 rankings ──
async function getTopRankings(difficultyFilter) {
    const client = getSupabaseClient();
    if (!client) return { data: null, error: { message: "Supabase no disponible." } };
    try {
        let query = client
            .from('rankings')
            .select('*')
            .order('brain_age', { ascending: true })
            .limit(100);
        if (difficultyFilter && difficultyFilter !== 'all') {
            query = query.eq('difficulty', difficultyFilter);
        }
        const { data, error } = await query;
        return { data, error };
    } catch (err) {
        return { data: null, error: err };
    }
}

// ── Get all stats for charts ──
async function getStats() {
    const client = getSupabaseClient();
    if (!client) return { data: null, error: { message: "Supabase no disponible." } };
    try {
        const { data, error } = await client
            .from('rankings')
            .select('brain_age, reaction_score, numbers_score, patterns_score, math_score, sequence_score');
        return { data, error };
    } catch (err) {
        return { data: null, error: err };
    }
}

// ── Get total player count ──
async function getPlayerCount() {
    const client = getSupabaseClient();
    if (!client) return 0;
    try {
        const { count, error } = await client
            .from('rankings')
            .select('*', { count: 'exact', head: true });
        return error ? 0 : (count || 0);
    } catch (err) {
        return 0;
    }
}

// ── Get global averages for comparison ──
async function getGlobalAverages() {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
        const { data, error } = await client
            .from('rankings')
            .select('brain_age');
        if (error || !data || data.length === 0) return null;
        const sum = data.reduce((acc, r) => acc + r.brain_age, 0);
        return {
            avgBrainAge: Math.round(sum / data.length),
            totalPlayers: data.length
        };
    } catch (err) {
        return null;
    }
}
