// db.js - shared database logic
const supabaseUrl = 'https://owfppbdauqmghpmqrgse.supabase.co';
const supabaseKey = 'sb_publishable_qJP1lD7E3y0m9SzFxtl5Ww_ZBtI8r7q';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

async function saveRanking(data) {
    const { error } = await supabase.from('rankings').insert([data]);
    return error;
}

async function getTopRankings() {
    // Top 100 based on lowest brain_age
    const { data, error } = await supabase
        .from('rankings')
        .select('*')
        .order('brain_age', { ascending: true })
        .limit(100);
    
    return { data, error };
}

async function getStats() {
    const { data, error } = await supabase
        .from('rankings')
        .select('brain_age, reaction_score, numbers_score, patterns_score, math_score, sequence_score');
    
    return { data, error };
}
