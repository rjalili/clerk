Buckets = new Mongo.Collection ("Buckets");

Router.map(function() {
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
    //console.log(data);
    result = {
              token: Buckets.insert({"data": data})
             };
    
    this.response.writeHead(200, {'Content-Type': 'application/json'});
    this.response.end(JSON.stringify(result));
  }
});

}); // end Router.map()

/*
HTTP.methods({
    '/token': {
      get: function(data) {},
      post: function(data) {
        // add data to cache and get token back
        // pass token to anyone else and they can retrieve your data
        bucket
      },
      // put: function(data) {},
      delete: function(data) {}
    }
  });
  */
