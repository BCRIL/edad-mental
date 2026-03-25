const fs = require('fs');
const glob = require('fs').promises; // we don't need this actually
const { join } = require('path');

async function updateFooters() {
    const pages = [
        'index.html',
        'aviso-legal.html',
        'contacto.html',
        'politica-cookies.html',
        'politica-privacidad.html',
        'juego-de-inteligencia-espacial/index.html',
        'juego-de-memoria-de-secuencia/index.html',
        'juego-de-reconocimiento-de-patrones/index.html',
        'test-de-agilidad-mental/index.html',
        'test-de-reflejos-rapidos/index.html'
    ];

    for (let page of pages) {
        if (!fs.existsSync(page)) continue;
        let content = fs.readFileSync(page, 'utf8');
        
        if (content.includes('Términos de Servicio') || content.includes('terminos-servicio')) {
            console.log(`Already in ${page}`);
            continue;
        }

        // Add Terminos de Servicio beside Cookies
        content = content.replace(
            '<a href="/politica-cookies.html">Cookies</a>',
            '<a href="/politica-cookies.html">Cookies</a>\n                <a href="/terminos-servicio.html">Términos de Servicio</a>'
        );
        content = content.replace(
            '<a href="../politica-cookies.html">Cookies</a>',
            '<a href="../politica-cookies.html">Cookies</a>\n                <a href="../terminos-servicio.html">Términos de Servicio</a>'
        );

        fs.writeFileSync(page, content);
        console.log(`Updated footer in ${page}`);
    }
}

updateFooters();
