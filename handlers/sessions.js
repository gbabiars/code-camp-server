var notFound = require('Hapi').error.notFound;

module.exports = {
    findAll: function(req, reply) {
        req.server.app.knex('sessions')
            .select()
            .then(function(data) {
                reply({
                    sessions: data
                });
            });
    },

    findById: function(req, reply) {
        req.server.app.knex('sessions')
            .where('id', req.params.id)
            .select()
            .then(function(data)
            {
                reply(data.length > 0 ? { session: data[0] } : notFound());
            });
    }
};