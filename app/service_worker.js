'use strict';

importScripts('/calculator/app/js/service/utils.js');
importScripts('/calculator/app/js/service/static.js');
importScripts('/calculator/app/js/service/worker_api.js');
importScripts('/calculator/app/js/cachestorage/worker_api.js');

var worker = new ServiceWorker();
var cachesAPI = new CacheStorageAPI();

// lifecycle events
worker.oninstall = function(e) {
};


// network events
worker.onfetch = function(e) {
  debug(e.type + ': ' + e.request.url);
  if (StaticResources.handle(e)) {
    return;
  }

  e.respondWith(
    cachesAPI.match(e.request.url).then(function(response) {
      if (!response) {
        debug('going do to a fetch for for ' + e.request.url + ', might go bad\n');
      }
      return response || fetch(e.request);
    })
  )
};
