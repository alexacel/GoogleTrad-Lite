var express = require("express");
var server = express();
var bodyParser = require("body-parser");
var fs = require("fs");
var yandexKey;
var APIrequest = require("request");
var yandexURL = "https://translate.yandex.net/api/v1.5/tr.json/translate?"

function writeResponse(translatedText){
	if(typeof translatedText !== 'string'){ //FIXME apostrophes autour de string ?
		//TODO
	}
	
	fs.writeFileSync(__dirname+"/public/display.js", "document.getElementById('Output').innerHTML=\""+translatedText+"\";", "UTF-8");
	
}

yandexKey = fs.readFileSync("KEY", "UTF-8");

server.use(bodyParser.urlencoded({ extended: true }));

/********************/
//server.use(server.router);
server.use(express.static('public'));
console.log("dirname="+__dirname);
server.use("/scripts", express.static(__dirname+'/public'));
/********************/


//html display
server.get('/', function(request, response) {
	response.sendFile(__dirname + '/public/index.html');
});

server.post('/', function(request, response) {
	var From = request.body.from.toLowerCase();
	var To = request.body.to.toLowerCase();
	var Text = request.body.textarea;
	
	
	//TODO cas error != null
	APIrequest(yandexURL+"key="+yandexKey+"&text="+Text+"&lang="+From+'-'+To+"&[format=plain]", function (error, response, body) {
		var info = JSON.parse(body);
/*
		console.log('error:', error); // Print the error if one occurred 
		console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
		console.log('body:', body); // Print the body
*/
		
		if(error !== null){		//communication error between Yandex and node JS
			//TODO
		}
		if(response != 200){	//Yandex internal error (bad entries)
			//TODO
		}
		
		console.log("coucou");
		writeResponse(info.text);
		console.log("text="+info.text);
	});
	
	console.log("ceci est censé etre après coucou");
	setTimeout(function(){response.sendFile(__dirname + '/public/index.html')},1000); 
	
	//response.send(From + ' ' + To + ' ' + Text + ' ' + yandexKey);
	//response.sendFile(__dirname + '/public/index.html');
});
server.listen(8080);
