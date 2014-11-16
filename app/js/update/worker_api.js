'use strict';

importScripts('/js/protocols/protocol_helper.js');
importScripts('/js/update/utils.js');
importScripts('/js/update/config.js');

// TODO returns a boolean for checkForUpdate instead
// of the patch content.

var implementation = {
  recvCheckForUpdate: function(promise) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', Config.getUpdateUrl(), true);

    var headers = Config.getUpdateHeaders();
    for (var header in headers) {
      xhr.setRequestHeader(header, headers[header]);
    }

    xhr.send();

    xhr.onload = function() {
      // XXX Ideally we would just perform a HEAD requet instead of
      //     a GET, and retrieve the Content-Length header.
      //     But github, does not seems to allow that :( 
      //var length = this.getResponseHeader('Content-Length');

      var length = this.responseText.length;
      promise.resolve(length);
    };
  
    xhr.onerror = function() {
      promise.reject(this.status);
    };
  },

  recvApplyUpdate: function(promise) {
    var rv = UpdateUtils.apply(promise.args.updateUrl);
    promise.resolve(rv);
  }
};

ProtocolHelper.newChildProtocol(this, 'update', implementation);

