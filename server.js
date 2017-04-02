var express = require("express");
var server = express();
var bodyParser = require("body-parser");
var fs = require("fs");
var yandexKey;
var APIrequest = require("request");
var MongoClient = require('mongodb').MongoClient;
var yandexURL = "https://translate.yandex.net/api/v1.5/tr.json/translate?"

function writeResponse(translatedText){
	if(typeof translatedText !== 'string'){ //FIXME apostrophes autour de string ?
		//TODO
	}
	
	fs.writeFileSync(__dirname+"/public/display.js", "document.getElementById('Output').innerHTML=\""+translatedText+"\";", "UTF-8");
	
}


yandexKey = fs.readFileSync("KEY", "UTF-8");

server.use(bodyParser.urlencoded({ extended: true }));

//connect to database
/*
var DB;
MongoClient.connect("mongodb://localhost/data", function(error, db) {
	if (error) {
		console.log("error during connexion to database");
		throw error;
	}
	
	DB=db;
	console.log("connected to database");

});
*/




/**********tests mongodb*************/
/*
MongoClient.connect("mongodb://localhost/test2", function(error, db) {
    if (error) {
		console.log("error during connexion to database");
		throw error;
	}

    console.log("Connected to database");
	
	//nouvelle collection
	var collection = db.collection("personnages");
	
	//insertion d'un document
	var objNew = { name: "coucou", game: "Super Mario World", date: "1994" }; 	

	collection.insert(objNew, null, function (error, results) {
		if (error) {
			console.log("error trying to insert document into database");
			throw error;
		}

		console.log("Le document a bien été inséré");    
	});
	
	//on essaye de retrouver un doc
//	var objToFind = {name: "coucou"};
	collection.findOne({name: "coucou", game: "Super Mario Land"}, function(err, document) {
		console.log("err="+err);
		if (err){
			console.log("error in \'findOne\'");
			throw err;
		}
		if (document)
			console.log("La date recherchée est: "+document.date);
	});

	
	//lecture document
	db.collection("personnages").find().toArray(function (error, results) {
		if (error) {
			console.log("error trying to find collection");
			throw error;
		}
		
        results.forEach(function(obj, i) {
			console.log(i);
			console.log(obj);
            console.log(
                "ID : "  + obj._id.toString() + "\n" + //comment
                "Nom : " + obj.name + "\n" +           // Adrian Shephard
                "Jeu : " + obj.game                  // Half-Life: Opposing Force
            );
        });
		console.log("error="+error+"\n"+"results="+results);
    });
	
});
*/

/************************************/

/********************/
//server.use(server.router);
server.use(express.static('public'));
console.log("dirname="+__dirname);
server.use("/scripts", express.static(__dirname+'/public'));
/********************/




	
//html display
server.get('/', function(request, response) {
/*

	fs.unlink(__dirname+"/public/display.js", function (err) {
		if (err) {
			console.log("error while deleting display.js");
			throw err;
		}
		console.log ( "Fichier supprimé avec succès!");
		//response.sendFile(__dirname + '/public/index.html');
	});		*/
	
	response.sendFile(__dirname + '/public/index.html');
	
	
	
});

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
		
		
		
		//look for request in database
		function lookInDB() {
			collection.findOne({from: From.toUpperCase(), to: To.toUpperCase(), textarea: Text}, function(err, document) {
				if (err){
					console.log("error in \'findOne\'");
					throw err;
				}
				console.log("found something (maybe ?)");
				
				if(document)
				{
					console.log("document dans la db");
					console.log("la traduction est : "+document.translation);
					writeResponse(document.translation);
					//send result to client
					serverResponse.sendFile(__dirname + '/public/index.html');
				}
				else
				{
					console.log("le doc n'est pas dans la db");
					//TODO cas error != null
					APIrequest(yandexURL+"key="+yandexKey+"&text="+Text+"&lang="+From+'-'+To+"&[format=plain]", function (error, response, body) {
						if(error)
						{
							console.log("error while calling Yandex API");
							throw error;
						}
						
						console.log('API request: error:', error); // Print the error if one occurred 
						console.log('API request: statusCode:', response && response.statusCode); // Print the response status code if a response was received 
						console.log('API request: body:', body); // Print the body
						
						var info = JSON.parse(body);

						
						if(error !== null){		//communication error between Yandex and node JS
							//TODO
						}
						if(response != 200){	//Yandex internal error (bad entries)
							//TODO
						}
						
						console.log("coucou");
						writeResponse(info.text);
						console.log("text="+info.text);
						
						//database write
						console.log("jusqu'ici c'est bon");
						var objNew = { from: From.toUpperCase(), to: To.toUpperCase(), textarea: Text, translation: info.text };
						console.log("jusqu'ici c'est bon aussi: objNew="+objNew.from+' '+objNew.to+ ' '+objNew.textarea+ ' '+objNew.translation);
						collection.insert(objNew, null, function (error, results) {
							if (error) {
								console.log("error trying to insert document into database");
								throw error;
							}

							console.log("Le document a bien été inséré");    
							
								///////////////////////////////////lecture document

								///////////////////////////////////
							//send result to client
							serverResponse.sendFile(__dirname + '/public/index.html');
						});
					});
					
				}
/********************************************/				
				
			});
		}
		
		
		lookInDB();

	});
	
	//setTimeout(function(){response.sendFile(__dirname + '/public/index.html')},1000); 
	
	//response.send(From + ' ' + To + ' ' + Text + ' ' + yandexKey);
	//response.sendFile(__dirname + '/public/index.html');
});
server.listen(8080);
