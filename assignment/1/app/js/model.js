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
        return function Picture(message){
            if (message.id){
                this.id = message.id;
                id = (message.id>=id)? message.id+1 : id;
            }else{
                this.id = id++;
            }
            this.content = message.content;
            this.author = message.author;
            this.link = message.link;
            this.messages = [];
        }
    }());


    // create
    model.uploadPicture = function (data){
        // create the message
        var picture = new Message(data);
        pictures.push(message);
        // update the local storage and dispatch "messageUpdated"
        localStorage.setItem("pictures", JSON.stringify(pictures));
        document.dispatchEvent(new CustomEvent("pictureUpdated", {'detail': pictures }));
    };
    

}())