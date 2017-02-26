var galleries = (function(){

  var offset = 0;

  window.onload = function scheduler(e){
    var data = [];
    data.offset = offset;
    document.dispatchEvent(new CustomEvent("loadGalas", {'detail': data }));
  };

  galleries.loader = function(users){
    console.log(users);
    var container = document.getElementById("list_users");
    container.innerHTML = "";
    // Create Comments
    user.forEach(function (user){
      // create the message element
      var e = document.createElement('div');
      e.className = "user_elem";
      e.id = user;
      e.innerHTML = `
      <h3>${user}</h3>`;
    });
  };


  return galleries;

}());
