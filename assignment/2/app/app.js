var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());


var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });

// Setup NEDB
var Datastore = require('nedb');
var comments = new Datastore({ filename: 'db/comments.db', autoload: true, timestampData : true});
var pictures = new Datastore({ filename: 'db/pictures.db', autoload: true });
pictures.ensureIndex({fieldName: 'id', unique:true});


app.use(express.static('frontend'));

// app.use(function (req, res, next) {
//     console.log("messages", messages);
//     console.log("users", users);
//     console.log("HTTP Response", res.statusCode);
// });

app.listen(3000, function () {
  console.log('App listening on port 3000');
});

// Objects
var Comment = (function (){
    var id = 0;
    return function Comment(comment){
        this.id = cid++;
        this.pid = comment.pid;
        this.content = comment.content;
        this.author = comment.author;
        this.date = new Date();
    };
}());

var Picture = (function (){
    var id = 0;
    return function Picture(picture){
        this.id = id++;
        this.content = picture.content;
        this.author = picture.author;
        this.link = picture.link;
    };
})();

// Paths

// Create
app.post('/api/picture/', upload.single('picture'), function (req, res, next) {
  var info = JSON.parse(req.body.data);
  info['link'] = req.file.path;
  var data = new Picture(info);
  console.log(data);
  pictures.insert(data, function (err, pic) {
        if (err) {
            console.log(err);
            res.status(409).end("Picture failed to upload.");
            return next();
        }
        res.json(pic);
        // res.redirect('/');
        return next();
    });
});

// Reads
app.get('/api/picture/:id/', function (req, res, next) {
  var id = req.params.id;
  if (id) {
    res.json(id);
  } else {
    res.json("hello");
  }
  // Reutrn pics
  return next();
});

app.get('/api/comments/', function (req, res, next) {
  res.json("hello");
  return next();
});
