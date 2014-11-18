'use strict';

importScripts('/calculator/app/js/protocols/protocol_helper.js');

var implementation = {
  recvApplyUpdate: function(promise) {
    var self = this;
    var filesToUpdate = 0;

    var rv = promise.args.updatedFiles;
    for (var filename in rv) {
      filesToUpdate++;

      caches.match(filename).then((function(filename, response) {
        caches.open('calculator-cache-v4').then((function(filename, cache) {

          var originalUrl = response.url;
          cache.delete(originalUrl).then(function onDeleted() {
            var opts = {};
            opts['headers'] = { 'content-type': self._getContentType(filename) };

            var newResponse = new Response(rv[filename], opts);
            cache.put(originalUrl, newResponse).then(function onSaved() {
              filesToUpdate--;
              if (filesToUpdate === 0) {
                promise.resolve(true);
              }
            });
          });
        }).bind(this, filename));
      }).bind(this, filename));
    }

    // There was nothing to update...
    if (filesToUpdate === 0) {
      promise.reject(false);
    }
  },

  _getContentType: function(filename) {
    if (filename.indexOf('.css') !== -1) {
      return 'text/css';
    } else if (filename.indexOf('.json') !== -1) {
      return 'application/json';
    } else if (filename.indexOf('.js') !== -1) {
      return 'application/javascript';
    } else if (filename.indexOf('.html') !== -1) {
      return 'text/html';
    }

    return 'text/plain';
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

