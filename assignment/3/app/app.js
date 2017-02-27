var crypto = require('crypto');
var path = require('path');
var expressValidator = require('express-validator');
var cookieParser = require('cookie-parser');
var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(expressValidator());

var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });

var Datastore = require('nedb');
var comments = new Datastore({ filename: 'db/comments.db', autoload: true, timestampData : true});
var pictures = new Datastore({ filename: 'db/pictures.db', autoload: true });
var ids = new Datastore({ filename: 'db/ids.db', autoload:true });
var users = new Datastore({ filename: 'db/users.db', autoload: true });

// ID Management
var getID = function(itype, next){
  ids.findOne({type: itype}, function(err, curr_id){
    // Add id to ids db
    if (!curr_id){
      var info = [];
      info.type = itype;
      info.id = 0;
      var data = new ID(info);
      ids.insert(data, function(err, nid){
        if(nid) next(0);
      });
    }else{
      // Update the curr id
      var new_id = curr_id.id + 1;
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

var Picture = function (picture){
  this.id = picture.id;
  this.content = picture.content;
  this.author = picture.author;
  this.link = picture.link;
  this.upload = picture.upload;
};

var ID = function(info){
  this.type = info.type;
  this.id = info.id;
};

var User = function(user){
    var salt = crypto.randomBytes(16).toString('base64');
    var hash = crypto.createHmac('sha512', salt);
    hash.update(user.password);
    this.username = user.username;
    // this.picture = null;
    this.salt = salt;
    this.saltedHash = hash.digest('base64');
};


// Authentication

var checkPassword = function(user, password){
        var hash = crypto.createHmac('sha512', user.salt);
        hash.update(password);
        var value = hash.digest('base64');
        return (user.saltedHash === value);
};

app.use(cookieParser('keyboard cat', {
  secure: true,
  sameSite: true
}));
var session = require('express-session');
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true,
              sameSite: true}
}));

app.use(function (req, res, next){
    console.log("HTTPS request", req.method, req.url, req.body);
    return next();
});


// serving the frontend

app.get('/', function (req, res, next) {
    if (!req.session.user) return res.redirect('/signin.html');
    return next();
});

app.get('/galleries.html', function (req, res, next) {
    if (!req.session.user) return res.redirect('/signin.html');
    return next();
});

app.get('/signout/', function (req, res, next) {
    req.session.destroy(function(err) {
        if (err) return res.status(500).end(err);
        return res.redirect('/signin.html');
    });
});

app.use(express.static('frontend'));


// signout, signin

app.get('/api/signout/', function (req, res, next) {
    req.session.destroy(function(err) {
        if (err) return res.status(500).end(err);
        return res.end();
    });
});

app.post('/api/signin/', function (req, res, next) {
  req.checkBody('username', 'Invalid username').notEmpty();
  req.checkBody('password', 'Invalid password').notEmpty();
  req.sanitizeBody('username').escape();
  req.sanitizeBody('password').escape();
    if (!req.body.username || ! req.body.password) return res.status(400).send("Bad Request");
    users.findOne({username: req.body.username}, function(err, user){
        if (err) return res.status(500).end(err);
        if (!user || !checkPassword(user, req.body.password)) return res.status(401).end("Unauthorized");
        req.session.user = user;
        res.cookie('username', user.username, { secure: true, httpOnly: true, sameSite: true});
        return res.json(user.username);
    });
});


// CREATE

// Add new user
app.put('/api/users/', function (req, res, next) {
  req.checkBody('username', 'Invalid username').notEmpty();
  req.checkBody('password', 'Invalid password').notEmpty();
  req.sanitizeBody('username').escape();
  req.sanitizeBody('password').escape();

  var data = new User(req.body);
  users.findOne({username: req.body.username}, function(err, user){
      if (err) return res.status(500).end(err);
      if (user) return res.status(409).end("Username " + req.body.username + " already exists");
      users.insert(data, function (err, user) {
          if (err) return res.status(500).end(err);
          return res.json(user.username);
      });
  });
});

// Post a Comment
app.post('/api/comment/', function (req, res, next) {
  req.checkBody('username', 'Invalid username').notEmpty();
  req.checkBody('pid', 'Invalid picture ID').notEmpty();
  req.checkBody('author', 'Invalid author').notEmpty();
  req.checkBody('content', 'Invalid content').notEmpty();
  req.sanitizeBody('username').escape();
  req.sanitizeBody('pid').escape();
  req.sanitizeBody('author').escape();
  req.sanitizeBody('content').escape();

  if (!req.session.user) return res.status(403).end("Forbidden");
  req.body.username = req.session.user.username;
  var comment =  new Comment(req.body);
  comments.insert(comment, function (err, com) {
    if (err) return res.status(409).end("Failed to add Comment.");
    return res.json(com);
  });
});

// Add a Picture
addPicture = function (info, res, next){
  getID("pid", function(id){
    info.id = id;
    var data =  new Picture(info);
    pictures.insert(data, function (err, pic) {
      if (err) return res.status(409).end("Picture failed to upload.");
      return res.json(pic);
    });
  });
};

