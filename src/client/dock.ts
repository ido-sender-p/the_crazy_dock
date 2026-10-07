// Dock page: hero lightbox, gallery lightbox, rating, comments. Reads the photos from the #dock-data JSON block.
// Browser code kept as a string: the Worker serves it as /assets/dock.<hash>.js (see lib/assets.ts).

// Shared by both lightboxes: keep Tab inside the open dialog.
const focusTrapJs = `
  function focusables(box) {
    return Array.prototype.slice.call(
      box.querySelectorAll('button, a[href], textarea, input, select, [tabindex]:not([tabindex="-1"])'),
    ).filter(function (el) { return !el.disabled && el.getClientRects().length > 0; });
  }
  function trapTab(box, e) {
    if (e.key !== 'Tab') return;
    var f = focusables(box);
    if (!f.length) return;
    var first = f[0];
    var last = f[f.length - 1];
    var outside = !box.contains(document.activeElement);
    if (e.shiftKey && (document.activeElement === first || outside)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (document.activeElement === last || outside)) {
      e.preventDefault();
      first.focus();
    }
  }
`;

const heroLightboxJs = `
  (function () {
    var openBtn = document.getElementById('hero-open');
    var box = document.getElementById('hero-lightbox');
    var closeBtn = document.getElementById('hero-close');
    if (!openBtn || !box || !closeBtn) return;
    var opener = null;
    ${focusTrapJs}
    function open() {
      opener = document.activeElement;
      box.classList.add('open');
      closeBtn.focus();
    }
    function close() {
      box.classList.remove('open');
      if (opener && opener.focus) opener.focus();
      opener = null;
    }
    openBtn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else trapTab(box, e);
    });
  })();
`;

const galleryJs = `
    (function () {
      var dataEl = document.getElementById('dock-data');
      if (!dataEl) return;
      var data = JSON.parse(dataEl.textContent);
      var photos = data.photos;
      var dockSlug = data.slug;
      var box = document.getElementById('gallery-lightbox');
      var img = document.getElementById('lb-img');
      var caption = document.getElementById('lb-caption');
      var titleEl = document.getElementById('lb-title');
      var leaderTag = document.getElementById('lb-leader');
      var feedback = document.getElementById('lb-feedback');
      var ratingButtons = document.querySelectorAll('.rating-row button');
      var commentsList = document.getElementById('lb-comments-list');
      var commentInput = document.getElementById('lb-comment-input');
      var commentSubmit = document.getElementById('lb-comment-submit');
      var closeBtn = document.getElementById('lb-close');
      if (!box || !img || !caption || !closeBtn || !photos.length) return;
      var index = 0;
      var opener = null;
      ${focusTrapJs}
      function say(msg, bad) {
        if (!feedback) return;
        feedback.textContent = msg;
        feedback.classList.toggle('bad', !!bad);
      }
      function isTyping(t) {
        return !!t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable);
      }
      // Rejects with a message that is safe to show the visitor.
      function api(url, opts) {
        return fetch(url, opts).then(
          function (r) {
            if (r.status === 401) throw new Error('Please log in again');
            if (r.status === 429) throw new Error('Slow down a little, you have reached a limit. Try again later.');
            if (r.status === 404) throw new Error('This photo is no longer available.');
            if (!r.ok) throw new Error('Something went wrong. Please try again.');
            return r.json();
          },
          function () { throw new Error('Network problem. Check your connection and try again.'); },
        );
      }

      function renderComments(comments) {
        if (!commentsList) return;
        commentsList.textContent = '';
        if (!comments.length) {
          var empty = document.createElement('div');
          empty.className = 'lb-comments-empty';
          empty.textContent = 'No comments yet.';
          commentsList.appendChild(empty);
          return;
        }
        comments.forEach(function (c) {
          var row = document.createElement('div');
          row.className = 'lb-comment';
          var who = document.createElement('span');
          who.className = 'who';
          who.textContent = c.username;
          row.appendChild(who);
          row.appendChild(document.createTextNode(c.body));
          commentsList.appendChild(row);
        });
        commentsList.scrollTop = commentsList.scrollHeight;
      }

      function loadComments() {
        var p = photos[index];
        api('/docks/' + dockSlug + '/photos/' + p.id + '/comments')
          .then(function (data) {
            if (photos[index] === p) renderComments(data.comments || []);
          })
          .catch(function () {
            if (photos[index] !== p || !commentsList) return;
            commentsList.textContent = 'Could not load comments.';
          });
      }

      if (commentSubmit && commentInput) {
        commentSubmit.addEventListener('click', function () {
          var text = commentInput.value.trim();
          if (!text) return;
          var p = photos[index];
          api('/docks/' + dockSlug + '/photos/' + p.id + '/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ body: text }),
          })
            .then(function (data) {
              if (!data.comment) { say('Could not post your comment.', true); return; }
              commentInput.value = '';
              say('');
              if (photos[index] === p) loadComments();
            })
            .catch(function (err) { say(err.message, true); });
        });
      }
      // No counts or scores are ever shown. Only whether this photo is the
      // current #1 (isTop, decided server-side), and which number, if any,
      // the viewer themselves already picked.
      function markSelected(value) {
        ratingButtons.forEach(function (btn) {
          var on = Number(btn.dataset.value) === value;
          btn.classList.toggle('selected', on);
          btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
      }
      function updateRatingUI() {
        var p = photos[index];
        if (leaderTag) leaderTag.classList.toggle('show', !!p.isTop);
        say('');
        markSelected(p.yourRating);
      }
      function show(i) {
        index = (i + photos.length) % photos.length;
        img.src = photos[index].image_url;
        img.alt = photos[index].title;
        if (titleEl) titleEl.textContent = photos[index].title;
        caption.textContent = photos[index].caption;
        updateRatingUI();
        loadComments();
      }
      function open(i) {
        opener = document.activeElement;
        show(i);
        box.classList.add('open');
        closeBtn.focus();
      }
      function close() {
        box.classList.remove('open');
        if (opener && opener.focus) opener.focus();
        opener = null;
      }
      document.querySelectorAll('.gallery-tile').forEach(function (tile) {
        tile.addEventListener('click', function () { open(Number(tile.dataset.index)); });
      });
      closeBtn.addEventListener('click', close);
      document.getElementById('lb-prev').addEventListener('click', function () { show(index - 1); });
      document.getElementById('lb-next').addEventListener('click', function () { show(index + 1); });
      box.addEventListener('click', function (e) { if (e.target === box) close(); });
      document.addEventListener('keydown', function (e) {
        if (!box.classList.contains('open')) return;
        if (e.key === 'Escape') { close(); return; }
        trapTab(box, e);
        if (isTyping(e.target)) return;
        if (e.key === 'ArrowLeft') show(index - 1);
        if (e.key === 'ArrowRight') show(index + 1);
      });
      ratingButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var p = photos[index];
          var rating = Number(btn.dataset.value);
          api('/docks/' + dockSlug + '/photos/' + p.id + '/vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rating: rating }),
          })
            .then(function () {
              p.yourRating = rating;
              if (photos[index] !== p) return;
              markSelected(rating);
              say('Thanks for rating!');
            })
            .catch(function (err) { say(err.message, true); });
        });
      });
    })();
`;

export const dockJs = heroLightboxJs + "\n" + galleryJs;
