function displayRule(rule, index, array) {
  var url = Rulepedia.Util.computeRuleURI(rule);
  var ruleLink = $('<a/>', {
    class: 'rule-link list-group-item',
    href: url.substring(url.indexOf("/rule")),
  });

  var ruleHeading = $('<p/>', {
    class: 'rule-name',
    text: rule.name,
  });

  var ruleDescription = $('<p/>', {
    class: 'rule-description',
    text: rule.description,
  });

  var ruleIcon = $('<i/>', {
    class: 'fa fa-connectdevelop',
  });

  var span = $('<span/>', {
    class: '',
  });

  var table = $('<table/>', {
    class: 'rule-table',
  });


  var tr = $('<tr/>');

  var tdIcon = $('<td/>', {
    class: 'td-rule-icon'
  });

  tdIcon.append(ruleIcon);

  var removalButton = $('<button/>', {
    class: 'btn btn-danger',
    text: "Delete",
    type: "button",
  });

  removalButton.on('click', function(event) {
    removeRule(rule.id);
    //event.preventDefault();
    event.stopPropagation();
    return false;
  });

  var tdRemovalButton = $('<td/>', {
    class: 'td-rule-removal-button'
  });

  tdRemovalButton.append(removalButton);

  var tdContent = $('<td/>', {
    class: 'td-rule-content'
  });

  tdContent.append(ruleHeading);
  tdContent.append(ruleDescription);


  table.append(tdIcon);
  table.append(tdContent);
  //table.append(tdRemovalButton);
  table.append(tr);
  ruleLink.append(table);

  $('#rule-list').append(ruleLink);
}

function removeRule(ruleID)
{
 $.ajax({
    type: "POST",
    dataType: "text",
    url: 'remove',
    data: {"id" : ruleID},
    success: function (data) {
      alert('Rule removed!');
      pollRules(false);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(textStatus, errorThrown);
      alert('Rule cannot be removed!');
      pollRules(false);
    }
  });
}

function updateRuleList(rules)
{
  $('#rule-list').empty();
  rules.forEach(displayRule);
  installFromBrowse();
}

function installFromBrowse() {
  var rules = document.getElementsByClassName("list-group-item");
  for (var i = 0; i < rules.length; i++) {
    var rule = rules[i];
    if (typeof Android !== 'undefined') {
      url = rule.href;
      rule.removeAttribute("href");
      rule.onclick = function() {
        Android.installRule(JSON.stringify(Rulepedia.Util.getBackRule(url)));
      };
    }
  }
};
