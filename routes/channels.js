var express = require('express');
var router = express.Router();

router.get('/new', function(req, res, next) {
    res.render('new-channel', { title: 'Sabrina\'s Magic Shop - Create a new magic wand' });
});

module.exports = router;
