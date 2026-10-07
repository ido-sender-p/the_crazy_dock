// Photo picker label, drag-and-drop highlight and preview on the add-photo page.
// Browser code kept as a string: the Worker serves it as /assets/addPhoto.<hash>.js (see lib/assets.ts).
export const addPhotoJs = `
(function () {
  var input = document.getElementById('photo');
  var zone = document.getElementById('photo-dropzone');
  var label = document.getElementById('photo-filename');
  if (!input || !zone || !label) return;
  input.addEventListener('change', function () {
    label.textContent = input.files && input.files[0] ? input.files[0].name : 'Click to upload a photo';
  });
  ['dragover', 'dragenter'].forEach(function (evt) {
    zone.addEventListener(evt, function (e) { e.preventDefault(); zone.classList.add('drag'); });
  });
  ['dragleave', 'drop'].forEach(function (evt) {
    zone.addEventListener(evt, function (e) { e.preventDefault(); zone.classList.remove('drag'); });
  });
  zone.addEventListener('drop', function (e) {
    var dropped = e.dataTransfer && e.dataTransfer.files;
    if (!dropped || !dropped.length) return;
    var dt = new DataTransfer();
    dt.items.add(dropped[0]);
    input.files = dt.files;
    label.textContent = dropped[0].name;
  });
})();
`;