// Store a Picture on the Web
app.post('/api/picture/url/',function (req, res, next) {
  req.checkBody('link', 'Invalid picture link').notEmpty();
  req.checkBody('author', 'Invalid author').notEmpty();
  req.checkBody('content', 'Invalid content').notEmpty();
  req.sanitizeBody('link');
  req.sanitizeBody('author').escape();
  req.sanitizeBody('content').escape();

  if (req.body.author !== req.session.user.username) return res.status(403).send("Forbidden");
  var info = req.body;
  info.upload = false;
  //Add Picture to DB
  addPicture(info, res, next);
});

// Store a Picture Locally
app.post('/api/picture/local/', upload.single('picture'), function (req, res, next) {
  var info = JSON.parse(req.body.data);
  req.check('link', 'Invalid picture link').notEmpty();
  req.check('author', 'Invalid author').notEmpty();
  req.check('content', 'Invalid content').notEmpty();
  req.sanitize('link');
  req.sanitize('author').escape();
  req.sanitize('content').escape();
  console.log(info.author, req.session.user.username, req.body.data);
  if (info.author !== req.session.user.username) return res.status(403).send("Forbidden");
  info.upload = true;
  info.link = req.file;
  //Add Picture to DB
  addPicture(info, res, next);
});


// READ

// Get Picture Given ID
app.get('/api/picture/:id/', function (req, res, next) {
  req.check('id', 'Invalid picture id').notEmpty();
  req.sanitize('id').escape();
  if (!req.session.user) return res.status(403).end("Forbidden");
  var find_id = req.params.id;
  var nid = parseInt(find_id, 10);
  //ID was given
  if (!isNaN(nid)) {
    pictures.findOne({id: nid}, function(err, pic){
      if(!pic) return res.status(404).end("Picture at id:" + find_id + " not found.");
      getPicture(pic, function(upic){
         return res.json(upic);
       });
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
    //return res.redirect('/galleries.html');
  }
});

app.get('/api/picture/gallery/:user/', function (req, res, next) {
  req.check('user', 'Invalid user').notEmpty();
  req.sanitize('user').escape();
  if (!req.session.user) return res.status(403).end("Forbidden");
    pictures.find({author: req.params.user}).sort({ id: 1 }).limit(1).exec(function (err, docs) {
      if(docs.length === 0) return res.status(400).end("No pictures in db");
      getPicture(docs[0], function(upic){
         return res.json(upic);
       });
    });
});

// Get locally stored picture
app.get('/api/picture/:id/local', function (req, res, next) {
  req.check('id', 'Invalid picture id').notEmpty();
  req.sanitize('id').escape();
  if (!req.session.user) return res.status(403).end("Forbidden");
  var nid = parseInt(req.params.id, 10);
  pictures.findOne({id: nid}, function(err, pic){
    if(!pic) return res.status(404).end("Picture at id:" + find_id + " not found.");
    if (pic.link){
      res.setHeader('Content-Type', pic.link.mimetype);
      return res.sendFile(path.join(__dirname, pic.link.path));
    }
    return res.json(pic.link);
  });
});

// Get Comments given Picture ID, Offset, and Amount (Page)
app.get('/api/comments/:id/:offset/:amount', function (req, res, next) {
  req.check('id', 'Invalid picture id').notEmpty();
  req.sanitize('id').escape();
  req.check('offset', 'Invalid offset').notEmpty();
  req.sanitize('offset').escape();
  req.check('amount', 'Invalid amount').notEmpty();
  req.sanitize('amount').escape();

  if (!req.session.user) return res.status(403).end("Forbidden");
  var f_id = parseInt(req.params.id, 10);
  var offset = parseInt(req.params.offset, 10);
  var amount = parseInt(req.params.amount, 10);

  comments.find({pid: f_id}).sort({createdAt: -1}).skip(offset).limit(amount).exec(function(err, comments) {
    if(err) return res.status(404).end("Picture at id:" + f_id + " not found.");
    return res.json(comments);
  });
});

// Get Next Picture
app.get('/api/picture/next/:currid/', function (req, res, next) {
  req.check('currid', 'Invalid picture id').notEmpty();
  req.sanitize('currid').escape();
  if (!req.session.user) return res.status(403).end("Forbidden");
  var curr_id = parseInt(req.params.currid, 10);
  pictures.find({id: {$gt: curr_id}}).sort({id: 1 }).limit(1).exec(function(err, pic){
    if(pic.length === 0) return res.status(404).end("There is no next picture.");
    getPicture(pic[0], function(upic){
       return res.json(upic);
     });
  });
});

// Get Prev Picture
app.get('/api/picture/prev/:currid/', function (req, res, next) {
  req.check('currid', 'Invalid picture id').notEmpty();
  req.sanitize('currid').escape();
  if (!req.session.user) return res.status(403).end("Forbidden");
  var curr_id = parseInt(req.params.currid, 10);
  pictures.find({id: {$lt: curr_id}}).sort({id: -1 }).limit(1).exec(function(err, pic){
    if(pic.length === 0) return res.status(404).end("There is no previous picture.");
    getPicture(pic[0], function(upic){
       return res.json(upic);
     });
  });
});

// Get Next Picture Given User gallery
app.get('/api/picture/:user/next/:currid/', function (req, res, next) {
  req.check('currid', 'Invalid picture id').notEmpty();
  req.sanitize('currid').escape();
  req.check('user', 'Invalid user').notEmpty();
  req.sanitize('user').escape();
  if (!req.session.user) return res.status(403).end("Forbidden");
  var curr_id = parseInt(req.params.currid, 10);
  pictures.find({id: {$gt: curr_id}, author: req.params.user}).sort({id: 1 }).limit(1).exec(function(err, pic){
    if(pic.length === 0) return res.status(404).end("There is no next picture.");
    getPicture(pic[0], function(upic){
       return res.json(upic);
     });
  });
});

// Get Prev Picture Given User gallery
app.get('/api/picture/:user/prev/:currid/', function (req, res, next) {
  req.check('currid', 'Invalid picture id').notEmpty();
  req.sanitize('currid').escape();
  req.check('user', 'Invalid user').notEmpty();
  req.sanitize('user').escape();
  var curr_id = parseInt(req.params.currid, 10);
  pictures.find({id: {$lt: curr_id}, author: req.params.user}).sort({id: -1 }).limit(1).exec(function(err, pic){
    if(pic.length === 0) return res.status(404).end("There is no previous picture.");
    getPicture(pic[0], function(upic){
       return res.json(upic);
     });
  });
});

var getPicture = function(pic, next){
  if(pic.upload){
    var info = pic.link;
    pic.link = '/api/picture/' + pic.id + '/local/';
    pic.mimetype = info.mimetype;
  }
  next(pic);
};

// Get List of users that have gallery
app.get('/api/users/galleried/:offset/:amount', function(req, res, next){
  req.check('offset', 'Invalid offset').notEmpty();
  req.sanitize('offset').escape();
  req.check('amount', 'Invalid amount').notEmpty();
  req.sanitize('amount').escape();

  if (!req.session.user) return res.status(403).end("Forbidden");
  pictures.find({}).sort({author: 1}).exec(function (err, allPictures){
    var users = allPictures.map(function(e){return e.author;});
    var selectUsers = users.filter(function(elem, index, self) {
      return index == self.indexOf(elem);
    });
    var cutoff = selectUsers.length - req.params.offset;
    if (cutoff <= 0){
      cutoff = selectUsers.length;
    }
    var selUsers = selectUsers.slice(0, cutoff).slice(-req.params.amount);
    return res.json(selUsers);
  });
});


// DELETE

// Delete Picture
app.delete('/api/picture/:id/', function (req, res, next) {
  req.check('id', 'Invalid id').notEmpty();
  req.sanitize('id').escape();
  if (!req.session.user) return res.status(403).end("Forbidden");
  var find_id = req.params.id;
  var nid = parseInt(find_id, 10);
  pictures.findOne({ id: nid }, function(err, picture){
    if (err) return res.status(404).end("Message id:" + req.params.id + " does not exists");
    if (picture.author !== req.session.user.username) return res.status(403).send("Unauthorized");
    //Remove Picture
    pictures.remove({ id: nid }, {}, function (err, numRemoved) {
      if(err) return res.status(404).end("Picture at id:" + find_id + " not found.");
      //Remove Comments
      comments.remove({pid: nid }, {multi: true}, function (err, numRemoved) {
        if (err) return res.status(500).send("Database error");
        return res.json({});
      });
    });
  });
});

// Delete Comment
app.delete('/api/comment/:pid/:cid/', function (req, res, next) {
  req.check('pid', 'Invalid picture id').notEmpty();
  req.sanitize('pid').escape();
  req.check('cid', 'Invalid comment id').notEmpty();
  req.sanitize('cid').escape();
  if (!req.session.user) return res.status(403).end("Forbidden");
  comments.findOne({ _id: req.params.cid }, function(err, comment){
    if (err) return res.status(404).end("Message id:" + req.params.id + " does not exists");
    var pic_id = parseInt(req.params.pid, 10);
    pictures.findOne({ id: pic_id }, function(err, picture){
      if (err) return res.status(404).end("Picture id:" + req.params.pid + " does not exists");
      if (comment.author !== req.session.user.username && picture.author !== req.session.user.username) return res.status(403).send("Unauthorized");
      //Remove Comment
      comments.remove({_id: req.params.cid }, {}, function(err, num) {
        if (err) return res.status(500).send("Database error");
        return res.json({});
      });
    });
  });
});


// var http = require("http");
// http.createServer(app).listen(3000, function(){
//     console.log('HTTP on port 3000');
// });

var fs = require('fs');
var https = require('https');
var privateKey = fs.readFileSync( 'server.key' );
var certificate = fs.readFileSync( 'server.crt' );
var config = {
        key: privateKey,
        cert: certificate
};
https.createServer(config, app).listen(3000, function () {
    console.log('HTTPS on port 3000');
});
