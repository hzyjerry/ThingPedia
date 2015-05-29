(function() {
    Omlet.ready(function() {
      var req = {
        Type: "Text",
        PublisherName : "Sabrina",
        PublisherThumbnailUrl : "https://vast-hamlet-6003.herokuapp.com/images/world3.jpg",
      };

      if (window.ddx === undefined) {
        console.log("Must run from Omlet");
        return;
      }

      ddx.send("GetSubscriptionPublishURL", req, function(resp) {
        var url = "https://vast-hamlet-6003.herokuapp.com/webhook/hook/" + Base64.encodeURI(resp.HookURL);
        $('#retry').prop('href', url);
        Omlet.exit(Omlet.createRDL({
    	    noun: "app",
    	    displayTitle: "Sabrina",
    	    displayThumbnailUrl: "https://vast-hamlet-6003.herokuapp.com/images/world3.jpg",
    	    displayText: "Complete installation",
    	    json: false,
    	    webCallback: url,
    	    callback: url,
        }));
      }, function(){});
    });
})()
