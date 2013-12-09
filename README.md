Pirates Match 3
===============
v1.0
Copyright (c) 2009-2014 Solpeo Global sp. z o.o.

http://www.solpeo.com

This is the source code for Pirates - a match 3 game created using the Solpeo Engine.

How to build it
---------------

To build the game just run

`grunt`

It will minimize game source, create index.html file and copy all assets into `dist/` folder.
The only dependencies for grunt task are `grunt-contrib-copy` and `grunt-contrib-uglify`.

How to run it
-------------

After building the game it will become available in the `dist/` folder.
The game uses XHR requests, which won't work if you just run index.html from your folder.
To make it work you have to set up a web server to host the game.

Play hosted version
-------------------

You can also play the game online at http://pirates.solpeo.com

Create your own match 3
-----------------------

You can easily tweak the source code to create your own match 3 game.

For engine documentation refer to http://docs.solpeo.com

To get more information about the engine and other games visit http://www.solpeo.com

