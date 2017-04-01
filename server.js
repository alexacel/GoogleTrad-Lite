var express = require('express');
var server = express();
server.get('/', function(request, response) {
	response.sendFile(__dirname + '/index.html');
});
server.post('/', function(request, response) {
	response.send(request);
});
server.listen(8080);
