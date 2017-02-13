var express = require('express');
var app = express();
var path = require('path');

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
  this.pid = comment.id;
  this.content = comment.content;
  this.author = comment.author;
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
        //res.redirect('/?id=' + pic['id']);
        return next();
      });
    });
  });
};

// Store a Picture on the Web
app.post('/api/picture/url/',function (req, res, next) {
  var info = req.body;
  //Add Picture to DB
  addPicture(info, res, next);
});

// Store a Picture Locally
app.post('/api/picture/local/', upload.single('picture'), function (req, res, next) {
  var info = JSON.parse(req.body.data);
  info['link'] = req.file.path;
  //Add Picture to DB
  addPicture(info, res, next);
});

// Post a Comment
app.post('/api/comment/', function (req, res, next) {
  var comment =  new Comment(req.body);
  comments.insert(comment, function (err, com) {
    if (err) {
        res.status(409).end("Failed to add Comment.");
        next();
    }else{
      pc_relation.update({id: com['pid']}, {$push: {comments: com['_id']}}, {}, function (err, numReplaced) {
        if (err) {
            res.status(409).end("Failed to add Comment.");
            next();
        }
        next();
      });
    }
  });
});


// Reads

// TODO Needs Fixing
// Grab a Locally Stored Picture
app.get('/api/picture/local/grab/', function (req, res, next) {
    if (req.body.id){
        res.setHeader('Content-Type', req.body.mimetype);
        res.sendFile(path.join(__dirname, req.body.link));
    }
    else res.status(404).end("Profile not set");
    next();
});

// Get Picture Given ID
app.get('/api/picture/:id/', function (req, res, next) {
  var find_id = req.params.id;
  var nid = parseInt(find_id, 10);
  //ID was given
  if (!isNaN(nid)) {
    pictures.findOne({id: nid}, function(err, pic){
      if(!pic){
        res.status(404).end("Picture at id:" + find_id + " not found.");
        return next();
      }
      res.json(pic);
      next();
    });
  }
  //ID was not given
  else {
    pictures.find({}).sort({ id: 1 }).limit(1).exec(function (err, docs) {
      if(docs.length === 0){
        res.status(400).end("No pictures in db");
        return next();
      }
      res.json(docs[0]);
      next();
    });
  }
});

// Get Next Picture
app.get('/api/picture/next/:currid/', function (req, res, next) {
  var curr_id = parseInt(req.params.currid, 10);
  pictures.find({id: {$gt: curr_id}}).sort({id: 1 }).limit(1).exec(function(err, pic){
    if(pic.length === 0){
      res.status(404).end("There is no next picture.");
      return next();
    }
    res.json(pic[0]);
    next();
  });
});

// Get Prev Picture
app.get('/api/picture/prev/:currid/', function (req, res, next) {
  var curr_id = parseInt(req.params.currid, 10);
  pictures.find({id: {$lt: curr_id}}).sort({id: -1 }).limit(1).exec(function(err, pic){
    if(pic.length === 0){
      res.status(404).end("There is no next picture.");
      return next();
    }
    res.json(pic[0]);
    next();
  });
});

// Get Comments given Picture ID and Offset (Page)
app.get('/api/comments/:id/:offset', function (req, res, next) {
  var f_id = parseInt(req.params.id, 10);
  var offset = req.params.offset;
  var com_ids = [];
  pc_relation.find({ id: f_id }, function (err, docs) {
    if(docs[0]){
      var cutoff = docs[0].comments.length - offset;
  		com_ids = docs[0].comments.slice(0, cutoff).slice(-10);
      comments.find({_id: { $in: com_ids } }, function (err, comments) {
        res.json(comments);
        return next();
      });
    }
  });
});


// Delete

// Delete Picture
app.delete('/api/picture/:id/', function (req, res, next) {
  var find_id = req.params.id;
  var nid = parseInt(find_id, 10);
  pictures.remove({ id: nid }, {}, function (err, numRemoved) {
    if(err){
      res.status(404).end("Picture at id:" + find_id + " not found.");
      return next();
    }
    //Remove Comments
    comments.remove({pid: nid }, {multi: true}, function (err, numRemoved) {
      //Remove Picture-Comment Relation
      pc_relation.remove({ id: nid }, {}, next());
    });
  });
});

// Delete Comment
app.delete('/api/comment/:pid/:mid', function (req, res, next) {
  var pid = parseInt(req.params.pid, 10);
  // Remove Comment from Picture-Comment Relation
  pc_relation.findOne({id: pid}, function(err, pic){
    var new_comments = pic.comments.filter(function(i) {
	     return i != req.params.mid;
    });
    pc_relation.update({id: pid}, {$set:{ comments: new_comments }}, {}, function (err, numReplaced) {
      //Remove Comment
      comments.remove({_id: req.params.mid }, {}, next());
    });
  });
});
