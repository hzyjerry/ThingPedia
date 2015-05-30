var fs = require('fs');
var express = require('express');
var router = express.Router();
var crypto = require('crypto');

var ruleDBPath = './db/rules.json';

router.post('/', function(req, res) {

  try { 
    var ruleID = req.body.id;
    //console.log('ruleID ' + ruleID);
    var rules = loadRulesFromDB();

    var found = 0;

    for(var i = 0; i < rules.length; i++) {
      //console.log('rule.id ' + rules[i].id);
      
      if(rules[i].id == ruleID)
      {
        rules.splice(i, 1);
        found = 1;
        break;
      }
    }

    if(found)
    {
      saveRulesToDB(rules);
      res.status(200);
    }
    else
    {
      res.status(418);
    }
    
    res.end();
  } catch (e) {
    console.log('Error saving rule');
    res.status(500);
    res.end();
  }
  
});








function saveRulesToDB(rules) {
  var data = JSON.stringify(rules, null, 4);
  fs.writeFileSync(ruleDBPath, data, 'utf-8');
}

function loadRulesFromDB() {
  //console.log('process.cwd(): ' + process.cwd());

  try {
    var data = fs.readFileSync(ruleDBPath);
    return JSON.parse(data);
  } catch (e)
  {
    return [];
  }
}



module.exports = router;
