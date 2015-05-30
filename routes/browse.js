var express = require('express');
var router = express.Router();

var ruleDBPath = '/model/rules.db';

router.get('/', function(req, res, next) {
  res.render('browse', { title: 'Sabrina\'s Magic Shop - Browse spells' });
});

module.exports = router;
