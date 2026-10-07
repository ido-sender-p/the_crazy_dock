// Leaflet map init (home teaser and /map). Reads its markers from the #map-data JSON block and its options
// from the container's data attributes.
// Browser code kept as a string: the Worker serves it as /assets/map.<hash>.js (see lib/assets.ts).
export const mapJs = `
(function () {
  var host = document.querySelector('[data-leaflet]');
  var dataEl = document.getElementById('map-data');
  if (!host || !dataEl || !window.L) return;
  var docks = JSON.parse(dataEl.textContent);
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
})();
`;
