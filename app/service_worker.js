'use strict';

importScripts('/calculator/app/js/service/utils.js');

var worker = new ServiceWorker();

// lifecycle events
worker.oninstall = function(e) {
  debug('oninstall');
  importScripts('/calculator/app/service_worker_files.js');

  e.waitUntil(
    caches.open('calculator-cache-v4').then(function(cache) {
      cache.addAll(kCacheFiles);
      debug('Not waiting for cache to populate');
      return Promise.resolve();
    })
  );
};

worker.onactive = function(e) {
  debug('onactive');  
};

// network events
worker.onfetch = function(e) {
  debug(e.type + ': ' + e.request.url);

//  if (SmartWorkers.handle(e)) {
//    debug('SmartWorker handle');
//    return;
//  }

  e.respondWith(
    caches.match(e.request.url).then(function(response) {
      if (!response) {
        debug('going do to a fetch for for ' + e.request.url + ', might go bad\n');
      }
      return response || fetch(e.request);
    })
  )
};
