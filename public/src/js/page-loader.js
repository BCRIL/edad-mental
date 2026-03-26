// page-loader.js - Inicializar páginas individuales con datos de Supabase
(function() {
    'use strict';

    // Primero, esperar a que Supabase esté disponible
    async function ensureSupabaseReady() {
        let attempts = 0;
        const maxAttempts = 50; // 5 segundos (50 * 100ms)

        while (attempts < maxAttempts) {
            if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
                console.log('✓ Supabase disponible');
                return true;
            }
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.warn('⚠ Supabase no cargó después de 5 segundos');
        return false;
    }

    // Esperar a que el DOM esté listo Y app.js esté cargado
    async function initPageData() {
        const path = window.location.pathname.toLowerCase();

        // Solo ejecutar en páginas individuales (no en index.html)
        if (document.getElementById('view-welcome') !== null) {
            return; // Es SPA, no hacer nada
        }

        // Esperar a que Supabase esté listo usando la función centralizada de db.js
        if (typeof window.waitForSupabase === 'function') {
            console.log('⏳ Esperando Supabase...');
            const isReady = await window.waitForSupabase();
            if (!isReady) {
                console.error('❌ Supabase no se pudo cargar');
                return;
            }
            console.log('✅ Supabase listo para páginas individuales');
        } else {
            console.warn('⚠ Función waitForSupabase no disponible, intentando método alternativo');
            await ensureSupabaseReady();
        }

        console.log('Inicializando página individual:', path);

        if (path.includes('/perfil')) {
            console.log('Cargando perfil...');
            if (typeof loadAndSyncProfile === 'function') {
                loadAndSyncProfile().catch(e => console.error('Error al cargar perfil:', e));
            } else {
                console.error('loadAndSyncProfile no disponible');
            }
        }
        else if (path.includes('/ranking')) {
            console.log('Cargando ranking...');
            // Configurar listeners para filtros
            if (typeof setupRankingFilters === 'function') {
                setupRankingFilters();
            }
            // Cargar datos del ranking
            if (typeof loadRanking === 'function') {
                const filter = (typeof getCurrentRankingFilter === 'function')
                    ? getCurrentRankingFilter()
                    : 'all';
                loadRanking(filter).catch(e => console.error('Error al cargar ranking:', e));
            } else {
                console.error('loadRanking no disponible');
            }
        }
        else if (path.includes('/estadistica')) {
            console.log('Cargando estadísticas...');
            if (typeof loadStats === 'function') {
                loadStats().catch(e => console.error('Error al cargar stats:', e));
            } else {
                console.error('loadStats no disponible');
            }
        }
    }

    // Ejecutar después de que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            // Dar un pequeño delay para asegurar que app.js ya cargó
            setTimeout(initPageData, 100);
        });
    } else {
        // DOM ya está listo
        setTimeout(initPageData, 100);
    }

    // Re-verificar cuando la página se hace visible
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            console.log('Página visible nuevamente');
            const path = window.location.pathname.toLowerCase();
            if (path.includes('/perfil') && typeof loadAndSyncProfile === 'function') {
                loadAndSyncProfile();
            }
        }
    });
})();
