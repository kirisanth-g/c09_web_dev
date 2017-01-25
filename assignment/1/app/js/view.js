var view = (function(){
	var view = {};
	var pictures = [];
	var curr_pic_index;

	//Taken form Lab5
	window.onload = function scheduler(e){
        document.dispatchEvent(new Event("documentLoaded"));
    };
    

	document.getElementById("upload_op").onclick = function(e){
		document.getElementById("upload").style.display = 'flex';
		document.getElementById("upload_op").style.display = 'none';
	};

	view.closeUpload = function(){
		document.getElementById("upload").style.display = 'none';
		document.getElementById("upload_op").style.display = 'flex';
	};

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
		data.author = document.getElementById('upload_form_name').value;
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
		view.loadElements();
	};

	view.refresh = function(pics){
		pictures = pics;
		view.loadElements();
	}

	view.changePic = function(i){
		curr_pic_index = curr_pic_index + i;
		view.loadElements();
	};

	view.checkBtn = function(){
		if(curr_pic_index == pictures.length-1){
			document.getElementById('next').disabled = true;
		}
		if(curr_pic_index === 0){
			document.getElementById('prev').disabled = true;
		}
		if(0 < curr_pic_index && curr_pic_index < pictures.length-1){
			document.getElementById('next').disabled = false;
			document.getElementById('prev').disabled = false;
		}
	};

	view.deletePicture = function(){
		var data = {};
		data.id = pictures[curr_pic_index].id;
		document.dispatchEvent(new CustomEvent("delPicture", {'detail': data }));
	};

	view.loadElements = function(){
		if(pictures.length > 0){
			//load Picture
			view.loadPicture();
			//load Msg Entry
			view.loadMsgEntry();
			//load Msgs
			view.loadMessages();
		}else{
			//Picture
			document.getElementById("display").innerHTML = "";
        	//Msg Entry
        	document.getElementById("msg_entry").innerHTML = "";
        	//Msgs
        	document.getElementById("messages").innerHTML = "";
		}
	};

	view.loadPicture = function(){
		var container = document.getElementById("display");
		//Picture
        container.innerHTML = "";
        var pic = document.createElement('img');
        var curr_pic = pictures[curr_pic_index];
        console.log(pictures);
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
		<input type="button" class="pic_button" id="del" onclick="view.deletePicture()" value="Delete">
		<input type="button" class="pic_button" id="next" onclick="view.changePic(1)" value="Next">`;
		container.append(btn);
		view.checkBtn();
	};

	view.enterMsg = function(){
		console.log("hello");
		var data = {};
		data.id = pictures[curr_pic_index].id;
		data.msgauthor = document.getElementById('msg_name').value;
		data.msgcontent = document.getElementById('msg_content').value;
		// clean form 
		document.getElementById("comment").reset();
		document.dispatchEvent(new CustomEvent("uploadMsg", {'detail': data}));
	};


	view.loadMsgEntry = function(){
		var container = document.getElementById("msg_entry");
        container.innerHTML = `
        <form class="comment_form" id="comment">
		<div class="form_title">Write a Comment</div>
		<input class="form_element" id="msg_name" placeholder="Enter your name"></input>
		<input class="form_element" id="msg_content" placeholder="Comment"></input>
		<input type="button" class="button" onclick="view.enterMsg()" class="btn" value="Comment">
		</form>`;
	};


	view.loadMessages = function(){
		var container = document.getElementById("messages");
		container.innerHTML = "";
        var messages = pictures[curr_pic_index].messages;
        console.log(messages);
        messages.forEach(function (message){
        	// create the message element
            var e = document.createElement('div');
            e.className = "message";
            e.id = message.mid;
            e.innerHTML = `
                    <div class="author">${message.msgauthor}</div>
                    <div class="content">${message.msgcontent}</div>`;
            // add delete button
            var deleteButton = document.createElement('div');
            deleteButton.className = "delete-icon icon";
            deleteButton.onclick = function (e){
            	var data = {};
            	data.mid = parseInt(e.target.parentNode.id);
            	data.id = pictures[curr_pic_index].id;
                document.dispatchEvent(new CustomEvent("deleteMsg", {'detail': data}));
            };
            e.append(deleteButton); 
            // add this element to the document
            container.prepend(e);
        });
	};

	return view;

}());