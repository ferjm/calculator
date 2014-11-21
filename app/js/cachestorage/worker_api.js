'use strict';

importScripts('/calculator/app/js/protocols/protocol_helper.js');

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
}

CacheStorageAPI.prototype.open = function(key) {
  return this.protocol.sendOpen(key);
};

CacheStorageAPI.prototype.match = function(key) {
  var self = this;

  return new Promise(function(resolve, reject) {
    self.protocol.sendMatch(key).then(
      function onMatchSuccess(content) {
        var opts = {
          headers: { 'content-type': self._getContentType(key) }
        };

        if (content) {
          resolve(new Response(content, opts));
        } else {
          resolve(null);
        }
      },

      function onMatchError(rv) {
        resolve(null);
      }
    );
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
