# edad-mental

Proyecto web de pruebas cognitivas (edad mental) con modo diario, modo entrenamiento y landings SEO.

## Estructura

```text
edad-mental/
	public/
		src/
			js/
				app.js
				db.js
				auth-google.js
			styles/
				styles.css
		icons/
		index.html
		ranking.html
		estadisticas.html
		contacto.html
		aviso-legal.html
		politica-cookies.html
		politica-privacidad.html
		terminos-servicio.html
		juego-de-*/index.html
		test-de-*/index.html
		service-worker.js
		manifest.json
	scripts/
		build/
			build-landings.js
	package.json
```

## Desarrollo

1. Instalar dependencias:

```bash
npm install
```

2. Levantar servidor local:

```bash
npm run dev
```

La app quedara disponible en `http://localhost:8080`.

## Scripts utiles

- `npm run dev`: servidor local sin cache.
- `npm run build:landings`: regenera las paginas de landings SEO.

## Nota de arquitectura

Los arreglos funcionales (cookies, entreno, SEO y enlaces legales) estan integrados directamente en los HTML/JS de `public/`.
No se usa una capa de scripts de migracion para el runtime.