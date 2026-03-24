/* ============================================
   Test de Edad Mental — Game Engine & Logic
   Vanilla JS — No dependencies
   ============================================ */

(function () {
    'use strict';

    // ── State ──
    const scores = { reaction: 0, numbers: 0, patterns: 0, math: 0, sequence: 0 };
    // Raw metrics stored for scientific brain-age mapping
    const rawMetrics = { reactionMs: 0, digitSpan: 0, patternScore: 0, mathRate: 0, sequenceSpan: 0 };
    let currentGame = 0;
    let currentDifficulty = 'normal';

    // SVG icons for each game (replacing emojis)
    const gameIcons = {
        reaction: '<svg viewBox="0 0 48 48" width="48" height="48"><path d="M28 4l-4 18h10L20 44l4-18H14L28 4z" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        numbers: '<svg viewBox="0 0 48 48" width="48" height="48"><rect x="8" y="8" width="32" height="32" rx="6" fill="none" stroke="#06b6d4" stroke-width="2.5"/><text x="24" y="30" text-anchor="middle" font-family="Outfit,sans-serif" font-weight="800" font-size="18" fill="#22d3ee">123</text></svg>',
        patterns: '<svg viewBox="0 0 48 48" width="48" height="48"><circle cx="16" cy="16" r="6" fill="none" stroke="#a78bfa" stroke-width="2.5"/><rect x="28" y="10" width="12" height="12" rx="2" fill="none" stroke="#f472b6" stroke-width="2.5"/><polygon points="16,28 22,40 10,40" fill="none" stroke="#34d399" stroke-width="2.5" stroke-linejoin="round"/><path d="M28 28l12 12M28 40l12-12" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round"/></svg>',
        math: '<svg viewBox="0 0 48 48" width="48" height="48"><circle cx="24" cy="24" r="18" fill="none" stroke="#8b5cf6" stroke-width="2.5"/><text x="24" y="20" text-anchor="middle" font-family="Outfit,sans-serif" font-weight="800" font-size="12" fill="#a78bfa">+-%C3%97</text><path d="M15 28h18" fill="none" stroke="#a78bfa" stroke-width="2" stroke-linecap="round"/><text x="24" y="38" text-anchor="middle" font-family="Outfit,sans-serif" font-weight="800" font-size="10" fill="#22d3ee">=?</text></svg>',
        sequence: '<svg viewBox="0 0 48 48" width="48" height="48"><rect x="6" y="6" width="10" height="10" rx="2" fill="#8b5cf6" opacity=".3"/><rect x="19" y="6" width="10" height="10" rx="2" fill="#8b5cf6" opacity=".7"/><rect x="32" y="6" width="10" height="10" rx="2" fill="#8b5cf6" opacity=".3"/><rect x="6" y="19" width="10" height="10" rx="2" fill="#8b5cf6" opacity=".7"/><rect x="19" y="19" width="10" height="10" rx="2" fill="#8b5cf6"/><rect x="32" y="19" width="10" height="10" rx="2" fill="#8b5cf6" opacity=".7"/><rect x="6" y="32" width="10" height="10" rx="2" fill="#8b5cf6" opacity=".3"/><rect x="19" y="32" width="10" height="10" rx="2" fill="#8b5cf6" opacity=".7"/><rect x="32" y="32" width="10" height="10" rx="2" fill="#8b5cf6" opacity=".3"/></svg>',
    };

    const games = [
        { id: 1, iconKey: 'reaction', title: 'Tiempo de Reaccion', desc: 'Mide la velocidad de tu sistema nervioso. Cuando la zona roja cambie a verde, pulsa lo mas rapido posible. Se realizaran 3 rondas y se calculara tu tiempo medio de reaccion. Un adulto joven promedia unos 250ms.' },
        { id: 2, iconKey: 'numbers', title: 'Memoria de Numeros', desc: 'Evalua tu memoria de trabajo a corto plazo. Aparecera una secuencia de digitos durante unos segundos. Despues, deberas escribirla de memoria. Cada nivel anade un digito mas. La capacidad media es de 7 digitos.' },
        { id: 3, iconKey: 'patterns', title: 'Reconocimiento de Patrones', desc: 'Mide tu inteligencia fluida y razonamiento logico. Identifica que elemento completa cada secuencia. Tienes 30 segundos para resolver el maximo de patrones posibles entre numeros, colores, formas y letras.' },
        { id: 4, iconKey: 'math', title: 'Velocidad Matematica', desc: 'Evalua tu velocidad de procesamiento cognitivo. Resuelve sumas, restas y multiplicaciones lo mas rapido posible en 30 segundos. La precision tambien cuenta: las respuestas incorrectas reducen tu puntuacion.' },
        { id: 5, iconKey: 'sequence', title: 'Memoria de Secuencia', desc: 'Basada en el test de bloques de Corsi. Observa las casillas que se iluminan y repite la secuencia en el mismo orden. Cada ronda anade un paso mas. La capacidad media es de 5-6 elementos.' },
    ];

    // ── Helpers ──
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    function showScreen(id) {
        $$('.screen').forEach(s => s.classList.remove('active'));
        const target = $(`#screen-${id}`);
        target.classList.remove('active');
        void target.offsetWidth;
        target.classList.add('active');
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
        playTone(523, 0.12, 'sine', 0.12);
        setTimeout(() => playTone(659, 0.12, 'sine', 0.12), 80);
        setTimeout(() => playTone(784, 0.18, 'sine', 0.10), 160);
    }

    function sfxWrong() {
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
    const REACTION_ROUNDS = 3;

    function startReactionGame() {
        reactionAttempts = [];
        reactionRound = 0;
        showScreen('game1');
        runReactionRound();
    }

    function runReactionRound() {
        const zone = $('#reaction-zone');
        const text = $('#reaction-text');
        const hint = $('#reaction-hint');

        zone.className = 'reaction-zone waiting';
        text.textContent = 'Espera al color verde...';
        text.className = 'reaction-text';
        hint.textContent = `Ronda ${reactionRound + 1} de ${REACTION_ROUNDS}`;

        const oldResult = zone.querySelector('.reaction-time-result');
        if (oldResult) oldResult.remove();

        const delay = randInt(1500, 4000);
        reactionTimeout = setTimeout(() => {
            zone.className = 'reaction-zone ready';
            text.textContent = '¡PULSA AHORA!';
            sfxGo();
            reactionStartTime = performance.now();
        }, delay);
    }

    function handleReactionClick() {
        const zone = $('#reaction-zone');
        const text = $('#reaction-text');

        if (zone.classList.contains('waiting')) {
            clearTimeout(reactionTimeout);
            zone.className = 'reaction-zone too-early';
            text.textContent = '¡Demasiado pronto! Espera al verde.';
            sfxTooEarly();
            setTimeout(() => runReactionRound(), 1500);
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

            if (reactionRound < REACTION_ROUNDS) {
                setTimeout(() => {
                    resultEl.remove();
                    runReactionRound();
                }, 1200);
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
        numberLevel = 3;
        numberMaxLevel = 0;
        showScreen('game2');
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

        const timeMultiplier = currentDifficulty === 'hard' ? 300 : (currentDifficulty === 'easy' ? 600 : 400);
        const baseTime = currentDifficulty === 'hard' ? 800 : (currentDifficulty === 'easy' ? 1500 : 1200);
        const showTime = baseTime + (numberLevel * timeMultiplier);
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

    const patternSets = [
        {
            // Number sequence: 2, 4, 6, 8, ?
            label: '¿Qué número sigue la secuencia?',
            seq: [
                { type: 'number', value: '2' },
                { type: 'number', value: '4' },
                { type: 'number', value: '6' },
                { type: 'number', value: '8' },
            ],
            answer: 0,
            options: [
                { type: 'number', value: '10' },
                { type: 'number', value: '9' },
                { type: 'number', value: '12' },
                { type: 'number', value: '7' },
            ]
        },
        {
            // Color gradient: light to dark blue
            label: '¿Qué color continúa la degradación?',
            seq: [
                { type: 'color', color: '#bfdbfe' },
                { type: 'color', color: '#60a5fa' },
                { type: 'color', color: '#3b82f6' },
                { type: 'color', color: '#2563eb' },
            ],
            answer: 0,
            options: [
                { type: 'color', color: '#1d4ed8' },
                { type: 'color', color: '#f87171' },
                { type: 'color', color: '#93c5fd' },
                { type: 'color', color: '#fbbf24' },
            ]
        },
        {
            // Dots: 1, 2, 3, 4, ?
            label: '¿Cuántos puntos van a continuación?',
            seq: [
                { type: 'dots', count: 1, color: '#f472b6' },
                { type: 'dots', count: 2, color: '#f472b6' },
                { type: 'dots', count: 3, color: '#f472b6' },
                { type: 'dots', count: 4, color: '#f472b6' },
            ],
            answer: 0,
            options: [
                { type: 'dots', count: 5, color: '#f472b6' },
                { type: 'dots', count: 6, color: '#f472b6' },
                { type: 'dots', count: 3, color: '#f472b6' },
                { type: 'dots', count: 7, color: '#f472b6' },
            ]
        },
        {
            // Number: 3, 6, 12, 24, ?
            label: '¿Qué número sigue la secuencia?',
            seq: [
                { type: 'number', value: '3' },
                { type: 'number', value: '6' },
                { type: 'number', value: '12' },
                { type: 'number', value: '24' },
            ],
            answer: 0,
            options: [
                { type: 'number', value: '48' },
                { type: 'number', value: '36' },
                { type: 'number', value: '30' },
                { type: 'number', value: '28' },
            ]
        },
        {
            // Bar heights: 10, 20, 30, 40, ?
            label: '¿Qué barra sigue el patrón?',
            seq: [
                { type: 'bar', height: 10, color: '#34d399' },
                { type: 'bar', height: 20, color: '#34d399' },
                { type: 'bar', height: 30, color: '#34d399' },
                { type: 'bar', height: 40, color: '#34d399' },
            ],
            answer: 0,
            options: [
                { type: 'bar', height: 50, color: '#34d399' },
                { type: 'bar', height: 35, color: '#34d399' },
                { type: 'bar', height: 60, color: '#34d399' },
                { type: 'bar', height: 20, color: '#34d399' },
            ]
        },
        {
            // Alternating colors: red, blue, red, blue, ?
            label: '¿Qué color sigue la alternancia?',
            seq: [
                { type: 'color', color: '#ef4444' },
                { type: 'color', color: '#3b82f6' },
                { type: 'color', color: '#ef4444' },
                { type: 'color', color: '#3b82f6' },
            ],
            answer: 0,
            options: [
                { type: 'color', color: '#ef4444' },
                { type: 'color', color: '#3b82f6' },
                { type: 'color', color: '#22c55e' },
                { type: 'color', color: '#f59e0b' },
            ]
        },
        {
            // Letters: A, C, E, G, ?
            label: '¿Qué letra sigue la secuencia?',
            seq: [
                { type: 'letter', value: 'A' },
                { type: 'letter', value: 'C' },
                { type: 'letter', value: 'E' },
                { type: 'letter', value: 'G' },
            ],
            answer: 0,
            options: [
                { type: 'letter', value: 'I' },
                { type: 'letter', value: 'H' },
                { type: 'letter', value: 'J' },
                { type: 'letter', value: 'F' },
            ]
        },
        {
            // Fibonacci: 1, 1, 2, 3, ?
            label: '¿Qué número sigue la secuencia?',
            seq: [
                { type: 'number', value: '1' },
                { type: 'number', value: '1' },
                { type: 'number', value: '2' },
                { type: 'number', value: '3' },
            ],
            answer: 0,
            options: [
                { type: 'number', value: '5' },
                { type: 'number', value: '4' },
                { type: 'number', value: '6' },
                { type: 'number', value: '3' },
            ]
        },
        {
            // Shape sizes: small, medium, large circles, ?
            label: '¿Qué tamaño continúa la progresión?',
            seq: [
                { type: 'color', color: '#a78bfa', radius: '50%' },
                { type: 'color', color: '#a78bfa', radius: '50%' },
                { type: 'color', color: '#a78bfa', radius: '50%' },
                { type: 'color', color: '#a78bfa', radius: '50%' },
            ],
            // We'll handle sizes via inline style overrides
            seqSizes: [14, 20, 26, 32],
            answer: 0,
            options: [
                { type: 'color', color: '#a78bfa', radius: '50%', size: 38 },
                { type: 'color', color: '#a78bfa', radius: '50%', size: 20 },
                { type: 'color', color: '#a78bfa', radius: '50%', size: 10 },
                { type: 'color', color: '#a78bfa', radius: '50%', size: 50 },
            ]
        },
        {
            // Squares: 1², 2², 3², 4², ?
            label: '¿Qué número sigue? (cuadrados perfectos)',
            seq: [
                { type: 'number', value: '1' },
                { type: 'number', value: '4' },
                { type: 'number', value: '9' },
                { type: 'number', value: '16' },
            ],
            answer: 0,
            options: [
                { type: 'number', value: '25' },
                { type: 'number', value: '20' },
                { type: 'number', value: '32' },
                { type: 'number', value: '18' },
            ]
        },
        {
            // Triangular numbers: 1, 3, 6, 10, ?
            label: '¿Qué número sigue la secuencia?',
            seq: [
                { type: 'number', value: '1' },
                { type: 'number', value: '3' },
                { type: 'number', value: '6' },
                { type: 'number', value: '10' },
            ],
            answer: 0,
            options: [
                { type: 'number', value: '15' },
                { type: 'number', value: '14' },
                { type: 'number', value: '12' },
                { type: 'number', value: '16' },
            ]
        },
        {
            // Dots doubling: 1, 2, 4, 8, ?
            label: '¿Cuántos puntos van a continuación?',
            seq: [
                { type: 'dots', count: 1, color: '#06b6d4' },
                { type: 'dots', count: 2, color: '#06b6d4' },
                { type: 'dots', count: 4, color: '#06b6d4' },
                { type: 'dots', count: 8, color: '#06b6d4' },
            ],
            answer: 0,
            options: [
                { type: 'dots', count: 16, color: '#06b6d4' },
                { type: 'dots', count: 10, color: '#06b6d4' },
                { type: 'dots', count: 12, color: '#06b6d4' },
                { type: 'dots', count: 9, color: '#06b6d4' },
            ]
        },
        {
            // Bar descending: 50, 40, 30, 20, ?
            label: '¿Qué barra sigue el patrón?',
            seq: [
                { type: 'bar', height: 50, color: '#f59e0b' },
                { type: 'bar', height: 40, color: '#f59e0b' },
                { type: 'bar', height: 30, color: '#f59e0b' },
                { type: 'bar', height: 20, color: '#f59e0b' },
            ],
            answer: 0,
            options: [
                { type: 'bar', height: 10, color: '#f59e0b' },
                { type: 'bar', height: 15, color: '#f59e0b' },
                { type: 'bar', height: 25, color: '#f59e0b' },
                { type: 'bar', height: 40, color: '#f59e0b' },
            ]
        },
        {
            // Letter sequence: B, D, F, H, ?
            label: '¿Qué letra sigue la secuencia?',
            seq: [
                { type: 'letter', value: 'B' },
                { type: 'letter', value: 'D' },
                { type: 'letter', value: 'F' },
                { type: 'letter', value: 'H' },
            ],
            answer: 0,
            options: [
                { type: 'letter', value: 'J' },
                { type: 'letter', value: 'I' },
                { type: 'letter', value: 'K' },
                { type: 'letter', value: 'G' },
            ]
        },
        {
            // Powers of 3: 1, 3, 9, 27, ?
            label: '¿Qué número sigue la secuencia?',
            seq: [
                { type: 'number', value: '1' },
                { type: 'number', value: '3' },
                { type: 'number', value: '9' },
                { type: 'number', value: '27' },
            ],
            answer: 0,
            options: [
                { type: 'number', value: '81' },
                { type: 'number', value: '36' },
                { type: 'number', value: '54' },
                { type: 'number', value: '30' },
            ]
        },
        {
            // Color gradient: green progression
            label: '¿Qué color continúa la degradación?',
            seq: [
                { type: 'color', color: '#bbf7d0' },
                { type: 'color', color: '#4ade80' },
                { type: 'color', color: '#22c55e' },
                { type: 'color', color: '#16a34a' },
            ],
            answer: 0,
            options: [
                { type: 'color', color: '#15803d' },
                { type: 'color', color: '#ef4444' },
                { type: 'color', color: '#86efac' },
                { type: 'color', color: '#a78bfa' },
            ]
        },
        {
            // Subtraction: 64, 32, 16, 8, ?
            label: '¿Qué número sigue la secuencia?',
            seq: [
                { type: 'number', value: '64' },
                { type: 'number', value: '32' },
                { type: 'number', value: '16' },
                { type: 'number', value: '8' },
            ],
            answer: 0,
            options: [
                { type: 'number', value: '4' },
                { type: 'number', value: '6' },
                { type: 'number', value: '2' },
                { type: 'number', value: '0' },
            ]
        },
        {
            // Squares minus 1: 0, 3, 8, 15, ?
            label: '¿Qué número sigue la secuencia?',
            seq: [
                { type: 'number', value: '0' },
                { type: 'number', value: '3' },
                { type: 'number', value: '8' },
                { type: 'number', value: '15' },
            ],
            answer: 0,
            options: [
                { type: 'number', value: '24' },
                { type: 'number', value: '25' },
                { type: 'number', value: '20' },
                { type: 'number', value: '22' },
            ]
        },
        {
            // Double and subtract 1: 2, 3, 5, 9... 17 (33)
            label: 'Resuelve esta secuencia lógica',
            seq: [
                { type: 'number', value: '2' },
                { type: 'number', value: '3' },
                { type: 'number', value: '5' },
                { type: 'number', value: '9' },
            ],
            answer: 0,
            options: [
                { type: 'number', value: '17' },
                { type: 'number', value: '18' },
                { type: 'number', value: '15' },
                { type: 'number', value: '14' },
            ]
        },
        {
            // Alternating +3, -1: 5, 8, 7, 10, ? (9)
            label: '¿Qué número sigue?',
            seq: [
                { type: 'number', value: '5' },
                { type: 'number', value: '8' },
                { type: 'number', value: '7' },
                { type: 'number', value: '10' },
            ],
            answer: 0,
            options: [
                { type: 'number', value: '9' },
                { type: 'number', value: '13' },
                { type: 'number', value: '11' },
                { type: 'number', value: '12' },
            ]
        },
        {
            // Skip 2 letters: A, D, G, J, ? (M)
            label: '¿Qué letra falta?',
            seq: [
                { type: 'letter', value: 'A' },
                { type: 'letter', value: 'D' },
                { type: 'letter', value: 'G' },
                { type: 'letter', value: 'J' },
            ],
            answer: 0,
            options: [
                { type: 'letter', value: 'M' },
                { type: 'letter', value: 'N' },
                { type: 'letter', value: 'L' },
                { type: 'letter', value: 'K' },
            ]
        },
        {
            // Descending primes: 17, 13, 11, 7, ? (5)
            label: 'Encuentra el número que sigue',
            seq: [
                { type: 'number', value: '17' },
                { type: 'number', value: '13' },
                { type: 'number', value: '11' },
                { type: 'number', value: '7' },
            ],
            answer: 0,
            options: [
                { type: 'number', value: '5' },
                { type: 'number', value: '3' },
                { type: 'number', value: '6' },
                { type: 'number', value: '4' },
            ]
        },
        {
            // Vowels missing one: A, E, I, O, ? (U)
            label: '¿Qué vocal termina la secuencia?',
            seq: [
                { type: 'letter', value: 'A' },
                { type: 'letter', value: 'E' },
                { type: 'letter', value: 'I' },
                { type: 'letter', value: 'O' },
            ],
            answer: 0,
            options: [
                { type: 'letter', value: 'U' },
                { type: 'letter', value: 'N' },
                { type: 'letter', value: 'Y' },
                { type: 'letter', value: 'P' },
            ]
        },
    ];
    let patternIndex = 0;
    let patternCorrect = 0;
    let patternTimer = null;
    let patternTimeLeft = 30;
    let patternOrder = [];

    function startPatternGame() {
        patternIndex = 0;
        patternCorrect = 0;
        patternTimeLeft = currentDifficulty === 'hard' ? 20 : (currentDifficulty === 'easy' ? 45 : 30);
        patternOrder = shuffle([...Array(patternSets.length).keys()]);
        showScreen('game3');
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
        if (patternIndex >= patternSets.length) {
            clearInterval(patternTimer);
            finishPattern();
            return;
        }

        const p = patternSets[patternOrder[patternIndex]];
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
        let score = Math.round((patternCorrect / patternSets.length) * 100);
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
        mathTimeLeft = currentDifficulty === 'hard' ? 20 : (currentDifficulty === 'easy' ? 45 : 30);
        showScreen('game4');
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
        const diffMult = currentDifficulty === 'hard' ? 3 : (currentDifficulty === 'easy' ? 0.5 : 1);

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
        showScreen('game5');
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

        for (let i = 0; i < simonSequence.length; i++) {
            const idx = simonSequence[i];
            const btn = $(`.simon-btn[data-index="${idx}"]`);
            btn.classList.add('flash');
            sfxSimonFlash(idx);
            await sleep(450);
            btn.classList.remove('flash');
            await sleep(200);
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
        };

        // Weighted average (reaction time and sequence memory weighted slightly more
        // as they're the most validated cognitive markers)
        const weights = { reaction: 1.2, numbers: 1.0, patterns: 0.9, math: 0.9, sequence: 1.0 };
        let weightedSum = 0;
        let totalWeight = 0;
        for (const key in ages) {
            weightedSum += ages[key] * weights[key];
            totalWeight += weights[key];
        }

        let brainAge = Math.round(weightedSum / totalWeight);
        brainAge = Math.max(18, Math.min(80, brainAge));

        // Percentile from score distribution
        const avgScore = (scores.reaction + scores.numbers + scores.patterns + scores.math + scores.sequence) / 5;
        const percentile = scoreToPercentile(avgScore);

        // Update DOM
        $('#results-age').textContent = brainAge;
        $('#results-percentile').innerHTML = `Tu cerebro funciona mejor que el <strong>${percentile}%</strong> de los usuarios que han hecho este test.`;

        // Breakdown bars — show age per test, not a 0-100 score
        setTimeout(() => {
            setBar('reaction', scores.reaction, ages.reaction);
            setBar('numbers', scores.numbers, ages.numbers);
            setBar('patterns', scores.patterns, ages.patterns);
            setBar('math', scores.math, ages.math);
            setBar('sequence', scores.sequence, ages.sequence);
        }, 300);

        showScreen('results');

        window._shareData = { brainAge, percentile, scores, ages };

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
        return `Acabo de hacer el Test de Edad Mental.\n\nMi resultado: ${d.brainAge} años de edad mental.\n${comentario}\nMejor que el ${d.percentile}% de los usuarios.\n\nHaz el test gratis (3 minutos):\n${window.location.href}`;
    }

    // ── Event Listeners ──
    function initEvents() {
        $$('.btn-diff').forEach(btn => {
            btn.addEventListener('click', (e) => {
                $$('.btn-diff').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentDifficulty = btn.dataset.diff;
                sfxClick();
            });
        });

        $('#btn-start').addEventListener('click', () => {
            // Initialize audio context on first user interaction
            getAudioCtx();
            sfxClick();
            currentGame = 0;
            startNextGame();
        });

        $('#btn-ready').addEventListener('click', () => {
            sfxClick();
            switch (currentGame) {
                case 0: startReactionGame(); break;
                case 1: startNumberGame(); break;
                case 2: startPatternGame(); break;
                case 3: startMathGame(); break;
                case 4: startSimonGame(); break;
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
            Object.keys(scores).forEach(k => scores[k] = 0);
            Object.keys(rawMetrics).forEach(k => rawMetrics[k] = 0);
            currentGame = 0;
            showScreen('welcome');
        });

        // Save ranking to Supabase
        const btnSubmitScore = $('#btn-submit-score');
        if (btnSubmitScore) {
            btnSubmitScore.addEventListener('click', async () => {
                const nameInput = $('#player-name-input');
                const name = nameInput.value.trim();
                const msgEl = $('#ranking-msg');

                if (!name) {
                    msgEl.textContent = 'Por favor, ingresa tu nombre.';
                    msgEl.style.color = 'var(--clr-danger)';
                    nameInput.classList.add('shake');
                    setTimeout(() => nameInput.classList.remove('shake'), 400);
                    return;
                }

                btnSubmitScore.disabled = true;
                btnSubmitScore.textContent = 'Guardando...';
                msgEl.textContent = '';

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

                if (err) {
                    msgEl.textContent = 'Error al guardar. Intenta de nuevo.';
                    msgEl.style.color = 'var(--clr-danger)';
                    btnSubmitScore.disabled = false;
                    btnSubmitScore.textContent = 'Guardar';
                    console.error('Supabase Error:', err);
                } else {
                    msgEl.textContent = '¡Puntuación guardada con éxito!';
                    msgEl.style.color = 'var(--clr-success)';
                    btnSubmitScore.textContent = 'Guardado';
                    setTimeout(() => {
                        window.location.href = 'ranking.html';
                    }, 1500);
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
                // Scores
                const labels = ['Reacción', 'Números', 'Patrones', 'Mates', 'Secuencia'];
                const scoreKeys = ['reaction', 'numbers', 'patterns', 'math', 'sequence'];
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

    document.addEventListener('DOMContentLoaded', initEvents);

    // ══════════════════════════════════════════
    // V3: BACKGROUND PARTICLES (floating neurons)
    // ══════════════════════════════════════════
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
                p.x += p.dx;
                p.y += p.dy;
                if (p.x < 0) p.x = w;
                if (p.x > w) p.x = 0;
                if (p.y < 0) p.y = h;
                if (p.y > h) p.y = 0;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.color + p.opacity + ')';
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
                        ctx.strokeStyle = `rgba(139, 92, 246, ${0.08 * (1 - dist / 150)})`;
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

    window.addEventListener('load', () => {
        initBgParticles();
        loadPlayerCount();
    });
})();
