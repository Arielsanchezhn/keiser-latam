# Keiser University América Latina — hub regional

Un solo repositorio para todos los sitios de Keiser University en Centroamérica:

| Sitio | Carpeta | Dominio | Estado |
|---|---|---|---|
| Portal regional | `sites/portal/` | por definir | **en construcción** (borrador, no indexable) |
| El Salvador | `sites/sv/` | keiseruniversity.edu.sv | pendiente de migrar (hoy en otro proyecto Eleventy, vía Netlify Drop) |
| Nicaragua | `sites/ni/` | keiseruniversity.edu.ni | pendiente de migrar (prototipo en staging de Netlify) |
| Honduras | `sites/hn/` | keiseruniversity.edu.hn | por crear |

Stack: **Eleventy 3** (HTML estático) + **Netlify**.

---

## Correrlo

```bash
npm install
npm run start:portal      # http://localhost:8080
npm run build:portal      # genera _site/
```

Para cualquier sitio: `SITE=<id> npx @11ty/eleventy` (o `--serve`).

---

## Arquitectura

```
eleventy.config.js        Compila UN sitio por build, elegido con SITE
shared/
  _data/                  Datos de la red (globales para todos los sitios)
    network.json          Países, campus, sedes, oficinas, direcciones, teléfonos, URL
    programs.json         Catálogo regional: programa × ubicación
    accreditation.json    Declaración SACSCOC, ACBSP, nota de educación continua
    mapGeo.json           Contornos del mapa de Centroamérica (generados)
  _includes/
    layouts/base.njk      <head>, SEO, hreflang, robots, GTM opcional
    partials/             Encabezado, pie de la red, mapa, tarjetas, buscador
    macros.njk            Íconos
  assets/                 CSS, JS e imágenes compartidas → /assets/
sites/
  portal/
    site.config.json      Dominio, idiomas, indexable, tracking del sitio
    _data/strings.json    Textos ES/EN del sitio
    index.njk             Genera / (es) y /en/ (en)
    assets/               Imágenes propias del sitio → /assets/
```

### Reglas

1. **Un dato se escribe una sola vez.** Una dirección, un teléfono o la declaración de acreditación viven en `shared/_data/` y todos los sitios la leen de ahí. Si cambia el teléfono de Managua, se edita `network.json` y se publica en todos.
2. **El dominio nunca se escribe en una plantilla.** Sale de `site.config.json → origin` (o de la URL de Netlify si está vacío). Canonical, hreflang, og:url y sitemap lo usan.
3. **Bilingüe:** español en la raíz (`/`), inglés bajo `/en/`. Los textos de datos son `{ "es": "…", "en": "…" }` y se leen con el filtro `| t(locale)`.
4. **Tipos de ubicación** (confirmados el 18-oct-2026), en `network.json → locations[].type`:
   - `campus`: San Marcos, Managua
   - `site` (sede académica): San Salvador, que tiene aulas y clases pero no es un campus completo
   - `office` (oficina de admisiones): Tegucigalpa, donde no se imparten clases
5. **Acreditación:** la declaración de `accreditation.json` debe ser idéntica en todos los sitios (Principio 14.1 de SACSCOC). No usar "acreditación regional". No decir que ACBSP cubre "los programas de negocios" en general. Ver `claude/revision-sacscoc-portal.md` en el proyecto de Claude.
6. **Catálogo:** una combinación programa × ubicación en `programs.json` solo debe figurar si está aprobada ante SACSCOC. Los diplomados y el Language Institute llevan `continuingEducation: true`.
7. **Mejora progresiva:** sin JavaScript se ve todo el contenido. `shared/assets/js/hub.js` solo agrega la selección de país en el mapa y el filtro del buscador.

### Agregar un país, campus u oficina

1. Agregar la ubicación en `network.json → locations` y su id en el país correspondiente (`countries[].locations`).
2. Si va en el mapa, agregar su marcador en `mapGeo.json → markers` (coordenadas del lienzo de 720×520).
3. Si es un país nuevo, agregar su contorno en `mapGeo.json → network`. Se genera con `world-atlas` y `d3-geo` con el mismo encuadre; ver el comentario del archivo.
4. Agregar sus programas en `programs.json → offeredAt`.

---

## Despliegue en Netlify

Cada sitio es un **sitio de Netlify distinto conectado a este mismo repositorio**:

1. Netlify → *Add new site* → *Import an existing project* → GitHub → `keiser-latam`.
2. Build command y publish directory ya vienen de `netlify.toml` (`npm run build`, `_site`).
3. En *Site configuration → Environment variables*, definir **`SITE`** con el valor del sitio: `portal`, `sv`, `ni` o `hn`.
4. Asignar el dominio del sitio en *Domain management*.

Así, un push a `main` vuelve a publicar todos los sitios, cada uno con su contenido.

---

## Validación antes de entregar

Build limpio y batería en navegador (Playwright) en 1440 px y 390 px, ES y EN:

- un solo `<h1>` por página;
- sin errores de JavaScript;
- sin enlaces internos ni anclas rotas;
- sin imágenes rotas;
- sin desborde horizontal en el celular;
- mapa: cada país abre su panel;
- buscador: los filtros muestran el número correcto de programas.

---

## Bitácora

### 18-oct-2026 — Estructura del hub y portal regional (v0.1)

- Estructura multi-sitio con datos compartidos.
- Portal ES/EN: portada, accesos directos a cada ubicación, mapa interactivo, campus y sedes por país, oficina de Honduras, buscador regional de 30 programas, "¿Por qué Keiser?" y pie con contactos y declaración SACSCOC completa.
- El portal está como **borrador**: `noindex` + `robots.txt Disallow` (`indexable: false`).
- Validado: 4 de 4 combinaciones (ES/EN × escritorio/celular) sin problemas.

### Pendiente

- **Dominio del portal** (`latam.keiseruniversity.edu` con TI de Keiser, o dominio propio). Se escribe en `sites/portal/site.config.json → origin`.
- **Logo:** el SVG blanco actual dice "Latin American Campus" (es el logo de Nicaragua). Hace falta decidir el nombre del portal regional y conseguir el logo que corresponda.
- **Nicaragua:** las URL apuntan al staging `ku-nicaragua-ng.netlify.app`. Cambiar en `network.json` al lanzar.
- **Oficina de Acreditación de Keiser:** confirmar programa × ubicación, términos oficiales de cada ubicación, alcance de ACBSP y texto oficial en español.
- **Fuentes:** se cargan desde Google Fonts. Conviene alojarlas en `shared/assets/fonts/` para no depender de terceros.
- Migrar El Salvador (`sites/sv/`) y Nicaragua (`sites/ni/`).
