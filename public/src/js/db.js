// db.js - shared database logic (v8.0 — Auth con waitForSupabase)
const SUPABASE_URL = 'https://owfppbdauqmghpmqrgse.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93ZnBwYmRhdXFtZ2hwbXFyZ3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNjYyNDEsImV4cCI6MjA4OTk0MjI0MX0.AiW5Pmc8mSqa0Rx-EmWk5nzSrTDqCl99eKLnQg7v9Fw';

let _supabase = null;
let _supabasePromise = null;

// Esperar a que Supabase esté disponible
function waitForSupabase() {
    if (_supabasePromise) return _supabasePromise;

    _supabasePromise = new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 50; // 5 segundos (50 * 100ms)

        const checkSupabase = () => {
            if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
                resolve(true);
            } else if (attempts < maxAttempts) {
                attempts++;
                setTimeout(checkSupabase, 100);
            } else {
                console.warn('Supabase no cargó después de 5 segundos');
                resolve(false);
            }
        };

        checkSupabase();
    });

    return _supabasePromise;
}

function getSupabaseClient() {
    if (_supabase) return _supabase;
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
            auth: { persistSession: true }
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
    const isReady = await waitForSupabase();
    if (!isReady) return { user: null, error: { message: 'Supabase no disponible.' } };

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
        // El trigger handle_new_user() crea el perfil automáticamente.
        // Hacemos upsert defensivo por si el trigger va lento, pero
        // con ON CONFLICT DO NOTHING para no sobreescribir datos existentes.
        if (data.user) {
            await client.from('profiles').upsert(
                { id: data.user.id, display_name: safeName },
                { onConflict: 'id', ignoreDuplicates: true }
            );
        }
        return { user: data.user, error: null };
    } catch (err) {
        return { user: null, error: err };
    }
}

async function authSignIn(email, password) {
    const isReady = await waitForSupabase();
    if (!isReady) return { user: null, error: { message: 'Supabase no disponible.' } };

    const client = getSupabaseClient();
    if (!client) return { user: null, error: { message: 'Supabase no disponible.' } };
    try {
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        return { user: data?.user || null, error };
    } catch (err) {
        return { user: null, error: err };
    }
}

async function authSignInWithGoogle() {
    const isReady = await waitForSupabase();
    if (!isReady) return { error: { message: 'Supabase no disponible.' } };

    const client = getSupabaseClient();
    if (!client) return { error: { message: 'Supabase no disponible.' } };
    try {
        const { data, error } = await client.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'select_account'
                }
            }
        });
        return { data, error };
    } catch (err) {
        return { error: err };
    }
}

async function authSignOut() {
    const isReady = await waitForSupabase();
    if (!isReady) return;

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

// Obtener perfil completo (display_name, avatar_url, estadísticas)
async function getUserProfile(userId) {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
        const { data, error } = await client
            .from('profiles')
            .select('display_name, avatar_url, total_tests, best_brain_age, last_played_at, created_at')
            .eq('id', userId)
            .single();
        if (error || !data) return null;
        return data;
    } catch {
        return null;
    }
}

// Actualizar perfil del usuario (display_name, avatar_url, estadísticas)
// NOTA: No se puede borrar el perfil. Esta es la única mutación permitida.
async function updateUserProfile(userId, { displayName, avatarUrl, stats } = {}) {
    const client = getSupabaseClient();
    if (!client) return { error: { message: 'Supabase no disponible.' } };
    const updates = {};
    if (displayName !== undefined) {
        const safeName = sanitizeName(displayName);
        if (!safeName) return { error: { message: 'Nombre de usuario inválido.' } };
        updates.display_name = safeName;
    }
    if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;
    if (stats !== undefined) {
        // Actualizar estadísticas básicas
        if (stats.total_tests !== undefined) updates.total_tests = stats.total_tests;
        if (stats.best_brain_age !== undefined) updates.best_brain_age = stats.best_brain_age;
        if (stats.last_played_at !== undefined) updates.last_played_at = stats.last_played_at;

        // Actualizar promedios
        if (stats.average_brain_age !== undefined) updates.average_brain_age = stats.average_brain_age;
        if (stats.reaction_avg !== undefined) updates.reaction_avg = stats.reaction_avg;
        if (stats.numbers_avg !== undefined) updates.numbers_avg = stats.numbers_avg;
        if (stats.patterns_avg !== undefined) updates.patterns_avg = stats.patterns_avg;
        if (stats.math_avg !== undefined) updates.math_avg = stats.math_avg;
        if (stats.sequence_avg !== undefined) updates.sequence_avg = stats.sequence_avg;
        if (stats.colors_avg !== undefined) updates.colors_avg = stats.colors_avg;
        if (stats.spatial_avg !== undefined) updates.spatial_avg = stats.spatial_avg;

        // Actualizar racha
        if (stats.current_streak !== undefined) updates.current_streak = stats.current_streak;
        if (stats.highest_streak !== undefined) updates.highest_streak = stats.highest_streak;

        // Actualizar insignias
        if (stats.badges_unlocked !== undefined) updates.badges_unlocked = stats.badges_unlocked;
    }
    if (Object.keys(updates).length === 0) return { error: { message: 'Nada que actualizar.' } };
    try {
        const { error } = await client
            .from('profiles')
            .update(updates)
            .eq('id', userId);
        return { error };
    } catch (err) {
        return { error: err };
    }
}

