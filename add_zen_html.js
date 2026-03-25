const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const zenMarkup = `
<div class="zen-mode-container" style="margin-bottom: 40px; margin-top: 40px;">
  <h2>🎯 Modo Entrenamiento (Juega Libre)</h2>
  <p style="color: #94a3b8; margin-bottom:20px; line-height: 1.5;">Selecciona cualquier prueba para practicarla en modo infinito o para mejorar tus habilidades sin que afecte a tu puntuación de Edad Mental diaria.</p>
  <div class="zen-grid" id="zen-grid-container">
    <!-- Generated via app.js -->
  </div>
</div>
`;

const splitPoint = '<!-- SEO & Content Section for AdSense Approval -->';
if(html.includes(splitPoint) && !html.includes('Modo Entrenamiento')){
    html = html.replace(splitPoint, zenMarkup + '\n' + splitPoint);
    fs.writeFileSync('index.html', html);
    console.log('Zen markup added');
} else {
    console.log('Split point not found or already added');
}

