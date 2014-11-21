'use strict';

// XXX Firefox compat with latest spec
if ('getServiced' in clients) {
  clients.getAll = clients.getServiced;
}

importScripts('/calculator/app/js/service/utils.js');
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
  //e.waitUntil(
    //caches.open('calculator-cache-v4').then(function(cache) {
      //return cache.addAll(kCacheFiles);
    //})
  //);
};


// network events

worker.onfetch = function(e) {
  debug('in fetch ' + e.type + ' ' + e.request.url);
  if (e.request.url.indexOf('cache.html') !== -1) {
    e.respondWith(new Promise(function(resolve, reject) {
      var opts = {
        headers: { 'content-type': 'text/html' }
      };
      resolve(new Response('<html><head><title>Cache Polyfill</title><script src="/calculator/app/js/cachestorage/api.js"></script></head></html>', opts));
    }));
  } else if (e.request.url.indexOf('syn.html') !== -1) {
    e.respondWith(new Promise(function(resolve, reject) {
      cachesAPI.match(e.request.url).then(function(c) {
        debug('got content ' + c);
        var opts = {
          headers: { 'content-type': 'text/html' }
        };
        resolve(new Response(c, opts));
      });
    }));
  } else {
    e.respondWith(
      fetch(e.request)
    );
  }
};
