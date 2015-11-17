ClerkService = function(options) {
  
  this.options = {};
  if ( options ) {
    _.extend(this.options, options);
  }
  if ( !this.options.uiPath ) {
    this.options.uiPath = "http://clerk-ui.meteor.com/home";
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
//          'Location': "https://github.com/rjalili/clerk"
          'Location': clerkService.options.uiPath //"/info/about"
        });
        this.response.end();
//        this.redirect("/info/about");
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
        _.extend(data, this.request.body);
      }
      result = clerkService.store(data);
      this.response.writeHead(200, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      this.response.end(JSON.stringify(result));
    });

  }
  
  // check given key for being 17 characters + 8 hash characters that match the accurate hash of the id
  // use the id to look up the data
  // if key is not valid, just return {}
  this.fetch = function(key) {
    var selector ={};
    var result = {};  
    var id_hash = this.parseKey(key);
    if ( id_hash.id ) {
      var id = id_hash.id;
      var hash = id_hash.hash;
      var correct_hash = this.hash(id);
      if ( hash == correct_hash ) {
        _.extend(selector, {"_id":id});    

        var foundArray = Buckets.find(selector).fetch();
        //console.log(selector);
        result = foundArray[0];
        //result = {"result": this.request.query};
        //result = selector;        
      }      
    }
    return result;  
  }
  
  this.hash = function(id) {
    var crypto = Npm.require('crypto');
    var key = 'abc123';
    var hash = "";
    var hasher = crypto.createHmac('sha512', key);
    hasher.update(id);
    hash = hasher.digest('hex').substr(0,8);
    console.log(hash);    
    return hash;
  }

  this.makeKey = function(id) {
    var key = id + this.hash(id);
    console.log("key for id "+id+" is "+key);
    return key;
  }
  
  // split the key, which must be a string of length 25, into an ID of length 17 and a hash of length 8
  // the hash is the last 8 characters
  this.parseKey = function(key) {
    var id_hash = {"id":undefined,"hash":undefined};
    console.log("parse key "+key);
    if ( key.length > 8 ) {
      id_hash.id= key.substr(0,key.length-8);
      id_hash.hash = key.substr(-8);
    }
    console.log(JSON.stringify(id_hash));
    return id_hash;
  }
  
  this.store = function(bucketData) {
    var result, selector = {};
    var isAppending = false;
    var new_key;
    
    _.extend(selector,{"bucket":bucketData});
    _.extend(selector, {"version":"0.0.1", // this.version; 
                        "createdAt": new Date()
                       }); 

    if ( selector.bucket.key ) {
      var key = selector.bucket.key;
      var id_hash = this.parseKey(key);
      var id = id_hash.id;
      var hash = id_hash.hash;
      isAppending = true;
      var dbquery = {};
      _.extend(dbquery, {"_id":id}); // for mongo      
      _.extend(selector, {"_id":id}); // for mongo      
      //console.log(selector);
      //var options = {"upsert":true};
      writeResult = Buckets.upsert(dbquery,selector);
      
      if ( (writeResult.numberAffected) > 0 ) { //  + writeResult.nModified) > 0 ) {
        result = writeResult.insertedId;
      }
    }
    else {
      id = Buckets.insert(selector);  
      new_key = this.makeKey(id);
    }
    result = {"key":new_key};
    return result;
  }

}

clerkService = new ClerkService();
clerkService.init();

Meteor.methods({
  test: function() {
    var data = "this is a test";
    var key = clerkService.store({"data":data});
    console.log("testing to store "+data);
    console.log(" and the key after storing is "+JSON.stringify(key));
    var fetched = clerkService.fetch(key.key);
    console.log(" and the data fetched is "+JSON.stringify(fetched));
    fetched = clerkService.fetch("andthisAttemptShouldFail");
    console.log(" and the data fetched is "+JSON.stringify(fetched));
  }  
});


