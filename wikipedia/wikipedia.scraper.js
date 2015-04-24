'use strict';

var Yakuza = require('yakuza');

require('./article/article.agent');

Yakuza.scraper('Wikipedia').routine('GetData', [
  'GetLInks',
  'GetContent',
  'PreProcess'
]);
