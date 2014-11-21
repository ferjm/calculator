'use strict';

importScripts('/calculator/app/js/async_storage.js');
importScripts('/calculator/app/js/protocols/protocol_helper.js');

window.addEventListener('load', function() {
  var implementation = {
    recvMatch: function(promise) {
      var key = promise.args.key;

      asyncStorage.getItem(key, function(value) {
        promise.resolve(value);
      });
    }
  }

  var target = {
    addEventListener: function(type, callback) {
      addEventListener(type, callback);
    },

    postMessage: function(msg) {
      navigator.serviceWorker.controller.postMessage(msg);
    }
  };
  ProtocolHelper.newChildProtocol(target, 'cacheStorage', implementation);
});
