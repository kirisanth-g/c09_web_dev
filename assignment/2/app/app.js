var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());

var nedb = require('nedb'),
  db = new nedb({ filename: 'db/data.db', autoload: true });

app.use(express.static('frontend'));

// app.use(function (req, res, next) {
//     console.log("messages", messages);
//     console.log("users", users);
//     console.log("HTTP Response", res.statusCode);
// });

app.listen(3000, function () {
  console.log('App listening on port 3000')
});

// Paths
app.get('/api/picture/', function (req, res, next) {
  var id = req.query.id;
  if(id){
    res.json(id);
  }else{
    res.json("hello");
  }
  // Reutrn pics
  return next();
});

app.get('/api/comments/', function (req, res, next) {
  res.json("hello");
  return next();
});
