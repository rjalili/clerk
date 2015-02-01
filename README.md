tokened
=======

Tokened data store

Use token at tokened.meteor.com to cache data for another app or to give to someone. 

All the other app needs is the token you give you provide.

Usage:
to put something in a bucket and get a token back:

curl -X POST --data "data=hello" http://tokened.meteor.com/token 

or
from the browser: tokened.meteor.com/token/?data=hello

Should see a response like:
{"token":"dKxCtHRvGZGgNMrxj"}

to retrieve a bucket with a token:

curl http://tokened.meteor.com/data/dKxCtHRvGZGgNMrxj  

