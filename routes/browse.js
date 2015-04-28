var express = require('express');
var router = express.Router();

var ruleDBPath = '/model/rules.db';

router.get('/', function(req, res, next) {
  res.render('browse', { title: 'Rulepedia - Browse rules' });
});

module.exports = router;
