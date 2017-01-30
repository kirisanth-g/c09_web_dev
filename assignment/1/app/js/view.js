var view = (function(){
	var view = {};
	var pictures = [];
	var curr_pic_index;
	var msg_offset;
	var url_id;


	// --Taken form Lab5
	window.onload = function scheduler(e){
		url_id = getParameter('id');
		document.dispatchEvent(new Event("documentLoaded"));
	};


	// Taken form Techincal Overload
	function getParameter(theParameter) { 
		var params = window.location.search.substr(1).split('&');
		for (var i = 0; i < params.length; i++) {
			var p=params[i].split('=');
			if (p[0] == theParameter) {
				return decodeURIComponent(p[1]);
			}
		}
		return false;
	}


	// Open Upload Photo Form
	document.getElementById("upload_op").onclick = function(e){
		document.getElementById("upload").style.display = 'flex';
		document.getElementById("upload_op").style.display = 'none';
	};


	// Close Upload Photo Form
	view.closeUpload = function(){
		document.getElementById("upload").style.display = 'none';
		document.getElementById("upload_op").style.display = 'flex';
	};

	document.getElementById("upload_cls").onclick = function(e){
		view.closeUpload();
	};


	// Swap view for URL & File Upload
	document.getElementById('file_btn').onclick = function(e){
		document.getElementById('upload_url').style.display = 'none';
		document.getElementById('upload_file').style.display = 'flex';
	};

	document.getElementById('url_btn').onclick = function(e){
		document.getElementById('upload_file').style.display = 'none';
		document.getElementById('upload_url').style.display = 'flex';
	};


	// Uploading Photo
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
			// Grab the external URL
			data.link = document.getElementById("upload_url").value;
			// Clean & Close Form 
			document.getElementById("upload").reset();
			view.closeUpload();
			// Send out Event
			document.dispatchEvent(new CustomEvent("uploadSubmitted", {'detail': data }));
		}else{

			file = document.querySelector('input[type=file]').files[0];
			// Check if values are entered
			// --Modified from Lab5
			if (data.username.length>0 && data.content.length>0){
				// Clean & Close Form 
				document.getElementById("upload").reset();
				view.closeUpload();

				// Read Uploaded File into Memory
				var reader = new FileReader();
				// --Modified from Mozilla Developer Site
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

	//Find index of picture
	findIndex = function(id){
		for (var i = 0; i < pictures.length; i++){
			if(pictures[i].id == id){
				return i;
			}
		}
	}

	//404
	view.set404 = function(){
		view.clearPage();
		view.changeUrl(false);
		// var container = document.getElementsByTagName("BODY")[0];
		var e = document.getElementById("display");
		e.style.display = "flex";
		e.innerHTML = `
			<h1>404</h1>
			<h3>Image Not Found</h3>`;
	}

	// Relaods all info and refreshed frontend to last picture
	view.insertPictures = function(pics){
		pictures = pics;
		if(url_id){
			var id = findIndex(url_id);
			console.log("found", id);
			url_id ='';
			if(id >= 0){
				curr_pic_index = id;
			}
			//404
			else{
				return view.set404();
			}		
		}else{
			curr_pic_index = pictures.length-1;
		}
		console.log("next", curr_pic_index);
		msg_offset = 0;
		view.loadElements();
	};

	// Relaods all info and refreshed frontend
	view.refresh = function(pics){
		pictures = pics;
		view.loadElements();
	}

	// Refreshed frontend to next/prev picture
	view.changePic = function(i){
		curr_pic_index = curr_pic_index + i;
		view.loadElements();
	};

	// Locks and Unlocks next/prev buttons
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

	// Handles Delete Button
	view.deletePicture = function(){
		var data = {};
		data.id = pictures[curr_pic_index].id;
		document.dispatchEvent(new CustomEvent("delPicture", {'detail': data }));
	};

	// Loads frontend elements
	view.loadElements = function(){
		if(pictures.length > 0){
			//load Picture
			document.getElementById("display").style.display = "block";
			view.loadPicture();
			//load Msg Entry
			document.getElementById("msg_entry").style.display = "flex";
			view.loadMsgEntry();
			//load Msgs
			document.getElementById("messages").style.display = "flex";
			view.loadMessages();
			//change url
			view.changeUrl(true);
		}else{
			view.clearPage();
		}
	};

	view.clearPage = function (){
			//Picture
			document.getElementById("display").style.display = "none";
			//Msg Entry
			document.getElementById("msg_entry").style.display = "none";
			//Msgs
			document.getElementById("messages").style.display = "none";
	}

	// Loads Picture and Buttons
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
		<h1>${curr_pic.content}</h1>
		<p>by ${curr_pic.author}</p>`;
		container.append(info);
		//Buttons
		var btn = document.createElement('div');
		btn.className = "btn_group";
		btn.innerHTML= `
		<input type="button" class="pic_button" id="prev" onclick="view.changePic(-1)" value="<">
		<input type="button" class="pic_button" id="del" onclick="view.deletePicture()" value="x">
		<input type="button" class="pic_button" id="next" onclick="view.changePic(1)" value=">">`;
		container.append(btn);
		view.checkBtn();
	};

	// Handles Comment Submission
	view.enterMsg = function(){
		// Grab Form Elements
		var data = {};
		data.id = pictures[curr_pic_index].id;
		data.msgauthor = document.getElementById('msg_name').value;
		data.msgcontent = document.getElementById('msg_content').value;
		// Clean Form 
		document.getElementById("comment").reset();
		// Send Event
		document.dispatchEvent(new CustomEvent("uploadMsg", {'detail': data}));
	};

	// Loads Comment Entry Form
	view.loadMsgEntry = function(){
		var container = document.getElementById("msg_entry");
		container.innerHTML = `
		<form class="comment_form" id="comment">
		<div class="form_title">Write a Comment</div>
		<input class="form_element" id="msg_name" placeholder="Enter your name"></input>
		<textarea class="form_element" id="msg_content" placeholder="Comment"></textarea>
		<input type="button" class="button" onclick="view.enterMsg()" class="btn" value="Comment">
		</form>`;
	};

	// Loads Comments
	view.loadMessages = function(){
		var container = document.getElementById("messages");
		container.innerHTML = "";
		// Get the latest 10 comments
		var messages = pictures[curr_pic_index].messages;
		var len_msg = messages.length;
		// Remove element if there is no comments
		if (len_msg ===0){
			document.getElementById("messages").style.display = "none";
		}
		var cutoff = len_msg - msg_offset;
		// If the last comment on the comment page is deleted, move to previous page
		if(cutoff <= 0){
			return view.changeMsg(-10);
		}
		messages = messages.slice(0, cutoff).slice(-10);
		// Create Comments
		messages.forEach(function (message){
			// create the message element
			var e = document.createElement('div');
			e.className = "message";
			e.id = message.mid;
			e.innerHTML = `
			<div class="author">${message.msgauthor}</div>
			<div class="content">${message.msgcontent}</div>`;
			// Details
			var d = document.createElement('div');
			d.className = "details"
			d.innerHTML = `<div class="date">${message.date}</div>`;
			// add delete button
			var deleteButton = document.createElement('div');
			deleteButton.className = "delete-icon icon";
			deleteButton.onclick = function (e){
				var data = {};
				data.mid = parseInt(e.target.parentNode.parentNode.id);
				data.id = pictures[curr_pic_index].id;
				document.dispatchEvent(new CustomEvent("deleteMsg", {'detail': data}));
			};
			d.append(deleteButton); 
			e.append(d);
			// add this element to the document
			container.prepend(e);
		});
		// Set up msg buttons
		var btn = document.createElement('div');
		btn.className = "btn_group";
		btn.innerHTML= `
		<input type="button" class="pic_button" id="msg_prev" onclick="view.changeMsg(-10)" value="<">
		<input type="button" class="pic_button" id="msg_next" onclick="view.changeMsg(10)" value=">">`;
		container.prepend(btn);
		view.checkMsgBtn(cutoff);
	};

	// Refreshed frontend to next/prev picture
	view.changeMsg = function(i){
		msg_offset = msg_offset + i;
		console.log(msg_offset);
		view.loadMessages();
	};

	// Locks and Unlocks msg next/prev buttons
	view.checkMsgBtn = function(cutoff){
		if(msg_offset === 0){
			document.getElementById('msg_prev').disabled = true;
		}
		if(cutoff <= 10){
			document.getElementById('msg_next').disabled = true;
		}
	};

	// Change url
	view.changeUrl = function(check){
		if(check){
			window.history.replaceState(null, null, "/?id=" + pictures[curr_pic_index].id.toString());
		}else{
			window.history.replaceState(null, null, "");
		}
	}

	return view;

}());