'use strict';

importScripts('/calculator/app/js/async_storage.js');
importScripts('/calculator/app/js/cachestorage/utils.js');
importScripts('/calculator/app/js/protocols/protocol_helper.js');

window.addEventListener('load', function() {

  if (navigator.serviceWorker.controller) {
    var protocol = new IPDLProtocol('cacheStorage');

    protocol.recvMatch = function(resolve, reject, args) {
      var key = args.key;
      if (!key.startsWith('http')) {
        key = location.protocol + '//' + location.host + key;
      }

      debug('recvMatch: ' + key);
      asyncStorage.getItem(key, function(value) {
        resolve(value);
      });
    }
  }


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
