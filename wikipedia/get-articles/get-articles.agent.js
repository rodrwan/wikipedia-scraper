'use strict';

var Yakuza = require('yakuza');

require('./get-links/get-links.task');
require('./get-content/get-content.task');
require('./pre-process/pre-process.task');

Yakuza.agent('Wikipedia', 'Article')
  .plan([
    'GetLinks',
    'GetContent',
    'PreProcess'
  ])
  .routine('GetData', [
    'GetLinks',
    // 'GetContent',
    // 'PreProcess'
  ]);
