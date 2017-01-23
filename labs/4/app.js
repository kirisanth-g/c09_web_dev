var express = require('express');
var app = express();
app.use(express.static('frontend')); 


var bodyParser = require('body-parser');
app.use(bodyParser.json());


var Message = (function(){
    var id = 0;
    return function Message(message){
        this.id = id++;
        this.content = message.content;
        this.author = message.author
    }
}());

var messages = [];

app.use(function (req, res, next){
    console.log("HTTP request", req.method, req.url, req.body);
    next();
});

app.post('/', function (req, res, next) {
    res.json(req.body);
    next();
});

app.post('/api/messages/', function (req, res, next) {
    var message = new Message(req.body);
    messages.push(message);
    res.json({"id": message.id});
    next();
});

app.get('/api/messages/', function (req, res, next) {
	var msg = messages.filter(function(e){
        return(delete e["id"]);
    });
    res.json(msg);
    next();
});

app.delete('/api/messages/:id/', function (req, res, next) {
    messages = messages.filter(function(e){
        return(e.id !== parseInt(req.params.id));
    });
    res.json({"id": req.params.id});
    next();
});

app.use(function (req, res, next){
    console.log("HTTP Response", res.statusCode);
});

app.listen(3000, function () {
    console.log('app listening on port 3000!')
});