ClerkService = function(options) {
  this.options = {};
  if ( options ) {
    _.extend(this.options, options);
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
  
  this.store = function(bucket) {
    var result, selector = {};
    var isAppending = false;

    _.extend(selector,bucket);
    selector = {"version":"0.0.1", // this.version; 
                "createdAt": new Date()
                }; 

    if ( bucket.key ) {
      var key = bucket.key;
      isAppending = true;
      var dbquery = {};
      _.extend(dbquery, {"_id":key}); // for mongo      
      //console.log(selector);
      var options = {"upsert":true};
      if ( Buckets.update(selector,selector, options) > 0 ) {
        result = key;
      }
    }
    else {
      result = Buckets.insert(selector);      
    }
    result = {"key":result};
    return result;
  }
  
  this.fetch = function(key) {
    var selector ={};
    var result = {};  
    _.extend(selector, {"_id":key});    

    var foundArray = Buckets.find(selector).fetch();
    //console.log(selector);
    result = {"result": foundArray[0]};
    //result = {"result": this.request.query};
    //result = selector;
    return result;  
  }
}

clerkService = new ClerkService();
clerkService.init();

Router.route(//this.options.uiPath, 
  "/home",
  function () {
    this.render(//this.options.uiTemplate
      "home");
  });


Router.route(//this.options.apiPath
  "/:key",{ where: 'server' })
//
// PUT Handler
//
// TODO: just returns the request for now, should update the given bucket
.put(function (data) {
  // PUT /webhooks/stripe
  var data = {};

  if ( _.isObject(this.request.body) ) {
    _.extend(data, {"bucket":this.request.body});
  }
  if ( this.params.key ) {
    var p = this.params.key;
    _.extend(data, {"key":p}); // for clerk
  }

  result = clerkService.store(data);
  this.response.writeHead(200, {'Content-Type': 'application/json'});
  this.response.end(JSON.stringify(result));
})

Router.route(//this.options.apiPath
  "/",{ where: 'server' })
.get(function () {
  // GET array of submissions for given token
  var result = {};
  var p;
  
  var params = this.params.query;
  
  if ( params.key ) {
    p = params
    .key;
    result = clerkService.fetch(p);  
  }
  else { // if there are query params sent in with this GET, then store those params as the data
    if ( _.size(params) > 0 ) {
      result = clerkService.store({"bucket":params});      
    }
  }   
  this.response.writeHead(200, {'Content-Type': 'application/json'});
  this.response.end(JSON.stringify(result));
})
//
// POST Handler
//
.post(function () {
  // POST /webhooks/stripe
  var p;
  var data = {};

  if ( _.isObject(this.request.body) ) {
    _.extend(data, {"bucket":this.request.body});
  }
  result = clerkService.store(data);
  this.response.writeHead(200, {'Content-Type': 'application/json'});
  this.response.end(JSON.stringify(result));
});

/*
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
*/
