'use strict';

importScripts('/calculator/app/js/async_storage.js');
importScripts('/calculator/app/js/cachestorage/utils.js');
importScripts('/calculator/app/js/protocols/protocol_helper.js');

window.addEventListener('load', function() {
  var implementation = {
    recvMatch: function(promise) {
      var key = promise.args.key;
      if (!key.startsWith('http')) {
        key = location.protocol + '//' + location.host + promise.args.key;
      }

      debug('recvMatch: ' + key);
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
  new IPDLProtocol(target, 'cacheStorage', implementation);

  (new AppCache()).then(function onSuccess(shouldReload) {
    if (shouldReload) {
      new ServiceAPI(doSoftReload);
    } else {
      document.getElementById('content').src = 'index.html';
    }
  });
});

window.addEventListener('cacheprogress', function(e) {
  document.getElementById('loader').value = e.detail.progress;
});
