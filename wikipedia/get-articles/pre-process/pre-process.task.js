'use strict';

var Yakuza, Natural, _, preProcess;

Yakuza = require('yakuza');
Natural = require('natural');
_ = require('lodash');

preProcess = Yakuza.task('Wikipedia', 'Article', 'PreProcess');

preProcess.builder(function (job) {
  return {'extractedData': job.shared('GetContent.extractedData')};
});

preProcess.hooks({
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

preProcess.main(function (task, http, params) {
  var contentPocket, categoryPocket, normalizedPocket;

  contentPocket = params.extractedData[0];
  categoryPocket = params.extractedData[1];

  normalizedPocket = [];
  Natural.LancasterStemmer.attach();

  _.each(contentPocket, function (content) {
    // if true its passed to tokenizeAndStem then stopwords appear.
    normalizedPocket.push(content.join(' ').toString().tokenizeAndStem());
  });

  console.log('Total categories: ' + categoryPocket.length);
  task.share('dataToSave', normalizedPocket);
  task.success('Normalized data...');
});
