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
var ids = new Datastore({ filename: 'db/ids.db', autoload:true });
var pc_relation = new Datastore({ filename: 'db/pc_relation.db', autoload:true });
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

// ID Management
getID = function(itype, next){
  ids.findOne({type: itype}, function(err, curr_id){
    // Add id to ids db
    if (!curr_id){
      var info = [];
      info['type'] = itype;
      info['id'] = 0;
      var data = new ID(info);
      ids.insert(data, function(err, nid){
        if(nid) next(0);
      });
    }else{
      // Update the curr id
      var new_id = curr_id['id']+1;
      ids.update({ type: itype }, {$set: {id: new_id}}, {}, function (err, numReplaced) {
        if(numReplaced) next(new_id);
      });
    }
  });
};

// Objects
var Comment = function (comment){
  getNewID("cid", function(id){
    this.id = id;
    this.pid = comment.pid;
    this.content = comment.content;
    this.author = comment.author;
    this.date = new Date();
  });
};

var Picture = (function (){
  return function Picture(picture){
      this.id = picture.id;
      this.content = picture.content;
      this.author = picture.author;
      this.link = picture.link;
  };
}());

var ID = function(info){
  this.type = info.type;
  this.id = info.id;
};

var PCR = function(id){
  this.id = id;
  this.comments = [];
};


// Paths

// Create
addPicture = function (info, res, next){
  getID("pid", function(id){
    info['id'] = id;
    var data =  new Picture(info);
    pictures.insert(data, function (err, pic) {
      if (err) {
          res.status(409).end("Picture failed to upload.");
          return next();
      }
      // Add pc_relation (Picture - Comment)
      pcr_data = new PCR(pic['id']);
      pc_relation.insert(pcr_data, function(err, pcr){
        if (err) {
            res.status(409).end("Failed to set-up Picture elements.");
            return next();
        }
        res.json(pic);
        // res.redirect('/');
        return next();
      });
    });
  });
};

app.post('/api/picture/url/',function (req, res, next) {
  var info = req.body;
  //Add Picture to DB
  addPicture(info, res, next);
});


app.post('/api/picture/local/', upload.single('picture'), function (req, res, next) {
  var info = JSON.parse(req.body.data);
  info['link'] = req.file.path;
  console.log("here");
  //Add Picture to DB
  addPicture(info, res, next);
});

app.get('/api/picture/local/grab/', function (req, res, next) {
    console.log(req.params);
    if (req.body.id){
        res.setHeader('Content-Type', req.body.mimetype);
        res.sendFile(path.join(__dirname, req.body.link));
    }
    else res.status(404).end("Profile not set");
    next();
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
