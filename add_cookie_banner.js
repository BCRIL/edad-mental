const fs = require('fs');

const bannerHtml = `
    <!-- Cookie Consent Banner -->
    <div id="cookie-consent-banner" style="display: none; position: fixed; bottom: 0; left: 0; right: 0; background: var(--clr-surface); border-top: 1px solid var(--clr-glass-border); padding: 20px; z-index: 9999; box-shadow: 0 -4px 20px rgba(0,0,0,0.3); flex-direction: column; gap: 15px; font-family: var(--font-body);">
        <div style="max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; md:flex-row; gap: 20px; align-items: center; justify-content: space-between;">
            <div style="flex: 1;">
                <h3 style="margin: 0 0 10px 0; font-size: 18px; color: var(--clr-text);">Valoramos tu privacidad</h3>
                <p style="margin: 0; font-size: 14px; color: var(--clr-text-muted); line-height: 1.5;">
                    Utilizamos cookies propias y de terceros (como Google AdSense) para personalizar el contenido, los anuncios y analizar nuestro tráfico. Al hacer clic en "Aceptar todas", consientes el uso de todas las cookies. Consulta nuestra <a href="/politica-cookies.html" style="color: var(--clr-primary);">Política de Cookies</a> para más información.
                </p>
            </div>
            <div style="display: flex; gap: 10px; flex-shrink: 0;">
                <button id="btn-reject-cookies" style="padding: 10px 20px; border-radius: 8px; border: 1px solid var(--clr-glass-border); background: transparent; color: var(--clr-text); font-weight: 600; cursor: pointer; transition: all 0.2s;">Rechazar</button>
                <button id="btn-accept-cookies" style="padding: 10px 20px; border-radius: 8px; border: none; background: var(--clr-primary); color: white; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(139,92,246,0.3); transition: all 0.2s;">Aceptar Todas</button>
            </div>
        </div>
    </div>
    
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const banner = document.getElementById('cookie-consent-banner');
            const acceptBtn = document.getElementById('btn-accept-cookies');
            const rejectBtn = document.getElementById('btn-reject-cookies');
            
            if (!localStorage.getItem('cookie_consent')) {
                // Show banner
                banner.style.display = 'flex';
                // Move banner above adsense if any
                document.body.appendChild(banner);
            } else if (localStorage.getItem('cookie_consent') === 'accepted') {
                loadAdSense();
            }

            acceptBtn.addEventListener('click', function() {
                localStorage.setItem('cookie_consent', 'accepted');
                banner.style.display = 'none';
                loadAdSense();
            });

            rejectBtn.addEventListener('click', function() {
                localStorage.setItem('cookie_consent', 'rejected');
                banner.style.display = 'none';
            });
            
            function loadAdSense() {
                const adScript = document.createElement('script');
                adScript.async = true;
                adScript.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5204963814118924";
                adScript.crossOrigin = "anonymous";
                document.head.appendChild(adScript);
            }
        });
    </script>
`;

let content = fs.readFileSync('index.html', 'utf8');

// Remove current AdSense script to load it conditionally.
content = content.replace(
    /<script async src="https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client=ca-pub-\d+"[^>]*><\/script>/g,
    '<!-- AdSense conditionally loaded by consent banner -->'
);

// Inject banner before </body>
if (!content.includes('cookie-consent-banner')) {
    content = content.replace('</body>', bannerHtml + '\n</body>');
    fs.writeFileSync('index.html', content);
    console.log('Added cookie banner to index.html');
}

// Ensure app.js doesn't override this logic or do we need it in all game pages? Yes, we need it in games too.
const pages = [
    'juego-de-inteligencia-espacial/index.html',
    'juego-de-memoria-de-secuencia/index.html',
    'juego-de-reconocimiento-de-patrones/index.html',
    'test-de-agilidad-mental/index.html',
    'test-de-reflejos-rapidos/index.html'
];

for (let page of pages) {
    if (!fs.existsSync(page)) continue;
    let pageContent = fs.readFileSync(page, 'utf8');
    
    pageContent = pageContent.replace(
        /<script async src="https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client=ca-pub-\d+"[^>]*><\/script>/g,
        '<!-- AdSense conditionally loaded by consent banner -->'
    );
    
    if (!pageContent.includes('cookie-consent-banner')) {
        let pageBannerHtml = bannerHtml.replace('href="/politica-cookies.html"', 'href="../politica-cookies.html"');
        pageContent = pageContent.replace('</body>', pageBannerHtml + '\n</body>');
        fs.writeFileSync(page, pageContent);
        console.log(`Added cookie banner to ${page}`);
    }
}
