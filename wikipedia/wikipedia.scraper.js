'use strict';

var Yakuza = require('yakuza');

require('./get-articles/get-articles.agent');

Yakuza.scraper('Wikipedia').routine('GetData', [
  'GetLInks',
  'GetContent',
  'PreProcess'
]);
