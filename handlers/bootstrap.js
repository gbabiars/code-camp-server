var request = require('request-promise'),
    Q = require('q'),
    _ = require('lodash'),
    sessionsUrl = 'http://apr2014.desertcodecamp.com/Services/CodeCamp.svc/Sessions?$format=json&$filter=Camp/ShortUrl%20eq%20%27apr2014%27&$expand=Track,Slot/Time,Slot/CampRoom/Room',
    tracksUrl = 'http://apr2014.desertcodecamp.com/Services/CodeCamp.svc/Tracks?$format=json';

function parseStatus(session) {
    var approved = session.IsApproved,
        suggestion = session.IsSuggestion;

    if(approved) {
        return "approved";
    }
    if(suggestion) {
        return "suggested";
    }
    return "pending";
}

function loadSessions(options) {
    return request(sessionsUrl).then(function(data) {

        options.sessions = JSON.parse(data).value.map(function(session) {

            var result = {};

            result._id = session.SessionId;
            result.title = session.Name;
            result.description = session.Abstract;
            result.track_id = session.Track.TrackId;
            result.status = parseStatus(session);

            if(session.Slot) {
                result.startTime = session.Slot.Time.StartDate;
                result.endTime = session.Slot.Time.EndDate;
                result.room = session.Slot.CampRoom.Room.Name;
            }

            return result;

        });

        return options;

    });
}

function saveSessions(options) {

    var sessionsCollection = options.db.collection('sessions');

    return Q.Promise(function(resolve) {

        sessionsCollection.remove({}, { w: 1 }, function() {
            sessionsCollection.insert(options.sessions, { w: 1 }, function() {
                resolve(options);
            });
        });

    });

}

function loadTracks(options) {
    return request(tracksUrl).then(function(data) {

        options.tracks = JSON.parse(data).value.map(function(track) {

            var result = {};

            result._id = track.TrackId;
            result.name = track.Name;
            result.description = track.Description;

            return result;

        });

        return options;

    });
}

function fixupTracks(options) {
    options.tracks.forEach(function(track) {
        track.sessions = options.sessions
            .filter(function(session) {
                return session.track_id === track._id;
            })
            .map(function(session) {
                return session._id;
            });
    });
    return options;
}

function saveTracks(options) {

    var tracksCollection = options.db.collection('tracks');

    return Q.Promise(function(resolve) {

        tracksCollection.remove({}, { w: 1 }, function() {
            tracksCollection.insert(options.tracks, { w: 1 }, function() {
                resolve(options);
            });
        });

    });

}

function load(req, reply) {

//    var db = req.server.app.db;
    var options = {
        db: req.server.app.db
    };

    loadSessions(options)
        .then(saveSessions)
        .then(loadTracks)
        .then(fixupTracks)
        .then(saveTracks)
        .then(function(options) {
            reply({
                sessions: options.sessions,
                tracks: options.tracks
            });
        });

}

module.exports = load;