clerk
=======

Clerk stores stuff for anyone and gets it back to whoever has the claim ticket

Use clerk at clerk.meteor.com to cache data for another app or to give to someone. 

Items are stored for 1 hour (that's the intention. For now the database stores items forever)

All the other app needs is the key  you provide.

Usage:
to put something in a bucket and get a key back:

curl -X POST --data "data=hello" http://clerk.meteor.com/ 

or

from the browser: clerk.meteor.com/?data=hello

all the parameters sent in are stored and you get back a key that can retrieve them

Should see a response like:
{"key":"dKxCtHRvGZGgNMrxj"}

to retrieve with a key:

curl http://clerk.meteor.com/?key=[your key]

e.g.
curl http://clerk.meteor.com/?key=dKxCtHRvGZGgNMrxj  

#NOTE:
The "key" attribute is used by clerk for looking up your bucket. So, if you want to store "key" then put it inside another object. E.g. {data: {key: thekey, mydata: {...} }}