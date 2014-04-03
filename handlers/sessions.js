var Q = require('q'),
    _ = require('lodash');

var convertSession = function(session) {
    return {
        id: session._id,
        title: session.title,
        description: session.description,
        room: session.room,
        startTime: session.startTime,
        endTime: session.endTime,
        status: session.status,
        track: session.track_id
    };
};

var convertTrack = function(track) {
    return {
        id: track._id,
        name: track.name,
        description: track.description,
        sessions: track.sessions
    };
};

module.exports = {
    findAll: function(req, reply) {
        var db = req.server.app.db;

        var sessionsPromise = Q.ninvoke(db.collection('sessions').find({}), 'toArray')
            .then(function(docs) {
                return docs.map(convertSession);
            });

        var tracksPromise = Q.ninvoke(db.collection('tracks').find({}), 'toArray')
            .then(function(docs) {
                return docs
                    .filter(function(d) { return d.sessions.length > 0; })
                    .map(convertTrack);
            });

        Q.all([sessionsPromise, tracksPromise]).then(function(data) {
            var sessions = data[0],
                tracks = data[1];

            reply({
                sessions: sessions,
                tracks: tracks
            });
        });
    },

    findById: function(req, reply) {
        var db = req.server.app.db;

        Q.ninvoke(db.collection('sessions'), 'findOne', { _id: req.params.id })
            .then(function(session) {

                Q.ninvoke(db.collection('tracks'), 'findOne', { _id: session.trackId })
                    .then(function(track) {

                        reply({
                            session: convertSession(session),
                            tracks: [convertTrack(track)]
                        });

                    });
            });
    }
};