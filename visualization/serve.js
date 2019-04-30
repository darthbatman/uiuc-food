var express = require('express');
var app = express();
var http = require('http').Server(app);

app.use('/src', express.static(__dirname + '/src'));
app.use('/res', express.static(__dirname + '/res'));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

http.listen(8080, function() {
	console.log('Listening on *:8080');
});