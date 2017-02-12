// Some code has been modified from Lab5
var model = (function(){
    "use strict";

    var model = {};

    var pictures = [];

    // Message constructor
    var Message = (function (){
        var mid = 0;
        return function Message(message){
            if (message.mid){
                this.mid = message.mid;
                mid = (message.mid>=mid)? message.mid+1 : mid;
            }else{
                this.mid = mid++;
            }
            this.msgcontent = message.msgcontent;
            this.msgauthor = message.msgauthor;
            this.date = new Date();
        };
    }());

    // Picture constructor
    var Picture = (function (){
        var id = 0;
        return function Picture(picture){
            if (picture.id){
                this.id = picture.id;
                id = (picture.id>=id)? picture.id+1 : id;
            }else{
                this.id = id++;
            }
            this.content = picture.content;
            this.author = picture.author;
            this.link = picture.link;
            if(picture.messages){
                this.messages = picture.messages.map(function(msg){
                    return new Message(msg);
                });
            }else{
                this.messages = new Array();
            }
        };
    }());

    // init

    model.init = function (){
        // fetch data from the local store
        var data = localStorage.getItem("pictures");
        if (data){
            pictures = JSON.parse(data).map(function(pic){
                return new Picture(pic);
            });
        }
        // dispatch "messageUpdated"
        document.dispatchEvent(new CustomEvent("pictureUpdated", {'detail': pictures }));
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
        // select and delete message
        pictures = pictures.filter(function(e){
            return (e.id !== data.id);
        });
        model.savePics();
    };

    // save
    // model.saveToLocal = function(event){
    //     // update the local storage and dispatch "messageUpdated"
    //     localStorage.setItem("pictures", JSON.stringify(pictures));
    //     document.dispatchEvent(event);
    // };

    //save pics
    model.loadPicture = function(err, picture){
      console.log(err, picture);
      if (err) return showError(err);
      document.dispatchEvent(new CustomEvent("pictureUpdated", {'detail': picture }));
    };

    //save msg
    model.saveMsg = function(){
        model.saveToLocal(new CustomEvent("messageUpdated", {'detail': pictures }));
    };

    // create msg
    model.uploadMessage = function(data, id){
        // select and delete message
        var picture = pictures.filter(function(e){
            return (e.id === id);
        });
        picture = picture[0];
        picture.messages.push(new Message(data));
        model.saveMsg();
    };

    // create msg
    model.deleteMessage = function(data){
        // select and delete message
        var picture = pictures.filter(function(e){
            return (e.id === data.id);
        });
        picture = picture[0];
        picture.messages = picture.messages.filter(function(me){
            return(me.mid !== data.mid);
        });
        model.saveMsg();
    };

    // Grab Local file
    model.grabLocal = function(pic){
      console.log(pic);
      doAjax('GET', '/api/picture/local/grab/', pic, true, function(err, info){
        console.log(info);
        pic.link = info;
        return pic;
      });
    }

    // Ajax from Lab 6
    var doAjax = function (method, url, body, json, callback){
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function(e){
            switch(this.readyState){
                 case (XMLHttpRequest.DONE):
                  console.log(this.status, this.responseText);
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
