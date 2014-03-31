var request = require('request-promise'),
    cheerio = require('cheerio'),
    _ = require('lodash'),
    sessionsUrl = 'http://apr2014.desertcodecamp.com/sessions/all';

function sessions(req, reply) {

    var db = req.server.app.db;

    request(sessionsUrl)
        .then(function(data) {
            var $ = cheerio.load(data);
            var $sessions = $('#sessions');

            // parse html to get data
            var categories = $sessions.children('h3')
                .map(function(index, element) {
                    var $el = $(element);

                    var sessions = $el.next().find('.sessionList tr#SessionRow')
                        .map(function(index, element) {
                            var $el = $(element);
                            return {
                                status: $el.attr('class'),
                                title: $el.find('td:nth-child(3)').text(),
                                description: $el.find('td:nth-child(4) a').attr('data-content')
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

                        sessionsCollection.insert(_.flatten(categories, 'sessions'), { w: 1 }, function(err, insertedSessions) {
                            reply(insertedSessions.length);
                        })

                    });

                });

            });
        });

};

module.exports = {
    sessions: sessions
};
