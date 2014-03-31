var notFound = require('Hapi').error.notFound,
    ObjectID = require('mongodb').ObjectID;

module.exports = {
    findAll: function(req, reply) {
        var db = req.server.app.db;
        db.collection('sessions')
            .find({})
            .toArray(function(err, docs) {
                var sessions = docs.map(function(d) {
                    d.id = d._id;
                    delete d._id;
                    return d;
                });
                reply({ sessions: sessions });
            });
    },

    findById: function(req, reply) {
        var db = req.server.app.db;
        db.collection('sessions')
            .findOne({ _id: new ObjectID(req.params.id) }, function(err, session) {
                session.id = s._id;
                reply({ session: session });
            });
    }
};