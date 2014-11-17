'use strict';

importScripts('/app/js/protocols/protocol_helper.js');
importScripts('/app/js/update/utils.js');
importScripts('/app/js/update/config.js');

var implementation = {
  recvCheckForUpdate: function(promise) {
    Config.getUpdateInfos().then(
      function onUpdateInfosSuccess(updateUrl, updateHeaders) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', updateUrl, true);

        for (var header in updateHeaders) {
          xhr.setRequestHeader(header, updateHeaders[header]);
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

      function onUpdateInfosError(rv) {
        promise.reject(rv);
      }
    );
  },

  recvApplyUpdate: function(promise) {
    Config.getUpdateInfos().then(
      function onUpdateUrlSuccess(updateUrl, updateHeaders) {
        // XXX Use the returned url, instead of a param
        var rv = UpdateUtils.apply(promise.args.updateUrl);
        promise.resolve(rv);
      },

      function onUpdateInfosError(rv) {
        promise.reject(rv);
      }
    );
  }
};

ProtocolHelper.newChildProtocol(this, 'update', implementation);

