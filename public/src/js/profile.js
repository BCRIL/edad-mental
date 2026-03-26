// profile.js â€” Perfil de usuario con persistencia en Supabase
(function () {
    'use strict';

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // CARGA Y SINCRONIZACIÃ“N DE PERFIL
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

    window.loadAndSyncProfile = async () => {
        let history = getHistory();
        let streak = getCurrentStreak();
        let highestStreak = typeof getHighestStreak === 'function' ? getHighestStreak() : 0;

        // Verificar si el usuario esta autenticado y mostrar/ocultar auth gate
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

        // Si el usuario esta autenticado, sincronizamos DESDE Supabase para unificar dispositivos
        if (user) {
            try {
                // Obtener perfil y stats remotos
                const profileData = await window.getUserProfile(user.id);
                const { data: remoteRankings, error } = await window.getUserRankings(user.id);

                if (remoteRankings && remoteRankings.length > 0 && Array.isArray(remoteRankings)) {
                    history = remoteRankings.map(row => ({
                        date: row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
                        brainAge: row.brain_age,
                        difficulty: row.difficulty || 'normal',
                        scores: {
                            reaction: row.reaction_score || 0,
                            numbers: row.numbers_score || 0,
                            patterns: row.patterns_score || 0,
                            math: row.math_score || 0,
                            sequence: row.sequence_score || 0
                        }
                    }));
                    // Actualizar localStorage para mantener sincronizado este dispositivo
                    localStorage.setItem('brainAge_history', JSON.stringify(history));
                }

                if (profileData) {
                    if (profileData.current_streak !== undefined && profileData.current_streak !== null) {
                        streak = profileData.current_streak;
                    }
                    if (profileData.highest_streak !== undefined && profileData.highest_streak !== null) {
                        highestStreak = Math.max(highestStreak, profileData.highest_streak);
                    }
                    
                    // Sincronizar racha remota en local
                    const today = new Date().toISOString().split('T')[0];
                    let streakData = { streak: streak, lastDate: profileData.last_played_at || today, highest_streak: highestStreak };
                    localStorage.setItem('brainAge_streak', JSON.stringify(streakData));
                }
            } catch (e) {
                console.error('Error sincronizando desde Supabase:', e);
            }
        }

        // Renderizar estadisticas locales / remotas unificadas
        const bestAge = history.length > 0 ? Math.min(...history.map(h => h.brainAge)) : null;
        const avgAge = history.length > 0 ? Math.round(history.reduce((sum, h) => sum + h.brainAge, 0) / history.length) : null;

        $('#profile-streak').textContent = streak;
        $('#profile-total').textContent = history.length;
        $('#profile-best').textContent = bestAge ? bestAge : '--';

        // Si el usuario esta autenticado, sincronizar HACIA Supabase
        if (user && typeof updateUserProfile === 'function') {
            try {
                // Actualizar estadisticas en el servidor
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
        // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        // LIGAS (GamificaciÃ³n)
        // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        let league = { name: 'Bronce', icon: 'ðŸ¥‰', color: '#b45309' };
        if (history.length > 0) {
            const sortedH = [...history].reverse();
            let impr = 0;
            for (let i = 1; i < sortedH.length; i++) {
                if (sortedH[i].brainAge <= sortedH[i - 1].brainAge) impr++;
                else impr = 0;
            }
            if (impr >= 9) league = { name: 'Diamante', icon: 'ðŸ’Ž', color: '#06b6d4' };
            else if (impr >= 6) league = { name: 'Oro', icon: 'ðŸ¥‡', color: '#f59e0b' };
            else if (impr >= 3) league = { name: 'Plata', icon: 'ðŸ¥ˆ', color: '#94a3b8' };
        }
        const leagueIcon = $('#profile-league-icon');
        const leagueName = $('#profile-league-name');
        if (leagueIcon) leagueIcon.textContent = league.icon;
        if (leagueName) {
            leagueName.textContent = league.name;
            leagueName.style.color = league.color;
        }

        // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        // ACTUALIZAR ESTADÃSTICAS
        // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        const avgEl = $('#profile-avg');
        if (avgEl) avgEl.textContent = avgAge ? avgAge : '--';

        const highestStreakEl = $('#profile-highest-streak');
        if (highestStreakEl) highestStreakEl.textContent = highestStreak || 0;

        // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        // INSIGNIAS
        // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        const badgeContainer = $('#profile-badges');
        if (badgeContainer) {
            const BADGES = [
                { icon: 'ðŸŽ®', label: 'Primer Test', achieved: history.length >= 1 },
                { icon: 'ðŸŒŸ', label: '5 Partidas', achieved: history.length >= 5 },
                { icon: 'ðŸ’Ž', label: 'Veterano', achieved: history.length >= 10 },
                { icon: 'ðŸ”¥', label: '3 dÃ­as', achieved: streak >= 3 },
                { icon: 'âš¡', label: '7 dÃ­as', achieved: streak >= 7 },
                { icon: 'ðŸ§ ', label: 'â‰¤22 aÃ±os', achieved: bestAge && bestAge <= 22 },
                { icon: 'ðŸ†', label: 'â‰¤18 aÃ±os', achieved: bestAge && bestAge <= 18 }
            ];
            badgeContainer.innerHTML = BADGES.map(b => `
                <div class="profile-badge-item ${b.achieved ? 'is-unlocked' : 'is-locked'}">
                    <span class="profile-badge-item__icon" style="filter:${b.achieved ? 'none' : 'grayscale(1)'};">${b.icon}</span>
                    <span class="profile-badge-item__label">${b.label}</span>
                </div>`).join('');
        }

        // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        // TABLA DE HISTORIAL
        // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        const historyDiv = $('#profile-history');
        if (historyDiv) {
            if (history.length === 0) {
                historyDiv.innerHTML = '<p class="profile-history__empty">AÃºn no tienes partidas guardadas.</p>';
            } else {
                const rows = history.map(h => {
                    const diff = h.difficulty === 'easy' ? 'ðŸŸ¢ FÃ¡cil' : h.difficulty === 'hard' ? 'ðŸ”´ DifÃ­cil' : 'ðŸ”µ Normal';
                    const col = h.brainAge <= 28 ? '#10b981' : h.brainAge <= 45 ? '#f59e0b' : '#ef4444';
                    return `<tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                        <td style="padding:11px 10px;font-size:13px;">${h.date}</td>
                        <td style="padding:11px 10px;font-weight:800;font-size:18px;color:${col};font-family:var(--font-display);">${h.brainAge}<span style="font-size:11px;font-weight:400;color:var(--clr-text-muted);"> aÃ±os</span></td>
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

        // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        // GRÃFICO DE EVOLUCIÃ“N
        // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

        // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        // GRÃFICO RADAR DE FORTALEZAS
        // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
                    labels: ['ReacciÃ³n', 'Memoria Nums.', 'Patrones', 'Mates', 'Secuencia', 'Colores', 'Espacial'],
                    datasets: [{
                        label: 'Tu PuntuaciÃ³n',
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

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // GUARDAR RESULTADO AL HISTORIAL
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

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
            // Mostrar notificaciÃ³n cada 3 dÃ­as
            const msg = `ðŸ”¥ Â¡Racha de ${streak} dÃ­as! Sigue asÃ­.`;
            if (typeof alert !== 'undefined') console.log(msg);
        }
    };

    console.log('âœ… profile.js loaded');
})();

