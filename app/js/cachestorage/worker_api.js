'use strict';

importScripts('/calculator/app/js/protocols/protocol_helper.js');
importScripts('/calculator/app/js/cache/worker_api.js');

function CacheStorageAPI() {
  var target = {
    addEventListener: function(type, callback) {
      addEventListener(type, callback);
    },

    postMessage: function(msg) {
      clients.getAll().then(function(windows) {
        windows.forEach(function(window) {
          window.postMessage(msg);
        });
      });
    }
  };

  this.protocol =
    ProtocolHelper.newParentProtocol(target, 'cacheStorage');

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
            headers: { 'content-type': self._getContentType(key) }
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

CacheStorageAPI.prototype._getContentType = function(filename) {
  if (filename.endsWith('.css')) {
    return 'text/css';
  } else if (filename.endsWith('.json')) {
    return 'application/json';
  } else if (filename.endsWith('.js')) {
    return 'application/javascript';
  } else if (filename.endsWith('.html')) {
    return 'text/html';
  }

  return 'text/plain';
};
