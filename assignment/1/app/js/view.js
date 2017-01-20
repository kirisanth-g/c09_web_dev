var view = (function(){

	document.getElementById("upload_op").onclick = function(e){
	    // prevent from refreshing the page on submit
	    e.preventDefault();
	    document.getElementById("upload").style.display = 'flex';
	    document.getElementById("upload_op").style.display = 'none'
    };

    document.getElementById("upload_cls").onclick = function(e){
	    // prevent from refreshing the page on submit
	    e.preventDefault();
	    document.getElementById("upload").style.display = 'none';
	    document.getElementById("upload_op").style.display = 'flex'
    };

	return view;

}());