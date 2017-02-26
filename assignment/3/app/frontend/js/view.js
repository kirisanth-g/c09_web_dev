/* jshint esversion: 6*/
var view = (function(){
	var view = {};
	var msg_offset = 0;
	var url_data = [];
	var curr_pic;


	// --Taken form Lab5
	window.onload = function scheduler(e){
		url_data.url_id = getParameter('id');
		url_data.user_gala = getParameter('user');
		var upload = document.getElementById('upblock');

		model.getActiveUsername(function(err, username){
			console.log(url_data.user_gala, username);
			if(!url_data.user_gala){
				var all_btn = document.getElementById("all_button");
				all_btn.style.display = 'none';
			}else if(url_data.user_gala === username){
				upload.style.display = 'block';
			}else{
				upload.style.display = 'none';
			}
			document.dispatchEvent(new CustomEvent("documentLoaded", {'detail': url_data }));
		});
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
		document.getElementById('upload_url').required = false;
		document.getElementById('upload_file').required = true;
	};

	document.getElementById('url_btn').onclick = function(e){
		document.getElementById('upload_file').style.display = 'none';
		document.getElementById('upload_url').style.display = 'flex';
		document.getElementById('upload_url').required = true;
		document.getElementById('upload_file').required = false;
	};


	// Uploading Photo
	document.getElementById("upload").onsubmit = function(e){
		// prevent from refreshing the page on submit
		e.preventDefault();
		// read form elements
		var data = {};
		var file;
		data.content = document.getElementById('upload_photo_name').value;
		var type = document.querySelector('input[name="type"]:checked').value;

		if (type==="URL"){
			// Grab the external URL
			data.link = document.getElementById("upload_url").value;
			// Clean & Close Form
			document.getElementById("upload").reset();
			view.closeUpload();
			// Send out Data and Event
			var formdata = new FormData();
			formdata.append("data", JSON.stringify(data));
			document.dispatchEvent(new CustomEvent("urlLoadSubmitted", {'detail': data }));
		}else{

			file = document.querySelector('input[type=file]').files[0];
			// Check if values are entered
			// --Modified from Lab5
			// if (data.username.length>0 && data.content.length>0){
			if (true){
				// Clean & Close Form
				document.getElementById("upload").reset();
				view.closeUpload();

				// Send out data and event
				var formd = new FormData();
        formd.append("picture", file);
        formd.append("data", JSON.stringify(data));
				document.dispatchEvent(new CustomEvent("uploadSubmitted", {'detail': formd }));
			}
		}
	};

	//404
	view.set404 = function(details){
		console.log(details);
		view.clearPage();
		view.changeUrl(false);
		// var container = document.getElementsByTagName("BODY")[0];
		var e = document.getElementById("display");
		e.innerHTML = `
			<h1>404</h1>
			<h3>Image Not Found</h3>
			<p>${details}</p>`;
		document.getElementById("display").style.display = "block";
	};

	// Relaods all info and refreshed frontend to last picture
	view.loader = function(pic){
		curr_pic = pic;
		msg_offset = 0;
		view.loadElements();
	};


	// Refreshed frontend to next/prev picture
	view.changePic = function(i){
		var data = [];
		data.i = i;
		data.id = curr_pic.id;
		data.user_gala = url_data.user_gala;
		document.dispatchEvent(new CustomEvent("changePicture", {'detail': data }));
	};

	// Locks and Unlocks next/prev buttons
	// view.checkBtn = function(){
	// 	if(curr_pic_index == pictures.length-1){
	// 		document.getElementById('next').disabled = true;
	// 	}
	// 	if(curr_pic_index === 0){
	// 		document.getElementById('prev').disabled = true;
	// 	}
	// 	if(0 < curr_pic_index && curr_pic_index < pictures.length-1){
	// 		document.getElementById('next').disabled = false;
	// 		document.getElementById('prev').disabled = false;
	// 	}
	// };

	// Handles Delete Button
	view.deletePicture = function(){
		var data = {};
		data.id = curr_pic.id;
		document.dispatchEvent(new CustomEvent("delPicture", {'detail': data }));
	};

	// Loads frontend elements
	view.loadElements = function(){
		if(curr_pic){
			//load Picture
			document.getElementById("display").style.display = "block";
			view.loadPicture();
			//change url
			view.changeUrl(true);
			//load Msg Entry
			document.getElementById("msg_entry").style.display = "flex";
			view.loadMsgEntry();
			//load Msgs
			view.getComments();
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
	};

	// Loads Picture and Buttons
	view.loadPicture = function(){
		var container = document.getElementById("display");
		//Picture
		container.innerHTML = "";
		var pic = document.createElement('img');
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
		model.getActiveUsername(function(err, username){
			if (curr_pic.author!==username){
				var del_btn = document.getElementById("del");
				del_btn.style.visibility = "hidden";
			}
		});
		//view.checkBtn();
	};

	// Handles Comment Submission
	view.enterMsg = function(){
		// Grab Form Elements
		var data = {};
		data.id = curr_pic.id;
		data.content = document.getElementById('msg_content').value;
		// Clean Form
		document.getElementById("comment").reset();
		// Send Event
		document.dispatchEvent(new CustomEvent("uploadMsg", {'detail': data}));
	};

	view.getComments = function(){
		document.getElementById("messages").style.display = "flex";
		var data = [];
		data.id = curr_pic.id;
		data.offset = msg_offset;
		document.dispatchEvent(new CustomEvent("loadComs", {'detail': data}));
	};

	// Loads Comment Entry Form
	view.loadMsgEntry = function(){
		var container = document.getElementById("msg_entry");
		container.innerHTML = `
		<form class="comment_form" id="comment">
		<div class="form_title">Write a Comment</div>
		<textarea class="form_element" id="msg_content" placeholder="Comment" required></textarea>
		<input type="button" class="button" onclick="view.enterMsg()" class="btn" value="Comment">
		</form>`;
	};

	// Loads Comments
	view.loadMessages = function(messages){
		model.getActiveUsername(function(err, username){
			var container = document.getElementById("messages");
			container.innerHTML = "";
			// Create Comments
			messages.forEach(function (message){
				// create the message element
				var e = document.createElement('div');
				e.className = "message";
				e.id = message._id;
				e.innerHTML = `
				<div class="author">${message.author}</div>
				<div class="content">${message.content}</div>`;
				// Details
				var d = document.createElement('div');
				d.className = "details";
				var date = new Date(message.createdAt);
				d.innerHTML = `<div class="date">${date}</div>`;
				// add delete button
				var deleteButton = document.createElement('div');
				deleteButton.className = "delete-icon icon";
				deleteButton.onclick = function (e){
					var data = {};
					data.mid = e.target.parentNode.parentNode.id;
					data.pid = curr_pic.id;
					document.dispatchEvent(new CustomEvent("deleteMsg", {'detail': data}));
				};
				if (message.author!== username && curr_pic.author !== username){
	        deleteButton.style.visibility = "hidden";
	      }
				d.append(deleteButton);
				e.append(d);
				// add this element to the document
				container.append(e);
			});
			// Set up msg buttons
			var btn = document.createElement('div');
			btn.className = "btn_group";
			btn.innerHTML= `
			<input type="button" class="pic_button" id="msg_prev" onclick="view.changeMsg(-10)" value="<">
			<input type="button" class="pic_button" id="msg_next" onclick="view.changeMsg(10)" value=">">`;
			container.prepend(btn);
			//view.checkMsgBtn(cutoff);
		});
	};

	// Refreshed frontend to next/prev picture
	view.changeMsg = function(i){
		msg_offset = msg_offset + i;
		if(msg_offset < 0) msg_offset = 0;
		view.getComments();
	};

	// Locks and Unlocks msg next/prev buttons
	// view.checkMsgBtn = function(cutoff){
	// 	if(msg_offset === 0){
	// 		document.getElementById('msg_prev').disabled = true;
	// 	}
	// 	if(cutoff <= 10){
	// 		document.getElementById('msg_next').disabled = true;
	// 	}
	// };

	// Change url
	view.changeUrl = function(check){
		var url_link = "/";
		if(url_data.user_gala){
			url_link = "/?user=" + url_data.user_gala + "&";
		}
		if(check){
			window.history.replaceState(null, null, url_link + "?id=" + curr_pic.id.toString());
		}else{
			window.history.replaceState(null, null, url_link + "");
		}
	};

	return view;

}());
