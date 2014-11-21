'use strict';

importScripts('/calculator/app/js/protocols/protocol_helper.js');

var implementation = {
  recvApplyUpdate: function(promise) {
    var self = this;
    var filesToUpdate = 0;

    var rv = promise.args.updatedFiles;
    for (var filename in rv) {
      filesToUpdate++;

      cachesAPI.match(filename).then((function(filename, response) {
        //caches.open('calculator-cache-v4').then((function(filename, cache) {

          debug('patching cache ' + filename);
          var originalUrl = filename;
          cacheAPI.delete(originalUrl).then(function onDeleted() {
            debug('delete cache ' + filename);
            var opts = {};
            opts['headers'] = { 'content-type': self._getContentType(filename) };

            var newResponse = new Response(rv[filename], opts);
            cacheAPI.put(originalUrl, rv[filename]).then(function onSaved() {
              debug('put cache ' + filename);
              filesToUpdate--;
              if (filesToUpdate === 0) {
                promise.resolve(true);
              }
            });
          });
        }).bind(this, filename));
      //}).bind(this, filename));
    }

    // There was nothing to update...
    if (filesToUpdate === 0) {
      promise.reject(false);
    }
  },

  _getContentType: function(filename) {
    if (filename.endsWith('.css')) {
      return 'text/css';
    } else if (filename.endsWith('.json')) {
      return 'application/json';
    } else if (filename.endsWith('.js')) {
      return 'application/javascript';
    } else if (filename.endsWith('.html')) {
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

