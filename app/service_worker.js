'use strict';

importScripts('/js/service/utils.js');
importScripts('/js/service/worker_api.js');

var kCacheFiles = [
  // html
  '/',
  '/index.html',

  // style
  '/style/calculator.css',

  // scripts
  '/js/utils.js',
  '/js/client_service_worker.js',
  '/js/calculator.js',

  // updates
  '/js/update/api.js',
  '/js/update/worker_api.js',
  '/js/update/utils.js',
  '/js/update/config.js',
  '/js/update/format/unified_diff.js',

  // service worker helpers
  '/js/service/api.js',
  '/js/service/worker_api.js',
  '/js/service/utils.js',
  '/js/service/cache-polyfill.js',

  // protocols
  '/js/protocols/ipdl.js',
  '/js/protocols/lexer.js',
  '/js/protocols/uuid.js',
  '/js/protocols/protocol_helper.js',
  '/js/protocols/update/child.js',
  '/js/protocols/update/parent.js',
  '/js/protocols/service/child.js',
  '/js/protocols/service/parent.js'
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

