var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('create', { title: 'Rulepedia - Create a new rule' });
});

router.get('/triggers', function(req, res, next) {
    // FIXME: unhardcode

    res.json([
        { id: 'facebook', description: "Facebook",
          events: [
              { id: 'message-received',
                description: "When I receive a message",
                params: [
                    { id: 'content-contains',
                      type: 'textarea',
                      optional: true,
                      description: "containing this text" },
                    { id: 'sender-matches',
                      type: 'facebook-contact',
                      optional: true,
                      description: "from this person" }
                ]
              },
              { id: 'photo-tagged',
                description: "When I\'m tagged on a picture" },
              { id: 'starred-contact-notification',
                description: "When a friend does something",
                params: [
                    { id: 'contact-matches',
                      type: 'facebook-contact',
                      optional: true,
                      description: "and the friend is" }
                ] }
          ] },
        { id: 'weather', description: "Weather",
          events: [
              { id: 'given-forecast',
                description: "When the forecast says",
                params: [
                    { id: 'forecast',
                      type: 'select',
                      options: { 'rain': "Rain", 'sun': "Sunny" },
                    }]
              },
              { id: 'given-temperature',
                description: "When the temperature is",
                params: [
                    { id: 'comparator',
                      type: 'select',
                      options: { 'gt': "Above", 'lt': "Below" },
                    },
                    { id: 'value',
                      type: 'temperature',
                    }
                ]
              }
          ] }
    ]);
});

module.exports = router;
