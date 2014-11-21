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
  this.protocol =
    ProtocolHelper.newParentProtocol(target, 'cacheStorage');
}

CacheStorageAPI.prototype.match = function(request) {
  return this.protocol.sendMatch(request);
};

