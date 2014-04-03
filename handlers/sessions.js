var Q = require('q'),
    moment = require('moment');

function convertSession(session) {
    return {
        id: session._id,
        title: session.title,
        description: session.description,
        room: session.room,
        startTime: session.startTime ? moment(session.startTime).toDate() : undefined,
        endTime: session.endTime ? moment(session.endTime).toDate() : undefined,
        status: session.status,
        track: session.track_id,
        presenters: session.presenter_ids
    };
}

function convertTrack(track) {
    return {
        id: track._id,
        name: track.name,
        description: track.description,
        sessions: track.sessions
    };
}

function convertUser(user) {
    return {
        id: user._id,
        name: user.firstName + ' ' + user.lastName,
        biography: user.biography,
        twitter: user.twitter,
        facebook: user.facebook,
        blog: user.blog,
        speakerRate: user.speakerRate,
        slideShare: user.slideShare
    }
}

function findAllSessions(db) {
    return Q.ninvoke(db.collection('sessions').find({}), 'toArray')
        .then(function(docs) {
            return docs.map(convertSession);
        });
}

function findAllTracks(db) {
    return Q.ninvoke(db.collection('tracks').find({}), 'toArray')
        .then(function(docs) {
            return docs
                .filter(function(d) { return d.sessions.length > 0; })
                .map(convertTrack);
        });
}

function findAllUsers(db) {
    return Q.ninvoke(db.collection('users').find({}), 'toArray')
        .then(function(docs) {
            return docs.map(convertUser);
        });
}

module.exports = {
    findAll: function(req, reply) {
        var db = req.server.app.db;

        Q.all([findAllSessions(db), findAllTracks(db), findAllUsers(db)]).then(function(data) {
            var sessions = data[0],
                tracks = data[1],
                users = data[2];

            reply({
                sessions: sessions,
                tracks: tracks,
                users: users
            });
        });
    },

    findById: function(req, reply) {
        var db = req.server.app.db;

        Q.ninvoke(db.collection('sessions'), 'findOne', { _id: req.params.id }).then(function(session) {

                Q.ninvoke(db.collection('tracks'), 'findOne', { _id: session.trackId }).then(function(track) {

                        reply({
                            session: convertSession(session),
                            tracks: [convertTrack(track)]
                        });

                    });
            });
    }
};