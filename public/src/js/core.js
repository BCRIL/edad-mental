// core.js — Estado global y funciones de utilidad
(function () {
    'use strict';

    // ═══════════════════════════════════════════════════════════
    // ESTADO GLOBAL
    // ═══════════════════════════════════════════════════════════
    window.APP_STATE = {
        scores: { reaction: 0, numbers: 0, patterns: 0, math: 0, sequence: 0, colors: 0, spatial: 0 },
        rawMetrics: { reactionMs: 0, digitSpan: 0, patternScore: 0, mathRate: 0, sequenceSpan: 0, colorsScore: 0, spatialSpan: 0 },
        currentGame: 0,
        currentDifficulty: 'normal',
        isTrainingMode: false,
        trainingScoreHistory: [],
        currentUser: null,
        currentDisplayName: null,
        shareData: null,

        // Dificultades
        DIFF: {
            easy: { reactionFakeChance: 0, reactionMinDelay: 2000, reactionMaxDelay: 4000, reactionRounds: 2, numberStart: 3, patternTime: 45, mathTime: 45, simonFlashMs: 550, simonPauseMs: 250, colorsTime: 40, spatialStartLevel: 1 },
            normal: { reactionFakeChance: 0, reactionMinDelay: 1000, reactionMaxDelay: 3000, reactionRounds: 3, numberStart: 4, patternTime: 30, mathTime: 30, simonFlashMs: 420, simonPauseMs: 180, colorsTime: 30, spatialStartLevel: 1 },
            hard: { reactionFakeChance: 0.35, reactionMinDelay: 500, reactionMaxDelay: 1800, reactionRounds: 5, numberStart: 6, patternTime: 18, mathTime: 18, simonFlashMs: 260, simonPauseMs: 100, colorsTime: 20, spatialStartLevel: 2 }
        },

        getDiff() { return this.DIFF[this.currentDifficulty]; }
    };

    // ═══════════════════════════════════════════════════════════
    // SELECTORES Y HELPERS
    // ═══════════════════════════════════════════════════════════
    window.$ = (sel) => document.querySelector(sel);
    window.$$ = (sel) => document.querySelectorAll(sel);

    window.randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    window.shuffle = (arr) => {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = window.randInt(0, i);
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    };

    window.sleep = (ms) => new Promise(r => setTimeout(r, ms));

    window.escapeHTML = (str) => {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return String(str).replace(/[&<>"']/g, m => map[m]);
    };

    // ═══════════════════════════════════════════════════════════
    // STORAGE HELPERS
    // ═══════════════════════════════════════════════════════════
    window.getHistory = () => {
        try {
            return JSON.parse(localStorage.getItem('brainAge_history') || '[]');
        } catch { return []; }
    };

    window.saveHistory = (history) => {
        localStorage.setItem('brainAge_history', JSON.stringify(history));
    };

    window.getCurrentStreak = () => {
        try {
            const data = JSON.parse(localStorage.getItem('brainAge_streak') || '{"streak":0,"lastDate":null}');
            return data.streak || 0;
        } catch { return 0; }
    };

    window.updateStreak = () => {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        let data = JSON.parse(localStorage.getItem('brainAge_streak') || '{"streak":0,"lastDate":null,"highest_streak":0}');

        if (data.lastDate === today) {
            // Ya jugó hoy, no cambiar
        } else if (data.lastDate === yesterday) {
            data.streak++;
        } else {
            data.streak = 1;
        }

        // Actualizar highest_streak si el actual es mayor
        if (data.streak > (data.highest_streak || 0)) {
            data.highest_streak = data.streak;
        }

        data.lastDate = today;
        localStorage.setItem('brainAge_streak', JSON.stringify(data));
    };

    window.getHighestStreak = () => {
        try {
            const data = JSON.parse(localStorage.getItem('brainAge_streak') || '{"streak":0,"lastDate":null,"highest_streak":0}');
            return data.highest_streak || 0;
        } catch { return 0; }
    };

    // ═══════════════════════════════════════════════════════════
    // AUDIO ENGINE
    // ═══════════════════════════════════════════════════════════
    let audioCtx = null;

    window.getAudioCtx = () => {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        return audioCtx;
    };

    window.playTone = (freq, duration, type = 'sine', volume = 0.15) => {
        try {
            const ctx = window.getAudioCtx();
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
        } catch (e) { /* Audio not supported */ }
    };

    window.sfxCorrect = () => {
        if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
        window.playTone(523, 0.12, 'sine', 0.12);
        setTimeout(() => window.playTone(659, 0.12, 'sine', 0.12), 80);
        setTimeout(() => window.playTone(784, 0.18, 'sine', 0.10), 160);
    };

    window.sfxWrong = () => {
        if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
        window.playTone(330, 0.15, 'square', 0.08);
        setTimeout(() => window.playTone(260, 0.25, 'square', 0.06), 120);
    };

    window.sfxClick = () => window.playTone(800, 0.05, 'sine', 0.08);
    window.sfxCountdown = () => window.playTone(440, 0.1, 'sine', 0.08);
    window.sfxGo = () => {
        window.playTone(880, 0.15, 'sine', 0.12);
        setTimeout(() => window.playTone(1100, 0.2, 'sine', 0.10), 100);
    };

    window.sfxSimonFlash = (index) => {
        const notes = [262, 294, 330, 392, 440, 523, 587, 659, 784];
        window.playTone(notes[index] || 440, 0.25, 'sine', 0.10);
    };

    window.sfxTooEarly = () => window.playTone(200, 0.3, 'sawtooth', 0.06);
    window.sfxTimerWarn = () => window.playTone(600, 0.08, 'square', 0.05);
    window.sfxResults = () => {
        const notes = [523, 659, 784, 1047];
        notes.forEach((n, i) => {
            setTimeout(() => window.playTone(n, 0.2, 'sine', 0.10), i * 150);
        });
    };

    // ═══════════════════════════════════════════════════════════
    // PARTICLES
    // ═══════════════════════════════════════════════════════════
    window.spawnParticles = (element) => {
        if (!element) return;
        const rect = element.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        for (let i = 0; i < 12; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.left = cx + 'px';
            p.style.top = cy + 'px';
            p.style.width = window.randInt(6, 12) + 'px';
            p.style.height = p.style.width;
            p.style.position = 'fixed';
            p.style.pointerEvents = 'none';
            p.style.zIndex = '1000';
            p.style.backgroundColor = ['#22d3ee', '#a78bfa', '#f472b6', '#34d399', '#f59e0b'][window.randInt(0, 4)];
            p.style.borderRadius = '50%';
            p.style.transition = 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
            document.body.appendChild(p);

            const angle = Math.random() * Math.PI * 2;
            const dist = window.randInt(40, 120);
            const tx = Math.cos(angle) * dist;
            const ty = Math.sin(angle) * dist - 40;

            void p.offsetWidth;
            p.style.transform = `translate(${tx}px, ${ty}px) scale(0)`;
            p.style.opacity = '0';
            setTimeout(() => p.remove(), 600);
        }
    };

    console.log('✅ core.js loaded');
})();
