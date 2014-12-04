'use strict';

importScripts('/calculator/app/js/async_storage.js');
importScripts('/calculator/app/js/protocols/protocol_helper.js');

window.addEventListener('load', function() {
  if (!navigator.serviceWorker.controller) {
    return;
  }

  var protocol = new IPDLProtocol('cache');

  protocol.recvPut = function(resolve, reject, args) {
    var key = location.protocol + '//' + location.host + args.key;
    var response = args.response;

    asyncStorage.setItem(key, response, function onSuccess() {
      resolve();
    });
  };

  protocol.recvDelete = function(resolve, reject, args) {
    var key = location.protocol + '//' + location.host + args.key;

    asyncStorage.removeItem(key, function onSuccess() {
      resolve();
    });
  };
});

