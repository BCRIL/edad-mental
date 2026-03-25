const fs = require('fs');

let appJs = fs.readFileSync('app.js', 'utf8');

// 1. Remove the old training mode render at the very bottom
appJs = appJs.replace(/function renderTrainingMode\(\) {[\s\S]*?renderTrainingMode\);/g, '');

// 2. We need to add our fresh logic inside the main IIFE
const logicToFormat = `
    function renderTrainingMode() {
        const grid = document.getElementById('zen-grid-container');
        if (!grid) return;
        grid.innerHTML = '';
        gamesPool.forEach((g, idx) => {
            const card = document.createElement('div');
            card.className = 'zen-card';
            card.innerHTML = (g.iconKey ? gameIcons[g.iconKey] : '') + '<h3>' + g.title + '</h3><p>' + g.label + '</p>';
            card.style.cssText = 'background: rgba(0,0,0,0.2); padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); cursor: pointer; text-align: center; display:flex; flex-direction:column; align-items:center; justify-content:center; gap: 10px; transition: all 0.2s;';
            card.onmouseover = () => { card.style.borderColor = '#8b5cf6'; card.style.transform = 'translateY(-3px)'; card.style.background = 'rgba(255,255,255,0.05)'; };
            card.onmouseout = () => { card.style.borderColor = 'rgba(255,255,255,0.05)'; card.style.transform = 'none'; card.style.background = 'rgba(0,0,0,0.2)'; };
            
            card.onclick = () => {
                isTrainingMode = true;
                currentGame = 0; 
                games[0] = gamesPool[idx];
                showInstructions(currentGame);
            };
            grid.appendChild(card);
        });
    }

    function renderDailyGamesList() {
        const list = document.getElementById('daily-games-list');
        if (!list) return;
        list.innerHTML = '';
        games.forEach((g, idx) => {
            let svg = g.iconKey ? gameIcons[g.iconKey].replace(/width="48"/g, 'width="18"').replace(/height="48"/g, 'height="18"') : '';
            list.innerHTML += '<div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); padding:8px 14px; border-radius:30px; font-size:13px; font-weight:500; display:flex; align-items:center; gap:8px; color:#f1f5f9; box-shadow:0 4px 6px rgba(0,0,0,0.1);">' + svg + g.title + '</div>';
        });
    }
`;

// Insert the code right before the `// START` marker inside the IIFE
if (appJs.includes('// START')) {
    appJs = appJs.replace('// START', logicToFormat + '\n    // START');
}

// Ensure the new functions are called within // START
const startBlock = `
    // START
    initRouter();
    initEvents();
    renderTrainingMode();
    renderDailyGamesList();
`;
appJs = appJs.replace(/\/\/ START\s+initRouter\(\);\s+initEvents\(\);/g, startBlock);

fs.writeFileSync('app.js', appJs);
console.log('App.js updated successfully!');
