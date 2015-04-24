'use strict';

var Yakuza, Qsql, _, saveData;

Yakuza = require('yakuza');
Qsql = require('q-sqlite3');
_ = require('lodash');

saveData = Yakuza.task('Wikipedia', 'Article', 'SaveData');

saveData.builder(function (job) {
  return {'dataToSave': job.shared('PreProcess.dataToSave')};
});

saveData.hooks({
  'onFail': function (task) {
    console.log('Retry => ' + task.runs);
    if (task.runs === 3) {
      return;
    }
    task.rerun();
  }
});

saveData.main(function (task, http, params) {
  console.log(params);
});
