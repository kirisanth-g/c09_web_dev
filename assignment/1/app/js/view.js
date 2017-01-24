var view = (function(){

	document.getElementById("upload_op").onclick = function(e){
		document.getElementById("upload").style.display = 'flex';
		document.getElementById("upload_op").style.display = 'none';
	};

	document.getElementById("upload_cls").onclick = function(e){
		document.getElementById("upload").style.display = 'none';
		document.getElementById("upload_op").style.display = 'flex';
	};

	document.getElementById('file_btn').onclick = function(e){
		document.getElementById('upload_url').style.display = 'none';
		document.getElementById('upload_file').style.display = 'flex';
	};

	document.getElementById('url_btn').onclick = function(e){
		document.getElementById('upload_file').style.display = 'none';
		document.getElementById('upload_url').style.display = 'flex';
	};


	document.getElementById("upload").onsubmit = function(e){
		// prevent from refreshing the page on submit
		e.preventDefault();
		// read form elements
		var data;
		var file;
		data.username = document.getElementById("upload_form_name").value;
		data.content = document.getElementById("upload_photo_name").value;
		data.type = document.querySelector('input[name="type"]:checked').value;
		
		if (type==="URL"){
			file = document.getElementById("upload_url").value;
		}else{
			file = document.getElementById("upload_file").value;
		}

		// Modified from Lab5
		if (data.username.length>0 && data.content.length>0 && data.link.length>0){
			// clean form 
			document.getElementById("upload").reset();
			var reader = new FileReader();

			//Modified from Mozilla Developer Site
			reader.addEventListener("load", function(){
				data.link = reader.result;
				document.dispatchEvent(new CustomEvent("uploadSubmitted", {'detail': data }));
			}, false);

			if(file){
				reader.readAsDataURL(file);
			}
		}
	};

	return view;

}());