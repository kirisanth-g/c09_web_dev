(function(model, view){
    
    // model events
    document.addEventListener('pictureUpdated', function (e) {
        view.insertPictures(e.detail);
    });

    // views events
    document.addEventListener('uploadSubmitted', function (e) {
    	console.log(e.detail);
        model.uploadPicture(e.detail);
    });

    //Taken from Lab5
    document.addEventListener('documentLoaded', function (e) {
        model.init();
    });

}(model, view))
