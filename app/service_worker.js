'use strict';

importScripts('/app/js/service/utils.js');
importScripts('/app/js/service/worker_api.js');

var kCacheFiles = [
  // html
  '/app/',
  '/app/index.html',

  // style
  '/app/style/calculator.css',

  // config
  '/app/config.json',

  // scripts
  '/app/js/utils.js',
  '/app/js/client_service_worker.js',
  '/app/js/calculator.js',

  // updates
  '/app/js/update/api.js',
  '/app/js/update/worker_api.js',
  '/app/js/update/utils.js',
  '/app/js/update/config.js',
  '/app/js/update/format/unified_diff.js',

  // service worker helpers
  '/app/js/service/api.js',
  '/app/js/service/worker_api.js',
  '/app/js/service/utils.js',
  '/app/js/service/cache-polyfill.js',

  // protocols
  '/app/js/protocols/ipdl.js',
  '/app/js/protocols/lexer.js',
  '/app/js/protocols/uuid.js',
  '/app/js/protocols/protocol_helper.js',
  '/app/js/protocols/update/child.js',
  '/app/js/protocols/update/parent.js',
  '/app/js/protocols/service/child.js',
  '/app/js/protocols/service/parent.js'
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
  // It sounds simpler to replicate the app content on a
  // different url than the original one for dev purposes.
  var url = e.request.url.replace('foo/', '');

  e.respondWith(
    caches.match(url).then(function(response) {
      return response || fetch(url);
    })
  );
};

