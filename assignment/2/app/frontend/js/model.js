// Some code has been modified from Lab5
var model = (function(){
    "use strict";

    var model = {};

    var pictures = [];

    // init
    model.init = function (data){
      console.log(data);
      // fetch inital picture
      doAjax('GET', '/api/picture/' + data.url_id +'/', data, true, model.loadPicture);
      // dispatch "messageUpdated"
      //document.dispatchEvent(new CustomEvent("pictureUpdated", {'detail': pictures }));
    };

    // create
    model.uploadPicture = function (data){
        // Upload the Picture
        doAjax('POST', '/api/picture/local/', data, false, model.loadPicture);
    };

    model.urlLoadPicture = function (data){
      console.log(data);
        // Upload the Picture
        doAjax('POST', '/api/picture/url/', data, true, model.loadPicture);
    };

    // delete
    model.deletePicture = function (data){
        doAjax('DELETE', '/api/picture/' + data.id +'/', data, true, model.init);
    };

    //Change picture
    model.changePic = function (data){
      if(data.i >= 0){
        doAjax('GET', '/api/picture/next/' + data.id +'/', data, true, model.loadPicture);
      }else{
        doAjax('GET', '/api/picture/prev/' + data.id +'/', data, true, model.loadPicture);
      }
    };


    //save pics
    model.loadPicture = function(err, picture){
      // if (err) return showError(err);
      if (err) return ;
      document.dispatchEvent(new CustomEvent("pictureUpdated", {'detail': picture }));
    };

    model.loadedComments = function(err, comments){
      // if (err) return showError(err);
      if (err) return ;
      document.dispatchEvent(new CustomEvent("CommentsLoaded", {'detail': comments}));
    };

    model.reloadComments = function(){
      document.dispatchEvent(new CustomEvent("commentUpdated"));
    };

    // create msg
    model.uploadMessage = function(data){
      // Upload the Comment
      doAjax('POST', '/api/comment/', data, true, model.reloadComments);
    };

    model.loadComments = function(data){
      //Get comments
      doAjax('GET', '/api/comments/' + data.id + '/' + data.offset + '/', data, true, model.loadedComments);
    };

    // create msg
    model.deleteMessage = function(data){
        doAjax('DELETE', '/api/comment/'+ data.pid + '/' + data.mid + '/', data, true, model.reloadComments);
    };

    // Grab Local file
    model.grabLocal = function(pic){
      doAjax('GET', '/api/picture/local/grab/', pic, true, function(err, info){
        pic.link = info;
        return pic;
      });
    };

    // Ajax from Lab 6
    var doAjax = function (method, url, body, json, callback){
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function(e){
            switch(this.readyState){
                 case (XMLHttpRequest.DONE):
                  //console.log(this.status, this.responseText);
                    if (this.status === 200) {
                        if(json) return callback(null, JSON.parse(this.responseText));
                        model.grabLocal(JSON.parse(this.responseText));
                    }else{
                        return callback(this.responseText, null);
                    }
            }
        };
        xhttp.open(method, url, true);
        if (json && body){
            xhttp.setRequestHeader('Content-Type', 'application/json');
            xhttp.send(JSON.stringify(body));
        }else{
            xhttp.send(body);
        }
    };


    return model;

}());
