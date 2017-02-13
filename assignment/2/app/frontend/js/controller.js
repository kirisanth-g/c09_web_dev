(function(model, view){

    // model events
    document.addEventListener('pictureUpdated', function (e) {
      console.log(e);
      view.loader(e.detail);
    });

    document.addEventListener('commentUpdated', function (e) {
      console.log("reloading comments");
      view.getComments();
    });

    document.addEventListener('CommentsLoaded', function (e) {
      console.log("done loading comments");
        view.loadMessages(e.detail);
    });

    // views events
    document.addEventListener('uploadSubmitted', function (e) {
        console.log(e);
        model.uploadPicture(e.detail);
    });

    document.addEventListener('urlLoadSubmitted', function (e) {
        model.urlLoadPicture(e.detail);
    });

    document.addEventListener('delPicture', function (e) {
        model.deletePicture(e.detail);
    });

    document.addEventListener('uploadMsg', function (e) {
      model.uploadMessage(e.detail);
    });

    document.addEventListener('deleteMsg', function (e){
        model.deleteMessage(e.detail);
    });

    //Taken from Lab5
    document.addEventListener('documentLoaded', function (e) {
      model.init(e.detail);
    });

    document.addEventListener('loadComs', function (e) {
      model.loadComments(e.detail);
    });

    document.addEventListener('changePicture', function (e) {
      model.changePic(e.detail);
    });

}(model, view));
