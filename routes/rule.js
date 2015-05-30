var express = require('express');
var router = express.Router();

/* GET rule details page. */
router.get('/', function(req, res, next) {
  res.render('rule', { title: 'Sabrina\'s Magic Shop - Spell Details' });
});

module.exports = router;
