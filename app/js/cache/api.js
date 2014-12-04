'use strict';

importScripts('/calculator/app/js/async_storage.js');
importScripts('/calculator/app/js/protocols/protocol_helper.js');

window.addEventListener('load', function() {
  if (!navigator.serviceWorker.controller) {
    return;
  }

  var implementation = {
    recvPut: function(promise) {
      var key = location.protocol + '//' + location.host + promise.args.key;
      var response = promise.args.response;

      asyncStorage.setItem(key, response, function onSuccess() {
        promise.resolve();
      });
    },

    recvDelete: function(promise) {
      var key = location.protocol + '//' + location.host + promise.args.key;

      asyncStorage.removeItem(key, function onSuccess() {
        promise.resolve();
      });
    }
  }

  new IPDLProtocol('cache', implementation);
});
