var request = require('request-promise'),
    cheerio = require('cheerio'),
    _ = require('lodash'),
    Q = require('q'),
    sessionsUrl = 'http://apr2014.desertcodecamp.com/sessions/all',
    sessionDetailUrl = 'http://apr2014.desertcodecamp.com/session/';

function parseSessionsPage() {
    return request(sessionsUrl).then(function(data) {
        var $ = cheerio.load(data),
            $sessions = $('#sessions');

        // parse html to get data
        return $sessions.children('h3')
            .map(function(index, element) {
                var $el = $(element);

                var sessions = $el.next().find('.sessionList tr#SessionRow')
                    .map(function(index, element) {
                        var $el = $(element);
                        return {
                            status: $el.attr('class'),
                            title: $el.find('td:nth-child(3)').text(),
                            description: $el.find('td:nth-child(4) a').attr('data-content'),
                            sessionId: $el.find('#hlSessionInfo').attr('href').replace('/session.aspx?SessionId=', '')
                        }
                    })
                    .toArray();

                return {
                    name: $el.text(),
                    description: $el.next().find('small').text(),
                    sessions: sessions
                }
            })
            .toArray();
    });
};

function parseSessionDetailPage(session) {
    console.log('Parsing ' + session.title);
    return request(sessionDetailUrl + session.sessionId).then(function(data) {
        var $ = cheerio.load(data);

        session.room = $('#lblRoom').text();
        session.time = $('#lblTime').text();

        return session;
    });
};

function sessions(req, reply) {

    var db = req.server.app.db;

    parseSessionsPage().then(function(categories) {


        // store off the category data
        var tracksCollection = db.collection('tracks'),
            sessionsCollection = db.collection('sessions');

        tracksCollection.remove({}, { w: 1 }, function(err, count) {

            var mappedCategories = categories.map(function(c) {
                return { name: c.name, description: c.description };
            });
            tracksCollection.insert(mappedCategories, { w: 1 }, function(err, insertedCategories) {

                insertedCategories.forEach(function(c, i) {
                    categories[i].sessions.forEach(function(s) {
                        s.categoryId = c._id;
                    });
                });

                sessionsCollection.remove({}, { w: 1 }, function(err, count) {

                    var flattenedSessions = _.flatten(categories, 'sessions'),
                        sessionDetailsPromises = [];

                    flattenedSessions.forEach(function(s) {
                        var sessionPromise = parseSessionDetailPage(s);
                        sessionDetailsPromises.push(sessionPromise);
                    });

                    Q.all(sessionDetailsPromises).done(function(data) {
                        console.log('Finished loading all sessions');

                        sessionsCollection.insert(flattenedSessions, { w: 1 }, function(err, insertedSessions) {
                            reply(insertedSessions.length);
                        });

                    });

                });

            });

        });
    });

};

module.exports = {
    sessions: sessions
};
