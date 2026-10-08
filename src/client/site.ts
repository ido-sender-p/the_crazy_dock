// Runs on every page: swaps the login/profile links by cookie, and the accessibility panel with its saved preferences.
// Browser code kept as a string: the Worker serves it as /assets/site.<hash>.js (see lib/assets.ts).
export const siteJs = `
(function () {
  if (document.cookie.split('; ').indexOf('ui_logged_in=1') === -1) return;
  var authLink = document.getElementById('auth-link');
  var profileLink = document.getElementById('profile-link');
  if (authLink) authLink.style.display = 'none';
  if (profileLink) profileLink.style.display = 'inline-flex';
})();

// A search field with data-placeholders (a JSON list of phrases) shows one of them at random on each visit.
// The page itself is cached, so the choice has to happen in the browser.
(function () {
  var inputs = document.querySelectorAll('input[data-placeholders]');
  for (var i = 0; i < inputs.length; i++) {
    try {
      var list = JSON.parse(inputs[i].getAttribute('data-placeholders'));
      if (list && list.length) inputs[i].setAttribute('placeholder', list[Math.floor(Math.random() * list.length)]);
    } catch (e) {}
  }
})();

(function () {
  var STORAGE_KEY = 'wildock-a11y';
  var toggle = document.getElementById('a11y-toggle');
  var panel = document.getElementById('a11y-panel');
  if (!toggle || !panel) return;
  var textButtons = panel.querySelectorAll('[data-a11y-text]');
  var contrastCheck = document.getElementById('a11y-contrast-check');
  var grayscaleCheck = document.getElementById('a11y-grayscale-check');
  var underlineCheck = document.getElementById('a11y-underline-check');
  var fontCheck = document.getElementById('a11y-font-check');
  var cursorCheck = document.getElementById('a11y-cursor-check');
  var guideCheck = document.getElementById('a11y-guide-check');
  var motionCheck = document.getElementById('a11y-motion-check');
  var resetBtn = document.getElementById('a11y-reset');

  var guideBar = document.createElement('div');
  guideBar.className = 'a11y-reading-guide';
  document.body.appendChild(guideBar);
  function onGuideMove(e) { guideBar.style.top = e.clientY + 'px'; }

  function load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch (e) { return {}; }
  }
  function save(prefs) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch (e) {}
  }
  function apply(prefs) {
    var cl = document.documentElement.classList;
    cl.remove(
      'a11y-text-large', 'a11y-text-larger', 'a11y-contrast', 'a11y-grayscale',
      'a11y-underline', 'a11y-readable-font', 'a11y-big-cursor', 'a11y-reduce-motion',
    );
    if (prefs.text === 'large') cl.add('a11y-text-large');
    if (prefs.text === 'larger') cl.add('a11y-text-larger');
    if (prefs.contrast) cl.add('a11y-contrast');
    if (prefs.grayscale) cl.add('a11y-grayscale');
    if (prefs.underline) cl.add('a11y-underline');
    if (prefs.font) cl.add('a11y-readable-font');
    if (prefs.cursor) cl.add('a11y-big-cursor');
    if (prefs.motion) cl.add('a11y-reduce-motion');
    textButtons.forEach(function (btn) {
      var on = (btn.getAttribute('data-a11y-text') || '') === (prefs.text || '');
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    if (contrastCheck) contrastCheck.checked = !!prefs.contrast;
    if (grayscaleCheck) grayscaleCheck.checked = !!prefs.grayscale;
    if (underlineCheck) underlineCheck.checked = !!prefs.underline;
    if (fontCheck) fontCheck.checked = !!prefs.font;
    if (cursorCheck) cursorCheck.checked = !!prefs.cursor;
    if (guideCheck) guideCheck.checked = !!prefs.guide;
    if (motionCheck) motionCheck.checked = !!prefs.motion;

    guideBar.classList.toggle('active', !!prefs.guide);
    document.removeEventListener('mousemove', onGuideMove);
    if (prefs.guide) document.addEventListener('mousemove', onGuideMove);
  }

  var prefs = load();
  apply(prefs);

  function openPanel() {
    panel.removeAttribute('hidden');
    toggle.setAttribute('aria-expanded', 'true');
    var first = panel.querySelector('button, input');
    if (first) first.focus();
  }
  function closePanel() {
    panel.setAttribute('hidden', '');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    if (panel.hasAttribute('hidden')) openPanel(); else closePanel();
  });
  // Tabbing out of the panel closes it without stealing focus back.
  panel.addEventListener('focusout', function (e) {
    var next = e.relatedTarget;
    if (next && !panel.contains(next) && next !== toggle) closePanel();
  });
  document.addEventListener('click', function (e) {
    if (panel.hasAttribute('hidden')) return;
    if (panel.contains(e.target) || toggle.contains(e.target)) return;
    closePanel();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !panel.hasAttribute('hidden')) {
      closePanel();
      toggle.focus();
    }
  });

  textButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var value = btn.getAttribute('data-a11y-text') || '';
      if (value) prefs.text = value; else delete prefs.text;
      save(prefs);
      apply(prefs);
    });
  });
  if (contrastCheck) contrastCheck.addEventListener('change', function () {
    prefs.contrast = contrastCheck.checked; save(prefs); apply(prefs);
  });
  if (grayscaleCheck) grayscaleCheck.addEventListener('change', function () {
    prefs.grayscale = grayscaleCheck.checked; save(prefs); apply(prefs);
  });
  if (underlineCheck) underlineCheck.addEventListener('change', function () {
    prefs.underline = underlineCheck.checked; save(prefs); apply(prefs);
  });
  if (fontCheck) fontCheck.addEventListener('change', function () {
    prefs.font = fontCheck.checked; save(prefs); apply(prefs);
  });
  if (cursorCheck) cursorCheck.addEventListener('change', function () {
    prefs.cursor = cursorCheck.checked; save(prefs); apply(prefs);
  });
  if (guideCheck) guideCheck.addEventListener('change', function () {
    prefs.guide = guideCheck.checked; save(prefs); apply(prefs);
  });
  if (motionCheck) motionCheck.addEventListener('change', function () {
    prefs.motion = motionCheck.checked; save(prefs); apply(prefs);
  });
  if (resetBtn) resetBtn.addEventListener('click', function () {
    prefs = {}; save(prefs); apply(prefs);
  });
})();
`;
