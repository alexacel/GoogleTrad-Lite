var express = require("express");
var server = express();
var bodyParser = require("body-parser");
var fs = require("fs");
var contenu;
var request = require("request");


request("https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20170401T093925Z.56d1337c6ad24db0.2fe47c122869fa7525789165f6fd4df08bfaf7b8&text=\"Bonjour le monde\"&lang=fr-en&[format=plain]", function (error, response, body) {
  console.log('error:', error); // Print the error if one occurred 
  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
  console.log('body:', body); // Print the HTML for the Google homepage. 
});

contenu = fs.readFileSync("KEY", "UTF-8");

server.use(bodyParser.urlencoded({ extended: true }));

//affichage du html
server.get('/', function(request, response) {
	response.sendFile(__dirname + '/index.html');
});

server.post('/', function(request, response) {
	var From = request.body.from.toLowerCase();
	var To = request.body.to.toLowerCase();
	var Text = request.body.textarea;
	
	response.send(From + ' ' + To + ' ' + Text + ' ' + contenu);
});
server.listen(8080);
