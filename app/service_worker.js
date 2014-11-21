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
  '/calculator/app/js/protocols/utils/lexer.js',
  '/calculator/app/js/protocols/utils/uuid.js',
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
  // Chrome has a fun cache issue with XHR from an other worker and
  // ServiceWorker. So in order to workaround it, a timestamp is
  // added to the url, to make sure the request ends up in the
  // service worker.
  // In order to retrieve the correct match, it needs to be removed
  // before looking into the database.
  // XXX e.request.url may have a better way to know the params.
  var url = e.request.url;
  if (url.indexOf('?') !== -1) {
    url = url.replace(/\?.+/, '');
    // XXX It seems to help for a race. Makes no sense.
    debug('');
  }

  e.respondWith(
    caches.match(url).then(function(response) {
      return response || fetch(e.request);
    })
  );
};

