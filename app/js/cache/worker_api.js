'use strict';

importScripts('/calculator/app/js/protocols/protocol_helper.js');

function CacheAPI() {
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
    ProtocolHelper.newParentProtocol(target, 'cache');
}

CacheAPI.prototype.put = function(key, response) {
  return this.protocol.sendPut(key, response);
};

CacheAPI.prototype.delete = function(key) {
  return this.protocol.sendDelete(key);
};

CacheAPI.prototype.getAll = function(files) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
};
