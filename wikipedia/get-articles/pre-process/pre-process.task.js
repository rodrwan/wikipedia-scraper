'use strict';

var Yakuza, Natural, _, preProcess;

Yakuza = require('yakuza');
Natural = require('natural');
_ = require('lodash');

preProcess = Yakuza.task('Wikipedia', 'Article', 'PreProcess');

preProcess.builder(function (job) {
  return {'contentPocket': job.shared('GetContent.contentPocket')};
});

preProcess.hooks({
  'onFail': function (task) {
    console.log('Retry => ' + task.runs);
    if (task.runs === 3) {
      return;
    }
    task.rerun();
  }
});

preProcess.main(function (task, http, params) {
  var contentPocket, normalizedPocket;

  contentPocket = params.contentPocket;
  normalizedPocket = [];
  Natural.PorterStemmer.attach();

  _.each(contentPocket, function (content) {
    normalizedPocket.push(content.toString().tokenizeAndStem());
  });

  task.share('dataToSave', normalizedPocket);
  task.success('Normalized data...');
});
