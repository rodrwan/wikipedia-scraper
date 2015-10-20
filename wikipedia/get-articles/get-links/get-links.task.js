'use strict';

var Yakuza, Q, getLinks, Gurkha, SCHEMA, cheerio, _;

Yakuza = require('yakuza');
Gurkha = require('gurkha');
Q = require('q');
cheerio = require('cheerio');
_ = require('lodash');

SCHEMA = {};

SCHEMA.content = {
  '$rule': '.w3-table-all tr:not(:nth-child(1))',
  '$sanitizer': function ($elem) {
    return $elem.text().replace(/\s{2,}/g, ' ').trim();
  },
  'selector': {
    '$rule': 'td:nth-child(1)'
  },
  'description': {
    '$rule': 'td:nth-child(3)'
  }
};

SCHEMA.options = {
  'options': {
    'normalizeWhitespace': true
  }
};

getLinks = Yakuza.task('Wikipedia', 'Article', 'GetLinks');

getLinks.builder(function (job) {
  return job.params;
});

getLinks.hooks({
  'onFail': function (task) {
    console.log('Retry => ' + task.runs);
    console.log('Something went wrong with PreProcess task.');
    console.log('Error: ')
    console.log(task.error);

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
  requestUrl = 'http://www.w3schools.com/cssref/css_selectors.asp';
  template = http.optionsTemplate();
  requestOpts = template.build({
    'url': requestUrl
  });

  http.get(requestOpts).then(function (result) {
    var bodyParser, response, $, trs;

    bodyParser = new Gurkha(SCHEMA.content, SCHEMA.options);
    response =  bodyParser.parse(result.body);

    task.success(response);
  }).fail(function (err) {
    task.fail(err);
  }).done();
  // promisePocket.push(request);


  // console.log('Getting random data to seed the system.');
  // Q.all(promisePocket)

  // .then(function (links) {
  //   task.share('links', links);
  //   task.success('Total links ' + links.length);
  // })

  // .fail(function (err) {

  //   task.fail(err);
  // }).done();
});
