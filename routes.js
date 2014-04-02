var Hapi = require('Hapi'),
    sessionsHandlers = require('./handlers/sessions'),
    scrapeHandlers = require('./handlers/scrape'),
    boostrapHandler = require('./handlers/bootstrap');

var notFoundHandler = function(req, reply) {
    reply(Hapi.error.notFound());
};

module.exports = [
    { method: 'GET', path: '/api/sessions', config: { handler: sessionsHandlers.findAll } },
    { method: 'GET', path: '/api/sessions/{id}', config: { handler: sessionsHandlers.findById } },

    { method: 'GET', path: '/api/tracks', config: { handler: sessionsHandlers.findAll } },

    { method: 'GET', path: '/api/scrape', config: { handler: scrapeHandlers.sessions } },

    { method: 'GET', path: '/api/bootstrap', config: { handler: boostrapHandler } },

    { method: 'GET', path: '/api/{path*}', config: { handler: notFoundHandler } }
];