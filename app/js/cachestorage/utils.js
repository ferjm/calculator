'use strict';

importScripts('/calculator/app/service_worker_files.js');

function AppCache() {
  var totalFileCount = kCacheFiles.length;
  function broadcastProgress(remaining) {
    var e = new CustomEvent('cacheprogress', {
      detail: {
        progress: 1 - (remaining / totalFileCount)
      }
    });
    window.dispatchEvent(e);
  }

  function saveIntoDatabase(key, content) {
    asyncStorage.setItem(key, content, function() {
      if (kCacheFiles.length) {
        saveFileContent(kCacheFiles.shift());
        broadcastProgress(kCacheFiles.length);
      } else {
        promise.resolve(true);
      }
    });
  }

  function saveFileContent(filename) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', filename, true);

    var isImage = isImageFormat(filename);
    if (isImage) {
      xhr.responseType = 'blob';
    }

    xhr.send();

    xhr.onload = function() {
      var key = location.protocol + '//' + location.host + filename;
      saveIntoDatabase(key, this.response);
    };
  }

  function isImageFormat(key) {
    return ['png'].some(function isImageFormat(extension) {
      return key.endsWith('.' + extension);
    });
  }

  var resolveCallback, rejectCallback;
  var promise = new Promise(function(resolve, reject) {
    resolveCallback = resolve;
    rejectCallback = reject;
  });
  promise.resolve = resolveCallback;
  promise.reject = rejectCallback;

  if (navigator.serviceWorker.controller) {
    promise.resolve(false);
  } else {
    saveFileContent(kCacheFiles.shift());
  }

  return promise;
};


