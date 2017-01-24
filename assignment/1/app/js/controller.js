(function(model, view){
    
    // model events
    document.addEventListener('pictureUpdated', function (e) {
        view.insertPictures(e.detail);
    });

    // views events
    document.addEventListener('formSubmitted', function (e) {
         model.uploadPicture(e.detail);
    });

}(model, view))
