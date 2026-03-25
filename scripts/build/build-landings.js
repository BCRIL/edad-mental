const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..', 'public');

const landings = [
  {
    slug: 'juego-de-memoria-de-secuencia',
    title: 'Juego de Memoria de Secuencia Espacial | Edad Mental',
    desc: 'Juega gratis al test de memoria de secuencia (Test de Corsi). Repite los patrones de bloques luminosos y descubre tu nivel de memoria a corto plazo.',
    h1: 'Juego de Memoria de Secuencia',
    h2: 'Como funciona el test de memoria espacial?',
    p1: 'El juego de memoria de secuencia esta disenado para evaluar tu memoria de trabajo visoespacial. Observa atentamente las casillas que se iluminan y repite la misma secuencia.',
    p2: 'Este ejercicio, tambien conocido como Test de Bloques de Corsi, es utilizado por neuropsicologos en todo el mundo. Comienza ahora y descubre que edad tiene tu cerebro.'
  },
  {
    slug: 'test-de-reflejos-rapidos',
    title: 'Test de Reflejos Rapidos y Reaccion | Mide tus ms',
    desc: 'Que tan rapidos son tus reflejos? Haz el test de reaccion gratis. Mide tus milisegundos y compara tu velocidad de reaccion con la media mundial.',
    h1: 'Test de Reflejos Rapidos',
    h2: 'Como medir tu tiempo de reaccion?',
    p1: 'Este test medira con precision milimetrica la velocidad de tu sistema nervioso. Toca la pantalla o haz clic lo mas rapido posible cuando el color cambie de rojo a verde.',
    p2: 'Un tiempo promedio saludable es de aproximadamente 250ms. Mejora tus reflejos jugando a diario y calcula la edad mental de tus reflejos.'
  },
  {
    slug: 'test-de-agilidad-mental',
    title: 'Test de Agilidad Mental y Velocidad Cognitiva | Gratis',
    desc: 'Pon a prueba tu cerebro con este test de agilidad mental gratuito. Ejercicios matematicos, logica y memoria rapida para calcular tu edad cerebral.',
    h1: 'Test de Agilidad Mental',
    h2: 'Ejercita tu velocidad cognitiva',
    p1: 'La agilidad mental se basa en la rapidez con la que tu cerebro procesa informacion y toma decisiones correctas bajo presion de tiempo.',
    p2: 'Enfrenta desafios de matematicas rapidas, secuencias y reconocimiento de patrones. Activa tu rendimiento cerebral ahora mismo iniciando el test completo.'
  },
  {
    slug: 'juego-de-reconocimiento-de-patrones',
    title: 'Juego de Reconocimiento de Patrones Logicos | Inteligencia Fluida',
    desc: 'Descubre tu nivel de inteligencia fluida con este juego de logica y reconocimiento de series numericas y geometricas.',
    h1: 'Juego de Reconocimiento de Patrones',
    h2: 'Desarrolla tu pensamiento logico',
    p1: 'El reconocimiento de patrones es una habilidad fundamental de la inteligencia humana. Consiste en identificar reglas ocultas en secuencias de elementos numericos o graficos.',
    p2: 'En este juego veras secuencias generadas proceduralmente que nunca se repiten. Tendras que adivinar que elemento sigue para completar la logica geometrica o aritmetica.'
  },
  {
    slug: 'juego-de-inteligencia-espacial',
    title: 'Juego de Inteligencia Espacial y Memoria Visual | Entrena tu Cerebro',
    desc: 'Mejora tu capacidad de memoria visual espacial. Memoriza cuadriculas y reproduce las posiciones exactas en este reto cognitivo.',
    h1: 'Juego de Inteligencia Espacial',
    h2: 'Evalua tu memoria fotografica',
    p1: 'La inteligencia espacial te permite recordar la ubicacion exacta de los objetos en un espacio de dos o tres dimensiones de manera instantanea.',
    p2: 'Te mostraremos un patron en una cuadricula durante una fraccion de segundo. Cierra los ojos, recuerdalo y recrea la imagen perfecta. Listo para el reto?'
  }
];

function render(page) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.title}</title>
  <meta name="description" content="${page.desc}">
  <meta name="robots" content="index, follow">
  <meta property="og:title" content="${page.title}">
  <meta property="og:description" content="${page.desc}">
  <meta property="og:type" content="article">
  <meta property="og:image" content="https://edadmental.online/og-image.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../src/styles/styles.css">
</head>
<body>
  <div class="landing-card">
    <h1>${page.h1}</h1>
    <p style="font-size:18px;color:#cbd5e1;">${page.desc}</p>
    <h2>${page.h2}</h2>
    <p>${page.p1}</p>
    <p>${page.p2}</p>
    <a href="../" class="btn-cta">Iniciar Test Completo</a>
  </div>
  <div class="breadcrumbs">
    <a href="../">Volver al Test de Edad Mental</a>
  </div>
</body>
</html>`;
}

function build() {
  console.log('Building SEO landing pages...');
  for (const page of landings) {
    const dir = path.join(ROOT, page.slug);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), render(page), 'utf8');
    console.log('Created: ' + page.slug + '/index.html');
  }
  console.log('Done.');
}

build();
