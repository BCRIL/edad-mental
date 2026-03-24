// db.js - shared database logic (v5.0 — with Auth)
const SUPABASE_URL = 'https://owfppbdauqmghpmqrgse.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93ZnBwYmRhdXFtZ2hwbXFyZ3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNjYyNDEsImV4cCI6MjA4OTk0MjI0MX0.AiW5Pmc8mSqa0Rx-EmWk5nzSrTDqCl99eKLnQg7v9Fw';

let _supabase = null;

function getSupabaseClient() {
    if (_supabase) return _supabase;
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
            auth: { persistSession: true } // keep session across page reloads
        });
    }
    return _supabase;
}

// ── Security: sanitize player name ──
function sanitizeName(name) {
    if (typeof name !== 'string') return '';
    return name
        .trim()
        .replace(/[<>"'&\/\\]/g, '')
        .substring(0, 20);
}

// ══════════════════════════════════════
// AUTH FUNCTIONS
// ══════════════════════════════════════

async function authSignUp(email, password, displayName) {
    const client = getSupabaseClient();
    if (!client) return { user: null, error: { message: 'Supabase no disponible.' } };
    const safeName = sanitizeName(displayName);
    if (!safeName) return { user: null, error: { message: 'Nombre de usuario inválido.' } };
    try {
        const { data, error } = await client.auth.signUp({
            email,
            password,
            options: { data: { display_name: safeName } }
        });
        if (error) return { user: null, error };
        // Insert into profiles table
        if (data.user) {
            await client.from('profiles').upsert({
                id: data.user.id,
                display_name: safeName
            });
        }
        return { user: data.user, error: null };
    } catch (err) {
        return { user: null, error: err };
    }
}

async function authSignIn(email, password) {
    const client = getSupabaseClient();
    if (!client) return { user: null, error: { message: 'Supabase no disponible.' } };
    try {
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        return { user: data?.user || null, error };
    } catch (err) {
        return { user: null, error: err };
    }
}

async function authSignOut() {
    const client = getSupabaseClient();
    if (!client) return;
    await client.auth.signOut();
}

async function getCurrentUser() {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data } = await client.auth.getSession();
    return data?.session?.user || null;
}

async function getUserDisplayName(userId) {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
        const { data, error } = await client
            .from('profiles')
            .select('display_name')
            .eq('id', userId)
            .single();
        if (error || !data) return null;
        return data.display_name;
    } catch {
        return null;
    }
}

function onAuthChange(callback) {
    const client = getSupabaseClient();
    if (!client) return;
    client.auth.onAuthStateChange((_event, session) => {
        callback(session?.user || null);
    });
}

// ══════════════════════════════════════
// RANKING FUNCTIONS
// ══════════════════════════════════════

async function saveRanking(data) {
    const client = getSupabaseClient();
    if (!client) return { message: 'Supabase no disponible.' };
    data.player_name = sanitizeName(data.player_name);
    if (!data.player_name) return { message: 'Nombre inválido.' };
    try {
        const { error } = await client.from('rankings').insert([data]);
        return error;
    } catch (err) {
        return err;
    }
}

async function getTopRankings(difficultyFilter) {
    const client = getSupabaseClient();
    if (!client) return { data: null, error: { message: 'Supabase no disponible.' } };
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

async function getStats() {
    const client = getSupabaseClient();
    if (!client) return { data: null, error: { message: 'Supabase no disponible.' } };
    try {
        const { data, error } = await client
            .from('rankings')
            .select('brain_age, reaction_score, numbers_score, patterns_score, math_score, sequence_score');
        return { data, error };
    } catch (err) {
        return { data: null, error: err };
    }
}

async function getPlayerCount() {
    const client = getSupabaseClient();
    if (!client) return 0;
    try {
        const { count, error } = await client
            .from('rankings')
            .select('*', { count: 'exact', head: true });
        return error ? 0 : (count || 0);
    } catch {
        return 0;
    }
}

async function getGlobalAverages() {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
        const { data, error } = await client.from('rankings').select('brain_age');
        if (error || !data || data.length === 0) return null;
        const sum = data.reduce((acc, r) => acc + r.brain_age, 0);
        return { avgBrainAge: Math.round(sum / data.length), totalPlayers: data.length };
    } catch {
        return null;
    }
}
