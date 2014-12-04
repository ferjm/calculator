'use strict';

importScripts('/calculator/app/js/service/utils.js');
importScripts('/calculator/app/js/protocols/protocol_helper.js');
importScripts('/calculator/app/js/cache/worker_api.js');
importScripts('/calculator/app/service_worker_files.js');

function CacheStorageAPI() {
  // On chrome, let's use the real cache directly.
  if (!('Worker' in self)) {
    return caches;
  }

  this.protocol = new IPDLProtocol(self, 'cacheStorage');

  this.cache = new CacheAPI();
}

CacheStorageAPI.prototype.open = function(key) {
  var cache = this.cache;
  return new Promise(function(resolve, reject) {
    resolve(cache);
  });
};

CacheStorageAPI.prototype.match = function(key) {
  var self = this;

  return new Promise(function(resolve, reject) {
    clients.getAll().then(function(windows) {
      // Ensure there is someone on the other side.
      if (!windows.length) {
        resolve(null);
        return;
      }

      // There is someone to answer, lets send it the message.
      self.protocol.sendMatch(key).then(
        function onMatchSuccess(content) {
          var opts = {
            headers: { 'content-type': getContentType(key) }
          };
          resolve(content ? new Response(content, opts) : null);
        },

        function onMatchError(rv) {
          resolve(null);
        }
      );
    });
  });
};
