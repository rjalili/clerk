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
//    console.log("init");
    
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
      this.response.writeHead(200, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      this.response.end(JSON.stringify(result));
    })

    Router.route(//this.options.apiPath
      "/",{ where: 'server' })
    /* don't seem to have the OPTIONS method in iron:router
    .options(function() {
            this.response.writeHead(200, {'Content-Type': 'application/json',
                                          'Access-Control-Allow-Origin': '*',
                                          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
                                         });
             })
             */
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
      if ( _.size(result) > 0 ) {
        this.response.writeHead(200, { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        this.response.end(JSON.stringify(result));    
      }
      else {
        this.response.writeHead(302, {
          'Location': "https://github.com/rjalili/clerk"
        });
        this.response.end();
      }
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
      this.response.writeHead(200, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      this.response.end(JSON.stringify(result));
    });

  }
  
  this.store = function(bucket) {
    var result, selector = {};
    var isAppending = false;

    _.extend(selector,bucket);
    _.extend(selector, {"version":"0.0.1", // this.version; 
                        "createdAt": new Date()
                       }); 

    if ( bucket.key ) {
      var key = bucket.key;
      isAppending = true;
      var dbquery = {};
      _.extend(dbquery, {"_id":key}); // for mongo      
      //console.log(selector);
      var options = {"upsert":true};
      if ( Buckets.update(dbquery,selector, options) > 0 ) {
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

