// Leaflet map init (home teaser and /map). Loads Leaflet and the marker file only when the map nears the viewport.
// The container carries data-leaflet, data-markers (asset URL), data-radius and data-zoom-control.
// Browser code kept as a string: the Worker serves it as /assets/map.<hash>.js (see lib/assets.ts).
export const mapJs = `
(function () {
  var host = document.querySelector('[data-leaflet]');
  if (!host) return;
  var started = false;

  // Leaflet (and its CSS and the marker file) only load when the map is about to be seen, so the home
  // page does not pay for a third-party library and tile requests the visitor may never scroll to.
  function load(el) {
    return new Promise(function (resolve, reject) {
      el.onload = resolve;
      el.onerror = reject;
      document.head.appendChild(el);
    });
  }
  function start() {
    if (started) return;
    started = true;
    var css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    css.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    css.crossOrigin = '';
    var js = document.createElement('script');
    js.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    js.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    js.crossOrigin = '';
    var markers = fetch(host.getAttribute('data-markers')).then(function (r) { return r.json(); });
    Promise.all([load(css), load(js), markers]).then(function (all) { init(all[2]); });
  }

  function init(docks) {
    var escapeHtml = function (s) {
      return String(s).replace(/[&<>"']/g, function (ch) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
      });
    };
    var map = L.map(host, { scrollWheelZoom: false, zoomControl: host.getAttribute('data-zoom-control') !== 'false' }).setView([20, 10], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);
    var radius = Number(host.getAttribute('data-radius')) || 6;
    docks.forEach(function (d) {
      // Dock names can come from user submissions once approved, so this must
      // stay HTML-escaped: bindPopup renders its argument as raw HTML.
      L.circleMarker([d.a, d.o], { radius: radius, color: '#0b2545', weight: 1.5, fillColor: '#c9a24d', fillOpacity: 0.9 })
        .addTo(map)
        .bindPopup('<strong>' + escapeHtml(d.n) + '</strong><br>' + escapeHtml(String(d.t).replace(/_/g, ' ')) + '<br><a href="/docks/' + encodeURIComponent(d.s) + '">View dock</a>');
    });
    // Open zoomed in on the hand-written entries (Capri), not on the whole world map the
    // full catalogue would give; every dock is still on the map to pan to.
    var focus = docks.filter(function (d) { return d.f; });
    if (!focus.length) focus = docks;
    if (focus.length) {
      var bounds = L.latLngBounds(focus.map(function (d) { return [d.a, d.o]; }));
      map.fitBounds(bounds.pad(0.5), { maxZoom: 6 });
    }
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries, observer) {
      if (entries[0].isIntersecting) { observer.disconnect(); start(); }
    }, { rootMargin: '300px' }).observe(host);
  } else {
    start();
  }
})();
`;
