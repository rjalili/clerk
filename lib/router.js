ClerkService = function(options) {
  this.options = {};
  if ( !options ) {
    this.options = {};
  }
  else {
    this.options = options;
  }
  if ( !this.options.uiPath ) {
    this.options.uiPath = "/home";
  }  
  if ( !this.options.uiTemplate ) {
    this.options.uiTemplate = "home";
  }  
  if ( !this.options.apiPath ) {
    this.options.apiPath = "/";
  }  
  if ( !this.options.apiPathForStoreByGet ) {
    this.options.apiPathForStoreByGet = "/store";
  }  
  this.version = "0.0.1";

  this.init = function() {
    console.log("init");
  }
}

  Router.route(//this.options.uiPath, 
    "/home",
    function () {
      this.render(//this.options.uiTemplate
        "home");
    }, {where: 'server'});

  Router.route(//this.options.apiPath
    "/",{ where: 'server' })
  .get(function () {
    // GET array of submissions for given token

    var selector ={};
    var result = {};

    if ( this.request.query.key ) {
      var p = this.request.query.key;
      _.extend(selector, {"_id":p});
    }
    else {
      _.extend(selector, {"_id":0});
    }
    var foundArray = Buckets.find(selector).fetch();
    
    result = {"result": foundArray[0]};
    //result = {"result": this.request.query};
    //result = selector;
    this.response.writeHead(200, {'Content-Type': 'application/json'});
    this.response.end(JSON.stringify(result));
  })
  //
  // POST Handler
  //
  .post(function () {
    // POST /webhooks/stripe
    var result, selector = {};
    var isAppending = false;
    selector = {"version":"0.0.1"};// this.version; 
    if ( this.params.key ) {
      var p = this.params.key;
      _.extend(selector, {"key":p}); // for clerk
      _.extend(selector, {"_id":p}); // for mongo
      isAppending = true;
    }

    if ( _.isObject(this.request.body) ) {
      _.extend(selector, {"bucket":this.request.body});
    }
    var result = selector;
    //    result = this.request.body;
    result = {"key": Buckets.insert(selector)};
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

  Router.route("/store", {"where":"server"}) //this.options.apiPathForStoreByGet)
  .get(function () {
    // GET array of submissions for given token

    var selector ={};
    var result = {};

    selector = {"version":"0.0.1"}; //ClerkServer.version; 

    if ( this.request.query ) {
      var p = this.request.query;
      _.extend(selector, {"bucket":p});
    }
    if ( this.request.query.key ) {
      var p = this.request.query.key;
      _.extend(selector, {"_id":p});
    }

    result = {"result": Buckets.update(selector,selector, {upsert:true})};
    //result = {"result": this.request.query};
    //result = selector;
    this.response.writeHead(200, {'Content-Type': 'application/json'});
    this.response.end(JSON.stringify(result));
  });

