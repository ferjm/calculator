'use strict';

importScripts('/calculator/app/js/protocols/protocol_helper.js');
importScripts('/calculator/app/js/update/utils.js');
importScripts('/calculator/app/js/update/config.js');

function debug(str) {
  console.log('Worker: ' + str);
  if ('dump' in self) {
    dump('Worker: ' + str + '\n');
  }
}

var protocol = new IPDLProtocol('update');

protocol.recvCheckForUpdate = function(resolve, reject, args) {
  var self = this;

  Config.getUpdateInfos().then(
    function onUpdateInfosSuccess(updateInfos) {
      self._getFileContent(updateInfos).then(
        function onFileContentSuccess(content) {
          // XXX Ideally we would just perform a HEAD requet instead
          // of a GET, and retrieve the Content-Length header.
          //     But github, does not seems to allow that :(
          //var length = this.getResponseHeader('Content-Length');
          resolve(content.length);
        },

        function onFileContentError(rv) {
          reject(rv);
        }
      );
    },

    function onUpdateInfosError(rv) {
      reject(rv);
    }
  );
};

protocol.recvApplyUpdate = function(resolve, reject, args) {
  var self = this;

  Config.getUpdateInfos().then(
    function onUpdateUrlSuccess(updateInfos) {
      if (args.updateUrl) {
        updateInfos = {
          'url': args.updateUrl,
          'headers': {}
        };
      }

      self._getFileContent(updateInfos).then(
        function onFileContentSuccess(content) {
          var rv = UpdateUtils.apply(content);
          resolve(rv);
        },

        function onFileContentError(rv) {
          reject(rv);
        }
      );
    },

    function onUpdateInfosError(rv) {
      reject(rv);
    }
  );
};

protocol._getFileContent = function(infos) {
  return new Promise(function onFileContent(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', infos.url, true);

    for (var header in infos.headers) {
      xhr.setRequestHeader(header, infos.headers[header]);
    }

    xhr.send();

    xhr.onload = function() {
      resolve(this.responseText);
    };

    xhr.onerror = function() {
      reject(this.status);
    };
  });
};

