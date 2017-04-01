var express = require('express');
var server = express();
var bodyParser = require("body-parser");
var fs = require("fs");
var contenu;

contenu = fs.readFileSync("KEY", "UTF-8");

server.use(bodyParser.urlencoded({ extended: true }));

//affichage du html
server.get('/', function(request, response) {
	response.sendFile(__dirname + '/index.html');
});

server.get("http://https://translate.yandex.net/api/v1.5/tr/translate ?", function(request, response)) {
	
});

server.post('/', function(request, response) {
	var From = request.body.from.toLowerCase();
	var To = request.body.to.toLowerCase();
	var Text = request.body.textarea;
	
	response.send(From + ' ' + To + ' ' + Text + ' ' + contenu);
});
server.listen(8080);
