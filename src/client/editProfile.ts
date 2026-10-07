// Avatar preview on the edit-profile page.
// Browser code kept as a string: the Worker serves it as /assets/editProfile.<hash>.js (see lib/assets.ts).
export const editProfileJs = `
(function () {
  var input = document.getElementById('avatar');
  if (!input) return;
  input.addEventListener('change', function () {
    var file = input.files && input.files[0];
    if (!file) return;
    var label = document.getElementById('avatar-picker-label');
    if (label) label.textContent = file.name;
    var prev = document.getElementById('avatar-preview');
    if (!prev || !file.type || file.type.indexOf('image/') !== 0) return;
    var url = URL.createObjectURL(file);
    if (prev.tagName === 'IMG') {
      prev.src = url;
    } else {
      var img = document.createElement('img');
      img.className = 'avatar-preview';
      img.id = 'avatar-preview';
      img.alt = '';
      img.src = url;
      prev.replaceWith(img);
    }
  });
})();
`;
