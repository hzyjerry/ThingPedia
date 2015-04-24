function displayRule(element, index, array) {

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


