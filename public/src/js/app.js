/* ============================================
   Test de Edad Mental — Game Engine & Logic
   Vanilla JS — No dependencies
   ============================================ */

(function () {
    'use strict';

    // ── State ──
    const scores = { reaction: 0, numbers: 0, patterns: 0, math: 0, sequence: 0, colors: 0, spatial: 0 };
    // Raw metrics stored for scientific brain-age mapping
    const rawMetrics = { reactionMs: 0, digitSpan: 0, patternScore: 0, mathRate: 0, sequenceSpan: 0, colorsScore: 0, spatialSpan: 0 };
    let currentGame = 0;
    let currentDifficulty = 'normal';
    let isTrainingMode = false;
    let trainingScoreHistory = [];

    // ── Difficulty Config (dramatic differences per level) ──
    const DIFF = {
        easy: { reactionFakeChance: 0, reactionMinDelay: 2000, reactionMaxDelay: 4000, reactionRounds: 2, numberStart: 3, patternTime: 45, mathTime: 45, simonFlashMs: 550, simonPauseMs: 250, colorsTime: 40, spatialStartLevel: 1 },
        normal: { reactionFakeChance: 0, reactionMinDelay: 1000, reactionMaxDelay: 3000, reactionRounds: 3, numberStart: 4, patternTime: 30, mathTime: 30, simonFlashMs: 420, simonPauseMs: 180, colorsTime: 30, spatialStartLevel: 1 },
        hard: { reactionFakeChance: 0.35, reactionMinDelay: 500, reactionMaxDelay: 1800, reactionRounds: 5, numberStart: 6, patternTime: 18, mathTime: 18, simonFlashMs: 260, simonPauseMs: 100, colorsTime: 20, spatialStartLevel: 2 }
    };
    function D() { return DIFF[currentDifficulty]; }

    // SVG icons for each game
    const gameIcons = {
        reaction: '<svg viewBox="0 0 48 48" width="48" height="48"><path d="M28 4l-4 18h10L20 44l4-18H14L28 4z" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        numbers: '<svg viewBox="0 0 48 48" width="48" height="48"><rect x="8" y="8" width="32" height="32" rx="6" fill="none" stroke="#06b6d4" stroke-width="2.5"/><text x="24" y="30" text-anchor="middle" font-family="Outfit,sans-serif" font-weight="800" font-size="18" fill="#22d3ee">123</text></svg>',
        patterns: '<svg viewBox="0 0 48 48" width="48" height="48"><circle cx="16" cy="16" r="6" fill="none" stroke="#a78bfa" stroke-width="2.5"/><rect x="28" y="10" width="12" height="12" rx="2" fill="none" stroke="#f472b6" stroke-width="2.5"/><polygon points="16,28 22,40 10,40" fill="none" stroke="#34d399" stroke-width="2.5" stroke-linejoin="round"/><path d="M28 28l12 12M28 40l12-12" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round"/></svg>',
        math: '<svg viewBox="0 0 48 48" width="48" height="48"><circle cx="24" cy="24" r="18" fill="none" stroke="#8b5cf6" stroke-width="2.5"/><text x="24" y="20" text-anchor="middle" font-family="Outfit,sans-serif" font-weight="800" font-size="12" fill="#a78bfa">+-%C3%97</text><path d="M15 28h18" fill="none" stroke="#a78bfa" stroke-width="2" stroke-linecap="round"/><text x="24" y="38" text-anchor="middle" font-family="Outfit,sans-serif" font-weight="800" font-size="10" fill="#22d3ee">=?</text></svg>',
        sequence: '<svg viewBox="0 0 48 48" width="48" height="48"><rect x="6" y="6" width="10" height="10" rx="2" fill="#8b5cf6" opacity=".3"/><rect x="19" y="6" width="10" height="10" rx="2" fill="#8b5cf6" opacity=".7"/><rect x="32" y="6" width="10" height="10" rx="2" fill="#8b5cf6" opacity=".3"/><rect x="6" y="19" width="10" height="10" rx="2" fill="#8b5cf6" opacity=".7"/><rect x="19" y="19" width="10" height="10" rx="2" fill="#8b5cf6"/><rect x="32" y="19" width="10" height="10" rx="2" fill="#8b5cf6" opacity=".7"/><rect x="6" y="32" width="10" height="10" rx="2" fill="#8b5cf6" opacity=".3"/><rect x="19" y="32" width="10" height="10" rx="2" fill="#8b5cf6" opacity=".7"/><rect x="32" y="32" width="10" height="10" rx="2" fill="#8b5cf6" opacity=".3"/></svg>',
        colors: '<svg viewBox="0 0 48 48" width="48" height="48"><circle cx="18" cy="18" r="12" fill="none" stroke="#ef4444" stroke-width="2.5"/><circle cx="30" cy="18" r="12" fill="none" stroke="#3b82f6" stroke-width="2.5"/><circle cx="24" cy="30" r="12" fill="none" stroke="#10b981" stroke-width="2.5"/></svg>',
        spatial: '<svg viewBox="0 0 48 48" width="48" height="48"><rect x="10" y="10" width="12" height="12" rx="2" fill="none" stroke="#f472b6" stroke-width="2.5"/><rect x="26" y="10" width="12" height="12" rx="2" fill="#f472b6" /><rect x="10" y="26" width="12" height="12" rx="2" fill="#f472b6" /><rect x="26" y="26" width="12" height="12" rx="2" fill="none" stroke="#f472b6" stroke-width="2.5"/></svg>'
    };

    const gamesPool = [
        { iconKey: 'reaction', title: 'Tiempo de Reaccion', desc: 'Mide la velocidad de tu sistema nervioso. Cuando la zona roja cambie a verde, pulsa lo mas rapido posible. Se realizaran 3 rondas y se calculara tu tiempo medio de reaccion. Un adulto joven promedia unos 250ms.', label: 'Reacción' },
        { iconKey: 'numbers', title: 'Memoria de Numeros', desc: 'Evalua tu memoria de trabajo a corto plazo. Aparecera una secuencia de digitos durante unos segundos. Despues, deberas escribirla de memoria. Cada nivel anade un digito mas. La capacidad media es de 7 digitos.', label: 'Números' },
        { iconKey: 'patterns', title: 'Reconocimiento de Patrones', desc: 'Mide tu inteligencia fluida y razonamiento logico. Identifica que elemento completa cada secuencia. Tienes 30 segundos para resolver el maximo de patrones posibles entre numeros, colores, formas y letras.', label: 'Patrones' },
        { iconKey: 'math', title: 'Velocidad Matematica', desc: 'Evalua tu velocidad de procesamiento cognitivo. Resuelve sumas, restas y multiplicaciones lo mas rapido posible en 30 segundos. La precision tambien cuenta: las respuestas incorrectas reducen tu puntuacion.', label: 'Mates' },
        { iconKey: 'sequence', title: 'Memoria de Secuencia', desc: 'Basada en el test de bloques de Corsi. Observa las casillas que se iluminan y repite la secuencia en el mismo orden. Cada ronda anade un paso mas. La capacidad media es de 5-6 elementos.', label: 'Secuencia' },
        { iconKey: 'colors', title: 'Percepción de Colores', desc: 'Efecto Stroop. Presta atención al COLOR en el que está pintada la palabra, ignorando lo que dice el texto. Selecciona el botón que indique el COLOR de la tinta. Tienes 30 segundos.', label: 'Colores' },
        { iconKey: 'spatial', title: 'Memoria Espacial', desc: 'Aparecerá una cuadrícula donde algunas celdas se iluminarán en azul durante un instante. Memoriza las posiciones. Cuando se oculten, pulsa solo las celdas que se iluminaron. Se requiere precisión perfecta.', label: 'Espacial' }
    ];

    // Seeded Random Number Generator for Daily Tests
    function getSeededRandom(seed) {
        return function () {
            let t = seed += 0x6D2B79F5;
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

    // Daily Seed
    const todayStr = new Date().toISOString().split('T')[0];
    let seed = 0;
    for (let i = 0; i < todayStr.length; i++) seed += todayStr.charCodeAt(i);
    const dailyRng = getSeededRandom(seed);

    // Select 5 games for today's test
    const games = shuffleWithSeed(gamesPool, dailyRng).slice(0, 5);
    games.forEach((g, i) => g.id = i + 1);
    const dailyGame0Backup = { ...games[0] };

    /** 'home' | 'training' — where the user opened training from */
    let trainingEntryView = 'home';

    // ── Helpers ──
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    function showScreen(id) {
        $$('.screen').forEach(s => s.classList.remove('active'));
        const target = $(`#screen-${id}`);
        target.classList.remove('active');
        void target.offsetWidth;
        target.classList.add('active');
        const backBar = document.getElementById('training-back-bar');
        if (backBar) {
            const showBar = isTrainingMode && id !== 'welcome';
            backBar.style.display = showBar ? 'flex' : 'none';
            backBar.setAttribute('aria-hidden', showBar ? 'false' : 'true');
        }
        
        // Hide info-sections during games/results to prevent scrolling noise
        const infoSections = document.querySelector('.info-sections');
        if (infoSections) {
            infoSections.style.display = (id === 'welcome' || id === 'results') ? 'block' : 'none';
        }

        const appMain = document.getElementById('app');
        if (appMain) {
            if (isTrainingMode && id !== 'welcome') appMain.classList.add('training-bar-pad');
            else appMain.classList.remove('training-bar-pad');
        }
    }

    function cleanupActiveGameTimers() {
        try {
            if (typeof reactionTimeout !== 'undefined' && reactionTimeout) clearTimeout(reactionTimeout);
        } catch (e) { /* noop */ }
        try {
            if (typeof patternTimer !== 'undefined' && patternTimer) clearInterval(patternTimer);
        } catch (e) { /* noop */ }
        try {
            if (typeof mathTimer !== 'undefined' && mathTimer) clearInterval(mathTimer);
        } catch (e) { /* noop */ }
        try {
            if (typeof colorsInterval !== 'undefined' && colorsInterval) clearInterval(colorsInterval);
        } catch (e) { /* noop */ }
    }

    function exitTrainingFlow() {
        cleanupActiveGameTimers();
        isTrainingMode = false;
        currentGame = 0;
        games[0] = { ...dailyGame0Backup };
        const backBar = document.getElementById('training-back-bar');
        if (backBar) {
            backBar.style.display = 'none';
            backBar.setAttribute('aria-hidden', 'true');
        }
        const appMainExit = document.getElementById('app');
        if (appMainExit) appMainExit.classList.remove('training-bar-pad');

        // Detectar si estamos en SPA o página individual
        const isSPA = document.getElementById('view-welcome') !== null;

        if (isSPA) {
            // Estamos en index.html - usar router SPA
            if (trainingEntryView === 'training') {
                navigate('/entrenamiento');
            } else {
                navigate('/');
                setTimeout(() => showScreen('welcome'), 330);
            }
        } else {
            // Estamos en página individual - ocultar game screens y mostrar lista
            const screens = ['screen-instructions', 'screen-game-reaction', 'screen-game-numbers',
                'screen-game-patterns', 'screen-game-math', 'screen-game-sequence',
                'screen-game-colors', 'screen-game-spatial'];
            screens.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = 'none';
            });

            // Mostrar la lista de entrenamientos nuevamente
            const trainingList = document.querySelector('.training-page-main');
            if (trainingList) trainingList.style.display = 'block';
        }
    }

    function setProgress(gameIndex) {
        const pct = (gameIndex / 5) * 100;
        $('#progress-bar').style.width = pct + '%';
    }

    function randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = randInt(0, i);
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function sleep(ms) {
        return new Promise(r => setTimeout(r, ms));
    }

    function spawnParticles(element) {
        if (!element) return;
        const rect = element.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        for (let i = 0; i < 12; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.left = cx + 'px';
            p.style.top = cy + 'px';
            p.style.width = randInt(6, 12) + 'px';
            p.style.height = p.style.width;
            p.style.position = 'fixed';
            p.style.pointerEvents = 'none';
            p.style.zIndex = '1000';
            p.style.backgroundColor = ['#22d3ee', '#a78bfa', '#f472b6', '#34d399', '#f59e0b'][randInt(0, 4)];
            p.style.borderRadius = '50%';
            p.style.transition = 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
            document.body.appendChild(p);

            const angle = Math.random() * Math.PI * 2;
            const dist = randInt(40, 120);
            const tx = Math.cos(angle) * dist;
            const ty = Math.sin(angle) * dist - 40;

            void p.offsetWidth; // trigger reflow
            p.style.transform = `translate(${tx}px, ${ty}px) scale(0)`;
            p.style.opacity = '0';
            setTimeout(() => p.remove(), 600);
        }
    }

    // ══════════════════════════════════════════
    // SOUND ENGINE — Web Audio API (no files needed)
    // ══════════════════════════════════════════
    let audioCtx = null;

    function getAudioCtx() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioCtx;
    }

    function playTone(freq, duration, type = 'sine', volume = 0.15) {
        try {
            const ctx = getAudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(volume, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + duration);
        } catch (e) { /* Audio not supported, fail silently */ }
    }

    function sfxCorrect() {
        if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
        playTone(523, 0.12, 'sine', 0.12);
        setTimeout(() => playTone(659, 0.12, 'sine', 0.12), 80);
        setTimeout(() => playTone(784, 0.18, 'sine', 0.10), 160);
        if (typeof setParticlesState === 'function') {
            setParticlesState('fast');
            setTimeout(() => setParticlesState('normal'), 600);
        }
    }

    function sfxWrong() {
        if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
        playTone(330, 0.15, 'square', 0.08);
        setTimeout(() => playTone(260, 0.25, 'square', 0.06), 120);
    }

    function sfxClick() {
        playTone(800, 0.05, 'sine', 0.08);
    }

    function sfxCountdown() {
        playTone(440, 0.1, 'sine', 0.08);
    }

    function sfxGo() {
        playTone(880, 0.15, 'sine', 0.12);
        setTimeout(() => playTone(1100, 0.2, 'sine', 0.10), 100);
    }

    function sfxSimonFlash(index) {
        // Each tile plays a unique note from a pentatonic scale
        const notes = [262, 294, 330, 392, 440, 523, 587, 659, 784];
        playTone(notes[index] || 440, 0.25, 'sine', 0.10);
    }

    function sfxTooEarly() {
        playTone(200, 0.3, 'sawtooth', 0.06);
    }

    function sfxResults() {
        const notes = [523, 659, 784, 1047];
        notes.forEach((n, i) => {
            setTimeout(() => playTone(n, 0.2, 'sine', 0.10), i * 150);
        });
    }

    function sfxTimerWarn() {
        playTone(600, 0.08, 'square', 0.05);
    }

    // ── Show Instructions before each game ──
    function showInstructions(gameIndex) {
        const g = games[gameIndex];
        setProgress(gameIndex);
        $('#game-badge').textContent = `Prueba ${g.id} de 5`;
        $('#instruction-icon').innerHTML = gameIcons[g.iconKey];
        $('#instruction-title').textContent = g.title;
        $('#instruction-text').textContent = g.desc;
        showScreen('instructions');
    }

    function renderDailyTestsInfo() {
        const container = $('#daily-tests-info');
        if (!container) return;

        const fullDescriptions = {
            'reaction': {
                desc1: 'Mide cuanto tarda tu sistema nervioso en procesar un estimulo visual y generar una respuesta motora. Segun investigaciones de Der y Deary (2006), el tiempo de reaccion simple promedia 250ms en adultos jovenes y aumenta aproximadamente 1ms por año despues de los 25.',
                desc2: 'Se realizan 3 rondas para calcular tu media y reducir la variabilidad. Los resultados reflejan la eficiencia de tu transmision neuronal.',
                tags: ['Velocidad neuronal', 'Atención sostenida']
            },
            'numbers': {
                desc1: 'Evalua tu memoria de trabajo a corto plazo. Aparecera una secuencia de digitos durante unos segundos. Despues de que desaparezcan, tendras que introducirlos de memoria.',
                desc2: 'Basado en el subtest de digitos de la escala WAIS-IV. Cada nivel superado con exito anade un digito adicional a la secuencia. Un span de 7 digitos es considerado promedio.',
                tags: ['Memoria de trabajo', 'Retencion a corto plazo']
            },
            'patterns': {
                desc1: 'Diseñada para evaluar la inteligencia fluida (resolver problemas nuevos ideando patrones lógicos concurrentes). Tienes 30 segundos para identificar la figura o el numero que continua cada secuencia.',
                desc2: 'Mide el razonamiento inductivo tipico del test de Matrices de Raven mediante la aplicación de flexibilidad cognitiva en tiempo real.',
                tags: ['Inteligencia Fluida', 'Razonamiento logico']
            },
            'math': {
                desc1: 'Mide tu velocidad de procesamiento cognitivo resolviendo sumas, restas y multiplicaciones simples contra el reloj. Esta habilidad es una de las que más declinan con la edad de forma natural.',
                desc2: 'La puntuacion tiene en cuenta tanto la velocidad como la precision. Responder al azar penaliza tu resultado.',
                tags: ['Velocidad de procesamiento', 'Calculo mental']
            },
            'sequence': {
                desc1: 'Inspirada en el test de bloques de Corsi y el clasico juego Simon. Evalua tu memoria visuoespacial y capacidad de retener secuencias de forma ordenada y estructurada.',
                desc2: 'La cuadricula se iluminará en secuencias de posiciones ordenadas. Debes reproducir el orden exacto de los flashes.',
                tags: ['Memoria visuoespacial', 'Span de Corsi']
            },
            'colors': {
                desc1: 'Aplica el mundialmente famoso "Efecto Stroop". Valida tu control inhibitorio y atención selectiva. Deberás ignorar lo que ESTÁ ESCRITO en la pantalla, y pulsar el botón que concuerde con la TINTA en la que está coloreada la palabra.',
                desc2: 'El cerebro adulto sano tiende a leer las palabras más rápido de lo que reconoce los colores, obligando a tu córtex prefrontal a suprimir ese instinto para acertar.',
                tags: ['Atención dividida', 'Control inhibitorio']
            },
            'spatial': {
                desc1: 'Una variación estática del test de Span visuoespacial. Deberás memorizar las coordenadas de los bloques que se iluminan brevemente y recordar ÚNICAMENTE sus ubicaciones de manera simultánea.',
                desc2: 'Prueba la flexibilidad de la memoria de trabajo y evalúa directamente la capacidad de almacenamiento visual fotográfico.',
                tags: ['Memoria fotográfica', 'Retención espacial']
            }
        };

        container.innerHTML = '';
        games.forEach((g, idx) => {
            const d = fullDescriptions[g.iconKey];
            const tagsHtml = d.tags.map(t => `<span class="test-metric">${t}</span>`).join('');
            container.innerHTML += `
                <div class="test-detail">
                    <div class="test-detail-header">
                        <div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">
                            ${gameIcons[g.iconKey]}
                        </div>
                        <h3>Prueba ${idx + 1}: ${g.title}</h3>
                    </div>
                    <p>${d.desc1}</p>
                    <p>${d.desc2}</p>
                    ${tagsHtml}
                </div>
            `;
        });
    }

    // ── Navigation ──
    function startNextGame() {
        if (currentGame >= 5) {
            showResults();
            return;
        }
        showInstructions(currentGame);
    }

    // ══════════════════════════════════════════
    // GAME 1: Reaction Time
    // ══════════════════════════════════════════
    let reactionTimeout = null;
    let reactionStartTime = 0;
    let reactionAttempts = [];
    let reactionRound = 0;
    // REACTION_ROUNDS now comes from difficulty config

    function startReactionGame() {
        reactionAttempts = [];
        reactionRound = 0;
        showScreen('game-reaction');
        runReactionRound();
    }

    function runReactionRound() {
        const zone = $('#reaction-zone');
        const text = $('#reaction-text');
        const hint = $('#reaction-hint');
        const cfg = D();

        zone.style.background = '';
        zone.className = 'reaction-zone waiting';
        text.textContent = currentDifficulty === 'hard' ? '¡Cuidado! Hay trampas...' : 'Espera al color verde...';
        text.className = 'reaction-text';
        hint.textContent = `Ronda ${reactionRound + 1} de ${cfg.reactionRounds}`;

        const oldResult = zone.querySelector('.reaction-time-result');
        if (oldResult) oldResult.remove();

        const delay = cfg.reactionMinDelay + Math.random() * (cfg.reactionMaxDelay - cfg.reactionMinDelay);
        reactionTimeout = setTimeout(() => {
            // Hard mode: fake yellow flash to trick the player
            if (cfg.reactionFakeChance > 0 && Math.random() < cfg.reactionFakeChance) {
                zone.style.background = 'linear-gradient(135deg,#facc15,#f59e0b)';
                text.textContent = '¡NO PULSES! ⚠️';
                text.style.color = '#0f0c29';
                sfxTooEarly();
                setTimeout(() => {
                    zone.style.background = '';
                    text.style.color = '';
                    runReactionRound();
                }, 1000);
                return;
            }
            zone.className = 'reaction-zone ready';
            text.textContent = '¡PULSA AHORA!';
            sfxGo();
            reactionStartTime = performance.now();
        }, delay);
    }

    function handleReactionClick() {
        const zone = $('#reaction-zone');
        const text = $('#reaction-text');
        const cfg = D();

        if (zone.classList.contains('waiting')) {
            clearTimeout(reactionTimeout);
            // Penalise early click
            reactionAttempts.push(1800);
            reactionRound++;
            zone.className = 'reaction-zone too-early';
            text.textContent = '¡Demasiado pronto! -1 ronda';
            sfxTooEarly();
            if (reactionRound >= cfg.reactionRounds) {
                setTimeout(() => finishReaction(), 1200);
            } else {
                setTimeout(() => runReactionRound(), 1500);
            }
            return;
        }

        if (zone.classList.contains('ready')) {
            const elapsed = Math.round(performance.now() - reactionStartTime);
            zone.className = 'reaction-zone clicked';
            text.textContent = '';
            sfxClick();

            const resultEl = document.createElement('div');
            resultEl.className = 'reaction-time-result';
            resultEl.textContent = elapsed + ' ms';
            $('#reaction-content').appendChild(resultEl);

            reactionAttempts.push(elapsed);
            reactionRound++;

            if (reactionRound < cfg.reactionRounds) {
                setTimeout(() => { resultEl.remove(); runReactionRound(); }, 1200);
            } else {
                setTimeout(() => finishReaction(), 1200);
            }
        }
    }

    function finishReaction() {
        const avg = reactionAttempts.reduce((a, b) => a + b, 0) / reactionAttempts.length;
        rawMetrics.reactionMs = avg;
        // Score: 200ms=100, 500ms=0 (linear, clamped)
        let score = Math.round(Math.max(0, Math.min(100, (500 - avg) / 3)));
        scores.reaction = score;
        currentGame++;
        startNextGame();
    }

    // ══════════════════════════════════════════
    // GAME 2: Number Memory
    // ══════════════════════════════════════════
    let numberLevel = 0;
    let numberTarget = '';
    let numberMaxLevel = 0;

    function startNumberGame() {
        numberLevel = D().numberStart;  // Easy=3, Normal=4, Hard=6
        numberMaxLevel = 0;
        showScreen('game-numbers');
        showNumber();
    }

    function showNumber() {
        const display = $('#number-display');
        const inputArea = $('#number-input-area');
        const feedback = $('#number-feedback');
        const timerBar = $('#number-timer-bar');
        const levelEl = $('#number-level');
        const input = $('#number-input');

        inputArea.style.display = 'none';
        feedback.style.display = 'none';
        display.style.display = 'flex';

        levelEl.textContent = `Nivel ${numberLevel - 2}`;

        let digits = '';
        for (let i = 0; i < numberLevel; i++) {
            digits += randInt(i === 0 ? 1 : 0, 9);
        }
        numberTarget = digits;
        display.textContent = digits;

        sfxCountdown();

        const timePerDigit = currentDifficulty === 'hard' ? 280 : currentDifficulty === 'easy' ? 700 : 450;
        const baseShowTime = currentDifficulty === 'hard' ? 600 : currentDifficulty === 'easy' ? 1400 : 1000;
        const showTime = baseShowTime + (numberLevel * timePerDigit);
        timerBar.style.transition = 'none';
        timerBar.style.width = '100%';
        setTimeout(() => {
            timerBar.style.transition = `width ${showTime}ms linear`;
            timerBar.style.width = '0%';
        }, 50);

        setTimeout(() => {
            display.style.display = 'none';
            inputArea.style.display = 'block';
            input.value = '';
            input.focus();
            sfxGo();
        }, showTime);
    }

    function checkNumber() {
        const input = $('#number-input');
        const feedback = $('#number-feedback');
        const userAnswer = input.value.trim();

        if (!userAnswer) return;

        feedback.style.display = 'block';
        $('#number-input-area').style.display = 'none';

        if (userAnswer === numberTarget) {
            numberMaxLevel = numberLevel - 2;
            feedback.className = 'number-feedback correct';
            feedback.textContent = '¡Correcto! Siguiente nivel...';
            sfxCorrect();
            spawnParticles(input);
            numberLevel++;
            if (numberLevel > (currentDifficulty === 'easy' ? 8 : (currentDifficulty === 'hard' ? 12 : 10))) {
                finishNumber();
                return;
            }
            setTimeout(() => showNumber(), 1000);
        } else {
            input.classList.add('shake');
            feedback.className = 'number-feedback wrong';
            feedback.textContent = `Incorrecto — Era: ${numberTarget}`;
            sfxWrong();
            setTimeout(() => {
                input.classList.remove('shake');
                finishNumber();
            }, 1200);
        }
    }

    function finishNumber() {
        rawMetrics.digitSpan = numberMaxLevel;
        let score = Math.round(Math.min(100, Math.max(0, numberMaxLevel * 12.5)));
        scores.numbers = score;
        currentGame++;
        startNextGame();
    }

    // ══════════════════════════════════════════
    // GAME 3: Pattern Recognition (CSS shapes, no emojis)
    // ══════════════════════════════════════════

    // Pattern types: numeric sequences, shape rotations, color progressions
    // Each pattern is defined with HTML/CSS content instead of emojis
    function createShapeEl(shape) {
        const div = document.createElement('div');
        div.className = 'pattern-item';

        if (shape.type === 'number') {
            div.textContent = shape.value;
            div.style.fontFamily = 'var(--font-display)';
            div.style.fontWeight = '800';
            div.style.fontSize = '22px';
            div.style.color = shape.color || 'var(--clr-text)';
        } else if (shape.type === 'color') {
            const inner = document.createElement('div');
            inner.style.width = '32px';
            inner.style.height = '32px';
            inner.style.borderRadius = shape.radius || '50%';
            inner.style.background = shape.color;
            div.appendChild(inner);
        } else if (shape.type === 'dots') {
            div.style.display = 'flex';
            div.style.flexWrap = 'wrap';
            div.style.gap = '3px';
            div.style.justifyContent = 'center';
            div.style.alignContent = 'center';
            for (let i = 0; i < shape.count; i++) {
                const dot = document.createElement('div');
                dot.style.width = '8px';
                dot.style.height = '8px';
                dot.style.borderRadius = '50%';
                dot.style.background = shape.color || '#a78bfa';
                div.appendChild(dot);
            }
        } else if (shape.type === 'bar') {
            const bar = document.createElement('div');
            bar.style.width = '8px';
            bar.style.height = shape.height + 'px';
            bar.style.background = shape.color || 'var(--clr-accent-light)';
            bar.style.borderRadius = '4px';
            div.appendChild(bar);
        } else if (shape.type === 'arrow') {
            div.textContent = shape.value;
            div.style.fontSize = '26px';
            div.style.color = shape.color || 'var(--clr-text)';
        } else if (shape.type === 'letter') {
            div.textContent = shape.value;
            div.style.fontFamily = 'var(--font-display)';
            div.style.fontWeight = '700';
            div.style.fontSize = '24px';
            div.style.color = shape.color || 'var(--clr-accent-light)';
        }

        return div;
    }

    // ── Dynamic Pattern Generator (infinite unique patterns) ──
    function generatePattern() {
        const generators = [
            // Arithmetic: a, a+d, a+2d, a+3d -> a+4d
            () => {
                const a = randInt(1, 20);
                const d = randInt(2, 8) * (Math.random() > 0.3 ? 1 : -1);
                const seq = [a, a + d, a + 2 * d, a + 3 * d];
                const ans = a + 4 * d;
                const wrongs = [ans + randInt(1, 3), ans - randInt(1, 3), ans + d].filter(w => w !== ans && w > 0);
                return { label: '¿Qué número sigue la secuencia?', type: 'number', seq, answer: ans, wrongs };
            },
            // Geometric: a, a*r, a*r², a*r³ -> a*r⁴
            () => {
                const a = randInt(1, 4);
                const r = [2, 3][randInt(0, 1)];
                const seq = [a, a * r, a * r * r, a * r * r * r];
                const ans = a * r * r * r * r;
                const wrongs = [ans + randInt(1, 10), ans - randInt(1, 5), a * r * r * r + r].filter(w => w !== ans && w > 0);
                return { label: '¿Qué número sigue la secuencia?', type: 'number', seq, answer: ans, wrongs };
            },
            // Squares: n², (n+1)², (n+2)², (n+3)² -> (n+4)²
            () => {
                const n = randInt(1, 6);
                const seq = [n * n, (n + 1) * (n + 1), (n + 2) * (n + 2), (n + 3) * (n + 3)];
                const ans = (n + 4) * (n + 4);
                const wrongs = [ans + 1, ans - 1, (n + 3) * (n + 3) + n + 4].filter(w => w !== ans && w > 0);
                return { label: '¿Qué número sigue? (cuadrados)', type: 'number', seq, answer: ans, wrongs };
            },
            // Fibonacci-like: a, b, a+b, a+2b -> a+3b (or true fib)
            () => {
                const a = randInt(1, 5);
                const b = randInt(1, 5);
                const seq = [a, b, a + b, b + a + b];
                const ans = (a + b) + (b + a + b);
                const wrongs = [ans + 2, ans - 2, ans + randInt(3, 6)].filter(w => w !== ans && w > 0);
                return { label: '¿Qué número sigue la serie?', type: 'number', seq, answer: ans, wrongs };
            },
            // Letters with skip: start + skip N
            () => {
                const start = randInt(0, 10);
                const skip = randInt(1, 3);
                const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                const seq = [0, 1, 2, 3].map(i => letters[start + i * skip]);
                const ans = letters[start + 4 * skip];
                const nearLetters = [letters[start + 4 * skip + 1], letters[start + 4 * skip - 1], letters[start + 3 * skip + 1]].filter(w => w && w !== ans);
                return { label: '¿Qué letra sigue?', type: 'letter', seq, answer: ans, wrongs: nearLetters };
            },
            // Dots counting
            () => {
                const start = randInt(1, 3);
                const step = randInt(1, 3);
                const colors = ['#f472b6', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981'];
                const c = colors[randInt(0, colors.length - 1)];
                const seq = [start, start + step, start + 2 * step, start + 3 * step];
                const ans = start + 4 * step;
                const wrongs = [ans + 1, ans - 1, ans + step].filter(w => w !== ans && w > 0);
                return { label: '¿Cuántos puntos van a continuación?', type: 'dots', seq, answer: ans, wrongs, color: c };
            },
            // Bar heights
            () => {
                const start = randInt(5, 15);
                const step = randInt(5, 12);
                const colors = ['#34d399', '#f59e0b', '#06b6d4', '#a78bfa', '#f472b6'];
                const c = colors[randInt(0, colors.length - 1)];
                const seq = [start, start + step, start + 2 * step, start + 3 * step];
                const ans = start + 4 * step;
                const wrongs = [ans + step, ans - step, start + 2 * step].filter(w => w !== ans && w > 0);
                return { label: '¿Qué barra sigue el patrón?', type: 'bar', seq, answer: ans, wrongs, color: c };
            },
            // Color gradient
            () => {
                const hue = randInt(0, 360);
                const seq = [0, 1, 2, 3].map(i => `hsl(${hue}, 70%, ${80 - i * 15}%)`);
                const ans = `hsl(${hue}, 70%, ${80 - 4 * 15}%)`;
                const wrongs = [
                    `hsl(${(hue + 120) % 360}, 70%, 35%)`,
                    `hsl(${hue}, 70%, 75%)`,
                    `hsl(${(hue + 60) % 360}, 70%, 50%)`
                ];
                return { label: '¿Qué color continúa la degradación?', type: 'color', seq, answer: ans, wrongs };
            },
        ];

        const gen = generators[randInt(0, generators.length - 1)];
        return buildPatternSet(gen());
    }

    function buildPatternSet(raw) {
        const { label, type, seq, answer, wrongs, color } = raw;
        const patSet = { label, answer: 0, seq: [], options: [] };

        if (type === 'number') {
            patSet.seq = seq.map(v => ({ type: 'number', value: String(v) }));
            const allOpts = [answer, ...wrongs.slice(0, 3)];
            while (allOpts.length < 4) allOpts.push(answer + randInt(1, 8));
            patSet.options = allOpts.map(v => ({ type: 'number', value: String(v) }));
        } else if (type === 'letter') {
            patSet.seq = seq.map(v => ({ type: 'letter', value: v }));
            const allOpts = [answer, ...wrongs.slice(0, 3)];
            while (allOpts.length < 4) allOpts.push(String.fromCharCode(65 + randInt(0, 25)));
            patSet.options = allOpts.map(v => ({ type: 'letter', value: v }));
        } else if (type === 'dots') {
            patSet.seq = seq.map(v => ({ type: 'dots', count: v, color: color || '#f472b6' }));
            const allOpts = [answer, ...wrongs.slice(0, 3)];
            while (allOpts.length < 4) allOpts.push(answer + randInt(1, 4));
            patSet.options = allOpts.map(v => ({ type: 'dots', count: v, color: color || '#f472b6' }));
        } else if (type === 'bar') {
            patSet.seq = seq.map(v => ({ type: 'bar', height: v, color: color || '#34d399' }));
            const allOpts = [answer, ...wrongs.slice(0, 3)];
            while (allOpts.length < 4) allOpts.push(answer + randInt(2, 10));
            patSet.options = allOpts.map(v => ({ type: 'bar', height: v, color: color || '#34d399' }));
        } else if (type === 'color') {
            patSet.seq = seq.map(v => ({ type: 'color', color: v }));
            const allOpts = [answer, ...wrongs.slice(0, 3)];
            while (allOpts.length < 4) allOpts.push(`hsl(${randInt(0, 360)}, 60%, 50%)`);
            patSet.options = allOpts.map(v => ({ type: 'color', color: v }));
        }
        return patSet;
    }

    // Generate N fresh patterns per game session
    let generatedPatterns = [];
    let patternIndex = 0;
    let patternCorrect = 0;
    let patternTimer = null;
    let patternTimeLeft = 30;

    function startPatternGame() {
        const numPatterns = D().patternRounds || 12;
        generatedPatterns = [];
        for (let i = 0; i < numPatterns; i++) generatedPatterns.push(generatePattern());
        patternIndex = 0;
        patternCorrect = 0;
        patternTimeLeft = D().patternTime;
        showScreen('game-patterns');
        showPatternRound();
        patternTimer = setInterval(() => {
            patternTimeLeft--;
            $('#pattern-timer').textContent = patternTimeLeft + 's';
            if (patternTimeLeft <= 5 && patternTimeLeft > 0) sfxTimerWarn();
            if (patternTimeLeft <= 0) {
                clearInterval(patternTimer);
                finishPattern();
            }
        }, 1000);
    }

    function showPatternRound() {
        if (patternIndex >= generatedPatterns.length) {
            clearInterval(patternTimer);
            finishPattern();
            return;
        }

        const p = generatedPatterns[patternIndex];
        const seqEl = $('#pattern-sequence');
        const optEl = $('#pattern-options');
        const scoreEl = $('#pattern-score');
        const promptEl = $('#pattern-prompt');

        promptEl.textContent = p.label;

        // Build sequence
        seqEl.innerHTML = '';
        p.seq.forEach((item, idx) => {
            const el = createShapeEl(item);
            // Special handling for size-progression pattern
            if (p.seqSizes) {
                const inner = el.querySelector('div');
                if (inner) {
                    inner.style.width = p.seqSizes[idx] + 'px';
                    inner.style.height = p.seqSizes[idx] + 'px';
                }
            }
            seqEl.appendChild(el);
        });

        // Mystery item
        const mystery = document.createElement('div');
        mystery.className = 'pattern-item mystery';
        mystery.textContent = '?';
        seqEl.appendChild(mystery);

        // Options (shuffled, but tracking correct answer index)
        const indexedOptions = p.options.map((opt, i) => ({ opt, isCorrect: i === p.answer }));
        const shuffled = shuffle(indexedOptions);

        optEl.innerHTML = '';
        shuffled.forEach(({ opt, isCorrect }, idx) => {
            const btn = document.createElement('button');
            btn.className = 'pattern-option';
            const inner = createShapeEl(opt);
            // For size options
            if (opt.size) {
                const circle = inner.querySelector('div');
                if (circle) {
                    circle.style.width = opt.size + 'px';
                    circle.style.height = opt.size + 'px';
                }
            }
            // Move children from inner to btn
            while (inner.firstChild) btn.appendChild(inner.firstChild);
            // Copy styles
            btn.style.fontFamily = inner.style.fontFamily;
            btn.style.fontWeight = inner.style.fontWeight;
            btn.style.fontSize = inner.style.fontSize;
            btn.style.color = inner.style.color;
            if (opt.type === 'number' || opt.type === 'letter') {
                btn.textContent = opt.value;
                btn.style.fontFamily = 'var(--font-display)';
                btn.style.fontWeight = '800';
                btn.style.fontSize = '22px';
            }
            btn.dataset.correct = isCorrect ? '1' : '0';
            btn.addEventListener('click', () => handlePatternAnswer(btn, isCorrect));
            optEl.appendChild(btn);
        });

        scoreEl.textContent = `Aciertos: ${patternCorrect}`;
    }

    function handlePatternAnswer(btn, isCorrect) {
        $$('.pattern-option').forEach(b => {
            b.style.pointerEvents = 'none';
            if (b.dataset.correct === '1') b.classList.add('correct-answer');
        });

        if (isCorrect) {
            patternCorrect++;
            btn.classList.add('correct-answer');
            sfxCorrect();
            spawnParticles(btn);
        } else {
            btn.classList.add('wrong-answer');
            btn.classList.add('shake');
            sfxWrong();
            setTimeout(() => btn.classList.remove('shake'), 400);
        }

        $('#pattern-score').textContent = `Aciertos: ${patternCorrect}`;
        patternIndex++;

        setTimeout(() => showPatternRound(), 800);
    }

    function finishPattern() {
        clearInterval(patternTimer);
        rawMetrics.patternScore = patternCorrect;
        const numPatterns = generatedPatterns.length || 12;
        let score = Math.round((patternCorrect / numPatterns) * 100);
        scores.patterns = score;
        currentGame++;
        startNextGame();
    }

    // ══════════════════════════════════════════
    // GAME 4: Math Speed
    // ══════════════════════════════════════════
    let mathCorrect = 0;
    let mathTotal = 0;
    let mathTimer = null;
    let mathTimeLeft = 30;

    function startMathGame() {
        mathCorrect = 0;
        mathTotal = 0;
        mathTimeLeft = D().mathTime; // Easy=45s, Normal=30s, Hard=18s
        showScreen('game-math');
        showMathProblem();
        mathTimer = setInterval(() => {
            mathTimeLeft--;
            $('#math-timer').textContent = mathTimeLeft + 's';
            if (mathTimeLeft <= 5 && mathTimeLeft > 0) sfxTimerWarn();
            if (mathTimeLeft <= 0) {
                clearInterval(mathTimer);
                finishMath();
            }
        }, 1000);
    }

    function showMathProblem() {
        const ops = ['+', '-', '×'];
        const op = ops[randInt(0, 2)];
        let a, b, answer;
        const diffMult = currentDifficulty === 'hard' ? 4 : currentDifficulty === 'easy' ? 0.4 : 1;

        if (op === '+') {
            a = Math.floor(randInt(5, 50) * diffMult);
            b = Math.floor(randInt(5, 50) * diffMult);
            answer = a + b;
        } else if (op === '-') {
            a = Math.floor(randInt(20, 80) * diffMult);
            b = Math.floor(randInt(5, a - 1) * diffMult);
            answer = a - b;
        } else {
            a = Math.floor(randInt(2, 12) * (currentDifficulty === 'hard' ? 2 : 1));
            b = Math.floor(randInt(2, 12) * (currentDifficulty === 'hard' ? 2 : 1));
            answer = a * b;
        }

        $('#math-problem').textContent = `${a} ${op} ${b} = ?`;

        const wrongOptions = new Set();
        while (wrongOptions.size < 3) {
            let wrong = answer + randInt(-10, 10);
            if (wrong !== answer && wrong > 0) wrongOptions.add(wrong);
        }

        const options = shuffle([answer, ...wrongOptions]);
        const optEl = $('#math-options');
        optEl.innerHTML = '';

        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'math-option';
            btn.textContent = opt;
            btn.addEventListener('click', () => handleMathAnswer(btn, opt, answer));
            optEl.appendChild(btn);
        });
    }

    function handleMathAnswer(btn, selected, correct) {
        $$('.math-option').forEach(b => {
            b.style.pointerEvents = 'none';
            if (parseInt(b.textContent) === correct) b.classList.add('correct-answer');
        });

        mathTotal++;
        if (selected === correct) {
            mathCorrect++;
            sfxCorrect();
            spawnParticles(btn);
        } else {
            btn.classList.add('wrong-answer');
            btn.classList.add('shake');
            sfxWrong();
            setTimeout(() => btn.classList.remove('shake'), 400);
        }

        $('#math-score').textContent = `Aciertos: ${mathCorrect} de ${mathTotal}`;
        setTimeout(() => showMathProblem(), 600);
    }

    function finishMath() {
        clearInterval(mathTimer);
        rawMetrics.mathRate = mathCorrect;
        // Score = accuracy × speed. Penalizes random clicking:
        // if you answer 6/12 correct but tried 20 total → accuracy = 6/20 = 30% → score drops
        const accuracy = mathTotal > 0 ? mathCorrect / mathTotal : 0;
        let score = Math.round(Math.min(100, Math.max(0, (mathCorrect * accuracy / 12) * 100)));
        scores.math = score;
        currentGame++;
        startNextGame();
    }

    // ══════════════════════════════════════════
    // GAME 5: Simon (Sequence Memory)
    // ══════════════════════════════════════════
    let simonSequence = [];
    let simonUserIndex = 0;
    let simonLevel = 0;
    let simonPlaying = false;
    let simonMaxLevel = 0;

    function startSimonGame() {
        simonSequence = [];
        simonLevel = 0;
        simonMaxLevel = 0;
        simonPlaying = false;
        showScreen('game-sequence');
        nextSimonRound();
    }

    async function nextSimonRound() {
        simonLevel++;
        simonMaxLevel = Math.max(simonMaxLevel, simonLevel);
        $('#simon-level').textContent = `Nivel ${simonLevel}`;
        $('#simon-prompt').textContent = 'Observa la secuencia...';

        setSimonEnabled(false);
        simonSequence.push(randInt(0, 8));

        await sleep(700);

        const flashMs = D().simonFlashMs; // Easy=550, Normal=420, Hard=260
        const pauseMs = D().simonPauseMs; // Easy=250, Normal=180, Hard=100

        for (let i = 0; i < simonSequence.length; i++) {
            const idx = simonSequence[i];
            const btn = $(`.simon-btn[data-index="${idx}"]`);
            btn.classList.add('flash');
            sfxSimonFlash(idx);
            await sleep(flashMs);
            btn.classList.remove('flash');
            await sleep(pauseMs);
        }

        simonUserIndex = 0;
        simonPlaying = true;
        setSimonEnabled(true);
        $('#simon-prompt').textContent = '¡Tu turno! Repite la secuencia.';
    }

    function setSimonEnabled(enabled) {
        $$('.simon-btn').forEach(btn => {
            btn.disabled = !enabled;
        });
    }

    async function handleSimonClick(index) {
        if (!simonPlaying) return;

        const btn = $(`.simon-btn[data-index="${index}"]`);
        btn.classList.add('user-tap');
        sfxSimonFlash(parseInt(index));
        setTimeout(() => btn.classList.remove('user-tap'), 200);

        if (parseInt(index) === simonSequence[simonUserIndex]) {
            simonUserIndex++;
            if (simonUserIndex >= simonSequence.length) {
                simonPlaying = false;
                setSimonEnabled(false);

                const targetMaxLevel = currentDifficulty === 'hard' ? 12 : (currentDifficulty === 'easy' ? 7 : 9);
                if (simonLevel >= targetMaxLevel) {
                    finishSimon();
                    return;
                }

                sfxCorrect();
                spawnParticles(btn);
                $('#simon-prompt').textContent = '¡Correcto! Siguiente nivel...';
                await sleep(800);
                nextSimonRound();
            }
        } else {
            simonPlaying = false;
            setSimonEnabled(false);
            btn.classList.add('error-flash');
            btn.classList.add('shake');
            sfxWrong();
            $('#simon-prompt').textContent = 'Secuencia incorrecta.';
            await sleep(1200);
            btn.classList.remove('error-flash');
            finishSimon();
        }
    }

    function finishSimon() {
        let reachedLevel = simonMaxLevel - 1;
        rawMetrics.sequenceSpan = reachedLevel;
        let score = Math.round(Math.min(100, Math.max(0, (reachedLevel / 8) * 100)));
        scores.sequence = score;
        currentGame++;
        startNextGame();
    }

    // ══════════════════════════════════════════
    // RESULTS — Research-Based Brain Age & Percentile
    // ══════════════════════════════════════════
    //
    // Brain age estimation based on cognitive research benchmarks:
    //
    // 1. Reaction Time (Luce, 1986; Der & Deary, 2006):
    //    - Age 20: ~250ms average
    //    - Increases ~0.5-1ms per year after 25
    //    - By age 60: ~350ms
    //
    // 2. Digit Span (Wechsler Adult Intelligence Scale norms):
    //    - Peak at age 20-30: 7±2 digits forward
    //    - Declines ~0.3 digits per decade after 30
    //
    // 3. Processing Speed (Salthouse, 1996):
    //    - Peaks at 18-25, linear decline
    //
    // 4. Pattern Recognition (Cattell's fluid intelligence):
    //    - Peaks at 20-25, gradual decline
    //
    // We use per-game age estimates and then average them.

    function reactionToAge(ms) {
        // Based on normative data: 250ms→20yr, +1ms/year roughly
        if (ms <= 220) return 18;
        if (ms >= 500) return 75;
        // Linear interpolation: 220ms=18yr, 500ms=75yr
        return Math.round(18 + ((ms - 220) / 280) * 57);
    }

    function digitSpanToAge(span) {
        // Peak span ~7 at age 20-30. Span of 8=18yr, span of 1=70yr
        // Based on WAIS norms
        if (span >= 8) return 18;
        if (span <= 1) return 70;
        const ageMap = [70, 65, 58, 50, 42, 35, 28, 22, 18]; // index 0=span0, 8=span8
        return ageMap[Math.min(span, 8)];
    }


    function patternScoreToAge(correct) {
        // 10/10 = 18yr (peak fluid intelligence), 0/10 = 70yr
        if (correct >= 10) return 18;
        if (correct <= 0) return 70;
        return Math.round(70 - (correct / 10) * 52);
    }


    function mathRateToAge(correctIn30s) {
        // Normative: young adults solve ~10-15 simple arithmetic in 30s
        // 15+=18yr, 0=70yr
        if (correctIn30s >= 15) return 18;
        if (correctIn30s <= 0) return 70;
        return Math.round(70 - (correctIn30s / 15) * 52);
    }

    function sequenceSpanToAge(level) {
        // Peak sequence memory ~7-8 at age 20-25
        // Based on Corsi block-tapping test norms
        if (level >= 8) return 18;
        if (level <= 0) return 70;
        const ageMap = [70, 62, 55, 48, 40, 33, 27, 22, 18]; // index 0=level0
        return ageMap[Math.min(level, 8)];
    }

    // ══════════════════════════════════════════
    // NEW GAME: Color Perception (Stroop)
    // ══════════════════════════════════════════
    let colorsScore = 0;
    let colorsFails = 0;
    let colorsTimeLeft = 30;
    let colorsInterval = null;
    let currentColorAnswer = '';

    function updateColorsScoreDisplay() {
        const el = $('#colors-score');
        if (!el) return;
        el.innerHTML = '<span class="colors-stat colors-stat--hits">Aciertos: ' + colorsScore + '</span><span class="colors-stat-sep" aria-hidden="true">·</span><span class="colors-stat colors-stat--miss">Fallos: ' + colorsFails + '</span>';
    }

    function startColorGame() {
        colorsScore = 0;
        colorsFails = 0;
        colorsTimeLeft = D().colorsTime; // Easy=40s, Normal=30s, Hard=20s
        updateColorsScoreDisplay();
        updateTimer('colors-timer', colorsTimeLeft);
        showScreen('game-colors');

        colorsInterval = setInterval(() => {
            colorsTimeLeft--;
            updateTimer('colors-timer', colorsTimeLeft);
            if (colorsTimeLeft <= 0) {
                clearInterval(colorsInterval);
                rawMetrics.colorsScore = colorsScore;
                scores.colors = Math.min(100, Math.round((colorsScore / 25) * 100));
                currentGame++;
                startNextGame();
            } else if (colorsTimeLeft <= 5) {
                sfxTimerWarn();
            }
        }, 1000);

        runColorRound();
    }

    function runColorRound() {
        const words = ['ROJO', 'AZUL', 'VERDE', 'AMARILLO', 'ROSA'];
        const cssColors = ['#ef4444', '#3b82f6', '#10b981', '#eab308', '#f472b6'];

        const wIdx = randInt(0, 4);
        let cIdx = randInt(0, 4);
        // 40% chance of matching color/word
        if (Math.random() < 0.4) cIdx = wIdx;

        const display = $('#colors-display');
        display.textContent = words[wIdx];
        display.style.color = cssColors[cIdx];

        currentColorAnswer = words[cIdx]; // Answer is the COLOR of the ink

        const optsContainer = $('#colors-options');
        optsContainer.innerHTML = '';

        // Options are names of colors (always white text)
        const opts = shuffle([...words]);
        opts.forEach(opt => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'colors-option-btn';
            btn.textContent = opt;
            btn.addEventListener('click', () => {
                if (opt === currentColorAnswer) {
                    colorsScore++;
                    sfxCorrect();
                } else {
                    colorsFails++;
                    colorsScore = Math.max(0, colorsScore - 1);
                    sfxWrong();
                }
                updateColorsScoreDisplay();
                runColorRound();
            });
            optsContainer.appendChild(btn);
        });
    }

    // ══════════════════════════════════════════
    // NEW GAME: Spatial Memory (Grid)
    // ══════════════════════════════════════════
    let spatialLevel = 1;
    let spatialGrid = [];
    let spatialActiveCells = [];
    let spatialUserClicks = [];


    function startSpatialGame() {
        spatialLevel = D().spatialStartLevel; // Easy/Normal=1, Hard=2
        showScreen('game-spatial');
        runSpatialRound();
    }

    async function runSpatialRound() {
        $('#spatial-prompt').textContent = 'Nivel ' + spatialLevel + ': Memoriza las celdas...';
        $('#spatial-level').textContent = 'Nivel ' + spatialLevel;
        const grid = $('#spatial-grid');
        grid.innerHTML = '';

        // Calculate grid size based on level
        const gridSize = spatialLevel < 5 ? 9 : 16;
        spatialGrid = [];
        spatialActiveCells = [];
        spatialUserClicks = [];

        grid.style.gridTemplateColumns = gridSize === 9 ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)';

        const activeCount = Math.min(2 + Math.floor(spatialLevel / 2), gridSize - 1);

        for (let i = 0; i < gridSize; i++) {
            const btn = document.createElement('button');
            btn.className = 'spatial-btn';
            btn.dataset.idx = i;
            grid.appendChild(btn);
            spatialGrid.push(btn);
        }

        // Select random cells
        const indices = shuffle(Array.from(Array(gridSize).keys())).slice(0, activeCount);
        spatialActiveCells = indices;

        sfxGo();

        // Show cells
        await sleep(500);
        indices.forEach(idx => {
            spatialGrid[idx].classList.add('active-target');
            sfxSimonFlash(5);
        });

        // Hide cells
        await sleep(1500 + (activeCount * 200));
        indices.forEach(idx => spatialGrid[idx].classList.remove('active-target'));

        $('#spatial-prompt').textContent = '¡Tu turno! Selecciona las ' + activeCount;

        // Enable clicks
        spatialGrid.forEach(btn => {
            btn.addEventListener('click', function onClick() {
                const idx = parseInt(btn.dataset.idx);
                if (spatialUserClicks.includes(idx)) return;

                spatialUserClicks.push(idx);

                if (spatialActiveCells.includes(idx)) {
                    sfxClick();
                    btn.classList.add('active-target', 'success-pulse'); // Blue/Green
                    if (spatialUserClicks.length === spatialActiveCells.length) {
                        // Level complete
                        sfxCorrect();
                        spatialLevel++;
                        setTimeout(runSpatialRound, 1000);
                    }
                } else {
                    // Wrong! Game over
                    sfxWrong();
                    btn.style.backgroundColor = '#ef4444'; // Red
                    // Reveal missing ones
                    spatialActiveCells.forEach(i => {
                        if (!spatialUserClicks.includes(i)) spatialGrid[i].style.borderColor = '#10b981';
                    });

                    setTimeout(() => {
                        rawMetrics.spatialSpan = spatialLevel;
                        scores.spatial = Math.min(100, Math.round(((spatialLevel - 1) / 8) * 100));
                        currentGame++;
                        startNextGame();
                    }, 1500);
                }
            });
        });
    }

    function colorScoreToAge(correct) {
        if (correct >= 20) return 18;
        if (correct <= 0) return 70;
        return Math.round(70 - (correct / 20) * 52);
    }

    function spatialSpanToAge(span) {
        if (span >= 9) return 18;
        if (span <= 1) return 70;
        const ageMap = [70, 70, 65, 55, 45, 35, 28, 22, 18, 18];
        return ageMap[Math.min(span, 9)];
    }

    /**
     * Calculate percentile using a normal distribution CDF approximation.
     * We place the user's score on a distribution based on population norms.
     *
     * Instead of inventing a number, we use the fact that cognitive scores
     * in the general population follow approximately a normal distribution.
     * We define the population mean as ~50/100 score and SD as ~20.
     */
    function scoreToPercentile(avgScore) {
        // Approximate CDF of normal distribution using Horner's method
        // (Abramowitz & Stegun approximation)
        const mean = 48; // Slightly below 50 — most people are "average"
        const sd = 22;
        const z = (avgScore - mean) / sd;

        // CDF approximation for standard normal
        const t = 1 / (1 + 0.2316419 * Math.abs(z));
        const d = 0.3989422804014327; // 1/sqrt(2*PI)
        const p = d * Math.exp(-z * z / 2);
        const cdf = 1 - p * (t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.8212560 + t * 1.3302744)))));

        let percentile;
        if (z >= 0) {
            percentile = Math.round(cdf * 100);
        } else {
            percentile = Math.round((1 - cdf) * 100);
        }

        return Math.max(1, Math.min(99, percentile));
    }

    function showResults() {
        setProgress(5);
        sfxResults();

        // Calculate brain age per game using research-based mappings
        const ages = {
            reaction: reactionToAge(rawMetrics.reactionMs),
            numbers: digitSpanToAge(rawMetrics.digitSpan),
            patterns: patternScoreToAge(rawMetrics.patternScore),
            math: mathRateToAge(rawMetrics.mathRate),
            sequence: sequenceSpanToAge(rawMetrics.sequenceSpan),
            colors: colorScoreToAge(rawMetrics.colorsScore),
            spatial: spatialSpanToAge(rawMetrics.spatialSpan)
        };

        const weights = { reaction: 1.2, numbers: 1.0, patterns: 0.9, math: 0.9, sequence: 1.0, colors: 1.1, spatial: 1.0 };
        let weightedSum = 0;
        let totalWeight = 0;
        let avgScoreSum = 0;

        games.forEach(g => {
            weightedSum += ages[g.iconKey] * weights[g.iconKey];
            totalWeight += weights[g.iconKey];
            avgScoreSum += scores[g.iconKey];
        });

        let brainAge = Math.round(weightedSum / totalWeight);
        brainAge = Math.max(18, Math.min(80, brainAge));

        // Percentile from score distribution
        const avgScore = avgScoreSum / 5;
        const percentile = scoreToPercentile(avgScore);

        // Update DOM
        $('#results-age').textContent = brainAge;
        $('#results-percentile').innerHTML = `Tu cerebro funciona mejor que el <strong>${percentile}%</strong> de los usuarios que han hecho este test.`;

        // Breakdown bars — render dynamically based on the 5 selected games
        const breakdownContainer = $('.results-breakdown');
        breakdownContainer.innerHTML = '<h3 class="breakdown-title">Desglose por Prueba</h3>';

        games.forEach(g => {
            const key = g.iconKey;
            breakdownContainer.innerHTML += `
                <div class="breakdown-item">
                    <span class="breakdown-label">${g.label}</span>
                    <div class="breakdown-bar-bg"><div class="breakdown-bar" id="bar-${key}"></div></div>
                    <span class="breakdown-value" id="val-${key}">--</span>
                </div>
            `;
        });

        setTimeout(() => {
            games.forEach(g => {
                setBar(g.iconKey, scores[g.iconKey], ages[g.iconKey]);
            });
        }, 300);

        showScreen('results');

        // Determinar Arquetipo Cognitivo
        const archetypeScores = {
            'Francotirador 🎯': Math.max(scores.reaction || 0, scores.colors || 0, scores.spatial || 0),
            'Ajedrecista ♟️': Math.max(scores.sequence || 0, scores.patterns || 0),
            'Calculadora Humana 🧮': Math.max(scores.math || 0, scores.numbers || 0)
        };
        let archetype = 'Mente Equilibrada ⚖️';
        let maxArchScore = 0;
        for (const [arch, s] of Object.entries(archetypeScores)) {
            if (s > maxArchScore && s > 0) {
                maxArchScore = s;
                archetype = arch;
            }
        }
        const archEl = $('#results-archetype');
        if (archEl) {
            archEl.innerHTML = `Arquetipo: <span style="color:#fff;">${archetype}</span>`;
        }

        window._shareData = { brainAge, percentile, scores, ages, archetype };

        // Save to localStorage history (Phase 3) — not when in training mode
        if (!isTrainingMode) {
            saveResultToHistory(brainAge, currentDifficulty, games.map(g => g.label), scores);
            showStreakNotification();

            // Sincronizar con Supabase si usuario está autenticado
            syncProfileWithSupabase(brainAge);
        }

        // V3: Load global comparison
        if (typeof getGlobalAverages === 'function') {
            getGlobalAverages().then(avg => {
                if (avg) {
                    const el = $('#global-comparison');
                    const avgEl = $('#global-avg-age');
                    const verdictEl = $('#comparison-verdict');
                    avgEl.textContent = avg.avgBrainAge;
                    if (brainAge < avg.avgBrainAge) {
                        verdictEl.innerHTML = '¡Tu cerebro es <strong style="color:var(--clr-success)">más joven</strong> que la media! 🧠🔥';
                    } else if (brainAge === avg.avgBrainAge) {
                        verdictEl.textContent = 'Estás justo en la media. ¿Puedes mejorar? 💪';
                    } else {
                        verdictEl.innerHTML = 'Estás por encima de la media. <strong style="color:var(--clr-warning)">¡Entrena tu cerebro!</strong> 🏋️';
                    }
                    el.style.display = 'block';
                }
            });
        }
    }

    function setBar(name, score, age) {
        // Bar fill = score (0-100), label = age equivalent ("26 años")
        $(`#bar-${name}`).style.width = score + '%';
        $(`#val-${name}`).textContent = age + ' años';

        const bar = $(`#bar-${name}`);
        // Color: younger age = better = green
        if (age <= 28) {
            bar.style.background = 'linear-gradient(90deg, #10b981, #06b6d4)';
        } else if (age <= 45) {
            bar.style.background = 'linear-gradient(90deg, #f59e0b, #eab308)';
        } else {
            bar.style.background = 'linear-gradient(90deg, #ef4444, #f97316)';
        }
    }

    function getShareText() {
        const d = window._shareData;
        const comentario = d.brainAge <= 25 ? '¡Cerebro de élite!' :
            d.brainAge <= 35 ? '¡Muy por encima de la media!' :
                d.brainAge <= 45 ? 'Rendimiento sólido.' :
                    d.brainAge <= 55 ? 'Hay margen de mejora.' : 'El cerebro nunca deja de aprender.';
        return `Acabo de hacer el Test de Edad Mental.\n\nMi resultado: ${d.brainAge} años mentales.\nArquetipo: ${d.archetype || ''}\n${comentario}\nMejor que el ${d.percentile}% de los jugadores.\n\nHaz el test gratis (3 minutos):\n${window.location.href}`;
    }

    // ── Event Listeners ──
    function initEvents() {
        const diffDescriptions = {
            'easy': 'Mayor tiempo en pruebas y menor complejidad. Penaliza ligeramente tu edad mental final.',
            'normal': 'Nivel equilibrado. Ideal para conocer tu edad mental con precisión estándar.',
            'hard': 'Menos tiempo y secuencias más largas. Una buena puntuación mejora mucho tu resultado final.'
        };

        $$('.btn-diff').forEach(btn => {
            btn.addEventListener('click', (e) => {
                $$('.btn-diff').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentDifficulty = btn.dataset.diff;
                const descEl = document.getElementById('difficulty-description');
                if (descEl) {
                    descEl.textContent = diffDescriptions[currentDifficulty] || diffDescriptions['normal'];
                }
                sfxClick();
            });
        });

        $('#btn-start').addEventListener('click', () => {
            isTrainingMode = false;
            games[0] = { ...dailyGame0Backup };
            // Initialize audio context on first user interaction
            getAudioCtx();
            sfxClick();
            currentGame = 0;
            startNextGame();
        });

        const btnTrainingBack = document.getElementById('btn-training-back');
        if (btnTrainingBack) {
            btnTrainingBack.addEventListener('click', () => {
                sfxClick();
                exitTrainingFlow();
            });
        }

        $('#btn-ready').addEventListener('click', () => {
            sfxClick();
            const currentSelectedGame = games[currentGame];
            switch (currentSelectedGame.iconKey) {
                case 'reaction': startReactionGame(); break;
                case 'numbers': startNumberGame(); break;
                case 'patterns': startPatternGame(); break;
                case 'math': startMathGame(); break;
                case 'sequence': startSimonGame(); break;
                case 'colors': startColorGame(); break;
                case 'spatial': startSpatialGame(); break;
            }
        });

        $('#reaction-zone').addEventListener('click', handleReactionClick);

        $('#btn-number-submit').addEventListener('click', checkNumber);
        $('#number-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') checkNumber();
        });

        $$('.simon-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                handleSimonClick(btn.dataset.index);
            });
        });

        $('#btn-share-twitter').addEventListener('click', () => {
            const text = encodeURIComponent(getShareText());
            window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
        });

        $('#btn-share-whatsapp').addEventListener('click', () => {
            const text = encodeURIComponent(getShareText());
            window.open(`https://wa.me/?text=${text}`, '_blank');
        });

        $('#btn-share-copy').addEventListener('click', () => {
            navigator.clipboard.writeText(getShareText()).then(() => {
                const span = $('#btn-share-copy span');
                span.textContent = 'Copiado';
                setTimeout(() => { span.textContent = 'Copiar Resultado'; }, 2000);
            });
        });

        $('#btn-retry').addEventListener('click', () => {
            sfxClick();
            isTrainingMode = false;
            games[0] = { ...dailyGame0Backup };
            Object.keys(scores).forEach(k => scores[k] = 0);
            Object.keys(rawMetrics).forEach(k => rawMetrics[k] = 0);
            currentGame = 0;
            showScreen('welcome');
        });

        // Save ranking to Supabase
        const btnSubmitScore = $('#btn-submit-score');
        if (btnSubmitScore) {
            btnSubmitScore.addEventListener('click', async () => {
                const name = (_currentDisplayName || '').trim();
                const msgEl = $('#ranking-msg');

                if (!name || !_currentUser) {
                    if (msgEl) { msgEl.textContent = 'Debes iniciar sesión para guardar.'; msgEl.style.color = 'var(--clr-danger)'; }
                    return;
                }

                btnSubmitScore.disabled = true;
                btnSubmitScore.innerHTML = '<svg style="animation:spin 1s linear infinite;display:inline-block;margin-right:6px;" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Guardando...';
                if (msgEl) msgEl.textContent = '';

                const data = {
                    player_name: name,
                    difficulty: currentDifficulty,
                    brain_age: window._shareData.brainAge,
                    reaction_score: scores.reaction,
                    numbers_score: scores.numbers,
                    patterns_score: scores.patterns,
                    math_score: scores.math,
                    sequence_score: scores.sequence
                };

                const err = await saveRanking(data);
                btnSubmitScore.disabled = false;
                btnSubmitScore.textContent = 'Guardar en Ranking';

                if (err) {
                    if (msgEl) { msgEl.textContent = 'Error al guardar. Intenta de nuevo.'; msgEl.style.color = 'var(--clr-danger)'; }
                    console.error('Supabase Error:', err);
                } else {
                    window._sharePlayerName = name;
                    // Show success overlay
                    const overlay = document.getElementById('score-saved-overlay');
                    const textEl = document.getElementById('score-saved-text');
                    if (textEl) textEl.textContent = `¡Tu puntuación (${window._shareData.brainAge} años mentales) ha sido guardada en el ranking global!`;
                    if (overlay) overlay.style.display = 'flex';
                    btnSubmitScore.textContent = '✓ Guardado';
                }
            });
        }

        // V3: Download shareable card
        const btnDownload = $('#btn-download-card');
        if (btnDownload) {
            btnDownload.addEventListener('click', () => {
                const d = window._shareData;
                if (!d) return;
                const canvas = document.createElement('canvas');
                canvas.width = 600; canvas.height = 400;
                const ctx = canvas.getContext('2d');
                // Background gradient
                const grd = ctx.createLinearGradient(0, 0, 600, 400);
                grd.addColorStop(0, '#0f0c29');
                grd.addColorStop(0.5, '#1a1145');
                grd.addColorStop(1, '#24243e');
                ctx.fillStyle = grd;
                ctx.fillRect(0, 0, 600, 400);
                // Border glow
                ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
                ctx.lineWidth = 3;
                ctx.roundRect(10, 10, 580, 380, 20);
                ctx.stroke();
                // Title
                ctx.fillStyle = '#a78bfa';
                ctx.font = 'bold 22px Outfit, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('Test de Edad Mental', 300, 55);
                // Brain age
                ctx.fillStyle = '#22d3ee';
                ctx.font = 'bold 80px Outfit, sans-serif';
                ctx.fillText(d.brainAge, 300, 160);
                ctx.fillStyle = '#94a3b8';
                ctx.font = '24px Inter, sans-serif';
                ctx.fillText('años de edad mental', 300, 195);
                // Scores dynamically generated for the 5 selected games
                const labels = games.map(g => g.label);
                const scoreKeys = games.map(g => g.iconKey);
                const barY = 230;
                labels.forEach((label, i) => {
                    const y = barY + i * 30;
                    ctx.fillStyle = '#94a3b8';
                    ctx.font = '14px Inter, sans-serif';
                    ctx.textAlign = 'left';
                    ctx.fillText(label, 60, y + 4);
                    // Bar bg
                    ctx.fillStyle = 'rgba(255,255,255,0.08)';
                    ctx.fillRect(180, y - 8, 300, 14);
                    // Bar fill
                    const score = d.scores[scoreKeys[i]];
                    const barGrd = ctx.createLinearGradient(180, 0, 480, 0);
                    barGrd.addColorStop(0, '#8b5cf6');
                    barGrd.addColorStop(1, '#06b6d4');
                    ctx.fillStyle = barGrd;
                    ctx.fillRect(180, y - 8, (score / 100) * 300, 14);
                    // Score value
                    ctx.fillStyle = '#f1f5f9';
                    ctx.textAlign = 'right';
                    ctx.font = 'bold 14px Outfit, sans-serif';
                    ctx.fillText(d.ages[scoreKeys[i]] + ' años', 540, y + 4);
                });
                // URL
                ctx.fillStyle = '#64748b';
                ctx.font = '13px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('edadmental.online', 300, 385);
                // Download
                const link = document.createElement('a');
                link.download = 'mi-edad-mental.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        }

        // V3: Challenge a friend
        const btnChallenge = $('#btn-challenge');
        if (btnChallenge) {
            btnChallenge.addEventListener('click', () => {
                const d = window._shareData;
                if (!d) return;
                const text = encodeURIComponent(`🧠 Mi edad mental es ${d.brainAge} años. ¿Puedes superarme?\n\nHaz el test gratis en 3 minutos:\nhttps://edadmental.online`);
                window.open(`https://wa.me/?text=${text}`, '_blank');
            });
        }
    }

    function restorePendingResult() {
        try {
            const pending = localStorage.getItem('pendingBrainAgeResult');
            if (pending) {
                const data = JSON.parse(pending);
                window._shareData = data.shareData;
                if (data.games) games = data.games;
                if (data.difficulty) currentDifficulty = data.difficulty;

                // Re-populate DOM
                $('#results-age').textContent = data.shareData.brainAge;
                $('#results-percentile').innerHTML = `Tu cerebro funciona mejor que el <strong>${data.shareData.percentile}%</strong> de los usuarios que han hecho este test.`;

                const breakdownContainer = $('.results-breakdown');
                breakdownContainer.innerHTML = '<h3 class="breakdown-title">Desglose por Prueba</h3>';
                games.forEach(g => {
                    const key = g.iconKey;
                    breakdownContainer.innerHTML += `
                        <div class="breakdown-item">
                            <span class="breakdown-label">${g.label}</span>
                            <div class="breakdown-bar-bg"><div class="breakdown-bar" id="bar-${key}"></div></div>
                            <span class="breakdown-value" id="val-${key}">--</span>
                        </div>
                    `;
                });

                setTimeout(() => {
                    games.forEach(g => {
                        setBar(g.iconKey, data.shareData.scores[g.iconKey], data.shareData.ages[g.iconKey]);
                    });
                }, 300);

                // Hide modal if open
                const authModal = document.getElementById('auth-modal');
                if (authModal) authModal.style.display = 'none';

                showScreen('results');
                localStorage.removeItem('pendingBrainAgeResult');
            }
        } catch (e) { }
    }

    document.addEventListener('DOMContentLoaded', () => {
        initEvents();
        restorePendingResult();
    });

    // ══════════════════════════════════════════
    // V3/V4: BACKGROUND PARTICLES (reactive)
    // ══════════════════════════════════════════
    let particleSpeedMultiplier = 1;
    let particleColorOverride = null;

    // Exposed to the rest of the IIFE
    window.setParticlesState = function (state) {
        if (state === 'fast') {
            particleSpeedMultiplier = 4;
            particleColorOverride = 'rgba(34,213,238,'; // Cyan for success
        } else if (state === 'error') {
            particleSpeedMultiplier = 2;
            particleColorOverride = 'rgba(239,68,68,'; // Red for error
        } else {
            particleSpeedMultiplier = 1;
            particleColorOverride = null;
        }
    };

    function initBgParticles() {
        const canvas = document.getElementById('bg-particles');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let w, h;
        const particles = [];
        const PARTICLE_COUNT = 40;

        function resize() {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: Math.random() * 2 + 1,
                dx: (Math.random() - 0.5) * 0.4,
                dy: (Math.random() - 0.5) * 0.4,
                opacity: Math.random() * 0.3 + 0.1,
                color: ['rgba(139,92,246,', 'rgba(6,182,212,', 'rgba(167,139,250,'][Math.floor(Math.random() * 3)]
            });
        }

        function drawParticles() {
            ctx.clearRect(0, 0, w, h);
            particles.forEach(p => {
                p.x += p.dx * particleSpeedMultiplier;
                p.y += p.dy * particleSpeedMultiplier;
                if (p.x < 0) p.x = w;
                if (p.x > w) p.x = 0;
                if (p.y < 0) p.y = h;
                if (p.y > h) p.y = 0;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                const colorPrefix = particleColorOverride || p.color;
                ctx.fillStyle = colorPrefix + p.opacity + ')';
                ctx.fill();
            });
            // Lines between nearby particles
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        const colorPrefix = particleColorOverride ? particleColorOverride.replace('rgba(', '').replace(',', '') : '139, 92, 246';
                        ctx.strokeStyle = `rgba(${colorPrefix}, ${0.08 * (1 - dist / 150)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(drawParticles);
        }
        drawParticles();
    }

    // V3: Load player count on welcome screen
    function loadPlayerCount() {
        if (typeof getPlayerCount === 'function') {
            getPlayerCount().then(count => {
                const el = document.getElementById('player-count-number');
                const container = document.getElementById('welcome-players');
                if (el && count > 0) {
                    el.textContent = count.toLocaleString('es-ES');
                    container.style.opacity = '1';
                }
            });
        }
    }

    // ══════════════════════════════════════════
    // V4: SINGLE PAGE APPLICATION ROUTER
    // ══════════════════════════════════════════
    const spaViews = {
        home: document.getElementById('view-home'),
        training: document.getElementById('view-training'),
        faq: document.getElementById('view-faq'),
        ranking: document.getElementById('view-ranking'),
        stats: document.getElementById('view-stats'),
        profile: document.getElementById('view-profile')
    };

    let currentRankingFilter = 'all';
    let statsLoaded = false;
    let rankChart = null;
    let radarChart = null;

    function escapeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.innerText = str;
        return div.innerHTML;
    }

    async function loadRanking(filter) {
        const tbody = document.getElementById('ranking-body');
        const podium = document.getElementById('ranking-podium');

        // En páginas individuales, mostrar auth gate si no hay autenticación
        const authGate = document.getElementById('ranking-page-auth-gate');
        const rankingContent = document.getElementById('ranking-page-content');

        // Verificar si el usuario está autenticado
        if (typeof getCurrentUser === 'function') {
            const user = await getCurrentUser();
            if (!user && authGate && rankingContent) {
                // Usuario no autenticado - mostrar auth gate
                authGate.style.display = 'block';
                rankingContent.style.display = 'none';
                return;
            } else if (user && authGate && rankingContent) {
                // Usuario autenticado - mostrar contenido
                authGate.style.display = 'none';
                rankingContent.style.display = 'block';
            }
        }

        if (!tbody) return;
        tbody.innerHTML = '<tr><td colspan="5" class="loading-spinner" style="text-align: center; padding: 40px;">Cargando...</td></tr>';
        if (podium) podium.innerHTML = '';

        if (typeof getTopRankings !== 'function') {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: var(--clr-danger); padding: 30px;">Error: No se pudo conectar con la base de datos.</td></tr>';
            return;
        }

        const { data, error } = await getTopRankings(filter);

        if (error || !data) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: var(--clr-danger); padding: 30px;">Error al cargar el ranking.</td></tr>';
            return;
        }

        const countEl = document.getElementById('ranking-count');
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 30px;">Aún no hay puntuaciones en esta categoría. ¡Sé el primero!</td></tr>';
            if (countEl) countEl.textContent = '';
            return;
        }

        if (countEl) countEl.textContent = `${data.length} jugador${data.length !== 1 ? 'es' : ''} en el ranking`;

        // 🏆 Render Podium (Top 3)
        if (podium && data.length > 0) {
            const top3 = data.slice(0, 3);
            const diffMap = { easy: 'Fácil', normal: 'Normal', hard: 'Difícil' };

            // Reorder for visual podium: 2nd, 1st, 3rd
            const podiumOrder = [];
            if (top3[1]) podiumOrder.push({ ...top3[1], pos: 2, height: '120px', bg: 'rgba(226, 232, 240, 0.1)', border: '#94a3b8', medal: '🥈' });
            if (top3[0]) podiumOrder.push({ ...top3[0], pos: 1, height: '150px', bg: 'rgba(234, 179, 8, 0.15)', border: '#eab308', medal: '🥇' });
            if (top3[2]) podiumOrder.push({ ...top3[2], pos: 3, height: '100px', bg: 'rgba(180, 83, 9, 0.1)', border: '#b45309', medal: '🥉' });

            podium.innerHTML = podiumOrder.map(p => `
                <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end;">
                    <div style="font-size: 24px; margin-bottom: 4px;">${p.medal}</div>
                    <div style="font-size: 14px; font-weight: 700; color: #fff; text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:80px;">${escapeHTML(p.player_name)}</div>
                    <div style="font-size: 12px; color: var(--clr-text-muted); margin-bottom: 8px;">${p.brain_age} años</div>
                    <div style="width: 100%; height: ${p.height}; background: ${p.bg}; border: 2px solid ${p.border}; border-bottom: none; border-radius: 12px 12px 0 0; display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 24px; font-weight: 900; color: ${p.border};">
                        #${p.pos}
                    </div>
                </div>
            `).join('');
        }

        tbody.innerHTML = '';
        const tableData = podium ? data.slice(3) : data; // Si hay podio, ocultar los 3 primeros de la tabla
        const startIndex = podium ? 3 : 0;

        tableData.forEach((row, index) => {
            const tr = document.createElement('tr');
            const pos = index + 1 + startIndex;
            let posClass = 'rank-pos';
            let medal = '';
            // No medals since they are in the podium view

            const diffMap = {
                easy: { label: 'Fácil', cls: 'easy' },
                normal: { label: 'Normal', cls: 'normal' },
                hard: { label: 'Difícil', cls: 'hard' }
            };
            const diff = diffMap[row.difficulty] || diffMap.normal;

            // Visual Gamification Demo League
            let leagueIcon = '🥉'; let leagueName = 'Bronce'; let leagueColor = '#b45309';
            if (pos <= 5 || index <= 2) { leagueIcon = '💎'; leagueName = 'Diamante'; leagueColor = '#06b6d4'; }
            else if (pos <= 20) { leagueIcon = '🥇'; leagueName = 'Oro'; leagueColor = '#f59e0b'; }
            else if (pos <= 50) { leagueIcon = '🥈'; leagueName = 'Plata'; leagueColor = '#94a3b8'; }

            tr.innerHTML = `
                <td class="${posClass}">#${pos}</td>
                <td class="rank-name">${escapeHTML(row.player_name)}</td>
                <td class="rank-age">${row.brain_age} años</td>
                <td><span class="diff-badge ${diff.cls}">${diff.label}</span></td>
                <td style="text-align:center;"><span style="background:${leagueColor}40; color:${leagueColor}; padding:4px 10px; border-radius:12px; font-weight:700; font-size:12px; border:1px solid ${leagueColor}60;">${leagueIcon} ${leagueName}</span></td>
            `;
            tbody.appendChild(tr);
        });
    }

    async function loadStats() {
        if (typeof Chart === 'undefined') return;

        // Chart.js global defaults
        Chart.defaults.color = '#94a3b8';
        Chart.defaults.font.family = "'Inter', sans-serif";

        let ageData = [0, 0, 0, 0, 0, 0];
        let radarData = [0, 0, 0, 0, 0];
        let archetypeData = [0, 0, 0, 1]; // [Francotirador, Ajedrecista, Calculadora, Equilibrada]
        let diffPerformance = [0, 0, 0]; // [Fácil, Normal, Difícil]
        let diffCounts = [0, 0, 0];
        let totalCount = 0;
        let sumBrainAge = 0;

        if (typeof getStats === 'function') {
            const { data, error } = await getStats();
            if (!error && data && data.length > 0) {
                totalCount = data.length;
                data.forEach(row => {
                    sumBrainAge += row.brain_age;
                    const a = row.brain_age;
                    if (a < 20) ageData[0]++;
                    else if (a <= 25) ageData[1]++;
                    else if (a <= 30) ageData[2]++;
                    else if (a <= 40) ageData[3]++;
                    else if (a <= 50) ageData[4]++;
                    else ageData[5]++;

                    // Performance vs Difficulty
                    if (row.difficulty === 'easy') { diffPerformance[0] += row.brain_age; diffCounts[0]++; }
                    else if (row.difficulty === 'hard') { diffPerformance[2] += row.brain_age; diffCounts[2]++; }
                    else { diffPerformance[1] += row.brain_age; diffCounts[1]++; }

                    // Archetype determination (Simulación por row de DB si no hay campo)
                    const maxS = Math.max(row.reaction_score || 0, row.numbers_score || 0, row.patterns_score || 0, row.math_score || 0);
                    if (maxS > 80) archetypeData[0]++;
                    else if (maxS > 60) archetypeData[1]++;
                    else if (maxS > 40) archetypeData[2]++;
                    else archetypeData[3]++;
                });

                let sumR = 0, sumN = 0, sumP = 0, sumM = 0, sumS = 0;
                data.forEach(row => {
                    sumR += row.reaction_score || 0;
                    sumN += row.numbers_score || 0;
                    sumP += row.patterns_score || 0;
                    sumM += row.math_score || 0;
                    sumS += row.sequence_score || 0;
                });
                radarData = [
                    Math.round(sumR / totalCount),
                    Math.round(sumN / totalCount),
                    Math.round(sumP / totalCount),
                    Math.round(sumM / totalCount),
                    Math.round(sumS / totalCount)
                ];
            } else {
                // Mock fallback
                totalCount = 100;
                sumBrainAge = 3200;
                ageData = [12, 35, 25, 18, 7, 3];
                radarData = [75, 60, 65, 55, 78];
                archetypeData = [20, 30, 15, 35];
                diffPerformance = [28, 34, 40];
                diffCounts = [1, 1, 1];
            }
        }

        const avgAge = Math.round(sumBrainAge / (totalCount || 1));

        // Update KPIs
        const totalPlayersEl = document.getElementById('stats-total-players');
        const avgAgeEl = document.getElementById('stats-avg-age');
        const topArchEl = document.getElementById('stats-top-archetype');

        if (totalPlayersEl) totalPlayersEl.textContent = totalCount;
        if (avgAgeEl) avgAgeEl.textContent = avgAge + ' años';
        if (topArchEl) {
            const arches = ['Francotirador 🎯', 'Ajedrecista ♟️', 'Calculadora 🧮', 'Equilibrada ⚖️'];
            const maxIdx = archetypeData.indexOf(Math.max(...archetypeData));
            topArchEl.textContent = arches[maxIdx];
        }

        // 1. Age Chart
        const ctxAge = document.getElementById('ageChart');
        if (ctxAge) {
            new Chart(ctxAge.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: ['< 20', '20-25', '26-30', '31-40', '41-50', '51+'],
                    datasets: [{
                        label: 'Usuarios',
                        data: ageData,
                        backgroundColor: 'rgba(139, 92, 246, 0.6)',
                        borderColor: 'rgba(139, 92, 246, 1)',
                        borderWidth: 1,
                        borderRadius: 4
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
            });
        }

        // 2. Radar Chart
        const ctxRadar = document.getElementById('radarChart');
        if (ctxRadar) {
            new Chart(ctxRadar.getContext('2d'), {
                type: 'radar',
                data: {
                    labels: ['Reacción', 'Memoria Nums.', 'Patrones', 'Mates', 'Secuencia'],
                    datasets: [{
                        label: 'Puntuación Media',
                        data: radarData,
                        backgroundColor: 'rgba(6, 182, 212, 0.2)',
                        borderColor: 'rgba(6, 182, 212, 1)',
                        pointBackgroundColor: 'rgba(6, 182, 212, 1)',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    scales: { r: { angleLines: { color: 'rgba(255,255,255,0.1)' }, grid: { color: 'rgba(255,255,255,0.1)' }, pointLabels: { color: '#f1f5f9' }, ticks: { display: false } } }
                }
            });
        }

        // 3. Archetype Chart (Donut)
        const ctxArch = document.getElementById('archetypeChart');
        if (ctxArch) {
            new Chart(ctxArch.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Francotirador', 'Ajedrecista', 'Calculadora', 'Equilibrada'],
                    datasets: [{
                        data: archetypeData,
                        backgroundColor: ['rgba(244, 63, 94, 0.7)', 'rgba(139, 92, 246, 0.7)', 'rgba(16, 185, 129, 0.7)', 'rgba(245, 158, 11, 0.7)'],
                        borderWidth: 0
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } } }
            });
        }

        // 4. Performance vs Dificultad (Bar)
        const ctxDiff = document.getElementById('difficultyPerformanceChart');
        if (ctxDiff) {
            const finalPerformance = diffCounts.map((c, i) => c > 0 ? Math.round(diffPerformance[i] / c) : 0);
            new Chart(ctxDiff.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: ['Fácil', 'Normal', 'Difícil'],
                    datasets: [{
                        label: 'Edad Mental Media',
                        data: finalPerformance,
                        backgroundColor: ['rgba(16, 185, 129, 0.6)', 'rgba(14, 165, 233, 0.6)', 'rgba(244, 63, 94, 0.6)'],
                        borderColor: ['#10b981', '#0ea5e9', '#f43f5e'],
                        borderWidth: 1,
                        borderRadius: 6
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
            });
        }

        statsLoaded = true;
    }

    function navigate(path, push = true) {
        if (push) history.pushState({ path }, '', path);

        let viewKey = 'home';
        const lowerPath = path.toLowerCase();
        if (lowerPath.includes('ranking')) viewKey = 'ranking';
        else if (lowerPath.includes('estadistica')) viewKey = 'stats';
        else if (lowerPath.includes('perfil')) viewKey = 'profile';
        else if (lowerPath.includes('entrenamiento')) viewKey = 'training';
        else if (lowerPath.includes('preguntas-frecuentes') || lowerPath.endsWith('/faq') || lowerPath === '/faq') viewKey = 'faq';

        // Update nav styling
        document.querySelectorAll('.nav-link[data-route]').forEach(link => {
            link.classList.remove('active-route');
            if (link.dataset.route === viewKey) {
                link.classList.add('active-route');
                // Allow CSS transitions on the active route 
                link.style.color = "var(--clr-accent-light)";
            } else {
                link.style.color = "";
            }
        });

        // Hide all views with transition
        Object.values(spaViews).forEach(v => {
            if (v && v.style.display !== 'none') {
                v.style.opacity = '0';
                setTimeout(() => { if (v.style.opacity === '0') v.style.display = 'none'; }, 300);
            }
        });

        // Show target view
        setTimeout(() => {
            const targetView = spaViews[viewKey];
            if (targetView) {
                targetView.style.display = 'block';
                // Trigger reflow
                void targetView.offsetWidth;
                targetView.style.opacity = '1';

                // Initializers
                if (viewKey === 'ranking') loadRanking(currentRankingFilter);
                if (viewKey === 'stats') loadStats();
                if (viewKey === 'profile') {
                    // Cargar y sincronizar perfil con Supabase si está disponible
                    if (typeof loadAndSyncProfile === 'function') {
                        loadAndSyncProfile();
                    } else if (typeof loadProfile === 'function') {
                        loadProfile();
                    }
                }
                if (viewKey === 'home' && !isTrainingMode) {
                    setTimeout(() => showScreen('welcome'), 50);
                }
            }
        }, 300);
    }

    function setupRankingFilters() {
        // Ranking filter tabs listener
        const filterTabs = document.getElementById('filter-tabs');
        if (filterTabs) {
            filterTabs.addEventListener('click', (e) => {
                const tab = e.target.closest('.filter-tab');
                if (!tab) return;
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentRankingFilter = tab.dataset.filter;
                loadRanking(currentRankingFilter);
            });
        }
    }

    function setupRouter() {
        // Intercept link clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[data-route]');
            if (link) {
                e.preventDefault();
                const path = link.getAttribute('href');
                if (link.dataset.route === 'home') {
                    cleanupActiveGameTimers();
                    isTrainingMode = false;
                    games[0] = { ...dailyGame0Backup };
                    const appMain = document.getElementById('app');
                    if (appMain) appMain.classList.remove('training-bar-pad');
                    const backBar = document.getElementById('training-back-bar');
                    if (backBar) {
                        backBar.style.display = 'none';
                        backBar.setAttribute('aria-hidden', 'true');
                    }
                }
                navigate(path);
                // Close hamburger menu on mobile
                const navLinks = document.querySelector('.nav-links');
                const hamburger = document.getElementById('hamburger-btn');
                if (navLinks) navLinks.classList.remove('open');
                if (hamburger) hamburger.classList.remove('active');
            }
        });

        // Handle back/forward buttons
        window.addEventListener('popstate', () => {
            navigate(window.location.pathname, false);
        });

        setupRankingFilters();
    }

    // ══════════════════════════════════════════
    // PHASE 3: localStorage History, Streaks, Profile
    // ══════════════════════════════════════════
    const HISTORY_KEY = 'brainAge_history';
    const STREAK_KEY = 'brainAge_streak';

    function getHistory() {
        try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
        catch (e) { return []; }
    }

    function saveHistory(history) {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }

    function updateStreak(todayDateStr) {
        let data;
        try { data = JSON.parse(localStorage.getItem(STREAK_KEY)) || { streak: 0, lastDate: null }; }
        catch (e) { data = { streak: 0, lastDate: null }; }
        if (data.lastDate === todayDateStr) return; // Already updated today
        const yesterday = new Date(todayDateStr);
        yesterday.setDate(yesterday.getDate() - 1);
        const yStr = yesterday.toISOString().split('T')[0];
        data.streak = data.lastDate === yStr ? (data.streak || 0) + 1 : 1;
        data.lastDate = todayDateStr;
        localStorage.setItem(STREAK_KEY, JSON.stringify(data));
    }

    function getCurrentStreak() {
        try {
            const d = JSON.parse(localStorage.getItem(STREAK_KEY));
            return d ? (d.streak || 0) : 0;
        } catch (e) { return 0; }
    }

    function saveResultToHistory(brainAge, difficulty, gameLabels, currentScores) {
        const history = getHistory();
        const dateNow = new Date().toISOString().split('T')[0];
        history.unshift({ date: dateNow, brainAge, difficulty, games: gameLabels, scores: { ...currentScores } });
        saveHistory(history);
        updateStreak(dateNow);
    }

    function showStreakNotification() {
        const streak = getCurrentStreak();
        if (streak < 2) return;
        const notif = document.createElement('div');
        notif.style.cssText = 'position:fixed;bottom:20px;right:20px;background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff;padding:14px 20px;border-radius:12px;font-weight:700;z-index:9999;box-shadow:0 4px 24px rgba(245,158,11,0.4);';
        notif.innerHTML = `🔥 ¡Racha de ${streak} días! ¡Sigue así!`;
        document.body.appendChild(notif);
        setTimeout(() => notif.style.opacity = '0', 3500);
        setTimeout(() => notif.remove(), 4000);
    }

    let evolutionChartInstance = null;

    function loadProfile() {
        const history = getHistory();
        const streak = getCurrentStreak();
        document.getElementById('profile-streak').textContent = streak;
        document.getElementById('profile-total').textContent = history.length;

        if (history.length === 0) {
            document.getElementById('profile-best').textContent = '--';
            document.getElementById('profile-no-data').style.display = 'block';
        } else {
            document.getElementById('profile-best').textContent = Math.min(...history.map(h => h.brainAge));
            document.getElementById('profile-no-data').style.display = 'none';
        }

        let league = { name: 'Bronce', icon: '🥉', color: '#b45309' };
        if (history.length > 0) {
            const sortedH = [...history].reverse();
            let impr = 0;
            for (let i = 1; i < sortedH.length; i++) {
                if (sortedH[i].brainAge <= sortedH[i - 1].brainAge) impr++;
                else impr = 0;
            }
            if (impr >= 9) league = { name: 'Diamante', icon: '💎', color: '#06b6d4' };
            else if (impr >= 6) league = { name: 'Oro', icon: '🥇', color: '#f59e0b' };
            else if (impr >= 3) league = { name: 'Plata', icon: '🥈', color: '#94a3b8' };
        }
        document.getElementById('profile-league-icon').textContent = league.icon;
        document.getElementById('profile-league-name').textContent = league.name;
        document.getElementById('profile-league-name').style.color = league.color;

        // Badges
        const bestAge = history.length > 0 ? Math.min(...history.map(h => h.brainAge)) : 999;
        const badgeContainer = document.getElementById('profile-badges');
        if (badgeContainer) {
            const BADGES = [
                { icon: '🎮', label: 'Primer Test', achieved: history.length >= 1 },
                { icon: '🌟', label: '5 Partidas', achieved: history.length >= 5 },
                { icon: '💎', label: 'Veterano', achieved: history.length >= 10 },
                { icon: '🔥', label: '3 días', achieved: streak >= 3 },
                { icon: '⚡', label: '7 días', achieved: streak >= 7 },
                { icon: '🧠', label: '≤22 años', achieved: bestAge <= 22 },
                { icon: '🏆', label: '≤18 años', achieved: bestAge <= 18 },
            ];
            badgeContainer.innerHTML = BADGES.map(b => `
                <div class="profile-badge-item ${b.achieved ? 'is-unlocked' : 'is-locked'}">
                    <span class="profile-badge-item__icon" style="filter:${b.achieved ? 'none' : 'grayscale(1)'};">${b.icon}</span>
                    <span class="profile-badge-item__label">${b.label}</span>
                </div>`).join('');
        }

        // History table
        const historyDiv = document.getElementById('profile-history');
        if (historyDiv) {
            if (history.length === 0) {
                historyDiv.innerHTML = '<p class="profile-history__empty">Aún no tienes partidas guardadas.</p>';
            } else {
                const rows = history.map(h => {
                    const diff = h.difficulty === 'easy' ? '🟢 Fácil' : h.difficulty === 'hard' ? '🔴 Difícil' : '🔵 Normal';
                    const col = h.brainAge <= 28 ? '#10b981' : h.brainAge <= 45 ? '#f59e0b' : '#ef4444';
                    return `<tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                        <td style="padding:11px 10px;font-size:13px;">${h.date}</td>
                        <td style="padding:11px 10px;font-weight:800;font-size:18px;color:${col};font-family:var(--font-display);">${h.brainAge}<span style="font-size:11px;font-weight:400;color:var(--clr-text-muted);"> años</span></td>
                        <td style="padding:11px 10px;font-size:13px;">${diff}</td>
                        <td style="padding:11px 10px;font-size:12px;color:var(--clr-text-muted);">${h.games ? h.games.join(', ') : '--'}</td>
                    </tr>`;
                }).join('');
                historyDiv.innerHTML = `<table style="width:100%;border-collapse:collapse;">
                    <thead><tr style="border-bottom:1px solid rgba(255,255,255,0.07);">
                        <th style="padding:10px;text-align:left;font-size:12px;font-weight:600;color:var(--clr-text-muted);text-transform:uppercase;">Fecha</th>
                        <th style="padding:10px;text-align:left;font-size:12px;font-weight:600;color:var(--clr-text-muted);text-transform:uppercase;">Edad</th>
                        <th style="padding:10px;text-align:left;font-size:12px;font-weight:600;color:var(--clr-text-muted);text-transform:uppercase;">Nivel</th>
                        <th style="padding:10px;text-align:left;font-size:12px;font-weight:600;color:var(--clr-text-muted);text-transform:uppercase;">Pruebas</th>
                    </tr></thead><tbody>${rows}</tbody></table>`;
            }
        }

        // Evolution chart
        const ctxEvo = document.getElementById('evolutionChart');
        if (ctxEvo && typeof Chart !== 'undefined' && history.length > 0) {
            const sorted = [...history].reverse();
            const chartLabels = sorted.map(h => h.date.slice(5));
            const chartData = sorted.map(h => h.brainAge);
            if (evolutionChartInstance) evolutionChartInstance.destroy();
            evolutionChartInstance = new Chart(ctxEvo, {
                type: 'line',
                data: {
                    labels: chartLabels,
                    datasets: [{
                        label: 'Edad Mental',
                        data: chartData,
                        borderColor: 'rgba(139,92,246,1)',
                        backgroundColor: 'rgba(139,92,246,0.15)',
                        pointBackgroundColor: 'rgba(6,182,212,1)',
                        pointRadius: 5,
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { reverse: true, min: 15, max: 75, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                        x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                    }
                }
            });
        }

        // 📊 Profile Radar Chart (Fortalezas Cognitivas)
        const ctxRadarProfile = document.getElementById('profileRadarChart');
        if (ctxRadarProfile && typeof Chart !== 'undefined' && history.length > 0) {
            let sumScores = { reaction: 0, numbers: 0, patterns: 0, math: 0, sequence: 0 };
            let counts = { reaction: 0, numbers: 0, patterns: 0, math: 0, sequence: 0 };

            history.forEach(h => {
                if (h.scores) {
                    for (const k in sumScores) {
                        if (h.scores[k] !== undefined) {
                            sumScores[k] += h.scores[k] || 0;
                            counts[k] = (counts[k] || 0) + 1;
                        }
                    }
                }
            });

            const radarDataProfile = [
                counts.reaction > 0 ? Math.round(sumScores.reaction / counts.reaction) : 0,
                counts.numbers > 0 ? Math.round(sumScores.numbers / counts.numbers) : 0,
                counts.patterns > 0 ? Math.round(sumScores.patterns / counts.patterns) : 0,
                counts.math > 0 ? Math.round(sumScores.math / counts.math) : 0,
                counts.sequence > 0 ? Math.round(sumScores.sequence / counts.sequence) : 0
            ];

            // Use Fallback if no scores yet (compatibility with old history)
            const hasData = radarDataProfile.some(v => v > 0);
            const finalData = hasData ? radarDataProfile : [75, 60, 80, 55, 70]; // Default mock for empty visual fallback

            if (window._profileRadarChartInstance) window._profileRadarChartInstance.destroy();
            window._profileRadarChartInstance = new Chart(ctxRadarProfile.getContext('2d'), {
                type: 'radar',
                data: {
                    labels: ['Reacción', 'Memoria Nums.', 'Patrones', 'Mates', 'Secuencia'],
                    datasets: [{
                        label: 'Tu Puntuación',
                        data: finalData,
                        backgroundColor: 'rgba(6, 182, 212, 0.2)',
                        borderColor: 'rgba(6, 182, 212, 1)',
                        pointBackgroundColor: 'rgba(6, 182, 212, 1)',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    scales: {
                        r: {
                            angleLines: { color: 'rgba(255,255,255,0.1)' },
                            grid: { color: 'rgba(255,255,255,0.1)' },
                            pointLabels: { color: '#f1f5f9', font: { size: 11 } },
                            ticks: { display: false, max: 100, min: 0 }
                        }
                    },
                    plugins: { legend: { display: false } }
                }
            });
        }
    }

    // ══════════════════════════════════════════
    // PHASE 4: QR Code, Duel URL, Challenge Banner
    // ══════════════════════════════════════════
    function buildDuelUrl(brainAge, playerName) {
        const name = playerName || 'Anónimo';
        return `https://edadmental.online/?reto=${encodeURIComponent(name)}&edad=${brainAge}`;
    }

    function generateQrCodeUrl(text) {
        return `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(text)}&bgcolor=0f0c29&color=a78bfa&format=png`;
    }

    function checkDuelChallenge() {
        const params = new URLSearchParams(window.location.search);
        const challenger = params.get('reto');
        const age = params.get('edad');
        if (!challenger || !age) return;
        const banner = document.getElementById('duel-banner');
        if (!banner) return;
        document.getElementById('duel-challenger-name').textContent = escapeHTML(challenger);
        document.getElementById('duel-challenger-name2').textContent = ' a ' + escapeHTML(challenger);
        document.getElementById('duel-challenger-age').textContent = parseInt(age, 10);
        banner.style.display = 'block';
        document.getElementById('duel-accept-btn').addEventListener('click', () => {
            banner.style.display = 'none';
            document.getElementById('btn-start').click();
        });
        document.getElementById('duel-close-btn').addEventListener('click', () => {
            banner.style.display = 'none';
        });
    }

    function setupPhase4Buttons() {
        const btnDownload = document.getElementById('btn-download-card');
        if (btnDownload) {
            // Remove previous listener if any
            btnDownload.replaceWith(btnDownload.cloneNode(true));
            document.getElementById('btn-download-card').addEventListener('click', () => {
                const d = window._shareData;
                if (!d) return;
                const canvas = document.createElement('canvas');
                canvas.width = 620; canvas.height = 440;
                const ctx = canvas.getContext('2d');
                const grd = ctx.createLinearGradient(0, 0, 620, 440);
                grd.addColorStop(0, '#0f0c29'); grd.addColorStop(0.5, '#1a1145'); grd.addColorStop(1, '#24243e');
                ctx.fillStyle = grd; ctx.fillRect(0, 0, 620, 440);
                ctx.strokeStyle = 'rgba(139,92,246,0.5)'; ctx.lineWidth = 3;
                ctx.roundRect(10, 10, 600, 420, 20); ctx.stroke();
                ctx.fillStyle = '#a78bfa'; ctx.font = 'bold 22px Outfit,sans-serif'; ctx.textAlign = 'center';
                ctx.fillText('Test de Edad Mental', 300, 52);
                ctx.fillStyle = '#22d3ee'; ctx.font = 'bold 84px Outfit,sans-serif';
                ctx.fillText(d.brainAge, 300, 155);
                ctx.fillStyle = '#94a3b8'; ctx.font = '22px Inter,sans-serif';
                ctx.fillText('años de edad mental', 300, 190);
                // Bars
                games.slice(0, 5).forEach((g, i) => {
                    const y = 225 + i * 36, key = g.iconKey;
                    ctx.fillStyle = '#94a3b8'; ctx.font = '13px Inter,sans-serif'; ctx.textAlign = 'left';
                    ctx.fillText(g.label, 40, y + 4);
                    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(150, y - 9, 280, 14);
                    const score = d.scores[key] || 0;
                    const bg = ctx.createLinearGradient(150, 0, 430, 0);
                    bg.addColorStop(0, '#8b5cf6'); bg.addColorStop(1, '#06b6d4');
                    ctx.fillStyle = bg; ctx.fillRect(150, y - 9, (score / 100) * 280, 14);
                    ctx.fillStyle = '#f1f5f9'; ctx.textAlign = 'right'; ctx.font = 'bold 13px Outfit,sans-serif';
                    ctx.fillText((d.ages[key] || '--') + ' años', 450, y + 4);
                });
                // QR
                const duelUrl = buildDuelUrl(d.brainAge, window._sharePlayerName || '');
                const img = new Image();
                img.crossOrigin = 'anonymous';
                const finish = () => {
                    ctx.fillStyle = '#64748b'; ctx.font = '12px Inter,sans-serif'; ctx.textAlign = 'center';
                    ctx.fillText('edadmental.online', 310, 430);
                    const link = document.createElement('a');
                    link.download = `mi-edad-mental-${d.brainAge}.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                };
                img.onload = () => {
                    ctx.drawImage(img, 498, 208, 112, 112);
                    ctx.fillStyle = '#64748b'; ctx.font = '11px Inter,sans-serif'; ctx.textAlign = 'center';
                    ctx.fillText('¡Reta a amigos!', 554, 334);
                    finish();
                };
                img.onerror = finish;
                img.src = generateQrCodeUrl(duelUrl);
            });
        }

        const btnChallenge = document.getElementById('btn-challenge');
        if (btnChallenge) {
            btnChallenge.replaceWith(btnChallenge.cloneNode(true));
            document.getElementById('btn-challenge').addEventListener('click', () => {
                const d = window._shareData;
                if (!d) return;
                const name = window._sharePlayerName || 'Anónimo';
                const duelUrl = buildDuelUrl(d.brainAge, name);
                const text = encodeURIComponent(`🧠 Mi edad mental es ${d.brainAge} años. ¿Puedes superarme?\n\n¡Haz el test ahora: ${duelUrl}`);
                window.open(`https://wa.me/?text=${text}`, '_blank');
            });
        }
    }

    window.addEventListener('load', () => {
        initBgParticles();
        loadPlayerCount();

        // Solo configurar router SPA si estamos en index.html (tiene todos los views)
        const isSPA = document.getElementById('view-welcome') !== null;

        if (isSPA) {
            // Estamos en index.html - usar router SPA
            setupRouter();
            navigate(window.location.pathname, false);
        }
        // Las páginas individuales serán inicializadas por page-loader.js

        setupPhase4Buttons();
        checkDuelChallenge();
        renderDailyTestsInfo();
        renderTrainingMode();
        renderDailyGamesList();

        // Clear history button
        const btnClearHistory = document.getElementById('btn-clear-history');
        if (btnClearHistory) {
            btnClearHistory.addEventListener('click', () => {
                if (confirm('¿Seguro que quieres borrar tu historial local? Esta acción no se puede deshacer.')) {
                    localStorage.removeItem(HISTORY_KEY);
                    localStorage.removeItem(STREAK_KEY);
                    // Recargar perfil y sincronizar
                    if (typeof loadAndSyncProfile === 'function') {
                        loadAndSyncProfile();
                    } else if (typeof loadProfile === 'function') {
                        loadProfile();
                    }
                }
            });
        }

        // See ranking after save
        const btnSeeRanking = document.getElementById('btn-see-ranking');
        if (btnSeeRanking) {
            btnSeeRanking.addEventListener('click', () => {
                document.getElementById('score-saved-overlay').style.display = 'none';
                navigate('/ranking');
            });
        }

        // Auth setup
        initAuth();
    });

    // ══════════════════════════════════════════
    // AUTH SYSTEM (Supabase Auth)
    // ══════════════════════════════════════════
    let _currentUser = null;
    let _currentDisplayName = null;

    function updateNavForUser(user, displayName) {
        const btnLogin = document.getElementById('btn-nav-login');
        const pill = document.getElementById('nav-user-pill');
        const avatar = document.getElementById('nav-avatar');
        const nameSpan = document.getElementById('nav-username');
        // Ranking save auth gate elements
        const rankGate = document.getElementById('ranking-auth-gate');
        const rankForm = document.getElementById('ranking-save-form');
        const rankLabel = document.getElementById('ranking-user-label');
        // Profile view auth gate elements
        const profGate = document.getElementById('profile-auth-gate');
        const profContent = document.getElementById('profile-content');
        // Ranking view auth gate elements
        const rankPageGate = document.getElementById('ranking-page-auth-gate');
        const rankPageContent = document.getElementById('ranking-page-content');

        if (user && displayName) {
            _currentUser = user;
            _currentDisplayName = displayName;
            window._sharePlayerName = displayName;
            if (btnLogin) btnLogin.style.display = 'none';
            if (pill) {
                pill.style.display = 'flex';
                avatar.textContent = displayName.charAt(0).toUpperCase();
                nameSpan.textContent = displayName;
            }
            // Show save form, hide auth gate
            if (rankGate) rankGate.style.display = 'none';
            if (rankForm) rankForm.style.display = 'block';
            if (rankLabel) rankLabel.textContent = displayName;
            // Show profile content, hide auth gate
            if (profGate) profGate.style.display = 'none';
            if (profContent) profContent.style.display = 'block';
            // Show ranking page content, hide auth gate
            if (rankPageGate) rankPageGate.style.display = 'none';
            if (rankPageContent) rankPageContent.style.display = 'block';
        } else {
            _currentUser = null;
            _currentDisplayName = null;
            if (btnLogin) btnLogin.style.display = '';
            if (pill) pill.style.display = 'none';
            // Show auth gate, hide save form
            if (rankGate) rankGate.style.display = 'block';
            if (rankForm) rankForm.style.display = 'none';
            // Show profile auth gate, hide content
            if (profGate) profGate.style.display = 'block';
            if (profContent) profContent.style.display = 'none';
            // Show ranking page auth gate, hide content
            if (rankPageGate) rankPageGate.style.display = 'block';
            if (rankPageContent) rankPageContent.style.display = 'none';
        }
    }

    async function initAuth() {
        // Listen to auth changes (handles login, logout, session restore)
        if (typeof onAuthChange === 'function') {
            onAuthChange(async (user) => {
                if (user) {
                    const name = await getUserDisplayName(user.id) || user.email;
                    updateNavForUser(user, name);
                } else {
                    updateNavForUser(null, null);
                }
            });
        }
        // Also check immediately on load
        if (typeof getCurrentUser === 'function') {
            const user = await getCurrentUser();
            if (user) {
                const name = await getUserDisplayName(user.id) || user.email;
                updateNavForUser(user, name);
            }
        }
    }

    // Global functions (called from inline HTML onsubmit / onclick)
    window.handleLogin = async function (e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const errEl = document.getElementById('login-error');
        const btn = document.getElementById('btn-login-submit');
        errEl.style.display = 'none';
        btn.textContent = 'Entrando...';
        btn.disabled = true;
        const { user, error } = await authSignIn(email, password);
        btn.textContent = 'Entrar';
        btn.disabled = false;
        if (error) {
            errEl.textContent = error.message || 'Error al iniciar sesión.';
            errEl.style.display = 'block';
        } else {
            document.getElementById('auth-modal').style.display = 'none';
            const name = await getUserDisplayName(user.id) || user.email;
            updateNavForUser(user, name);
        }
    };

    window.handleRegister = async function (e) {
        e.preventDefault();
        const name = document.getElementById('reg-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;
        const errEl = document.getElementById('register-error');
        const successEl = document.getElementById('register-success');
        const btn = document.getElementById('btn-register-submit');
        errEl.style.display = 'none';
        successEl.style.display = 'none';
        btn.textContent = 'Creando cuenta...';
        btn.disabled = true;
        const { user, error } = await authSignUp(email, password, name);
        btn.textContent = 'Crear Cuenta';
        btn.disabled = false;
        if (error) {
            errEl.textContent = error.message || 'Error al crear cuenta.';
            errEl.style.display = 'block';
        } else {
            successEl.style.display = 'block';
            // If email confirmation is disabled, auto-login
            if (user) {
                updateNavForUser(user, name);
                setTimeout(() => {
                    document.getElementById('auth-modal').style.display = 'none';
                }, 2000);
            }
        }
    };

    window.handleLogout = async function () {
        await authSignOut();
        updateNavForUser(null, null);
    };

    window.switchAuthTab = function (tab) {
        const loginForm = document.getElementById('form-login');
        const regForm = document.getElementById('form-register');
        const tabLogin = document.getElementById('tab-login');
        const tabReg = document.getElementById('tab-register');
        if (tab === 'login') {
            loginForm.style.display = '';
            regForm.style.display = 'none';
            tabLogin.style.background = 'rgba(139,92,246,0.25)';
            tabLogin.style.color = '#f1f5f9';
            tabReg.style.background = 'transparent';
            tabReg.style.color = 'var(--clr-text-muted)';
        } else {
            loginForm.style.display = 'none';
            regForm.style.display = '';
            tabReg.style.background = 'rgba(139,92,246,0.25)';
            tabReg.style.color = '#f1f5f9';
            tabLogin.style.background = 'transparent';
            tabLogin.style.color = 'var(--clr-text-muted)';
        }
    };
    // ── Referral System (Growth Loop Demo) ──
    let referrals = 0;

    window.copyReferralLink = function () {
        let link = window.location.origin + '?ref=demo';
        if (window._shareData) link = window.location.origin + '?ref=' + window._shareData.brainAge + 'y';
        navigator.clipboard.writeText(link);
        const btn = document.getElementById('btn-copy-ref');
        btn.textContent = '¡Copiado!';
        setTimeout(() => btn.textContent = 'Copiar Enlace Privado', 2000);

        // Demo simulation: A friend clicks the link after 4 seconds
        if (referrals < 2) {
            setTimeout(() => {
                referrals++;
                document.getElementById('ref-count').textContent = referrals;
                document.getElementById('ref-progress-bar').style.width = (referrals * 50) + '%';

                // Efecto de sonido (opcional)
                if (typeof playTone === 'function') playTone(880, 0.1, 'sine', 0.1);

                if (referrals >= 2) {
                    const unlockBtn = document.getElementById('btn-unlock-analytics');
                    unlockBtn.disabled = false;
                    unlockBtn.style.opacity = '1';
                    unlockBtn.style.cursor = 'pointer';
                    unlockBtn.classList.remove('btn-secondary');
                    unlockBtn.classList.add('btn-primary', 'btn-glow');
                    unlockBtn.textContent = 'Ver mi Analítica Profunda';
                    unlockBtn.onclick = () => {
                        alert('¡Analítica desbloqueada! Aquí se renderizaría el PDF de Mapeo Cerebral Premium.');
                    };
                }
            }, 4000);
        }
    };

    // ── Sincronización de Perfil con Supabase ──
    window.syncProfileWithSupabase = async (brainAge) => {
        try {
            // Verificar si el usuario está autenticado
            if (typeof getCurrentUser !== 'function') return;
            const user = await getCurrentUser();
            if (!user) return;

            // Obtener historial para calcular estadísticas
            const history = getHistory();
            const today = new Date().toISOString().split('T')[0];

            // Calcular mejor edad mental (mínima)
            const bestBrainAge = Math.min(...history.map(h => h.brainAge));

            // Calcular promedio de edad mental
            const averageBrainAge = history.length > 0
                ? Math.round(history.reduce((sum, h) => sum + h.brainAge, 0) / history.length)
                : 0;

            // Calcular promedios por tipo de juego
            const gameAverages = { reaction: [], numbers: [], patterns: [], math: [], sequence: [], colors: [], spatial: [] };
            history.forEach(h => {
                if (h.scores) {
                    if (h.scores.reaction !== undefined) gameAverages.reaction.push(h.scores.reaction);
                    if (h.scores.numbers !== undefined) gameAverages.numbers.push(h.scores.numbers);
                    if (h.scores.patterns !== undefined) gameAverages.patterns.push(h.scores.patterns);
                    if (h.scores.math !== undefined) gameAverages.math.push(h.scores.math);
                    if (h.scores.sequence !== undefined) gameAverages.sequence.push(h.scores.sequence);
                    if (h.scores.colors !== undefined) gameAverages.colors.push(h.scores.colors);
                    if (h.scores.spatial !== undefined) gameAverages.spatial.push(h.scores.spatial);
                }
            });

            const stats = {
                total_tests: history.length,
                best_brain_age: bestBrainAge,
                last_played_at: today,
                average_brain_age: averageBrainAge,
                reaction_avg: gameAverages.reaction.length > 0 ? Math.round(gameAverages.reaction.reduce((a, b) => a + b, 0) / gameAverages.reaction.length) : 0,
                numbers_avg: gameAverages.numbers.length > 0 ? Math.round(gameAverages.numbers.reduce((a, b) => a + b, 0) / gameAverages.numbers.length) : 0,
                patterns_avg: gameAverages.patterns.length > 0 ? Math.round(gameAverages.patterns.reduce((a, b) => a + b, 0) / gameAverages.patterns.length) : 0,
                math_avg: gameAverages.math.length > 0 ? Math.round(gameAverages.math.reduce((a, b) => a + b, 0) / gameAverages.math.length) : 0,
                sequence_avg: gameAverages.sequence.length > 0 ? Math.round(gameAverages.sequence.reduce((a, b) => a + b, 0) / gameAverages.sequence.length) : 0,
                colors_avg: gameAverages.colors.length > 0 ? Math.round(gameAverages.colors.reduce((a, b) => a + b, 0) / gameAverages.colors.length) : 0,
                spatial_avg: gameAverages.spatial.length > 0 ? Math.round(gameAverages.spatial.reduce((a, b) => a + b, 0) / gameAverages.spatial.length) : 0,
                current_streak: typeof getCurrentStreak === 'function' ? getCurrentStreak() : 0,
                highest_streak: typeof getHighestStreak === 'function' ? getHighestStreak() : 0
            };

            // Calcular insignias desbloqueadas
            const badges = {
                first_test: history.length >= 1,
                five_games: history.length >= 5,
                veteran: history.length >= 10,
                three_day_streak: stats.current_streak >= 3,
                seven_day_streak: stats.current_streak >= 7,
                brain_age_22: bestBrainAge <= 22,
                brain_age_18: bestBrainAge <= 18
            };
            stats.badges_unlocked = JSON.stringify(badges);

            // Actualizar perfil en Supabase
            if (typeof updateUserProfile === 'function') {
                const result = await updateUserProfile(user.id, { stats });

                if (!result || !result.error) {
                    console.log('✅ Perfil sincronizado con Supabase:', {
                        total_tests: stats.total_tests,
                        best_brain_age: stats.best_brain_age,
                        average_brain_age: stats.average_brain_age,
                        current_streak: stats.current_streak,
                        highest_streak: stats.highest_streak,
                        badges: badges
                    });
                } else {
                    console.error('❌ Error sincronizando perfil:', result.error);
                }
            }
        } catch (err) {
            console.error('❌ Error en syncProfileWithSupabase:', err);
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        const refText = document.getElementById('referral-link-text');
        if (refText) refText.textContent = window.location.origin + '?ref=top';
    });

    
    function renderTrainingMode() {
        ['zen-grid-container', 'zen-grid-training'].forEach((gridId) => {
            const grid = document.getElementById(gridId);
            if (!grid) return;
            const entry = grid.dataset.trainingEntry || (gridId === 'zen-grid-training' ? 'training' : 'home');
            grid.innerHTML = '';
            gamesPool.forEach((g, idx) => {
                const card = document.createElement('button');
                card.type = 'button';
                card.className = 'training-game-row';
                const iconHtml = g.iconKey ? gameIcons[g.iconKey].replace(/width="48"/g, 'width="40"').replace(/height="48"/g, 'height="40"') : '';
                const shortDesc = g.desc.length > 130 ? g.desc.slice(0, 127) + '…' : g.desc;
                card.innerHTML = '<span class="training-game-row__icon">' + iconHtml + '</span><span class="training-game-row__text"><span class="training-game-row__title">' + g.title + '</span><span class="training-game-row__desc">' + shortDesc + '</span></span><span class="training-game-row__arrow" aria-hidden="true">→</span>';
                card.addEventListener('click', () => {
                    trainingEntryView = entry;
                    isTrainingMode = true;
                    currentGame = 0;
                    games[0] = { ...gamesPool[idx], id: games[0].id };
                    const go = () => showInstructions(currentGame);
                    if (entry === 'training') {
                        // Si estamos en página individual de entrenamiento, no navegar
                        const isSPA = document.getElementById('view-welcome') !== null;
                        if (isSPA) {
                            navigate('/');
                            setTimeout(go, 330);
                        } else {
                            // Página individual - ejecutar directamente
                            go();
                        }
                    } else {
                        go();
                    }
                });
                grid.appendChild(card);
            });
        });
    }

    function renderDailyGamesList() {
        const list = document.getElementById('daily-games-list');
        if (!list) return;
        list.innerHTML = '';
        games.forEach((g, idx) => {
            let svg = g.iconKey ? gameIcons[g.iconKey].replace(/width="48"/g, 'width="16"').replace(/height="48"/g, 'height="16"') : '';
            list.innerHTML += '<div style="font-size:12px; font-weight:500; display:flex; align-items:center; gap:6px; color:var(--clr-text-muted); opacity: 0.9;">' + svg + g.title + '</div>';
        });
    }

    // Exponer funciones críticas al scope global para páginas individuales
    window.navigate = navigate;
    window.loadRanking = loadRanking;
    window.loadStats = loadStats;
    window.showScreen = showScreen;
    window.renderTrainingMode = renderTrainingMode;
    window.exitTrainingFlow = exitTrainingFlow;
    window.setupRankingFilters = setupRankingFilters;

    // Getter para currentRankingFilter
    Object.defineProperty(window, 'getCurrentRankingFilter', {
        value: () => currentRankingFilter,
        writable: false,
        configurable: false
    });

})();


    
    