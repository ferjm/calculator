'use strict';

var kCacheFiles = [
  // html
  '/calculator/app/index.html',

  // style
  '/calculator/app/style/calculator.css',

  // config
  '/calculator/app/config.json',

  // scripts
  '/calculator/app/js/utils.js',
  '/calculator/app/js/string-polyfill.js',
  '/calculator/app/js/calculator.js',
  '/calculator/app/js/calculator_sw.js',

  // updates
  '/calculator/app/js/update/api.js',
  '/calculator/app/js/update/worker_api.js',
  '/calculator/app/js/update/utils.js',
  '/calculator/app/js/update/config.js',
  '/calculator/app/js/update/format/unified_diff.js',

  // service worker helpers
  '/calculator/app/js/service/api.js',
  '/calculator/app/js/service/worker_api.js',
  '/calculator/app/js/service/utils.js',
  '/calculator/app/js/service/cache-polyfill.js',

  // protocols
  '/calculator/app/js/protocols/ipdl.js',
  '/calculator/app/js/protocols/ipdl_parser.js',
  '/calculator/app/js/protocols/bridge.js',
  '/calculator/app/js/protocols/protocol.js',
  '/calculator/app/js/protocols/store.js',
  '/calculator/app/js/protocols/message.js',
  '/calculator/app/js/protocols/utils/uuid.js',
  '/calculator/app/js/protocols/protocol_helper.js',
  '/calculator/app/js/protocols/ipdl/PUpdate.ipdl',
  '/calculator/app/js/protocols/ipdl/PService.ipdl',
  '/calculator/app/js/protocols/ipdl/PCache.ipdl',
  '/calculator/app/js/protocols/ipdl/PCacheStorage.ipdl',

  '/calculator/patches/nightly_0.0.1...nightly_master',
  '/calculator/patches/nightly_0.0.1.1...nightly_master'
];
