var Hapi = require('hapi'),
    MongoClient = require('mongodb').MongoClient,
    routes = require('./routes');

// Create a server with a host and port
var server = Hapi.createServer('localhost', 8000, { cors: true });

MongoClient.connect('mongodb://127.0.0.1:27017/codecamp', function(err, db) {
    if(err) throw err;

    server.app.db = db;
    console.log('connected');
});

server.route(routes);

// Start the server
server.start(function() {
    console.log('Server started');
});