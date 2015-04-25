'use strict';

var Yakuza, params, job;

Yakuza = require('yakuza');

require('./wikipedia/wikipedia.scraper');

// maxArticles: amount of articles to feed this app
params = {
  'category': 'Random',
  'maxArticles': 10
};

job = Yakuza.job('Wikipedia', 'Article', params);

job.routine('GetData');

job.on('job:fail', function (res) {
  console.log(res);
});

job.on('task:*:success', function (task) {
  console.log(task.data);
});

job.run();
