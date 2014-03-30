var Hapi = require('hapi'),
    Knex = require('knex'),
    routes = require('./routes');

// Create a server with a host and port
var server = Hapi.createServer('localhost', 8000, { cors: true });

server.app.knex = Knex.initialize({
    client: 'pg',
    connection: "postgres://gbabiars:@localhost/gbabiars"
});

server.route(routes);

// Start the server
server.start(function() {
    console.log('Server started');
});
