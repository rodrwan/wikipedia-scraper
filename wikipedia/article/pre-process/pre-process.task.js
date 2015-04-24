'use strict';

var Yakuza, natural, _, preProcess;

Yakuza = require('yakuza');
natural = require('natural');
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
  var contentPocket;

  contentPocket = params.contentPocket;
  natural.PorterStemmer.attach();

  _.each(contentPocket, function (content) {
    console.log(content.toString().tokenizeAndStem().length);
  });

});
