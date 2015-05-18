function displayRule(rule, index, array) {
  var url = Rulepedia.Util.computeRuleURI(rule);
  var ruleLink = $('<a/>', {
    class: 'list-group-item',
    href: url.substring(url.indexOf("/rule")),
  });

  var ruleHeading = $('<h4/>', {
    class: 'list-group-item-heading',
    text: rule.name,
  });

  var ruleDescription = $('<p/>', {
    class: 'list-group-item-text',
    text: rule.description,
  });

  var ruleIcon = $('<i/>', {
    class: 'fa fa-cloud list-group-item-image',
  });

  var span = $('<span/>', {
    class: 'list-group-item-text',
  });

  var table = $('<table/>');

  var tr = $('<tr/>');

  var tdIcon = $('<td/>', {
    class: 'td-align-middle td-icon-size'
  });

  tdIcon.append(ruleIcon);

  var tdContent = $('<td/>', {
  });

  tdContent.append(ruleHeading);
  tdContent.append(ruleDescription);


  table.append(tdIcon);
  table.append(tdContent);
  table.append(tr);
  ruleLink.append(table);

  $('#rule-list').append(ruleLink);
}

$.ajax({
  dataType: "text",
  url: '/db/rules.json',
  data: null,
  success: function (data) {
    try{
      var rules = JSON.parse(data);
      rules.forEach(displayRule);
      installFromBrowse();
    } catch (e) {
      console.log(e);
    }
  }
});

function installFromBrowse() {
  var rules = document.getElementsByClassName("list-group-item");
  for (var i = 0; i < rules.length; i++) {
    var rule = rules[i];
    if (typeof Android !== 'undefined') {
      url = rule.href;
      rule.removeAttribute("href");
      rule.onclick = function() {
        // $('#install-rule-url').text("Click here");
        // $('#install-rule-url').onclick = function() {
          // console.log("Hello world");
        Android.installRule(JSON.stringify(Rulepedia.Util.getBackRule(url)));
        // }
        // $('#install-rule-dialog').modal();
      };
    }
  }
};
