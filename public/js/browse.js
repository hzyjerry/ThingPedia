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

  var ruleIcon= $('<i/>', {
    class: 'fa fa-cloud list-group-item-image',
  });


  //ruleLink.append(ruleIcon);
  ruleLink.append(ruleHeading);
  
  ruleLink.append(ruleDescription);

  $('#rule-list').append(ruleLink);
}

$.ajax({
  dataType: "text",
  url: '/db/rules.db',
  data: null,
  success: function (data) {
    var rules = JSON.parse(data);
    
    rules.forEach(displayRule);
  }
});


