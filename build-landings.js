const fs = require('fs');
const path = require('path');

const landings = [
    {
        slug: 'juego-de-memoria-de-secuencia',
        title: 'Juego de Memoria de Secuencia Espacial | Edad Mental',
        desc: 'Juega gratis al test de memoria de secuencia (Test de Corsi). Repite los patrones de bloques luminosos y descubre tu nivel de memoria a corto plazo.',
        h1: 'Juego de Memoria de Secuencia',
        h2: '¿Cómo funciona el test de memoria espacial?',
        p1: 'El juego de memoria de secuencia está diseñado para evaluar tu memoria de trabajo visoespacial. Observa atentamente las casillas que se iluminan y repite la misma secuencia.',
        p2: 'Este ejercicio, también conocido como Test de Bloques de Corsi, es utilizado por neuropsicólogos en todo el mundo. ¡Comienza ahora y descubre qué edad tiene tu cerebro!'
    },
    {
        slug: 'test-de-reflejos-rapidos',
        title: 'Test de Reflejos Rápidos y Reacción | Mide tus ms',
        desc: '¿Qué tan rápidos son tus reflejos? Haz el test de reacción gratis. Mide tus milisegundos y compara tu velocidad de reacción con la media mundial.',
        h1: 'Test de Reflejos Rápidos',
        h2: '¿Cómo medir tu tiempo de reacción?',
        p1: 'Este test medirá con precisión milimétrica la velocidad de tu sistema nervioso. Toca la pantalla o haz clic lo más rápido posible cuando el color cambie de rojo a verde.',
        p2: 'Un tiempo promedio saludable es de aproximadamente 250ms. Mejora tus reflejos jugando a diario y calcula la edad mental de tus reflejos.'
    },
    {
        slug: 'test-de-agilidad-mental',
        title: 'Test de Agilidad Mental y Velocidad Cognitiva | Gratis',
        desc: 'Pon a prueba tu cerebro con este test de agilidad mental gratuito. Ejercicios matemáticos, lógica y memoria rápida para calcular tu edad cerebral.',
        h1: 'Test de Agilidad Mental',
        h2: 'Ejercita tu velocidad cognitiva',
        p1: 'La agilidad mental se basa en la rapidez con la que tu cerebro procesa información y toma decisiones correctas bajo presión de tiempo.',
        p2: 'Enfrenta desafíos de matemáticas rápidas, secuencias y reconocimiento de patrones. Activa tu rendimiento cerebral ahora mismo iniciando el test completo.'
    },
    {
        slug: 'juego-de-reconocimiento-de-patrones',
        title: 'Juego de Reconocimiento de Patrones Lógicos | Inteligencia Fluida',
        desc: 'Descubre tu nivel de inteligencia fluida con este juego de lógica y reconocimiento de series numéricas y geométricas.',
        h1: 'Juego de Reconocimiento de Patrones',
        h2: 'Desarrolla tu pensamiento lógico',
        p1: 'El reconocimiento de patrones es una habilidad fundamental de la inteligencia humana. Consiste en identificar reglas ocultas en secuencias de elementos numéricos o gráficos.',
        p2: 'En este juego verás secuencias generadas proceduralmente que nunca se repiten. Tendrás que adivinar qué elemento sigue para completar la lógica geométrica o aritmética.'
    },
    {
        slug: 'juego-de-inteligencia-espacial',
        title: 'Juego de Inteligencia Espacial y Memoria Visual | Entrena tu Cerebro',
        desc: 'Mejora tu capacidad de memoria visual espacial. Memoriza cuadrículas y reproduce las posiciones exactas en este reto cognitivo.',
        h1: 'Juego de Inteligencia Espacial',
        h2: 'Evalúa tu memoria fotográfica',
        p1: 'La inteligencia espacial te permite recordar la ubicación exacta de los objetos en un espacio de dos o tres dimensiones de manera instantánea.',
        p2: 'Te mostraremos un patrón en una cuadrícula durante una fracción de segundo. Cierra los ojos, recuédalo, y recrea la imagen perfecta. ¿Listo para el reto?'
    }
];

const template = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITLE}}</title>
    <meta name="description" content="{{DESC}}">
    <meta name="robots" content="index, follow">
    <meta property="og:title" content="{{TITLE}}">
    <meta property="og:description" content="{{DESC}}">
    <meta property="og:type" content="article">
    <meta property="og:image" content="https://edadmental.online/og-image.png">
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../styles.css">
    
    <style>
        body {
            background: #0f0c29;
            background: linear-gradient(to bottom right, #0f0c29, #302b63, #24243e);
            color: #f1f5f9;
            font-family: 'Inter', sans-serif;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 24px;
            text-align: center;
        }
        .landing-card {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 24px;
            padding: 48px 32px;
            max-width: 700px;
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .icon-top {
            font-size: 64px;
            margin-bottom: 24px;
            display: inline-block;
            background: linear-gradient(135deg, #8b5cf6, #06b6d4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        h1 {
            font-family: 'Outfit', sans-serif;
            font-size: 42px;
            font-weight: 800;
            line-height: 1.1;
            margin-bottom: 16px;
            background: linear-gradient(to right, #ffffff, #94a3b8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        h2 {
            font-size: 20px;
            color: #06b6d4;
            margin: 32px 0 16px;
            font-weight: 600;
        }
        p {
            font-size: 16px;
            line-height: 1.6;
            color: #94a3b8;
            margin-bottom: 24px;
        }
        .btn-cta {
            display: inline-block;
            background: linear-gradient(135deg, #8b5cf6, #06b6d4);
            color: white;
            font-family: 'Outfit', sans-serif;
            font-weight: 700;
            font-size: 18px;
            text-decoration: none;
            padding: 16px 40px;
            border-radius: 999px;
            margin-top: 24px;
            transition: all 0.3s ease;
            box-shadow: 0 10px 25px -5px rgba(139, 92, 246, 0.5);
        }
        .btn-cta:hover {
            transform: translateY(-3px) scale(1.02);
            box-shadow: 0 15px 35px -5px rgba(139, 92, 246, 0.6);
        }
        .breadcrumbs {
            margin-top: 48px;
            font-size: 13px;
            color: #64748b;
        }
        .breadcrumbs a {
            color: #8b5cf6;
            text-decoration: none;
        }
        .breadcrumbs a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="landing-card">
        <div class="icon-top">🧠</div>
        <h1>{{H1}}</h1>
        <p style="font-size: 18px; color: #cbd5e1;">{{DESC}}</p>
        
        <h2>{{H2}}</h2>
        <p>{{P1}}</p>
        <p>{{P2}}</p>
        
        <a href="../" class="btn-cta">Iniciar Test Completo</a>
    </div>
    
    <div class="breadcrumbs">
        <a href="../">← Volver al Test de Edad Mental</a>
    </div>
</body>
</html>`;

function build() {
    console.log("Generando minipáginas de aterrizaje SEO...");
    landings.forEach(page => {
        const dir = path.join(__dirname, page.slug);
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        
        let html = template
            .replace(/{{TITLE}}/g, page.title)
            .replace(/{{DESC}}/g, page.desc)
            .replace(/{{H1}}/g, page.h1)
            .replace(/{{H2}}/g, page.h2)
            .replace(/{{P1}}/g, page.p1)
            .replace(/{{P2}}/g, page.p2);
            
        fs.writeFileSync(path.join(dir, 'index.html'), html);
        console.log("✅ Creado: /" + page.slug + "/");
    });
    console.log("¡Completado!");
}

build();
