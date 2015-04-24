'use strict';

var Yakuza, Q, getLinks;

Yakuza = require('yakuza');
Q = require('q');

getLinks = Yakuza.task('Wikipedia', 'Article', 'GetLinks');

getLinks.builder(function (job) {
  return job.params;
});

getLinks.hooks({
  'onFail': function (task) {
    console.log('Retry => ' + task.runs);
    if (task.runs === 3) {
      return;
    }
    task.rerun();
  }
});

getLinks.main(function (task, http, params) {
  var template, requestUrl, requestOpts, i, promisePocket, request;

  promisePocket = [];
  requestUrl = 'http://en.wikipedia.org/wiki/Special:' + params.category;
  template = http.optionsTemplate();
  requestOpts = template.build({
    'url': requestUrl
  });

  for (i = 0; i < params.maxArticles; i++) {
    request = http.get(requestOpts).then(function (result) {
      return result.res.headers.location;
    });
    promisePocket.push(request);
  }

  console.log('Getting random data to seed the system.');
  Q.all(promisePocket).then(function (links) {
    task.share('links', links);
    task.success('Total links ' + links.length);
  })
  .fail(function (err) {
    task.fail(err);
  }).done();
});
