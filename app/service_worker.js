'use strict';

importScripts('/calculator/app/js/service/utils.js');
importScripts('/calculator/app/js/service/worker_api.js');

var kCacheFiles = [
  // html
  '/calculator/app/',
  '/calculator/app/index.html',

  // style
  '/calculator/app/style/calculator.css',

  // config
  '/calculator/app/config.json',

  // scripts
  '/calculator/app/js/utils.js',
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
  '/calculator/app/js/protocols/lexer.js',
  '/calculator/app/js/protocols/uuid.js',
  '/calculator/app/js/protocols/protocol_helper.js',
  '/calculator/app/js/protocols/update/child.js',
  '/calculator/app/js/protocols/update/parent.js',
  '/calculator/app/js/protocols/service/child.js',
  '/calculator/app/js/protocols/service/parent.js'
];

var worker = new ServiceWorker();

// lifecycle events

worker.oninstall = function(e) {
  e.waitUntil(
    caches.open('calculator-cache-v4').then(function(cache) {
      return cache.addAll(kCacheFiles);
    })
  );
};


// network events

worker.onfetch = function(e) {
  e.respondWith(
    caches.match(e.request.url).then(function(response) {
      return response || fetch(e.request);
    })
  );
};

