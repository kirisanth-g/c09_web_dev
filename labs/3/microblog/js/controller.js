(function(){
    "use strict";

    var msg = "";
    
    document.addEventListener("onFormSubmit", function(e){
     	console.log(e.detail);
     	msg = e.detail.message;
     	model.createMessage(msg);
    });

    document.addEventListener("onNewMessage", function(e){
     	console.log(e.detail);
     	msg = e.detail.message;
     	view.insertMessage(msg);
    });
    
}());