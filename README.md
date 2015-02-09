clerk
=======

Clerk stores stuff for anyone and gets it back to whoever has the claim ticket

Use clerk at clerk.meteor.com to cache data for another app or to give to someone. 

All the other app needs is the key  you provide.

Usage:
to put something in a bucket and get a key back:

curl -X POST --data "data=hello" http://clerk.meteor.com/ 

or
from the browser: clerk.meteor.com/post/?data=hello

Should see a response like:
{"key":"dKxCtHRvGZGgNMrxj"}

to retrieve with a key:

curl http://clerk.meteor.com/dKxCtHRvGZGgNMrxj  

