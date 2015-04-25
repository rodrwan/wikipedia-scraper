'use strict';

var SCHEMAS, Yakuza, Gurkha, _, getContent;

Yakuza = require('yakuza');
Gurkha = require('gurkha');
_ = require('lodash');

/**
 * [syncRequest description]
 * @param  {[type]} http         [description]
 * @param  {[type]} requestStack [description]
 * @param  {[type]} contentStack [description]
 * @return {[type]}              [description]
 */
function syncRequest (http, requestStack, contentStack) {
  var requestOpts = requestStack.shift();

  if (typeof requestOpts === 'undefined') {
    return contentStack;
  }
  console.log('Requesting...');
  return http.get(requestOpts).then(function (result) {
    return processResponse(http, result.body, requestStack, contentStack);
  });
}

/**
 * [processResponse description]
 * @param  {[type]} http         [description]
 * @param  {[type]} body         [description]
 * @param  {[type]} requestStack [description]
 * @param  {[type]} contentStack [description]
 * @return {[type]}              [description]
 */
function processResponse (http, body, requestStack, contentStack) {
  var bodyParser;

  bodyParser = new Gurkha(SCHEMAS.content, SCHEMAS.options);
  contentStack.push(bodyParser.parse(body));

  return syncRequest(http, requestStack, contentStack);
}

SCHEMAS = {};

SCHEMAS.content = {
  '$rule': '#mw-content-text p',
  '$sanitizer': function ($elem) {
    return $elem.text().replace(/\s{2,}/g, ' ').trim();
  }
};

SCHEMAS.options = {
  'normalizeWhitespace': true
};

getContent = Yakuza.task('Wikipedia', 'Article', 'GetContent');

getContent.builder(function (job) {
  return {'links': job.shared('GetLinks.links')};
});

getContent.hooks({
  'onFail': function (task) {
    console.log('Retry => ' + task.runs);
    if (task.runs === 3) {
      return;
    }
    task.rerun();
  }
});

/*
 *
 */
getContent.main(function (task, http, params) {
  var template, requestUrl, requestOpts, requestStack, contentStack;

  contentStack = [];
  requestStack = [];
  template = http.optionsTemplate();

  _.each(params.links, function (link) {
    requestUrl = link;
    requestOpts = template.build({
      'url': requestUrl
    });

    requestStack.push(requestOpts);
  });
  // return a promise \o/
  syncRequest(http, requestStack, contentStack)
  .then(function (content) {
    task.share('contentPocket', content);
    task.success('Content extraction done !');
  })
  .fail(function (err) {
    task.fail(err);
  })
  .done();
});
