var model = (function(){
    "use strict";
    
    var model = {};
    var msg = "";

    model.createMessage = function(message){
    	msg = message;
    	// create event
	    var event = new CustomEvent("onNewMessage", {
	    	detail: {
	    		message: msg}});
	    document.dispatchEvent(event);
    };
    return model;
    
}());