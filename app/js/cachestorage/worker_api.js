'use strict';

importScripts('/calculator/app/js/protocols/protocol_helper.js');

function CacheStorageAPI() {
  var target = {
    addEventListener: function(type, callback) {
      addEventListener(type, callback);
    },

    postMessage: function(msg) {
      clients.getServiced().then(function(windows) {
        windows.forEach(function(window) {
          window.postMessage(msg);
        });
      });
    }
  };
  try {
    this.protocol =
      ProtocolHelper.newParentProtocol(target, 'cacheStorage');
  } catch (e) {
    debug(e)
    debug(e.stack.caller)
  }
}

CacheStorageAPI.prototype.match = function(request) {
  return this.protocol.sendMatch(request);
};

