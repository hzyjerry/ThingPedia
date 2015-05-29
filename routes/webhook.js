var fs = require('fs');
var express = require('express');
var router = express.Router();
var crypto = require('crypto');

router.get('/install', function(req, res, next) {
    res.render('webhook-install', { title: 'Sabrina - Install to Omlet' });
});

router.get('/hook/*', function(req, res, next) {
    res.render('webhook-redirect', { title: 'Sabrina - Install to Omlet' });
});

module.exports = router;
