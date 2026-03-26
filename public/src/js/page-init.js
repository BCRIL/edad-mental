// page-init.js - Inicializa el contenido específico de cada página
(function() {
    'use strict';

    // Detectar la página actual y cargar el contenido apropiado
    function initPageContent() {
        const path = window.location.pathname;

        if (path.includes('/entrenamiento')) {
            initTrainingPage();
        } else if (path.includes('/perfil')) {
            initProfilePage();
        }
    }

    // ═══════════════════════════════════════════════════════════
    // TRAINING PAGE
    // ═══════════════════════════════════════════════════════════
    function initTrainingPage() {
        // Mostrar el grid de entrenamientos
        setTimeout(() => {
            if (typeof renderTrainingMode === 'function') {
                renderTrainingMode();
            }
            // También cargar las pantallas de juegos para cuando sean necesarias
            loadGameScreens();
        }, 100);
    }

    function loadGameScreens() {
        const gameScreensHTML = `
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
                        <span class="game-badge-small">Entrenamiento — Reacción</span>
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
                        <span class="game-badge-small">Entrenamiento — Números</span>
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
                        <span class="game-badge-small">Entrenamiento — Patrones</span>
                        <span class="game-timer" id="pattern-timer">∞</span>
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
                        <span class="game-badge-small">Entrenamiento — Matemáticas</span>
                        <span class="game-timer" id="math-timer">∞</span>
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
                        <span class="game-badge-small">Entrenamiento — Secuencia</span>
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
                        <span class="game-badge-small">Entrenamiento — Colores</span>
                        <span class="game-timer" id="colors-timer">∞</span>
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
                        <span class="game-badge-small">Entrenamiento — Espacial</span>
                        <span class="game-level" id="spatial-level">Nivel 1</span>
                    </div>
                    <p class="game-prompt" id="spatial-prompt">Memoriza las celdas...</p>
                    <div class="spatial-grid" id="spatial-grid" style="display:grid; gap:12px; margin:24px auto; max-width:280px; width:100%;"></div>
                </div>
            </section>
        `;

        const container = document.getElementById('training-screens-container');
        if (container) {
            container.innerHTML = gameScreensHTML;
        }
    }

    // ═══════════════════════════════════════════════════════════
    // PROFILE PAGE
    // ═══════════════════════════════════════════════════════════
    function initProfilePage() {
        // El perfil ya está cargado en el HTML, solo necesitamos inicializarlo
        setTimeout(() => {
            if (typeof loadAndSyncProfile === 'function') {
                loadAndSyncProfile();
            }
        }, 100);
    }

    // Iniciar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPageContent);
    } else {
        initPageContent();
    }
})();