function onAuthChange(callback) {
    const client = getSupabaseClient();
    if (!client) return;
    client.auth.onAuthStateChange((_event, session) => {
        callback(session?.user || null);
    });
}

// ── Historial de resultados del usuario ──
async function getUserRankings(userId) {
    const client = getSupabaseClient();
    if (!client) return { data: null, error: { message: 'Supabase no disponible.' } };
    try {
        const { data, error } = await client
            .from('rankings')
            .select('brain_age, difficulty, created_at, reaction_score, numbers_score, patterns_score, math_score, sequence_score')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(50);  // Aumentado a 50 para mostrar más historial
        return { data, error };
    } catch (err) {
        return { data: null, error: err };
    }
}

// ── Calcular Liga (Gamificación) ──
function calculateLeague(rankings) {
    if (!rankings || rankings.length === 0) return { name: 'Bronce', icon: '🥉', color: '#b45309' };

    const sorted = [...rankings].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    let consecutiveImprovements = 0;
    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].brain_age <= sorted[i - 1].brain_age) {
            consecutiveImprovements++;
        } else {
            consecutiveImprovements = 0;
        }
    }

    if (consecutiveImprovements >= 9) return { name: 'Diamante', icon: '💎', color: '#06b6d4' };
    if (consecutiveImprovements >= 6) return { name: 'Oro',      icon: '🥇', color: '#f59e0b' };
    if (consecutiveImprovements >= 3) return { name: 'Plata',    icon: '🥈', color: '#94a3b8' };
    return { name: 'Bronce', icon: '🥉', color: '#b45309' };
}

// ── Calcular tendencia del usuario (últimas N partidas) ──
function calculateTrend(rankings, lastN = 5) {
    if (!rankings || rankings.length < 2) return null;
    const recent = [...rankings]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, lastN);
    if (recent.length < 2) return null;
    const first = recent[recent.length - 1].brain_age;
    const last  = recent[0].brain_age;
    const diff  = first - last;  // positivo = mejora (edad mental bajó)
    return { improving: diff > 0, diff: Math.abs(diff), sessions: recent.length };
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

// ── Obtener posición del usuario en el ranking global ──
async function getUserRankPosition(userId, difficulty = null) {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
        // Obtener la mejor puntuación del usuario
        let userQuery = client
            .from('rankings')
            .select('brain_age')
            .eq('user_id', userId)
            .order('brain_age', { ascending: true })
            .limit(1);
        if (difficulty) userQuery = userQuery.eq('difficulty', difficulty);
        const { data: userData } = await userQuery;
        if (!userData || userData.length === 0) return null;

        const bestAge = userData[0].brain_age;

        // Contar cuántos tienen mejor puntuación (edad mental menor)
        let countQuery = client
            .from('rankings')
            .select('*', { count: 'exact', head: true })
            .lt('brain_age', bestAge);
        if (difficulty) countQuery = countQuery.eq('difficulty', difficulty);
        const { count } = await countQuery;

        return { position: (count || 0) + 1, bestBrainAge: bestAge };
    } catch {
        return null;
    }
}

// ══════════════════════════════════════════════════════════════════
// NOTA DE ARQUITECTURA — Inmutabilidad de datos
// ══════════════════════════════════════════════════════════════════
// Los datos de perfiles y rankings son PERMANENTES por diseño:
//
//  • RLS de Supabase: no existe ninguna policy DELETE en profiles ni rankings.
//    Cualquier intento de borrado desde el cliente devuelve error 403.
//
//  • Triggers en BD: prevent_profile_delete() y prevent_ranking_delete()
//    lanzan EXCEPTION si alguien intenta borrar desde server-side.
//    prevent_ranking_update() hace que las puntuaciones sean inmutables.
//
//  • FK rankings.user_id → auth.users ON DELETE SET NULL:
//    Si se elimina una cuenta de auth, los rankings quedan con user_id=NULL
//    pero no se pierden del ranking global.
//
//  • Este archivo db.js NO expone ninguna función de borrado intencionalmente.
// ══════════════════════════════════════════════════════════════════

// ══════════════════════════════════════
// GLOBAL EXPORTS
// ══════════════════════════════════════

// Core functions
window.waitForSupabase = waitForSupabase;
window.getSupabaseClient = getSupabaseClient;

// Auth functions
window.authSignUp = authSignUp;
window.authSignIn = authSignIn;
window.authSignInWithGoogle = authSignInWithGoogle;
window.authSignOut = authSignOut;
window.getCurrentUser = getCurrentUser;
window.onAuthChange = onAuthChange;

// Profile functions
window.getUserDisplayName = getUserDisplayName;
window.getUserProfile = getUserProfile;
window.updateUserProfile = updateUserProfile;
window.getUserRankings = getUserRankings;
window.getUserRankPosition = getUserRankPosition;
window.calculateLeague = calculateLeague;
window.calculateTrend = calculateTrend;

// Ranking functions
window.saveRanking = saveRanking;
window.getTopRankings = getTopRankings;
window.getStats = getStats;
window.getPlayerCount = getPlayerCount;
window.getGlobalAverages = getGlobalAverages;
