'use strict';

importScripts('/js/protocols/protocol_helper.js');
importScripts('/js/update/utils.js');
importScripts('/js/update/config.js');

var implementation = {
  recvCheckForUpdate: function(promise) {
    Config.getUpdateUrl().then(
      function onUpdateUrlSuccess(updateUrl) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', updateUrl, true);

        var headers = Config.getUpdateHeaders();
        for (var header in headers) {
          xhr.setRequestHeader(header, headers[header]);
        }

        xhr.send();

        xhr.onload = function() {
          // XXX Ideally we would just perform a HEAD requet instead
          // of a GET, and retrieve the Content-Length header.
          //     But github, does not seems to allow that :(
          //var length = this.getResponseHeader('Content-Length');

          var length = this.responseText.length;
          promise.resolve(length);
        };
  
        xhr.onerror = function() {
          promise.reject(this.status);
        };
      },

      function onUpdateUrlError(rv) {
        promise.reject(rv);
      }
    );
  },

  recvApplyUpdate: function(promise) {
    Config.getUpdateUrl().then(
      function onUpdateUrlSuccess(updateUrl) {
        // XXX Use the returned url, instead of a param
        var rv = UpdateUtils.apply(promise.args.updateUrl);
        promise.resolve(rv);
      },

      function onUpdateUrlError(rv) {
        promise.reject(rv);
      }
    );
  }
};

ProtocolHelper.newChildProtocol(this, 'update', implementation);

