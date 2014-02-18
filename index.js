"use strict";

/*
 Copyright © 2014 World Wide Web Consortium, (Massachusetts Institute of Technology,
 European Research Consortium for Informatics and Mathematics, Keio University, Beihang).
 All Rights Reserved.

 This work is distributed under the W3C® Software License [1] in the hope that it will
 be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

 [1] http://www.w3.org/Consortium/Legal/2002/copyright-software-20021231
*/

var express = require("express"),
    gh = require("simple-github")({
        owner: "w3c",
        repo: "web-platform-tests"
    });

var server = express();

var issues = new Array();

function updateIssues() {
     gh.request("GET /repos/:owner/:repo/issues?per_page=100&state=open").then(function (opens) {
      gh.request("GET /repos/:owner/:repo/issues?per_page=100&state=closed").then(function(closed) {
        var new_issues = closed.concat(opens);
        new_issues.sort(function(a,b){
            return a.number - b.number;
        });
        issues = new_issues;
        console.log((new Date()).toISOString(), "Updated with", issues.length + " github objects");
      })
  });
}

setInterval(updateIssues, 3610000); // update every hour or so
updateIssues();

// Configuration
server.configure(function(){
    server.use(function (req, res, next) {
        res.set("Access-Control-Allow-Origin", "*");
        next();
    });
    server.use(express.compress());
    server.use(server.router);
});

server.configure('development', function() {
    server.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

server.configure('production', function() {
    server.use(express.errorHandler());
});

server.get('/issues', function (req, res, next) {
    res.send(issues);
});

var port = process.env.PORT || 8000;
server.listen(port, function() {
    console.log("Express server listening on port %d in %s mode", port, server.settings.env);
});
