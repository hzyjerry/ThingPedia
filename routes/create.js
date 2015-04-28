var fs = require('fs');
var express = require('express');
var router = express.Router();
var crypto = require('crypto');

var ruleDBPath = './db/rules.json';

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('create', { title: 'Rulepedia - Create a new rule' });
});

router.post('/', function(req, res) {
  
  //c

  //console.log(req.body);
  //response.send(request.body);    // echo the result back

  try {
    //var rule = JSON.parse(req.body);
    
    var rule = req.body;
    var rules = loadRulesFromDB();
    console.log('rules' + rules);
    rules.push(rule);
    saveRulesToDB(rules);

    sha1sum = crypto.createHash('sha1');
    sha1sum.update(JSON.stringify(rule));

    res.status(200);
    res.end(sha1sum.digest('hex'));
  } catch (e) {
    console.log('ASDASDASDASDASDASDASDASD');
    res.status(500);
    res.end();
  }
  
});








function saveRulesToDB(rules) {
  var data = JSON.stringify(rules, null, 4);
  fs.writeFileSync(ruleDBPath, data, 'utf-8');
}

function loadRulesFromDB() {
  console.log('process.cwd(): ' + process.cwd());

  try {
    var data = fs.readFileSync(ruleDBPath);
    return JSON.parse(data);
  } catch (e)
  {
    return [];
  }
}



module.exports = router;
