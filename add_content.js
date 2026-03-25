const fs = require('fs');

const seoContentHtml = `
            <!-- SEO & Content Section for AdSense Approval -->
            <section class="seo-content-section" style="margin-top: 60px; padding: 40px; background: var(--clr-surface); border-radius: 20px; border: 1px solid var(--clr-glass-border); text-align: left;">
                <h2 style="font-family: var(--font-display); font-size: 28px; margin-bottom: 20px; color: var(--clr-primary);">¿Qué es la Edad Mental y cómo se calcula?</h2>
                
                <p style="margin-bottom: 16px; line-height: 1.6; color: var(--clr-text-dim);">
                    La "edad mental" es un concepto fascinante que describe el nivel de rendimiento cognitivo y la agilidad cerebral de una persona en comparación con el promedio de rendimiento de diferentes grupos de edad. Aunque nuestra edad cronológica avanza inevitablemente año tras año, la salud y agilidad de nuestro cerebro pueden ser más jóvenes o mayores dependiendo de nuestra genética, estilo de vida y hábitos de estimulación mental.
                </p>
                
                <p style="margin-bottom: 16px; line-height: 1.6; color: var(--clr-text-dim);">
                    En <strong>EdadMental.online</strong>, hemos diseñado una serie de pruebas interactivas basadas en principios de la psicología cognitiva. Estas pruebas no miden la inteligencia (IQ) pura, sino factores dinámicos como la velocidad de respuesta, la memoria a corto plazo, el reconocimiento de patrones visuales y la capacidad de adaptación. Al completar nuestra batería de tests rápidos, nuestro algoritmo analiza tus resultados en tiempo real y calcula una estimación aproximada de tu edad mental actual.
                </p>

                <h3 style="font-family: var(--font-display); font-size: 22px; margin-top: 30px; margin-bottom: 16px; color: var(--clr-primary);">Nuestros Tests Cognitivos</h3>
                <ul style="margin-bottom: 20px; padding-left: 20px; color: var(--clr-text-dim); line-height: 1.6;">
                    <li style="margin-bottom: 10px;"><strong>Test de Agilidad Mental:</strong> Evalúa la velocidad a la que procesas información contradictoria o que requiere toma de decisiones rápidas.</li>
                    <li style="margin-bottom: 10px;"><strong>Test de Reflejos Rápidos:</strong> Mide tus tiempos de reacción ante estímulos visuales repentinos, un indicador clave del estado de tu sistema nervioso.</li>
                    <li style="margin-bottom: 10px;"><strong>Memoria de Secuencia:</strong> Pone a prueba tu memoria de trabajo (o a corto plazo) recordando el orden en que aparecen diferentes elementos.</li>
                    <li style="margin-bottom: 10px;"><strong>Reconocimiento de Patrones:</strong> Analiza tu capacidad para identificar relaciones lógicas y secuencias visuales de manera intuitiva.</li>
                    <li style="margin-bottom: 10px;"><strong>Inteligencia Espacial:</strong> Examina cómo tu cerebro rota y manipula objetos en el espacio tridimensional imaginario.</li>
                </ul>

                <h3 style="font-family: var(--font-display); font-size: 22px; margin-top: 30px; margin-bottom: 16px; color: var(--clr-primary);">¿Por qué es importante ejercitar la mente?</h3>
                <p style="margin-bottom: 16px; line-height: 1.6; color: var(--clr-text-dim);">
                    La plasticidad cerebral (o neuroplasticidad) es la capacidad del cerebro para cambiar y adaptarse a lo largo de la vida. Mantener el cerebro activo ayuda a fortalecer las conexiones neuronales, lo que puede retrasar el deterioro cognitivo natural asociado con el envejecimiento. Jugar diariamente a minijuegos de lógica, resolver rompecabezas, o realizar tests como los que ofrecemos en esta plataforma, proporcionan el "ejercicio cardiovascular" que tu mente necesita para mantenerse joven y ágil.
                </p>
                <p style="margin-bottom: 0; line-height: 1.6; color: var(--clr-text-dim);">
                    Recuerda: estos resultados son de carácter puramente recreativo e informativo. Para un análisis clínico de tus capacidades cognitivas, siempre es recomendable consultar a un especialista de la salud médica o psicológica. ¡Comienza el test ahora y descubre cuántos años tiene realmente tu mente!
                </p>
            </section>
`;

let content = fs.readFileSync('index.html', 'utf8');
// Inject in the view-home right before the end of the main tag if possible, or after the tests list
const insertionPoint = '<div id="tests-list"';
if (content.includes(insertionPoint) && !content.includes('¿Qué es la Edad Mental y cómo se calcula?')) {
    // Find the end of view-home or put it before </main> inside view-home
    content = content.replace('</main>\n        </div> <!-- end view-home -->', seoContentHtml + '\n            </main>\n        </div> <!-- end view-home -->');
    fs.writeFileSync('index.html', content);
    console.log('Added SEO content to index.html');
}

