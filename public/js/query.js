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
    class: 'fa fa-connectdevelop list-group-item-image',
  });

  var span = $('<span/>', {
    class: 'list-group-item-text',
  });

  var table = $('<table/>', {
    class: 'rule-table',
  });


  var tr = $('<tr/>');

  var tdIcon = $('<td/>', {
    class: 'td-align-middle td-icon-size'
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
    class: 'td-removal-button'
  });

  tdRemovalButton.append(removalButton);

  var tdContent = $('<td/>', {
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
