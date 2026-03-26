// page-init.js - Inicializa el contenido específico de cada página
(function() {
    'use strict';

    // Detectar la página actual y cargar el contenido apropiado
    function initPageContent() {
        const path = window.location.pathname;

        if (path.includes('/entrenamiento')) {
            loadTrainingPageContent();
        } else if (path.includes('/perfil')) {
            loadProfilePageContent();
        }
    }

    // ═══════════════════════════════════════════════════════════
    // TRAINING PAGE
    // ═══════════════════════════════════════════════════════════
    function loadTrainingPageContent() {
        // Las pantallas de entrenamiento están en el index.html
        // Cargamos solo lo necesario para entrenamientos

        // Esta es una simplificación - idealmente traerías el HTML de index.html
        const trainingScreensHTML = `
            <!-- SCREEN: Game Instructions -->
            <section class="screen" id="screen-instructions" style="display:none;">
                <div class="card instruction-card">
                    <div class="progress-bar-container">
                        <div class="progress-bar" id="progress-bar"></div>
                    </div>
                    <span class="game-badge" id="game-badge">Prueba 1 de 5</span>
                    <div class="instruction-icon" id="instruction-icon"></div>
                    <h2 class="instruction-title" id="instruction-title">Game Title</h2>
                    <p class="instruction-text" id="instruction-text">Game Description</p>
                    <button class="btn btn-primary" id="btn-ready">¡Estoy listo!</button>
                </div>
            </section>

            <!-- SCREEN: Game Reaction -->
            <section class="screen" id="screen-game-reaction" style="display:none;">
                <div class="card game-card game-reaction">
                    <div class="game-header">
                        <span class="game-badge-small">Prueba 1/5 — Reacción</span>
                    </div>
                    <div class="reaction-zone" id="reaction-zone">
                        <div class="reaction-content" id="reaction-content">
                            <p class="reaction-text" id="reaction-text">Espera al color verde...</p>
                        </div>
                    </div>
                    <p class="game-hint" id="reaction-hint">Pulsa la zona coloreada cuando cambie a verde</p>
                </div>
            </section>

            <!-- SCREEN: Game Numbers -->
            <section class="screen" id="screen-game-numbers" style="display:none;">
                <div class="card game-card">
                    <div class="game-header">
                        <span class="game-badge-small">Prueba 2/5 — Números</span>
                       <span class="game-level" id="number-level">Nivel 1</span>
                    </div>
                    <div class="number-display-area">
                        <div class="number-display" id="number-display">384</div>
                        <div class="number-timer-bar" id="number-timer-bar"></div>
                    </div>
                    <div class="number-input-area" id="number-input-area" style="display:none;">
                        <p class="game-prompt">¿Qué número era?</p>
                        <input type="number" class="number-input" id="number-input" placeholder="Escribe el número..." autocomplete="off">
                        <button class="btn btn-primary" id="btn-number-submit">Comprobar</button>
                    </div>
                    <div class="number-feedback" id="number-feedback" style="display:none;"></div>
                </div>
            </section>

            <!-- SCREEN: Game Patterns -->
            <section class="screen" id="screen-game-patterns" style="display:none;">
                <div class="card game-card">
                    <div class="game-header">
                        <span class="game-badge-small">Prueba 3/5 — Patrones</span>
                        <span class="game-timer" id="pattern-timer">30s</span>
                    </div>
                    <p class="game-prompt" id="pattern-prompt">¿Qué figura completa el patrón?</p>
                    <div class="pattern-sequence" id="pattern-sequence"></div>
                    <div class="pattern-options" id="pattern-options"></div>
                    <div class="pattern-score" id="pattern-score">Aciertos: 0</div>
                </div>
            </section>

            <!-- SCREEN: Game Math -->
            <section class="screen" id="screen-game-math" style="display:none;">
                <div class="card game-card">
                    <div class="game-header">
                        <span class="game-badge-small">Prueba 4/5 — Matemáticas</span>
                        <span class="game-timer" id="math-timer">30s</span>
                    </div>
                    <div class="math-problem" id="math-problem">12 + 7 = ?</div>
                    <div class="math-options" id="math-options"></div>
                    <div class="math-score" id="math-score">Aciertos: 0</div>
                </div>
            </section>

            <!-- SCREEN: Game Sequence -->
            <section class="screen" id="screen-game-sequence" style="display:none;">
                <div class="card game-card">
                    <div class="game-header">
                        <span class="game-badge-small">Prueba 5/5 — Secuencia</span>
                        <span class="game-level" id="simon-level">Nivel 1</span>
                    </div>
                    <p class="game-prompt" id="simon-prompt">Observa la secuencia...</p>
                    <div class="simon-grid" id="simon-grid">
                        <button class="simon-btn" data-index="0"></button>
                        <button class="simon-btn" data-index="1"></button>
                        <button class="simon-btn" data-index="2"></button>
                        <button class="simon-btn" data-index="3"></button>
                        <button class="simon-btn" data-index="4"></button>
                        <button class="simon-btn" data-index="5"></button>
                        <button class="simon-btn" data-index="6"></button>
                        <button class="simon-btn" data-index="7"></button>
                        <button class="simon-btn" data-index="8"></button>
                    </div>
                </div>
            </section>

            <!-- SCREEN: Game Colors -->
            <section class="screen" id="screen-game-colors" style="display:none;">
                <div class="card game-card">
                    <div class="game-header">
                        <span class="game-badge-small">Percepción de Colores</span>
                        <span class="game-timer" id="colors-timer">30s</span>
                    </div>
                    <p class="game-prompt" id="colors-prompt">¿De qué COLOR está pintada la palabra?</p>
                    <div class="colors-display" id="colors-display"></div>
                    <div class="colors-options" id="colors-options"></div>
                    <div class="colors-score" id="colors-score" role="status" aria-live="polite"></div>
                </div>
            </section>

            <!-- SCREEN: Game Spatial -->
            <section class="screen" id="screen-game-spatial" style="display:none;">
                <div class="card game-card">
                    <div class="game-header">
                        <span class="game-badge-small">Memoria Espacial</span>
                        <span class="game-level" id="spatial-level">Nivel 1</span>
                    </div>
                    <p class="game-prompt" id="spatial-prompt">Memoriza las celdas...</p>
                    <div class="spatial-grid" id="spatial-grid" style="display:grid; gap:12px; margin:24px auto; max-width:280px; width:100%;"></div>
                </div>
            </section>

            <!-- SCREEN: Results -->
            <section class="screen" id="screen-results" style="display:none;">
                <div class="card results-card">
                    <div class="results-header">
                        <div class="results-icon"></div>
                        <h2 class="results-label">Tu Edad Mental es</h2>
                        <div class="results-age" id="results-age">24</div>
                        <p class="results-age-label">años</p>
                    </div>
                    <div class="results-percentile" id="results-percentile">
                        ¡Tu cerebro funciona mejor que el <strong id="percentile-num">78</strong>% de los usuarios!
                    </div>
                    <div class="results-breakdown">
                        <h3 class="breakdown-title">Desglose por Prueba</h3>
                        <div class="breakdown-item">
                            <span class="breakdown-label">Reacción</span>
                            <div class="breakdown-bar-bg"><div class="breakdown-bar" id="bar-reaction"></div></div>
                            <span class="breakdown-value" id="val-reaction">--</span>
                        </div>
                        <div class="breakdown-item">
                            <span class="breakdown-label">Números</span>
                            <div class="breakdown-bar-bg"><div class="breakdown-bar" id="bar-numbers"></div></div>
                            <span class="breakdown-value" id="val-numbers">--</span>
                        </div>
                        <div class="breakdown-item">
                            <span class="breakdown-label">Patrones</span>
                            <div class="breakdown-bar-bg"><div class="breakdown-bar" id="bar-patterns"></div></div>
                            <span class="breakdown-value" id="val-patterns">--</span>
                        </div>
                        <div class="breakdown-item">
                            <span class="breakdown-label">Matemáticas</span>
                            <div class="breakdown-bar-bg"><div class="breakdown-bar" id="bar-math"></div></div>
                            <span class="breakdown-value" id="val-math">--</span>
                        </div>
                        <div class="breakdown-item">
                            <span class="breakdown-label">Secuencia</span>
                            <div class="breakdown-bar-bg"><div class="breakdown-bar" id="bar-sequence"></div></div>
                            <span class="breakdown-value" id="val-sequence">--</span>
                        </div>
                    </div>
                </div>
            </section>
        `;

        const container = document.getElementById('training-screens-container');
        if (container) {
            container.innerHTML = trainingScreensHTML;
            // Inicializar el modo entrenamiento después de que se inyecte el HTML
            setTimeout(() => {
                if (typeof initUI === 'function') {
                    // Los scripts de app.js manejarán la lógica
                }
            }, 100);
        }
    }

    // ═══════════════════════════════════════════════════════════
    // PROFILE PAGE
    // ═══════════════════════════════════════════════════════════
    function loadProfilePageContent() {
        // El perfil será cargado por profile.js
        // Solo aseguramos que el contenedor exista
        const container = document.getElementById('profile-content-container');
        if (container) {
            // Se rellenará vía loadAndSyncProfile()
        }
    }

    // Iniciar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPageContent);
    } else {
        initPageContent();
    }
})();
