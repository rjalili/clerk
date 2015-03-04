Clerk = function(options) {
  if ( !options ) {
    options = {
      "rootURL": "http://clerk.meteor.com",
      "apiPath": "/"
    };
  }

  Template.tokened.helpers( {
    token: function() {
      return Session.get("token");
    }
  })

  // In the client code, right after the helper definition:
  Template.storeSomething.events({
    "submit .new-bucket": function (event) {
      // This function is called when the new task form is submitted

      //console.log("foo");

      var text = event.target.text.value;

      // call API to get token for data
      HTTP.call("POST", options.rootURL+options.apiPath, 
                {data: {data: text}},
                function (error, result) {
                  if (!error) {
                    Session.set("token", result.data.key);
                  }
                  alert("storing "+text);
                });    


      // Clear form
      event.target.text.value = "";

      // Prevent default form submit
      return false;
    }
  });
}

var clerk = new Clerk();

