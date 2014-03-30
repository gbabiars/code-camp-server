var request = require('request-promise'),
    cheerio = require('cheerio'),
    sesionsUrl = 'http://apr2014.desertcodecamp.com/sessions/all';

function destroyCategories() {
    return knex('categories').del();
}

function insertCategories(categories) {
    return knex('categories')
        .returning('id')
        .insert(categories);
}

function sessions(req, reply) {

    var knex = req.server.app.knex;

    request(sesionsUrl)
        .then(function(data) {
            var $ = cheerio.load(data);
            var $sessions = $('#sessions');

            var categories = $sessions.children('h3')
                .map(function(index, element) {
                    var $el = $(element);
                    return {
                        name: $el.text(),
                        description: $el.next().find('small').text()
                    }
                })
                .toArray();

            knex.transaction(function(t) {
                knex('categories')
                    .transacting(t)
                    .del()
                    .then(t.commit, t.rollback);
            }).then(function() {
                knex('categories')
                    .insert(categories)
                    .then(function() {
                        reply('done');
                    });
            });
        });

}

module.exports = {
    sessions: sessions
};