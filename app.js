'use strict';

var Yakuza, params, job, express, port, app, server, bodyParser, http;

Yakuza = require('yakuza');
express = require('express');
bodyParser = require('body-parser');
http = require('http');

port = 8000;
app = express();
app.use(bodyParser.json());
server = http.createServer(app);


require('./wikipedia/wikipedia.scraper');

// maxArticles: amount of articles to feed this app
params = {
  'category': 'Random',
  'maxArticles': 100
};

app.get('/cssselector', function (req, res) {
  job = Yakuza.job('Wikipedia', 'Article', params);

  job.routine('GetData');

  job.on('job:fail', function (res) {
    console.log(res);
  });

  job.on('job:success', function (res) {
    console.log(res);
  });

  job.on('task:*:success', function (task) {
    res.json(task.data);
  });

  job.run();
});


server.listen(port);
