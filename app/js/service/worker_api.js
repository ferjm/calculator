'use strict';

importScripts('/calculator/app/js/service/utils.js');
importScripts('/calculator/app/js/protocols/protocol_helper.js');

var protocol = new IPDLProtocol('service');

protocol.recvApplyUpdate = function(resolve, reject, args) {
  var self = this;
  var filesToUpdate = 0;

  var rv = args.updatedFiles;
  for (var filename in rv) {
    filesToUpdate++;

    cachesAPI.match(filename).then((function(filename, response) {
      cachesAPI.open('calculator-cache-v4').then((function(filename, cache) {

        var originalUrl = filename;
        cache.delete(originalUrl).then(function onDeleted() {
          var opts = {
            'headers': { 'content-type': getContentType(filename) },
            'type': 'basic'
          };

          var newResponse = new Response(rv[filename], opts);
          cache.put(originalUrl, newResponse).then(function onSaved() {
            filesToUpdate--;
            if (filesToUpdate === 0) {
              resolve(true);
            }
          });
        });
      }).bind(this, filename));
    }).bind(this, filename));
  }

  // There was nothing to update...
  if (filesToUpdate === 0) {
    reject(false);
  }
};

