// profile.js — Perfil de usuario con persistencia en Supabase
(function () {
    'use strict';

    // ═══════════════════════════════════════════════════════════
    // CARGA Y SINCRONIZACIÓN DE PERFIL
    // ═══════════════════════════════════════════════════════════

    window.loadAndSyncProfile = async () => {
        const history = getHistory();
        const streak = getCurrentStreak();
        const highestStreak = typeof getHighestStreak === 'function' ? getHighestStreak() : 0;

        // Verificar si el usuario está autenticado y mostrar/ocultar auth gate
        let isLoggedIn = false;
        let user = null;

        if (typeof getCurrentUser === 'function') {
            user = await getCurrentUser();
            isLoggedIn = !!user;
        }

        const authGate = document.getElementById('profile-auth-gate');
        const profileContent = document.getElementById('profile-content');

        if (!isLoggedIn && authGate && profileContent) {
            // Usuario no autenticado - mostrar auth gate
            authGate.style.display = 'block';
            profileContent.style.display = 'none';
            return;
        } else if (isLoggedIn && authGate && profileContent) {
            // Usuario autenticado - mostrar contenido
            authGate.style.display = 'none';
            profileContent.style.display = 'block';
        }

        // Renderizar estadísticas locales primero
        const bestAge = history.length > 0 ? Math.min(...history.map(h => h.brainAge)) : null;
        const avgAge = history.length > 0 ? Math.round(history.reduce((sum, h) => sum + h.brainAge, 0) / history.length) : null;
        $('#profile-streak').textContent = streak;
        $('#profile-total').textContent = history.length;
        $('#profile-best').textContent = bestAge ? bestAge : '--';

        // Si el usuario está autenticado, sincronizar con Supabase
        if (user && typeof updateUserProfile === 'function') {
            try {
                // Actualizar estadísticas en el servidor si hay cambios
                const result = await updateUserProfile(user.id, {
                    displayName: APP_STATE.currentDisplayName,
                    stats: {
                        total_tests: history.length,
                        best_brain_age: bestAge,
                        average_brain_age: avgAge,
                        current_streak: streak,
                        highest_streak: highestStreak,
                        last_played_at: history.length > 0 ? history[0].date : null
                    }
                });

                if (!result.error) {
                    console.log('✅ Perfil sincronizado con Supabase');
                }
            } catch (e) {
                console.error('Error sincronizando perfil:', e);
            }
        }

        window.renderProfileContent(history, streak, bestAge, avgAge, highestStreak);
    };

    window.renderProfileContent = (history, streak, bestAge, avgAge, highestStreak) => {
        // ─────────────────────────────────────────────────────────
        // LIGAS (Gamificación)
        // ─────────────────────────────────────────────────────────
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
        const leagueIcon = $('#profile-league-icon');
        const leagueName = $('#profile-league-name');
        if (leagueIcon) leagueIcon.textContent = league.icon;
        if (leagueName) {
            leagueName.textContent = league.name;
            leagueName.style.color = league.color;
        }

        // ─────────────────────────────────────────────────────────
        // ACTUALIZAR ESTADÍSTICAS
        // ─────────────────────────────────────────────────────────
        const avgEl = $('#profile-avg');
        if (avgEl) avgEl.textContent = avgAge ? avgAge : '--';

        const highestStreakEl = $('#profile-highest-streak');
        if (highestStreakEl) highestStreakEl.textContent = highestStreak || 0;

        // ─────────────────────────────────────────────────────────
        // INSIGNIAS
        // ─────────────────────────────────────────────────────────
        const badgeContainer = $('#profile-badges');
        if (badgeContainer) {
            const BADGES = [
                { icon: '🎮', label: 'Primer Test', achieved: history.length >= 1 },
                { icon: '🌟', label: '5 Partidas', achieved: history.length >= 5 },
                { icon: '💎', label: 'Veterano', achieved: history.length >= 10 },
                { icon: '🔥', label: '3 días', achieved: streak >= 3 },
                { icon: '⚡', label: '7 días', achieved: streak >= 7 },
                { icon: '🧠', label: '≤22 años', achieved: bestAge && bestAge <= 22 },
                { icon: '🏆', label: '≤18 años', achieved: bestAge && bestAge <= 18 }
            ];
            badgeContainer.innerHTML = BADGES.map(b => `
                <div class="profile-badge-item ${b.achieved ? 'is-unlocked' : 'is-locked'}">
                    <span class="profile-badge-item__icon" style="filter:${b.achieved ? 'none' : 'grayscale(1)'};">${b.icon}</span>
                    <span class="profile-badge-item__label">${b.label}</span>
                </div>`).join('');
        }

        // ─────────────────────────────────────────────────────────
        // TABLA DE HISTORIAL
        // ─────────────────────────────────────────────────────────
        const historyDiv = $('#profile-history');
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

        // ─────────────────────────────────────────────────────────
        // GRÁFICO DE EVOLUCIÓN
        // ─────────────────────────────────────────────────────────
        const ctxEvo = document.getElementById('evolutionChart');
        if (ctxEvo && typeof Chart !== 'undefined' && history.length > 0) {
            const sorted = [...history].reverse();
            const chartLabels = sorted.map(h => h.date.slice(5));
            const chartData = sorted.map(h => h.brainAge);
            if (window._evolutionChartInstance) window._evolutionChartInstance.destroy();
            window._evolutionChartInstance = new Chart(ctxEvo, {
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

        // ─────────────────────────────────────────────────────────
        // GRÁFICO RADAR DE FORTALEZAS
        // ─────────────────────────────────────────────────────────
        const ctxRadarProfile = document.getElementById('profileRadarChart');
        if (ctxRadarProfile && typeof Chart !== 'undefined' && history.length > 0) {
            let sumScores = { reaction: 0, numbers: 0, patterns: 0, math: 0, sequence: 0, colors: 0, spatial: 0 };
            let counts = { reaction: 0, numbers: 0, patterns: 0, math: 0, sequence: 0, colors: 0, spatial: 0 };

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
                counts.sequence > 0 ? Math.round(sumScores.sequence / counts.sequence) : 0,
                counts.colors > 0 ? Math.round(sumScores.colors / counts.colors) : 0,
                counts.spatial > 0 ? Math.round(sumScores.spatial / counts.spatial) : 0
            ];

            const hasData = radarDataProfile.some(v => v > 0);
            const finalData = hasData ? radarDataProfile : [75, 60, 80, 55, 70, 65, 72];

            if (window._profileRadarChartInstance) window._profileRadarChartInstance.destroy();
            window._profileRadarChartInstance = new Chart(ctxRadarProfile.getContext('2d'), {
                type: 'radar',
                data: {
                    labels: ['Reacción', 'Memoria Nums.', 'Patrones', 'Mates', 'Secuencia', 'Colores', 'Espacial'],
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
                            pointLabels: { color: '#f1f5f9', font: { size: 10 } },
                            ticks: { display: false, max: 100, min: 0 }
                        }
                    },
                    plugins: { legend: { display: false } }
                }
            });
        }
    };

    // ═══════════════════════════════════════════════════════════
    // GUARDAR RESULTADO AL HISTORIAL
    // ═══════════════════════════════════════════════════════════

    window.saveResultToHistory = (brainAge, difficulty, games, scores) => {
        const history = getHistory();
        history.unshift({
            date: new Date().toISOString().split('T')[0],
            brainAge,
            difficulty,
            games,
            scores
        });
        saveHistory(history);
        updateStreak();
    };

    window.showStreakNotification = () => {
        const streak = getCurrentStreak();
        if (streak > 1 && streak % 3 === 0) {
            // Mostrar notificación cada 3 días
            const msg = `🔥 ¡Racha de ${streak} días! Sigue así.`;
            if (typeof alert !== 'undefined') console.log(msg);
        }
    };

    console.log('✅ profile.js loaded');
})();
