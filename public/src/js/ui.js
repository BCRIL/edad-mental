// ui.js — Gestión de pantallas y navegación
(function () {
    'use strict';

    // ═══════════════════════════════════════════════════════════
    // NAVEGACIÓN Y PANTALLAS
    // ═══════════════════════════════════════════════════════════

    window.showScreen = (id) => {
        $$('.screen').forEach(s => s.classList.remove('active'));
        const target = $(`#screen-${id}`);
        if (!target) return;
        target.classList.remove('active');
        void target.offsetWidth;
        target.classList.add('active');

        // Barra de entrenamiento
        const backBar = document.getElementById('training-back-bar');
        if (backBar) {
            const showBar = APP_STATE.isTrainingMode && id !== 'welcome';
            backBar.style.display = showBar ? 'flex' : 'none';
            backBar.setAttribute('aria-hidden', showBar ? 'false' : 'true');
        }

        // Info sections
        const infoSections = document.querySelector('.info-sections');
        if (infoSections) {
            infoSections.style.display = (id === 'welcome' || id === 'results') ? 'block' : 'none';
        }

        // Padding para training
        const appMain = document.getElementById('app');
        if (appMain) {
            if (APP_STATE.isTrainingMode && id !== 'welcome') {
                appMain.classList.add('training-bar-pad');
            } else {
                appMain.classList.remove('training-bar-pad');
            }
        }
    };

    window.setProgress = (gameIndex) => {
        const pct = (gameIndex / 5) * 100;
        const bar = $('#progress-bar');
        if (bar) bar.style.width = pct + '%';
    };

    window.cleanupActiveGameTimers = () => {
        try {
            if (typeof window.reactionTimeout !== 'undefined' && window.reactionTimeout) clearTimeout(window.reactionTimeout);
            if (typeof window.patternTimer !== 'undefined' && window.patternTimer) clearInterval(window.patternTimer);
            if (typeof window.mathTimer !== 'undefined' && window.mathTimer) clearInterval(window.mathTimer);
            if (typeof window.colorsInterval !== 'undefined' && window.colorsInterval) clearInterval(window.colorsInterval);
        } catch (e) { /* noop */ }
    };

    // Daily Seed para juegos
    const todayStr = new Date().toISOString().split('T')[0];
    let seed = 0;
    for (let i = 0; i < todayStr.length; i++) seed += todayStr.charCodeAt(i);

    function getSeededRandom(seedVal) {
        return function () {
            let t = seedVal += 0x6D2B79F5;
            t = Math.imul(t ^ t >>> 15, t | 1);
            t ^= t + Math.imul(t ^ t >>> 7, t | 61);
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        }
    }

    function shuffleWithSeed(array, rng) {
        let m = array.length, t, i;
        const arr = [...array];
        while (m) {
            i = Math.floor(rng() * m--);
            t = arr[m];
            arr[m] = arr[i];
            arr[i] = t;
        }
        return arr;
    }

    // Games pool
    window.GAMES_POOL = [
        { iconKey: 'reaction', title: 'Tiempo de Reaccion', desc: 'Mide la velocidad de tu sistema nervioso. Cuando la zona roja cambie a verde, pulsa lo más rápido posible.', label: 'Reacción' },
        { iconKey: 'numbers', title: 'Memoria de Numeros', desc: 'Evalúa tu memoria de trabajo a corto plazo. Aparecerá una secuencia de dígitos, luego deberás escribirla de memoria.', label: 'Números' },
        { iconKey: 'patterns', title: 'Reconocimiento de Patrones', desc: 'Mide tu inteligencia fluida y razonamiento lógico. Identifica qué elemento completa cada secuencia.', label: 'Patrones' },
        { iconKey: 'math', title: 'Velocidad Matematica', desc: 'Evalúa tu velocidad de procesamiento cognitivo. Resuelve sumas, restas y multiplicaciones lo más rápido posible.', label: 'Mates' },
        { iconKey: 'sequence', title: 'Memoria de Secuencia', desc: 'Basada en el test de bloques de Corsi. Observa las casillas que se iluminan y repite la secuencia.', label: 'Secuencia' },
        { iconKey: 'colors', title: 'Percepción de Colores', desc: 'Efecto Stroop. Presta atención al COLOR en el que está pintada la palabra, ignorando el texto.', label: 'Colores' },
        { iconKey: 'spatial', title: 'Memoria Espacial', desc: 'Memoriza las posiciones de las celdas que se iluminan. Cuando se oculten, pulsa solo esas celdas.', label: 'Espacial' }
    ];

    const dailyRng = getSeededRandom(seed);
    window.GAMES_TODAY = shuffleWithSeed(window.GAMES_POOL, dailyRng).slice(0, 5);
    window.GAMES_TODAY.forEach((g, i) => g.id = i + 1);
    window.GAMES_TODAY_BACKUP = { ...window.GAMES_TODAY[0] };

    // Iconos SVG
    window.GAME_ICONS = {
        reaction: '<svg viewBox="0 0 48 48" width="48" height="48"><path d="M28 4l-4 18h10L20 44l4-18H14L28 4z" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        numbers: '<svg viewBox="0 0 48 48" width="48" height="48"><rect x="8" y="8" width="32" height="32" rx="6" fill="none" stroke="#06b6d4" stroke-width="2.5"/><text x="24" y="30" text-anchor="middle" font-family="Outfit,sans-serif" font-weight="800" font-size="18" fill="#22d3ee">123</text></svg>',
        patterns: '<svg viewBox="0 0 48 48" width="48" height="48"><circle cx="16" cy="16" r="6" fill="none" stroke="#a78bfa" stroke-width="2.5"/><rect x="28" y="10" width="12" height="12" rx="2" fill="none" stroke="#f472b6" stroke-width="2.5"/><polygon points="16,28 22,40 10,40" fill="none" stroke="#34d399" stroke-width="2.5" stroke-linejoin="round"/><path d="M28 28l12 12M28 40l12-12" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round"/></svg>',
        math: '<svg viewBox="0 0 48 48" width="48" height="48"><circle cx="24" cy="24" r="18" fill="none" stroke="#8b5cf6" stroke-width="2.5"/><text x="24" y="20" text-anchor="middle" font-family="Outfit,sans-serif" font-weight="800" font-size="12" fill="#a78bfa">+-%C3%97</text><path d="M15 28h18" fill="none" stroke="#a78bfa" stroke-width="2" stroke-linecap="round"/><text x="24" y="38" text-anchor="middle" font-family="Outfit,sans-serif" font-weight="800" font-size="10" fill="#22d3ee">=?</text></svg>',
        sequence: '<svg viewBox="0 0 48 48" width="48" height="48"><rect x="6" y="6" width="10" height="10" rx="2" fill="#8b5cf6" opacity=".3"/><rect x="19" y="6" width="10" height="10" rx="2" fill="#8b5cf6" opacity=".7"/><rect x="32" y="6" width="10" height="10" rx="2" fill="#8b5cf6" opacity=".3"/><rect x="6" y="19" width="10" height="10" rx="2" fill="#8b5cf6" opacity=".7"/><rect x="19" y="19" width="10" height="10" rx="2" fill="#8b5cf6"/><rect x="32" y="19" width="10" height="10" rx="2" fill="#8b5cf6" opacity=".7"/><rect x="6" y="32" width="10" height="10" rx="2" fill="#8b5cf6" opacity=".3"/><rect x="19" y="32" width="10" height="10" rx="2" fill="#8b5cf6" opacity=".7"/><rect x="32" y="32" width="10" height="10" rx="2" fill="#8b5cf6" opacity=".3"/></svg>',
        colors: '<svg viewBox="0 0 48 48" width="48" height="48"><circle cx="18" cy="18" r="12" fill="none" stroke="#ef4444" stroke-width="2.5"/><circle cx="30" cy="18" r="12" fill="none" stroke="#3b82f6" stroke-width="2.5"/><circle cx="24" cy="30" r="12" fill="none" stroke="#10b981" stroke-width="2.5"/></svg>',
        spatial: '<svg viewBox="0 0 48 48" width="48" height="48"><rect x="10" y="10" width="12" height="12" rx="2" fill="none" stroke="#f472b6" stroke-width="2.5"/><rect x="26" y="10" width="12" height="12" rx="2" fill="#f472b6" /><rect x="10" y="26" width="12" height="12" rx="2" fill="#f472b6" /><rect x="26" y="26" width="12" height="12" rx="2" fill="none" stroke="#f472b6" stroke-width="2.5"/></svg>'
    };

    // ═══════════════════════════════════════════════════════════
    // INICIALIZACIÓN LAZY
    // ═══════════════════════════════════════════════════════════

    window.initUIEvents = () => {
        const diffDescriptions = {
            'easy': 'Mayor tiempo en pruebas y menor complejidad. Penaliza ligeramente tu edad mental final.',
            'normal': 'Nivel equilibrado. Ideal para conocer tu edad mental con precisión estándar.',
            'hard': 'Menos tiempo y secuencias más largas. Una buena puntuación mejora mucho tu resultado final.'
        };

        $$('.btn-diff').forEach(btn => {
            btn.addEventListener('click', (e) => {
                $$('.btn-diff').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                APP_STATE.currentDifficulty = btn.dataset.diff;
                const descEl = document.getElementById('difficulty-description');
                if (descEl) {
                    descEl.textContent = diffDescriptions[APP_STATE.currentDifficulty] || diffDescriptions['normal'];
                }
                sfxClick();
            });
        });

        const btnStart = $('#btn-start');
        if (btnStart) {
            btnStart.addEventListener('click', () => {
                APP_STATE.isTrainingMode = false;
                window.GAMES_TODAY[0] = { ...window.GAMES_TODAY_BACKUP };
                getAudioCtx();
                sfxClick();
                APP_STATE.currentGame = 0;
                if (typeof window.startNextGame === 'function') window.startNextGame();
            });
        }

        const btnTrainingBack = document.getElementById('btn-training-back');
        if (btnTrainingBack) {
            btnTrainingBack.addEventListener('click', () => {
                sfxClick();
                if (typeof window.exitTrainingFlow === 'function') window.exitTrainingFlow();
            });
        }

        const btnRetry = $('#btn-retry');
        if (btnRetry) {
            btnRetry.addEventListener('click', () => {
                sfxClick();
                APP_STATE.isTrainingMode = false;
                window.GAMES_TODAY[0] = { ...window.GAMES_TODAY_BACKUP };
                Object.keys(APP_STATE.scores).forEach(k => APP_STATE.scores[k] = 0);
                Object.keys(APP_STATE.rawMetrics).forEach(k => APP_STATE.rawMetrics[k] = 0);
                APP_STATE.currentGame = 0;
                showScreen('welcome');
            });
        }
    };

    console.log('✅ ui.js loaded');
})();
