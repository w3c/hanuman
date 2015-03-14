"use strict";

/*
 Copyright © 2015 World Wide Web Consortium, (Massachusetts Institute of Technology,
 European Research Consortium for Informatics and Mathematics, Keio University, Beihang).
 All Rights Reserved.

 This work is distributed under the W3C® Software License [1] in the hope that it will
 be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

 [1] http://www.w3.org/Consortium/Legal/2002/copyright-software-20021231
*/
var express = require("express"),
    issues = require("./issues"),
    compression = require('compression'),
    errorhandler = require('errorhandler'),
    morgan = require('morgan');

var server = express();

server.use(morgan('combined'));

// Configuration
server.use(function (req, res, next) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Server", "https://github.com/w3c/hanuman");
  next();
});
server.use(compression());


server.get('/issues', function (req, res, next) {
    res.jsonp(issues.get());
});

server.use(errorhandler);


var port = process.env.PORT || 8080;
server.listen(port, function() {
    console.log("Express server listening on port %d", port);
});
