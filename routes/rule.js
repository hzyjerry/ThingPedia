var express = require('express');
var router = express.Router();

/* GET rule details page. */
router.get('/', function(req, res, next) {
  res.render('rule', { title: 'Rulepedia - Rule Details' });
});

module.exports = router;