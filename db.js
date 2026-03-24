// db.js - shared database logic (v2.1)
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

async function saveRanking(data) {
    const client = getSupabaseClient();
    if (!client) return { message: "Supabase no disponible." };
    try {
        const { error } = await client.from('rankings').insert([data]);
        return error;
    } catch (err) {
        return err;
    }
}

async function getTopRankings() {
    const client = getSupabaseClient();
    if (!client) return { data: null, error: { message: "Supabase no disponible." } };
    try {
        const { data, error } = await client
            .from('rankings')
            .select('*')
            .order('brain_age', { ascending: true })
            .limit(100);
        return { data, error };
    } catch (err) {
        return { data: null, error: err };
    }
}

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
