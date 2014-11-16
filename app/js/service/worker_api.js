'use strict';

importScripts('/js/protocols/protocol_helper.js');

var implementation = {
  recvApplyUpdate: function(promise) {
    // XXX Can be stuck if updatedFiles is empty
    var rv = promise.args.updatedFiles;
    for (var filename in rv) {
      caches.match(filename).then(function(response) {
        caches.open('calculator-cache-v4').then(function(cache) {
          var opts = {
            'headers': { 'content-type': 'text/css' }
          };
          var response = new Response(rv[filename], opts);
          cache.put(filename, response);

          promise.resolve(true);
        });
      });
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

