// db.js - shared database logic
const supabaseUrl = 'https://owfppbdauqmghpmqrgse.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93ZnBwYmRhdXFtZ2hwbXFyZ3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNjYyNDEsImV4cCI6MjA4OTk0MjI0MX0.AiW5Pmc8mSqa0Rx-EmWk5nzSrTDqCl99eKLnQg7v9Fw';
let supabase;

console.log("Script db.js cargado.");

try {
    // Al ejecutar desde un archivo local (file://), las sesiones guardadas pueden colgar el código.
    supabase = window.supabase.createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false }
    });
} catch (err) {
    console.error("Error initializing Supabase client (possibly invalid key):", err);
}

async function saveRanking(data) {
    if (!supabase) return { message: "Supabase client uninitialized." };
    try {
        const { error } = await supabase.from('rankings').insert([data]);
        return error;
    } catch (err) {
        return err;
    }
}

async function getTopRankings() {
    if (!supabase) return { data: null, error: { message: "Supabase client uninitialized." } };
    try {
        const { data, error } = await supabase
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
    if (!supabase) return { data: null, error: { message: "Supabase client uninitialized." } };
    try {
        const { data, error } = await supabase
            .from('rankings')
            .select('brain_age, reaction_score, numbers_score, patterns_score, math_score, sequence_score');
        return { data, error };
    } catch (err) {
        return { data: null, error: err };
    }
}
