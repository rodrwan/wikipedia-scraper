'use strict';

var SCHEMAS, Yakuza, Gurkha, getLinks;

Yakuza = require('yakuza');
Gurkha = require('gurkha');

SCHEMAS = {};

SCHEMAS.subcategories = {
  '$rule': '#mw-pages div.mw-content-ltr a',
  '$sanitizer': function ($elem) {
    return $elem.attr('href');
  }
};

SCHEMAS.options = {
  'normalizeWhitespace': true
};

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
  var template, requestUrl, requestOpts;

  requestUrl = 'http://en.wikipedia.org/wiki/Category:' + params.category;
  template = http.optionsTemplate();

  requestOpts = template.build({
    'url': requestUrl
  });

  http.get(requestOpts).then(function (result) {
    var bodyParser, linkPocket;

    bodyParser = new Gurkha(SCHEMAS.subcategories, SCHEMAS.options);
    linkPocket = bodyParser.parse(result.body);

    return linkPocket;
  })
  .then(function (links) {
    task.share('links', links);
    task.success('Total links ' + links.length);
  })
  .fail(function (err) {
    task.fail(err);
  }).done();
});
