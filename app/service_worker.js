'use strict';

importScripts('/calculator/app/js/service/utils.js');
importScripts('/calculator/app/js/service/static.js');
importScripts('/calculator/app/js/service/worker_api.js');
importScripts('/calculator/app/js/cachestorage/worker_api.js');
importScripts('/calculator/app/js/cache/worker_api.js');

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
  '/calculator/app/js/protocols/utils/lexer.js',
  '/calculator/app/js/protocols/utils/uuid.js',
  '/calculator/app/js/protocols/protocol_helper.js',
  '/calculator/app/js/protocols/update/child.js',
  '/calculator/app/js/protocols/update/parent.js',
  '/calculator/app/js/protocols/service/child.js',
  '/calculator/app/js/protocols/service/parent.js'
];

var worker = new ServiceWorker();
var cachesAPI = new CacheStorageAPI();
var cacheAPI = new CacheAPI();

// lifecycle events

worker.oninstall = function(e) {
  // XXX For the moment, for beeing compatible with Firefox, this part is done
  // on the hidden window side.

  //e.waitUntil(
    //caches.open('calculator-cache-v4').then(function(cache) {
      //return cache.addAll(kCacheFiles);
    //})
  //);
};


// network events

worker.onfetch = function(e) {
  debug(e.type + ': ' + e.request.url);
  if (StaticResources.handle(e)) {
    return;
  }

  e.respondWith(
    cachesAPI.match(e.request.url).then(function(response) {
      return response || fetch(e.request);
    })
  )
};
