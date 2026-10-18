/* Keiser University — hub regional. Comportamiento compartido.
   Mejora progresiva: sin JavaScript se ve todo el contenido; esto solo
   agrega la selección de país en el mapa y el filtro del buscador. */
(function () {
  'use strict';

  /* ── Mapa de la red ─────────────────────────────────────────────────── */
  document.querySelectorAll('[data-network-map]').forEach(function (root) {
    var paths = root.querySelectorAll('.map-country[data-country]');
    var buttons = root.querySelectorAll('button[data-country]');
    var panels = root.querySelectorAll('[data-panel]');

    function select(id) {
      paths.forEach(function (p) { p.classList.toggle('is-selected', p.getAttribute('data-country') === id); });
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-country') === id ? 'true' : 'false'); });
      panels.forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== id; });
    }

    paths.forEach(function (p) {
      p.addEventListener('click', function () { select(p.getAttribute('data-country')); });
    });
    buttons.forEach(function (b) {
      b.addEventListener('click', function () { select(b.getAttribute('data-country')); });
    });

    select(root.getAttribute('data-selected'));
  });

  /* ── Buscador de programas ──────────────────────────────────────────── */
  document.querySelectorAll('[data-program-finder]').forEach(function (root) {
    var filters = root.querySelectorAll('button[data-filter]');
    var items = root.querySelectorAll('[data-level]');
    var count = root.querySelector('[data-count]');

    filters.forEach(function (f) {
      f.addEventListener('click', function () {
        var level = f.getAttribute('data-filter');
        var shown = 0;
        filters.forEach(function (x) { x.setAttribute('aria-pressed', x === f ? 'true' : 'false'); });
        items.forEach(function (it) {
          var on = level === 'all' || it.getAttribute('data-level') === level;
          it.hidden = !on;
          if (on) shown++;
        });
        if (count) {
          count.textContent = shown + ' ' + (shown === 1 ? count.getAttribute('data-one') : count.getAttribute('data-many'));
        }
      });
    });
  });
})();
