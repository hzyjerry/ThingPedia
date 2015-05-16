var express = require('express');
var router = express.Router();

router.get('/new', function(req, res, next) {
    res.render('new-channel', { title: 'Rulepedia - Create a new channel' });
});

module.exports = router;
