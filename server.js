var express = require('express');
var server = express();
var bodyParser = require("body-parser");

server.use(bodyParser.urlencoded({ extended: true }));

//affichage du html
server.get('/', function(request, response) {
	response.sendFile(__dirname + '/index.html');
});

server.post('/', function(request, response) {
	response.send(request.body.textarea);
});
server.listen(8080);