// Add content to games
const gameDetails = {
    'juego-de-inteligencia-espacial': {
        title: 'Sobre la Inteligencia Espacial',
        content: '<p style="margin-bottom: 15px;">La inteligencia espacial es la capacidad de percibir el mundo visual y espacial de manera precisa, y de realizar transformaciones a partir de esas percepciones. Implica ser capaz de crear imágenes mentales, pensar en tres dimensiones, orientarse en el espacio y reconocer patrones y formas.</p><p style="margin-bottom: 15px;">En este test, evaluamos tu habilidad para recordar la posición exacta de diferentes elementos tras un periodo de distracción. Esta habilidad es fundamental no solo en profesiones como ingeniería, arquitectura o diseño, sino en tareas cotidianas como conducir, leer mapas o empacar objetos. Mantener entrenada esta capacidad contribuye a una mejor agilidad mental global y a una edad cerebral rejuvenecida.</p>'
    },
    'juego-de-memoria-de-secuencia': {
        title: 'El Poder de la Memoria a Corto Plazo',
        content: '<p style="margin-bottom: 15px;">La memoria de trabajo o memoria a corto plazo es un sistema cognitivo que nos permite mantener y manipular información de forma temporal. Es el "espacio de trabajo" de nuestra mente, esencial para el razonamiento y la toma de decisiones.</p><p style="margin-bottom: 15px;">A través del juego de recordar secuencias de colores o números, estamos ejercitando directamente el córtex prefrontal de nuestro cerebro. Este tipo de entrenamiento cognitivo ha demostrado ser eficaz para mejorar la concentración, reducir el deterioro mental asociado a la edad, y proporcionar una mente mucho más ágil y rápida. Intenta practicar unos minutos al día y notarás la diferencia en tu rendimiento.</p>'
    },
    'juego-de-reconocimiento-de-patrones': {
        title: 'Reconocimiento de Patrones y Lógica',
        content: '<p style="margin-bottom: 15px;">El reconocimiento de patrones es una habilidad fundamental que define gran parte de la inteligencia fluida. Es nuestra capacidad para observar un caos aparente, organizar los datos, encontrar relaciones ocultas y predecir lo que vendrá a continuación.</p><p style="margin-bottom: 15px;">Este juego está diseñado para desafiar tu velocidad de procesamiento y tu capacidad lógica. Detectar el símbolo o número correcto en una matriz estructurada requiere concentración absoluta y rapidez visual. Este ejercicio es una herramienta excelente para mantener la mente joven, dado que obliga al cerebro a buscar soluciones rápidas ante problemas nuevos, estimulando así la neuroplasticidad y mejorando la edad cerebral general.</p>'
    },
    'test-de-agilidad-mental': {
        title: 'Mejora tu Agilidad Mental',
        content: '<p style="margin-bottom: 15px;">La agilidad mental se define como la capacidad del cerebro para cambiar de forma rápida y flexible de un tren de pensamiento a otro. Esta flexibilidad cognitiva es crucial en el mundo moderno, donde estamos bombardeados por estímulos y necesitamos tomar decisiones rápidas bajo presión.</p><p style="margin-bottom: 15px;">Al someter a tu cerebro a pruebas de inhibición mental e identificación rápida (como nombrar colores en vez de palabras escritas, o relacionar símbolos), estás fortaleciendo tu capacidad atencional e inhibitoria. Practicar tests de agilidad mental frecuentemente puede disminuir considerablemente tu edad mental al optimizar las conexiones sinápticas encargadas de las funciones ejecutivas.</p>'
    },
    'test-de-reflejos-rapidos': {
        title: 'Los Reflejos y el Sistema Nervioso',
        content: '<p style="margin-bottom: 15px;">El tiempo de reacción y los reflejos visuales son los principales indicadores de la integridad del sistema nervioso central. Miden exactamente cuánto tiempo transcurre desde que se presenta un estímulo en la pantalla hasta que tu cerebro lo procesa y da la orden a tu mano para hacer clic.</p><p style="margin-bottom: 15px;">Estos reflejos tienden a decaer ligeramente con la edad fisiológica, pero pueden mantenerse a niveles óptimos si se entrenan. Además de ser vital para la supervivencia (como reaccionar ante un obstáculo al conducir), tener buenos reflejos es un excelente sinónimo de juventud cerebral y de unos procesos neuroquímicos saludables.</p>'
    }
};

for (const [folder, details] of Object.entries(gameDetails)) {
    const filePath = `${folder}/index.html`;
    if (!fs.existsSync(filePath)) continue;
    let pageContent = fs.readFileSync(filePath, 'utf8');
    
    const gameSeoHtml = `
            <div style="margin-top: 50px; padding: 30px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; max-width: 800px; margin-left: auto; margin-right: auto; text-align: left; line-height: 1.6; color: #cbd5e1;">
                <h3 style="color: #fff; font-size: 20px; font-weight: 600; margin-bottom: 15px; text-align: center;">${details.title}</h3>
                ${details.content}
            </div>
    `;
    
    // Inject at the end of main before the script tags or in a suitable place
    if (!pageContent.includes(details.title)) {
        pageContent = pageContent.replace('</main>', gameSeoHtml + '\n    </main>');
        fs.writeFileSync(filePath, pageContent);
        console.log(`Added SEO content to ${filePath}`);
    }
}
