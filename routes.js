var Hapi = require('Hapi'),
    sessionsHandlers = require('./handlers/sessions');

var notFoundHandler = function(req, reply) {
    reply(Hapi.error.notFound());
};

module.exports = [
    { method: 'GET', path: '/api/sessions', config: { handler: sessionsHandlers.findAll } },
    { method: 'GET', path: '/api/sessions/{id}', config: { handler: sessionsHandlers.findById } },

    { method: 'GET', path: '/api/{path*}', config: { handler: notFoundHandler } }
];