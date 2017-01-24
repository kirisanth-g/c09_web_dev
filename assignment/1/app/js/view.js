var view = (function(){
	var view = {};
	var pictures = [];
	var curr_pic_index;

	document.getElementById("upload_op").onclick = function(e){
		document.getElementById("upload").style.display = 'flex';
		document.getElementById("upload_op").style.display = 'none';
	};

	view.closeUpload = function(){
		document.getElementById("upload").style.display = 'none';
		document.getElementById("upload_op").style.display = 'flex';
	}

	document.getElementById("upload_cls").onclick = function(e){
		view.closeUpload();
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
		var data = {};
		var file;
		data.username = document.getElementById('upload_form_name').value;
		data.content = document.getElementById('upload_photo_name').value;
		var type = document.querySelector('input[name="type"]:checked').value;
		
		if (type==="URL"){
			data.link = document.getElementById("upload_url").value;
			// clean form 
			document.getElementById("upload").reset();
			view.closeUpload();
			document.dispatchEvent(new CustomEvent("uploadSubmitted", {'detail': data }));
		}else{
				//file = document.getElementById("upload_file").value;
				file = document.querySelector('input[type=file]').files[0];
				console.log(file);
			// Modified from Lab5
			if (data.username.length>0 && data.content.length>0){
				// clean form 
				document.getElementById("upload").reset();
				view.closeUpload();
				var reader = new FileReader();

				//Modified from Mozilla Developer Site
				reader.addEventListener("load", function(){
					data.link = reader.result;
					document.dispatchEvent(new CustomEvent("uploadSubmitted", {'detail': data }));
				});

				if(file){
					reader.readAsDataURL(file);
				}
			}
		}
	};

	view.insertPictures = function(pics){
		pictures = pics;
		curr_pic_index = pictures.length-1;
		view.loadPicture();
	};

	view.changePic = function(i){
		curr_pic_index = curr_pic_index + i;
		view.loadPicture();
	};

	view.checkBtn = function(){
		console.log(curr_pic_index == pictures.length-1);
		console.log(curr_pic_index == 0);
		if(curr_pic_index == pictures.length-1){
			document.getElementById('next').disabled = true;
		}
		if(curr_pic_index == 0){
			document.getElementById('prev').disabled = true;
		}
		if(0 < curr_pic_index && curr_pic_index < pictures.length-1){
			document.getElementById('next').disabled = false;
			document.getElementById('prev').disabled = false;
		}
	}

	view.loadPicture = function(){
		var container = document.getElementById("display");
		//Picture
        container.innerHTML = "";
        var pic = document.createElement('img');
        curr_pic = pictures[curr_pic_index];
        pic.className = "photo";
        pic.id = curr_pic.id;
        pic.src = curr_pic.link;
        container.append(pic);
        //Info
        var info = document.createElement('div');
        info.id = "curr_info";
        info.innerHTML = `
        	<p>${curr_pic.content} by ${curr_pic.author}</p>
        	<p>ID: ${curr_pic.id}</p`;
		container.append(info);
		//Buttons
		var btn = document.createElement('div');
		btn.innerHTML= `
		<input type="button" class="pic_button" id="prev" onclick="view.changePic(-1)" value="Previous">
		<input type="button" class="pic_button" id="del" value="Delete">
		<input type="button" class="pic_button" id="next" onclick="view.changePic(1)" value="Next">`;
		container.append(btn);
		view.checkBtn();
	};

	return view;

}());