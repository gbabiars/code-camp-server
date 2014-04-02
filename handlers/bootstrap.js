var request = require('request-promise'),
    cheerio = require('cheerio'),
    Q = require('q'),
    sessionsUrl = 'http://apr2014.desertcodecamp.com/Services/CodeCamp.svc/Sessions?$format=json&$filter=Camp/ShortUrl%20eq%20%27apr2014%27&$expand=Track,Slot/Time,Slot/CampRoom/Room';

function loadSessions() {
    return request(sessionsUrl).then(function(data) {

        return JSON.parse(data).value.map(function(session) {

            var result = {};

            result._id = session.SessionId;
            result.title = session.Name;
            result.description = session.Abstract;
            result.trackId = session.Track.TrackId;

            if(session.Slot) {
                result.startTime = session.Slot.Time.StartDate;
                result.endTime = session.Slot.Time.EndDate;
                result.room = session.Slot.CampRoom.Room.Name;
            }

            return result;

        });

    });
}

function saveSessions(db, sessions) {

    var sessionsCollection = db.collection('sessions');

    return Q.Promise(function(resolve) {

        sessionsCollection.remove({}, { w: 1 }, function() {
            sessionsCollection.insert(sessions, { w: 1 }, function() {
                resolve(sessions);
            });
        });

    });

}

function load(req, reply) {

    var db = req.server.app.db;

    loadSessions().then(function(sessions) {

        saveSessions(db, sessions).then(function(data) {
            reply(data);
        });

    });

}

module.exports = load;