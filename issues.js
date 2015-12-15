/*
 Copyright © 2015 World Wide Web Consortium, (Massachusetts Institute of Technology,
 European Research Consortium for Informatics and Mathematics, Keio University, Beihang).
 All Rights Reserved.

 This work is distributed under the W3C® Software License [1] in the hope that it will
 be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

 [1] http://www.w3.org/Consortium/Legal/2002/copyright-software-20021231
*/
var io = require('./io-promise'),
    gh = require("simple-github")({
        owner: "w3c",
        repo: "web-platform-tests"
    });

var ISSUES_FILENAME = "/tmp/issues.json";

var issues = {};

var data = [];

io.read(ISSUES_FILENAME).then(function (res) {
  return res.json();
}).then(function (obj) {
  data = obj;
  console.log("Loaded %d issues from %s", data.length, ISSUES_FILENAME);
}).catch(function (err) {
  console.log("Unable to load issues from %s", ISSUES_FILENAME);
});

function fetchIssues() {
  return gh.request("GET /repos/:owner/:repo/issues?per_page=100&state=open")
  .then(function (opens) {
    return gh.request("GET /repos/:owner/:repo/issues?per_page=100&state=closed")
    .then(function(closed) {
      return closed.concat(opens);
    });
  })
  .then(function (new_issues) {
    new_issues.sort(function(a,b){
      return a.number - b.number;
    });
    data = new_issues;
    return io.save(ISSUES_FILENAME, data)
      .then(function () { return data;});
  });
}

function updateIssues() {
  var start = new Date().getTime();
  fetchIssues()
  .then(function (obj) {
    var now = new Date().getTime();
    console.log("%s Loaded %d github issues in %ds",
      new Date().toISOString(),
      obj.length,
      ((now - start)/1000));
    return obj;
  }).catch(function (err) {
      console.log("%s Failed to load github issues",
                  new Date().toISOString());
      console.log(err);
  });
}

setInterval(updateIssues, 3610000); // update every hour or so

updateIssues();

issues.get = function () {
  return data;
};

module.exports = issues;
