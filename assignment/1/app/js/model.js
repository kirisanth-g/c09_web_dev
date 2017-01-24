// Some code has been modified from Lab5
var model = (function(){
    "use strict";
    
    var model = {};

    var pictures = [];

    // Message constructor
    var Message = (function (){
        var id = 0;
        return function Message(message){
            if (message.id){
                this.id = message.id;
                id = (message.id>=id)? message.id+1 : id;
            }else{
                this.id = id++;
            }
            this.content = message.content;
            this.author = message.author;
            this.date = new Date();
        }
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
            this.author = picture.username;
            this.link = picture.link;
            this.messages = [];
        }
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
    }

    // create
    model.uploadPicture = function (data){
        // create the message
        var picture = new Picture(data);
        pictures.push(picture);
        // update the local storage and dispatch "messageUpdated"
        localStorage.setItem("pictures", JSON.stringify(pictures));
        document.dispatchEvent(new CustomEvent("pictureUpdated", {'detail': pictures }));
    };
    
    return model;

}())