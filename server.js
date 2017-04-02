var express = require("express");
var server = express();
var bodyParser = require("body-parser");
var fs = require("fs");
var yandexKey;
var APIrequest = require("request");
var MongoClient = require('mongodb').MongoClient;
var yandexURL = "https://translate.yandex.net/api/v1.5/tr.json/translate?"

function writeResponse(from, to, ori, translatedText){
	
	fs.writeFileSync(__dirname+"/public/display.js",  "document.getElementById('Output').innerHTML=\""+translatedText+"\";\n"
													+ "document.getElementById('To').value=\""+to+"\";\n"
													+ "document.getElementById('From').value=\""+from+"\";\n"
													+ "document.getElementById('Input').value=\""+ori+"\";\n"
													, "UTF-8");
	
}


yandexKey = fs.readFileSync("KEY", "UTF-8");

server.use(bodyParser.urlencoded({ extended: true }));


/********************/
//server.use(server.router);
server.use(express.static('public'));
server.use("/scripts", express.static(__dirname+'/public'));
/********************/




	
//html display
server.get('/', function(request, response) {

	response.sendFile(__dirname + '/public/index.html');
	
});

//POST request
server.post('/', function(request, response) {
	var serverResponse = response;
	
	MongoClient.connect("mongodb://localhost/data", function(error, db) {
		if (error) {
			console.log("error during connexion to database");
			throw error;
		}
		
		console.log("connected to database");


	
	
		var From = request.body.from.toLowerCase();
		var To = request.body.to.toLowerCase();
		var Text = request.body.textarea;
		
		
		
		var collection = db.collection("history");
		var documentInDB = null;
		
		
		
		//process request
		function processRequest() {
			//check if known request
			collection.findOne({from: From.toUpperCase(), to: To.toUpperCase(), textarea: Text}, function(err, document) {
				if (err){
					console.log("error in \'findOne\'");
					throw err;
				}
				
				//known request
				if(document)
				{
					console.log("Known request");
					console.log("result : "+document.translation);
					writeResponse(document.from, document.to, document.textarea, document.translation);
					//send result to client
					serverResponse.sendFile(__dirname + '/public/index.html');
				}
				
				//unknown request
				else
				{
					console.log("Request not known yet. Calling Yandex API...");
					APIrequest(yandexURL+"key="+yandexKey+"&text="+Text+"&lang="+From+'-'+To+"&[format=plain]", function (error, response, body) {
						if(error)
						{
							console.log("error while calling Yandex API");
							throw error;
						}
						
						
						var info = JSON.parse(body);
						
						//save answer
						writeResponse(From.toUpperCase(), To.toUpperCase(), Text, info.text);
						console.log("text="+info.text);
						
						//write into database
						var objNew = { from: From.toUpperCase(), to: To.toUpperCase(), textarea: Text, translation: info.text };

						collection.insert(objNew, null, function (error, results) {
							if (error) {
								console.log("error trying to insert document into database");
								throw error;
							}

							console.log("new document inserted into database");    
							

							//send result to client
							serverResponse.sendFile(__dirname + '/public/index.html');
						});
					});
					
				}			
				
			});
		}
		
		
		processRequest();

	});
	
});
server.listen(8080);
