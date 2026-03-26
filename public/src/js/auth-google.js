/**
 * auth-google.js — v1.0
 * Extensión de autenticación: Google OAuth + mejoras de perfil.
 * Incluir DESPUÉS de app.js en index.html.
 */

// ── Fix: updateTimer no estaba definido en app.js (usado en juego de colores y espacial) ──
if (typeof window.updateTimer === 'undefined') {
    window.updateTimer = function(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val + 's';
    };
}

// ══════════════════════════════════════════════════
// GOOGLE SIGN-IN
// ══════════════════════════════════════════════════

window.handleGoogleLogin = async function() {
    console.log('🔄 Iniciando login con Google...');

    // Save pending score if we are currently on the results screen
    if (window._shareData) {
        localStorage.setItem('pendingBrainAgeResult', JSON.stringify({
            shareData: window._shareData,
            games: window.games || [],
            difficulty: window.currentDifficulty || 'normal'
        }));
    }

    const btn = document.getElementById('btn-google-login');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<svg style="animation:spin 1s linear infinite;display:inline-block;vertical-align:middle;margin-right:8px;" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Verificando Supabase...`;
    }

    // Verificar que Supabase esté disponible primero
    if (typeof waitForSupabase === 'function') {
        const isReady = await waitForSupabase();
        if (!isReady) {
            console.error('❌ Supabase no se pudo cargar después de 5 segundos');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = `${googleIconSvg()} Continuar con Google`;
            }
            const errEl = document.getElementById('login-error') || document.getElementById('register-error');
            if (errEl) {
                errEl.textContent = 'Error: No se pudo conectar con el servidor. Recarga la página e intenta de nuevo.';
                errEl.style.display = 'block';
            }
            return;
        }
    }

    if (btn) {
        btn.innerHTML = `<svg style="animation:spin 1s linear infinite;display:inline-block;vertical-align:middle;margin-right:8px;" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Conectando con Google...`;
    }

    console.log('✓ Supabase verificado, procediendo con Google OAuth...');
    const { error } = await authSignInWithGoogle();
    if (error) {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `${googleIconSvg()} Continuar con Google`;
        }
        // Mostrar error
        const errEl = document.getElementById('login-error') || document.getElementById('register-error');
        if (errEl) {
            errEl.textContent = error.message || 'Error al conectar con Google.';
            errEl.style.display = 'block';
        }
    }
    // Si no hay error, Supabase redirige automáticamente a Google
};

function googleIconSvg() {
    return `<svg viewBox="0 0 24 24" width="18" height="18" style="vertical-align:middle;margin-right:8px;flex-shrink:0;">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>`;
}

// ══════════════════════════════════════════════════
// OVERRIDE: updateNavForUser — añade soporte para avatar de Google
// ══════════════════════════════════════════════════

// Guardamos la función original si existe
const _origUpdateNavForUser = window._updateNavForUser || null;

window._updateNavForUser = function(user, displayName, avatarUrl) {
    const btnLogin  = document.getElementById('btn-nav-login');
    const pill      = document.getElementById('nav-user-pill');
    const avatar    = document.getElementById('nav-avatar');
    const nameSpan  = document.getElementById('nav-username');

    if (user && displayName) {
        window._currentUser        = user;
        window._currentDisplayName = displayName;
        window._sharePlayerName    = displayName;

        if (btnLogin) btnLogin.style.display = 'none';

        if (pill) {
            pill.style.display = 'flex';
            nameSpan.textContent = displayName;

            // Si hay avatar (Google), mostrar imagen; si no, inicial
            if (avatarUrl) {
                avatar.innerHTML = `<img src="${avatarUrl}" alt="${displayName}" style="width:26px;height:26px;border-radius:50%;object-fit:cover;">`;
            } else {
                avatar.textContent = displayName.charAt(0).toUpperCase();
                avatar.style.background = 'linear-gradient(135deg,#8b5cf6,#06b6d4)';
            }
        }

        // Auto-rellenar nombre en pantalla de resultados
        const nameInput = document.getElementById('player-name-input');
        if (nameInput) nameInput.value = displayName;

    } else {
        window._currentUser        = null;
        window._currentDisplayName = null;
        if (btnLogin) btnLogin.style.display = '';
        if (pill) { pill.style.display = 'none'; }
        if (avatar) { avatar.innerHTML = '?'; avatar.style.background = 'linear-gradient(135deg,#8b5cf6,#06b6d4)'; }
    }
};

// ══════════════════════════════════════════════════
// OVERRIDE: initAuth — usa getUserProfile para obtener avatar también
// ══════════════════════════════════════════════════

window._initAuthGoogle = async function() {
    if (typeof onAuthChange !== 'function') return;

    onAuthChange(async (user) => {
        if (user) {
            const profile = await getUserProfile(user.id);
            const name = profile?.display_name || user.email;
            const avatar = profile?.avatar_url || null;
            window._updateNavForUser(user, name, avatar);
        } else {
            window._updateNavForUser(null, null, null);
        }
    });

    // Chequeo inmediato al cargar (restaura sesión)
    if (typeof getCurrentUser === 'function') {
        const user = await getCurrentUser();
        if (user) {
            const profile = await getUserProfile(user.id);
            const name = profile?.display_name || user.email;
            const avatar = profile?.avatar_url || null;
            window._updateNavForUser(user, name, avatar);
        }
    }
};

// ══════════════════════════════════════════════════
// OVERRIDE: loadProfile — muestra datos de Supabase si el usuario está logueado
// ══════════════════════════════════════════════════

window._loadProfileGoogle = async function() {
    // Primero cargamos los datos locales (ya lo hace app.js loadProfile)
    // Luego, si hay usuario logueado, añadimos sección de cuenta y rankings del servidor

    const user = window._currentUser;
    if (!user) {
        // Mostrar banner de "inicia sesión para sincronizar"
        _renderLoginBanner();
        return;
    }

    // Ocultar banner si estaba visible
    const banner = document.getElementById('profile-login-banner');
    if (banner) banner.remove();

    // Añadir sección de cuenta si no existe
    _renderAccountSection(user);

    // Cargar rankings del servidor
    _renderServerRankings(user.id);
};

function _renderLoginBanner() {
    const container = document.getElementById('profile-content');
    if (!container || document.getElementById('profile-login-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'profile-login-banner';
    banner.style.cssText = `
        background: rgba(139,92,246,0.1);
        border: 1px solid rgba(139,92,246,0.3);
        border-radius: 16px;
        padding: 24px 28px;
        margin-bottom: 28px;
        display: flex;
        align-items: center;
        gap: 20px;
        flex-wrap: wrap;
    `;
    banner.innerHTML = `
        <div style="flex:1;min-width:200px;">
            <div style="font-weight:700;font-size:16px;margin-bottom:4px;color:#f1f5f9;">☁️ Sincroniza tu progreso</div>
            <div style="font-size:13px;color:var(--clr-text-muted);">Inicia sesión para guardar tu historial en la nube y acceder desde cualquier dispositivo.</div>
        </div>
        <button onclick="document.getElementById('auth-modal').style.display='flex'"
            style="padding:10px 22px;border-radius:10px;border:none;background:linear-gradient(135deg,#8b5cf6,#06b6d4);color:#fff;font-family:var(--font-body);font-weight:700;font-size:14px;cursor:pointer;white-space:nowrap;">
            Iniciar sesión
        </button>
    `;
    container.insertBefore(banner, container.firstChild);
}

function _renderAccountSection(user) {
    if (document.getElementById('profile-account-section')) return;

    const container = document.getElementById('profile-content');
    if (!container) return;

    const provider = user.app_metadata?.provider || 'email';
    const providerLabel = provider === 'google'
        ? `${googleIconSvg()} Conectado con Google`
        : '📧 Cuenta con email';

    const section = document.createElement('div');
    section.id = 'profile-account-section';
    section.className = 'profile-panel profile-account-card card';
    section.style.cssText = 'padding:24px;margin-bottom:24px;border:1px solid var(--clr-glass-border);';
    section.innerHTML = `
        <div style="font-weight:700;margin-bottom:16px;font-size:16px;">👤 Mi Cuenta</div>
        <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
            <div id="profile-account-avatar" style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#8b5cf6,#06b6d4);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:#fff;flex-shrink:0;">
                ${window._currentDisplayName ? window._currentDisplayName.charAt(0).toUpperCase() : '?'}
            </div>
            <div style="flex:1;">
                <div style="font-weight:700;font-size:18px;color:#f1f5f9;">${window._currentDisplayName || 'Usuario'}</div>
                <div style="font-size:12px;color:var(--clr-text-muted);margin-top:3px;display:flex;align-items:center;gap:4px;">${providerLabel}</div>
            </div>
            <button onclick="handleLogout()" style="padding:8px 18px;border-radius:8px;border:1px solid rgba(239,68,68,0.4);background:rgba(239,68,68,0.1);color:#f87171;font-family:var(--font-body);font-weight:600;font-size:13px;cursor:pointer;">
                Cerrar sesión
            </button>
        </div>
    `;

    // Poner avatar de Google si está disponible
    const avatarImg = document.getElementById('nav-avatar')?.querySelector('img');
    if (avatarImg) {
        const avatarDiv = section.querySelector('#profile-account-avatar');
        if (avatarDiv) {
            avatarDiv.innerHTML = `<img src="${avatarImg.src}" alt="Avatar" style="width:52px;height:52px;border-radius:50%;object-fit:cover;">`;
        }
    }

    const statsRow = document.getElementById('profile-stats-row');
    if (statsRow) container.insertBefore(section, statsRow);
    else container.insertBefore(section, container.firstChild);
}

async function _renderServerRankings(userId) {
    // Buscar o crear el contenedor de rankings del servidor
    let serverDiv = document.getElementById('profile-server-rankings');
    if (!serverDiv) {
        const container = document.getElementById('profile-content');
        if (!container) return;

        serverDiv = document.createElement('div');
        serverDiv.id = 'profile-server-rankings';
        serverDiv.className = 'profile-panel card';
        serverDiv.style.cssText = 'padding:24px;margin-bottom:24px;border:1px solid var(--clr-glass-border);';
        serverDiv.innerHTML = `
            <div style="font-weight:700;margin-bottom:16px;font-size:16px;">🌐 Mis Rankings Guardados</div>
            <div id="profile-server-rankings-body" style="color:var(--clr-text-muted);text-align:center;padding:20px;">Cargando...</div>
        `;

        // Insertar antes del historial local
        const historyHost = document.getElementById('profile-history');
        const historyCard = historyHost && historyHost.closest('.profile-panel');
        if (historyCard) {
            container.insertBefore(serverDiv, historyCard);
        } else {
            container.appendChild(serverDiv);
        }
    }

    if (typeof getUserRankings !== 'function') return;

    const { data, error } = await getUserRankings(userId);
    const body = document.getElementById('profile-server-rankings-body');
    if (!body) return;

    if (error || !data || data.length === 0) {
        body.innerHTML = '<p style="color:var(--clr-text-muted);text-align:center;padding:16px;">Aún no tienes puntuaciones guardadas con tu cuenta. Completa un test y guarda tu puntuación.</p>';
        return;
    }

    const diffMap = { easy: '🟢 Fácil', normal: '🔵 Normal', hard: '🔴 Difícil' };
    const rows = data.map(r => {
        const date = r.created_at ? r.created_at.split('T')[0] : '--';
        const col = r.brain_age <= 28 ? '#10b981' : r.brain_age <= 45 ? '#f59e0b' : '#ef4444';
        return `<tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
            <td style="padding:10px;font-size:13px;">${date}</td>
            <td style="padding:10px;font-weight:800;font-size:18px;color:${col};font-family:var(--font-display);">${r.brain_age}<span style="font-size:11px;font-weight:400;color:var(--clr-text-muted);"> años</span></td>
            <td style="padding:10px;font-size:13px;">${diffMap[r.difficulty] || r.difficulty}</td>
        </tr>`;
    }).join('');

    body.innerHTML = `
        <table style="width:100%;border-collapse:collapse;">
            <thead><tr style="border-bottom:1px solid rgba(255,255,255,0.07);">
                <th style="padding:10px;text-align:left;font-size:11px;font-weight:600;color:var(--clr-text-muted);text-transform:uppercase;">Fecha</th>
                <th style="padding:10px;text-align:left;font-size:11px;font-weight:600;color:var(--clr-text-muted);text-transform:uppercase;">Edad Mental</th>
                <th style="padding:10px;text-align:left;font-size:11px;font-weight:600;color:var(--clr-text-muted);text-transform:uppercase;">Nivel</th>
            </tr></thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}

// ══════════════════════════════════════════════════
// HOOK: interceptar la navegación al perfil para inyectar datos de cuenta
// ══════════════════════════════════════════════════

// Esperamos a que window.load termine (app.js ya habrá corrido)
window.addEventListener('load', () => {

    // Re-inicializar auth con la versión mejorada
    window._initAuthGoogle();

    // Override: cuando navigate() vaya a 'profile', también llamamos _loadProfileGoogle
    const originalNavigate = window.navigate;
    if (typeof originalNavigate === 'function') {
        // Patch navigate via MutationObserver en la vista de perfil
        const profileView = document.getElementById('view-profile');
        if (profileView) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(m => {
                    if (m.type === 'attributes' && m.attributeName === 'style') {
                        const isVisible = profileView.style.display !== 'none' && profileView.style.opacity !== '0';
                        if (isVisible) {
                            setTimeout(() => window._loadProfileGoogle(), 350);
                        }
                    }
                });
            });
            observer.observe(profileView, { attributes: true });
        }
    }

    // Override: guardar ranking con user_id si el usuario está logueado
});
