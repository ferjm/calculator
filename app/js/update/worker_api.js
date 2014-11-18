'use strict';

importScripts('/calculator/app/js/protocols/protocol_helper.js');
importScripts('/calculator/app/js/update/utils.js');
importScripts('/calculator/app/js/update/config.js');

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
        if (promise.args.updateUrl)
          updateUrl = promise.args.updateUrl;
        }

        var rv = UpdateUtils.apply(updateUrl);
        promise.resolve(rv);
      },

      function onUpdateInfosError(rv) {
        promise.reject(rv);
      }
    );
  }
};

ProtocolHelper.newChildProtocol(this, 'update', implementation);

