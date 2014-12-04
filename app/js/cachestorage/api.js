'use strict';

importScripts('/calculator/app/js/async_storage.js');
importScripts('/calculator/app/js/cachestorage/utils.js');
importScripts('/calculator/app/js/protocols/protocol_helper.js');

window.addEventListener('load', function() {
  (new AppCache()).then(function onSuccess(shouldReload) {
    if (shouldReload) {
      new ServiceAPI(doSoftReload);
    } else {
      var protocol = new IPDLProtocol('cacheStorage');

      protocol.recvMatch = function(resolve, reject, args) {
        var key = args.key;
        if (!key.startsWith('http')) {
          key = location.protocol + '//' + location.host + key;
        }

        asyncStorage.getItem(key, function(value) {
          resolve(value);
        });
      }

      document.getElementById('content').src = 'index.html';
    }
  });
});

window.addEventListener('cacheprogress', function(e) {
  document.getElementById('loader').value = e.detail.progress;
});
