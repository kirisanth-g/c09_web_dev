/* jshint esversion: 6*/
var galleries = (function(){
  var galleries = {};
  var offset = 0;

  window.onload = function scheduler(e){
    galleries.fetch();
  };

  galleries.fetch = function(){
    var data = [];
    data.offset = offset;
    document.dispatchEvent(new CustomEvent("loadGalas", {'detail': data }));
  };

  galleries.loader = function(users){
    console.log(users);
    var container = document.getElementById("list_users");
    container.innerHTML = "";
    // Create Comments
    users.forEach(function (user){
      // create the message element
      var e = document.createElement('div');
      e.className = "user_elem button";
      e.id = user;
      e.innerHTML = `
      ${user}'s Gallery`;
      e.onclick = function (e){
        galleries.selectUser(user);
      };
      container.append(e);
    });
    // Set up gallary buttons
    var btn = document.createElement('div');
    btn.className = "btn_group";
    btn.innerHTML= `
    <input type="button" class="pic_button" id="gala_prev" onclick="galleries.changeGalas(-10)" value="<">
    <input type="button" class="pic_button" id="gala_next" onclick="galleries.changeGalas(10)" value=">">`;
    container.append(btn);
  };

  galleries.selectUser = function(user){
    window.location.href = '/?user=' + user;
    console.log(user);
  };

  // Refreshed frontend to next/prev picture
  galleries.changeGalas = function(i){
    offset = offset + i;
    if(offset < 0) offset = 0;
    galleries.fetch();
  };


  return galleries;

}());
