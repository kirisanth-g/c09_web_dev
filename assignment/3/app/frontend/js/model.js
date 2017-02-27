// Some code has been modified from Lab5
var model = (function(){
    "use strict";

    var model = {};

    // init
    model.init = function (data){
      console.log("init", data);
      // fetch inital picture
      if (data.user_gala){
        doAjax('GET', '/api/picture/gallery/' + data.user_gala +'/', data, true, model.loadPicture);
      }else {
        doAjax('GET', '/api/picture/' + data.url_id +'/', data, true, model.loadPicture);
      }
    };

    // signUp, signIn and signOut

    // model.signOut = function(callback){
    //     doAjax('DELETE', '/api/signout/', null, false, callback);
    // };

    model.signIn = function(data, callback){
      console.log("model");
        doAjax('POST', '/api/signin/', data, true, function(err, user){
            if (err) return callback(err, user);
            // update the local storage with username
            localStorage.setItem("user", JSON.stringify(user.username));
            callback(null, user);
        });
    };

    // create

     model.createUser = function(data, callback){
         doAjax('PUT', '/api/users/', data, true, callback);
     };


    // create
    model.uploadPicture = function (data){
      // Upload the Picture
      doAjax('POST', '/api/picture/local/', data, false, model.reloadPicture);
    };

    model.urlLoadPicture = function (data){
      model.getActiveUsername(function(err, username){
        data.author = username;
        console.log(data, data.author);
        // Upload the Picture
        doAjax('POST', '/api/picture/url/', data, true, model.loadPicture);
      });
    };

    model.reloadPicture = function(err, data){
      var info = [];
      if (data) info = JSON.parse(data);
      if (err) return document.dispatchEvent(new CustomEvent("404", {'detail': err })) ;
      doAjax('GET', '/api/picture/' + info.id +'/', data, true, model.loadPicture);
    };

    // delete
    model.deletePicture = function (data){
      doAjax('DELETE', '/api/picture/' + data.id +'/', data, true, function(err, data){
        model.reloadPicture(err);
      });
    };

    //Change picture
    model.changePic = function (data){
      var api_link = "";
      if(data.user_gala){
        api_link = "/" + data.user_gala;
      }
      if(data.i >= 0){
        doAjax('GET', '/api/picture' + api_link + '/next/' + data.id +'/', data, true, model.loadPicture);
      }else{
        doAjax('GET', '/api/picture' + api_link + '/prev/' + data.id +'/', data, true, model.loadPicture);
      }
    };


    //save pics
    model.loadPicture = function(err, picture){
      if (err) return document.dispatchEvent(new CustomEvent("404", {'detail': err })) ;
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
      model.getActiveUsername(function(err, username){
        data.author = username;
        doAjax('POST', '/api/comment/', data, true, model.reloadComments);
      });
    };

    model.loadComments = function(data){
      //Get comments
      doAjax('GET', '/api/comments/' + data.id + '/' + data.offset + '/10', data, true, model.loadedComments);
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

    // Grab users
    model.loadUsers = function(data){
      //Get comments
      doAjax('GET', '/api/users/galleried/' + data.offset + '/10', data, true, model.loadedUsers);
    };

    model.loadedUsers = function(err, comments){
      if (err) return ;
      document.dispatchEvent(new CustomEvent("LoadedGalas", {'detail': comments}));
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
                        return callback(null, this.responseText);
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

    model.getActiveUsername = function(callback){
      var data = localStorage.getItem("user");
      if (data){
          var username = JSON.parse(data);
          return callback(null, username);
      }
      return callback("No active user", null);
    };

    return model;

}());
