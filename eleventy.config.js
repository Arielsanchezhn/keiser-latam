// Hub regional de Keiser University en Centroamérica.
//
// Un solo proyecto Eleventy compila UN sitio por build, elegido con la
// variable de entorno SITE (portal | sv | ni | hn). Cada sitio vive en
// sites/<SITE>/ y comparte con los demás:
//
//   shared/_data/      datos de la red: ubicaciones, programas, acreditación
//   shared/_includes/  layouts y parciales
//   shared/assets/     CSS, JS e imágenes de marca
//
// Regla: un dato que aparece en más de un sitio (una dirección, un
// teléfono, la declaración de SACSCOC) se escribe UNA vez en shared/_data.

const fs = require("fs");
const path = require("path");

const SITE = process.env.SITE || "portal";
const SITE_DIR = path.join("sites", SITE);

if (!fs.existsSync(SITE_DIR)) {
  throw new Error(`SITE="${SITE}" no existe en sites/. Sitios disponibles: ${fs.readdirSync("sites").join(", ")}`);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

module.exports = function (eleventyConfig) {
  // ── Datos compartidos de la red ─────────────────────────────────────────
  const sharedData = path.join("shared", "_data");
  for (const file of fs.readdirSync(sharedData)) {
    if (file.endsWith(".json")) {
      eleventyConfig.addGlobalData(path.basename(file, ".json"), readJson(path.join(sharedData, file)));
    }
  }

  // Configuración del sitio en compilación (dominio, idiomas, tracking).
  // Netlify define URL en cada deploy; se usa como origen cuando el sitio
  // todavía no tiene dominio propio.
  const siteConfig = readJson(path.join(SITE_DIR, "site.config.json"));
  siteConfig.id = SITE;
  siteConfig.origin = (siteConfig.origin || process.env.URL || "http://localhost:8080").replace(/\/$/, "");
  eleventyConfig.addGlobalData("siteConfig", siteConfig);
  eleventyConfig.addGlobalData("build", { year: new Date().getFullYear() });

  // ── Assets ──────────────────────────────────────────────────────────────
  eleventyConfig.addPassthroughCopy({ "shared/assets": "assets" });
  if (fs.existsSync(path.join(SITE_DIR, "assets"))) {
    eleventyConfig.addPassthroughCopy({ [path.join(SITE_DIR, "assets")]: "assets" });
  }

  // ── Filtros ─────────────────────────────────────────────────────────────
  // Texto bilingüe: acepta {es, en} o una cadena simple.
  eleventyConfig.addFilter("t", function (value, locale) {
    if (value && typeof value === "object") return value[locale] ?? value.es ?? "";
    return value ?? "";
  });

  // Ruta de una página según idioma: es en la raíz, en bajo /en/.
  eleventyConfig.addFilter("localePath", function (slug, locale) {
    const clean = (slug || "").replace(/^\/|\/$/g, "");
    const base = locale === "es" ? "/" : `/${locale}/`;
    return clean ? `${base}${clean}/` : base;
  });

  eleventyConfig.addFilter("absUrl", function (p, origin) {
    if (!p) return origin;
    if (/^https?:/i.test(p)) return p;
    return origin + p;
  });

  // Busca elementos de una lista por id.
  eleventyConfig.addFilter("byId", function (list, id) {
    return (list || []).find((x) => x.id === id);
  });
  eleventyConfig.addFilter("whereEq", function (list, key, value) {
    return (list || []).filter((x) => x[key] === value);
  });

  // URL de un asset con huella de su contenido (?v=…). Los assets se sirven
  // con caché de un año (netlify.toml): sin la huella, el navegador seguiría
  // usando el CSS/JS viejo después de un deploy.
  const crypto = require("crypto");
  eleventyConfig.addFilter("assetUrl", function (url) {
    const rel = url.replace(/^\/assets\//, "");
    const candidates = [path.join(SITE_DIR, "assets", rel), path.join("shared", "assets", rel)];
    const file = candidates.find((f) => fs.existsSync(f));
    if (!file) return url;
    const hash = crypto.createHash("md5").update(fs.readFileSync(file)).digest("hex").slice(0, 10);
    return `${url}?v=${hash}`;
  });

  eleventyConfig.addFilter("pad2", function (n) {
    return String(n).padStart(2, "0");
  });

  // JSON seguro para incrustar en <script>.
  eleventyConfig.addFilter("jsonScript", function (value) {
    return JSON.stringify(value).replace(/</g, "\\u003c");
  });

  return {
    dir: {
      input: SITE_DIR,
      includes: "../../shared/_includes",
      data: "_data",
      output: "_site",
    },
    templateFormats: ["njk", "md"],
    htmlTemplateEngine: "njk",
  };
};
