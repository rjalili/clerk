Router.route("/home", function () {
    name: "home"
  });

Router.route("/:key", 
             { where: 'server', name: "clerk" })
  .get(function () {
    // GET array of submissions for given token

    var selector ={};
    var result = {};
    
    if ( this.params.key ) {
      var p = this.params.key;
      _.extend(selector, {"key":p});
    }
    result = {"result": Events.find(selector).fetch()};

    this.response.writeHead(200, {'Content-Type': 'application/json'});
    this.response.end(JSON.stringify(result));
  })
//
// POST Handler
//
  .post(function () {
    // POST /webhooks/stripe
    var result, selector = {};
    if ( this.params.key ) {
      var p = this.params.key;
      _.extend(selector, {"key":p}); // for clerk
      _.extend(selector, {"_id":p}); // for mongo
    }
    
    if ( _.isObject(this.request.body) ) {
      _.extend(selector, this.request.body});
    }
    var result = selector;
//    result = this.request.bod;
    result = {"_id": Events.upsert(selector)};
    this.response.writeHead(200, {'Content-Type': 'application/json'});
    this.response.end(JSON.stringify(result));
  })
//
// PUT Handler
//
  .put(function () {
    // PUT /webhooks/stripe
    var result = this.request;
    this.response.writeHead(200, {'Content-Type': 'application/json'});
    this.response.end(JSON.stringify(result));
  })

/*
Router.map(function() {
  this.route("home", {
    path: "/"
  });
  this.route("getBucket", {
   path: "/data/:token",
   action: function () {
  var token = this.params.token;
  var result = { 
                token: token,
                bucket: Buckets.findOne({"_id":token})
                };
    //console.log(result);
    this.response.writeHead(200, {'Content-Type': 'application/json'});
    this.response.end(JSON.stringify(result));
  },
  where: 'server',
  });

  this.route('token', {
  path: "/token",
  where: 'server',
  action: function () {
        // add data to cache and get token back
        // pass token to anyone else and they can retrieve your data
    var data = this.request.body.data; //@@TODO not getting the posted data,getting null
    if ( !data ) { data = this.params.data; }
    //console.log(data);
    result = {
              token: Buckets.insert({"data": data})
             };
    
    this.response.writeHead(200, {'Content-Type': 'application/json'});
    this.response.end(JSON.stringify(result));
  }
});

}); // end Router.map()
*/