'use strict';

// |caches| is not working in chrome nor firefox right now, so let's
// use indexedDB as a temporary backend.
importScripts('/app/js/service/cache-polyfill.js');

function debug(str) {
  console.log('ServiceWorker: ' + str);

  if ('dump' in self) {
    dump('ServiceWorker: ' + str + '\n');
  }
}

function ServiceWorker() {
  // lifecycle events
  addEventListener('activate', this);
  addEventListener('install', this);
  addEventListener('beforeevicted', this);
  addEventListener('evicted', this);

  // network events
  addEventListener('fetch', this);

  // misc events
  addEventListener('message', this);
};

ServiceWorker.prototype.handleEvent = function(e) {
  debug(e.type);

  if (!this['on' + e.type]) {
    return;
  }

  this['on' + e.type].call(this, e);
};

