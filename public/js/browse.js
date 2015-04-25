function displayRule(rule, index, array) {
  var ruleLink = $('<a/>', {
    class: 'list-group-item',
    href: 'http://google.com',
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
    var rules = JSON.parse(data);
    
    rules.forEach(displayRule);
  }
});


