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
    // A dock page's mini map has its own coordinates (data-lat/data-lon) and no marker file.
    var markers = host.hasAttribute('data-lat') ? Promise.resolve(null) : fetch(host.getAttribute('data-markers')).then(function (r) { return r.json(); });
    Promise.all([load(css), load(js), markers]).then(function (all) { init(all[2]); });
  }

  function initSingle() {
    var lat = Number(host.getAttribute('data-lat')), lon = Number(host.getAttribute('data-lon'));
    // On a phone, dragging the map would trap the page scroll, so it only zooms with the buttons.
    var map = L.map(host, { scrollWheelZoom: false, dragging: !L.Browser.mobile }).setView([lat, lon], Number(host.getAttribute('data-zoom')) || 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);
    var pin = L.divIcon({
      className: 'dock-pin',
      html: '<svg width="34" height="44" viewBox="0 0 34 44" aria-hidden="true"><path d="M17 43C17 43 3 27 3 16a14 14 0 0 1 28 0c0 11-14 27-14 27z" fill="#0b2545" stroke="#fff" stroke-width="2"/><circle cx="17" cy="16" r="5.5" fill="#c9a24d"/></svg>',
      iconSize: [34, 44],
      iconAnchor: [17, 42]
    });
    L.marker([lat, lon], { icon: pin, keyboard: false, interactive: false }).addTo(map);
  }

  function init(docks) {
    if (host.hasAttribute('data-lat')) { initSingle(); return; }
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
