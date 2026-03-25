const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const zenMarkup = `
<div class="zen-mode-container" style="margin-bottom: 40px; margin-top: 40px; text-align:left; padding: 30px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px;">
  <h2 style="font-size: 24px; color: #8b5cf6; margin-bottom: 15px;">🎯 Modo Entrenamiento (Práctica Libre)</h2>
  <p style="color: #94a3b8; font-size:15px; margin-bottom:20px; line-height: 1.5;">Selecciona cualquier prueba para jugarla de manera individual sin límite. Perfecciona tus tiempos de reacción, mejora tu memoria a corto plazo y entrena tu cerebro sin la presión del test general de 5 pruebas.</p>
  <div class="zen-grid" id="zen-grid-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px;">
    <!-- Generated via app.js -->
  </div>
</div>
`;

const splitPt = '<!-- SEO & Content Section for AdSense Approval -->';
if (html.includes(splitPt)) {
   html = html.replace(splitPt, zenMarkup + '\n' + splitPt);
   fs.writeFileSync('index.html', html);
   console.log('Added UI');
} else {
   html = html.replace('</main>\n        </div> <!-- end view-home -->', zenMarkup + '\n        </main>\n        </div> <!-- end view-home -->');
   fs.writeFileSync('index.html', html);
   console.log('Added UI to end of main');
}

let appJs = fs.readFileSync('app.js', 'utf8');
// add training mode handling
if(!appJs.includes('let isTrainingMode = false')) {
    console.log('Injecting training mode login to app.js');
    appJs = appJs.replace('let currentDifficulty = \'normal\';', `let currentDifficulty = 'normal';\n    let isTrainingMode = false;\n    let trainingScoreHistory = [];`);
    
    // Add logic to populate training grid
    const populateFunc = `
    function renderTrainingMode() {
        const grid = document.getElementById('zen-grid-container');
        if (!grid) return;
        grid.innerHTML = '';
        gamesPool.forEach((g, idx) => {
            const card = document.createElement('div');
            card.className = 'zen-card';
            card.innerHTML = g.iconKey ? gameIcons[g.iconKey] + '<h3>' + g.title + '</h3><p>' + g.label + '</p>' : '<h3>' + g.title + '</h3>';
            card.style.cssText = 'background: rgba(0,0,0,0.2); padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); cursor: pointer; text-align: center; display:flex; flex-direction:column; align-items:center; justify-content:center; gap: 10px; transition: all 0.2s;';
            card.onmouseover = () => { card.style.borderColor = '#8b5cf6'; card.style.transform = 'translateY(-3px)'; card.style.background = 'rgba(255,255,255,0.05)'; };
            card.onmouseout = () => { card.style.borderColor = 'rgba(255,255,255,0.05)'; card.style.transform = 'none'; card.style.background = 'rgba(0,0,0,0.2)'; };
            
            card.onclick = () => {
                isTrainingMode = true;
                currentGame = idx; // The index in gamesPool Instead of daily games!
                genesysSetupTraining(idx);
            };
            grid.appendChild(card);
        });
    }

    function genesysSetupTraining(poolIdx) {
        // Find the game in games array, or we bypass "games" completely
        // app.js heavily uses games[currentGame]
        // Let's modify the daily games array temporarily
        games[0] = gamesPool[poolIdx];
        currentGame = 0; 
        showInstructions(currentGame);
    }

    document.addEventListener('DOMContentLoaded', renderTrainingMode);
    `;

    appJs += '\n' + populateFunc;

    // Inside startNextGame
    appJs = appJs.replace(
        `if (currentGame >= 5) {
              showResults();
              return;
          }`,
        `if (isTrainingMode) {
              // Endless mode, show a small alert and go back to home
              alert('¡Bien hecho! Tu puntuación final ha sido calculada.\\nPuedes seguir jugando para mejorar.');
              showScreen('home');
              isTrainingMode = false;
              renderTrainingMode();
              return;
          }
          if (currentGame >= 5) {
              showResults();
              return;
          }`
    );

    // btn-start reset
    appJs = appJs.replace(
        `$('#btn-start').addEventListener('click', () => {`,
        `$('#btn-start').addEventListener('click', () => {
              isTrainingMode = false;`
    );

    fs.writeFileSync('app.js', appJs);
}

