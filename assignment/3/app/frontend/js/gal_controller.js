(function(model, galleries){

  // model events
  document.addEventListener('loadedGalas', function (e) {
    galleries.loader(e.detail);
  });

  // gallaries events
  document.addEventListener('loadGalas', function (e) {
      model.loadUsers(e.detail);
  });

}(model, galleries));
