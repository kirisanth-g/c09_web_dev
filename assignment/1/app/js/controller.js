(function(model, view){
    
    // model events
    document.addEventListener('pictureUpdated', function (e) {
        view.insertPictures(e.detail);
    });

    document.addEventListener('messageUpdated', function (e) {
        view.refresh(e.detail);
    });

    // views events
    document.addEventListener('uploadSubmitted', function (e) {
        model.uploadPicture(e.detail);
    });

    document.addEventListener('delPicture', function (e) {
        model.deletePicture(e.detail);
    });

    document.addEventListener('uploadMsg', function (e) {
        var id = e.detail.id;
        delete e.detail.id;
        model.uploadMessage(e.detail, id);
    });

    document.addEventListener('deleteMsg', function (e){
        model.deleteMessage(e.detail);
    });

    //Taken from Lab5
    document.addEventListener('documentLoaded', function (e) {
        model.init();
    });

}(model, view));
