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
  console.log(requestOpts);
  return http.get(requestOpts).then(function (result) {
    console.log(result.body);
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
  var bodyParser, parsedContent, parsedCategories;

  bodyParser = new Gurkha(SCHEMAS.content, SCHEMAS.options);
  parsedContent = bodyParser.parse(body);

  bodyParser = new Gurkha(SCHEMAS.categories, SCHEMAS.options);
  parsedCategories = bodyParser.parse(body);

  contentStack[0].push(parsedContent);
  contentStack[1].push(parsedCategories);

  return syncRequest(http, requestStack, contentStack);
}

SCHEMAS = {};

SCHEMAS.content = {
  '$rule': '#mw-content-text p',
  '$sanitizer': function ($elem) {
    return $elem.text().replace(/\s{2,}/g, ' ').trim();
  }
};

SCHEMAS.categories = {
  '$rule': '#catlinks > #mw-normal-catlinks > ul > li',
  'category': {
    '$rule': 'a',
    '$sanitizer': function ($elem) {
      return $elem.attr('title').replace('Category:', '');
    }
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

  contentStack[0] = [];
  contentStack[1] = [];
  // return a promise \o/
  syncRequest(http, requestStack, contentStack)
  .then(function (content) {
    task.share('extractedData', content);
    task.success('Content extraction done !');
  })
  .fail(function (err) {
    task.fail(err);
  })
  .done();
});
