var fs = require('fs');
var express = require('express');
var router = express.Router();

var ruleDBPath = './db/rules.json';

router.get('/:term', function(req, res, next) {
  var queryTerm = req.params.term;

  if(!queryTerm) queryTerm = "";


  var allRules = loadRulesFromDB();


  var rules = [];

  for(var i = 0; i < allRules.length; i++)
  {
    var rule = allRules[i];
    var actions = rule.actions;

    //console.log("rule " + rule);

    if (rule.description.toString().toLowerCase().indexOf(queryTerm.toLowerCase()) != -1)
    {
      rules.push(rule);
    }

  }

  res.render('query', { 
    title: 'Recommended rules',
    rules: rules
  });

  //res.setHeader('Content-Type', 'application/json');
  //res.send(JSON.stringify(rules));
  //res.end();
});


function loadRulesFromDB() {
  //console.log('process.cwd(): ' + process.cwd());

  try {
    var data = fs.readFileSync(ruleDBPath);
    
    return JSON.parse(data);
  } catch (e)
  {
    console.log(e);
    return [];
  }
}

module.exports = router;
