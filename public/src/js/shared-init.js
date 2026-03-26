// shared-init.js - Inicialización de componentes compartidos en todas las páginas
// Version 2.0 - Simplificado para arquitectura multi-página
(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════
    // HAMBURGER MENU
    // ═══════════════════════════════════════════════════════════
    function initHamburger() {
        const hamburgerBtn = document.getElementById('hamburger-btn');
        const navLinks = document.querySelector('.nav-links');

        if (hamburgerBtn && navLinks) {
            // Cerrar al hacer clic en un enlace
            navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    navLinks.classList.remove('open');
                    hamburgerBtn.classList.remove('active');
                });
            });

            // Cerrar al hacer clic fuera
            document.addEventListener('click', function(e) {
                if (!navLinks.contains(e.target) && !hamburgerBtn.contains(e.target)) {
                    navLinks.classList.remove('open');
                    hamburgerBtn.classList.remove('active');
                }
            });
        }
    }

    // ═══════════════════════════════════════════════════════════
    // AUTH UI INITIALIZATION
    // ═══════════════════════════════════════════════════════════
    async function initAuthUI() {
        if (typeof getCurrentUser !== 'function') return;

        const user = await getCurrentUser();
        const navAuthArea = document.getElementById('nav-auth-area');
        const btnNavLogin = document.getElementById('btn-nav-login');
        const navUserPill = document.getElementById('nav-user-pill');
        const navAvatar = document.getElementById('nav-avatar');
        const navUsername = document.getElementById('nav-username');

        if (!navAuthArea || !btnNavLogin || !navUserPill) return;

        if (user) {
            // Usuario autenticado
            btnNavLogin.style.display = 'none';
            navUserPill.style.display = 'flex';

            // Obtener display name
            if (typeof getUserDisplayName === 'function') {
                const displayName = await getUserDisplayName(user.id);
                if (displayName && navUsername) {
                    navUsername.textContent = displayName;
                }
            }

            // Avatar - primera letra del email o display name
            if (navAvatar) {
                const letter = (user.email?.[0] || '?').toUpperCase();
                navAvatar.textContent = letter;
            }
        } else {
            // Usuario no autenticado
            btnNavLogin.style.display = 'block';
            navUserPill.style.display = 'none';
        }
    }

    // ═══════════════════════════════════════════════════════════
    // AUTH MODAL TABS
    // ═══════════════════════════════════════════════════════════
    window.switchAuthTab = function(tab) {
        const loginForm = document.getElementById('form-login');
        const registerForm = document.getElementById('form-register');
        const tabLogin = document.getElementById('tab-login');
        const tabRegister = document.getElementById('tab-register');

        if (loginForm && registerForm) {
            if (tab === 'login') {
                loginForm.style.display = 'block';
                registerForm.style.display = 'none';
                if (tabLogin) tabLogin.classList.add('active');
                if (tabRegister) tabRegister.classList.remove('active');
            } else {
                loginForm.style.display = 'none';
                registerForm.style.display = 'block';
                if (tabLogin) tabLogin.classList.remove('active');
                if (tabRegister) tabRegister.classList.add('active');
            }
        }
    };

    // ═══════════════════════════════════════════════════════════
    // CLOSE AUTH MODAL ON SIGN IN
    // ═══════════════════════════════════════════════════════════
    window.closeAuthModal = function() {
        const authModal = document.getElementById('auth-modal');
        if (authModal) authModal.style.display = 'none';
    };

    // ═══════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════
    document.addEventListener('DOMContentLoaded', function() {
        initHamburger();
        initAuthUI();

        // Re-check auth on visibility change (usuario vuelve de otra pestaña)
        document.addEventListener('visibilitychange', function() {
            if (document.visibilityState === 'visible') {
                initAuthUI();
            }
        });
    });

    // Re-check auth al autenticarse
    if (typeof onAuthChange === 'function') {
        onAuthChange(() => {
            initAuthUI();
        });
    }
})();
