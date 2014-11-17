'use strict';

importScripts('/app/js/protocols/protocol_helper.js');

var implementation = {
  recvApplyUpdate: function(promise) {
    var filesToUpdate = 0;

    var rv = promise.args.updatedFiles;
    for (var filename in rv) {
      filesToUpdate++;

      caches.match(filename).then(function(response) {
        caches.open('calculator-cache-v4').then(function(cache) {
          var opts = {
            'headers': { 'content-type': 'text/css' }
          };
          var response = new Response(rv[filename], opts);
          cache.put(filename, response).then(function onSaved() {
            filesToUpdate--;
            if (filesToUpdate === 0) {
              promise.resolve(true);
            }
          });
        });
      });
    }

    // There was nothing to update...
    if (filesToUpdate === 0) {
      promise.reject(false);
    }
  }
};

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

ProtocolHelper.newChildProtocol(target, 'service', implementation);

