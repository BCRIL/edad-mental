const fs = require('fs');

function replaceEmojisAndImprove() {
    let indexHtml = fs.readFileSync('index.html', 'utf8');

    // Remove emoji from "Los 5 retos de hoy"
    indexHtml = indexHtml.replace('📋 Los 5 retos de hoy', '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px; margin-bottom:-2px;"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>Los 5 retos de hoy');

    // Remove emoji from "Modo Entrenamiento"
    indexHtml = indexHtml.replace('🎯 Modo Entrenamiento', '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--clr-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px; vertical-align: middle;"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>Modo Entrenamiento');

    fs.writeFileSync('index.html', indexHtml);
    console.log('Fixed emojis in index.html');

    // Fix icons in the game folders (🧠 -> SVG)
    const gameFolders = [
        'juego-de-inteligencia-espacial',
        'juego-de-memoria-de-secuencia',
        'juego-de-reconocimiento-de-patrones',
        'test-de-agilidad-mental',
        'test-de-reflejos-rapidos'
    ];

    const brainSVG = `<svg viewBox="0 0 48 48" width="60" height="60" style="margin-bottom:20px; display:inline-block;"><path d="M24 10C16 10 10 16 10 24c0 4.4 1.9 8.3 5 11" fill="none" stroke="url(#brain-grad)" stroke-width="3" stroke-linecap="round"/><path d="M38 35c3.1-2.7 5-6.6 5-11 0-8-6-14-14-14" fill="none" stroke="url(#brain-grad)" stroke-width="3" stroke-linecap="round"/><path d="M24 10v28" fill="none" stroke="url(#brain-grad)" stroke-width="3" stroke-linecap="round"/><circle cx="24" cy="24" r="5" fill="none" stroke="url(#brain-grad)" stroke-width="3"/><defs><linearGradient id="brain-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#8b5cf6" /><stop offset="100%" stop-color="#06b6d4" /></linearGradient></defs></svg>`;

    for (let folder of gameFolders) {
        const p = folder + '/index.html';
        if (fs.existsSync(p)) {
            let html = fs.readFileSync(p, 'utf8');
            html = html.replace('<div class="icon-top">🧠</div>', brainSVG);
            // Enhance the games UI slightly
            html = html.replace('background: rgba(255, 255, 255, 0.03);', 'background: rgba(255, 255, 255, 0.02); box-shadow: 0 30px 60px -12px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.1); border-color: transparent;');
            fs.writeFileSync(p, html);
            console.log('Improved ' + p);
        }
    }

    // Fix app.js to ensure rendering works correctly over the DOM lifecycle
    let appJs = fs.readFileSync('app.js', 'utf8');
    
    // Check if the render functions are inside DOMContentLoaded or not
    const startRegex = /\/\/ START\s+initRouter\(\);\s+initEvents\(\);\s+renderTrainingMode\(\);\s+renderDailyGamesList\(\);/;
    
    if (appJs.match(startRegex)) {
        appJs = appJs.replace(startRegex, `
    // START
    document.addEventListener('DOMContentLoaded', () => {
        initRouter();
        initEvents();
        renderTrainingMode();
        renderDailyGamesList();
        
        // Also ensure UI is correct
        setTimeout(() => {
            renderTrainingMode();
            renderDailyGamesList();
        }, 100);
    });
`);
        fs.writeFileSync('app.js', appJs);
        console.log('Wrapped app.js init in DOMContentLoaded');
    }
}

replaceEmojisAndImprove();
