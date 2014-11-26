'use strict';

function AppCache() {
  var kCacheFiles = [
    // html
    '/calculator/app/index.html',

    // style
    '/calculator/app/style/calculator.css',

    // images
    '/calculator/app/style/images/icon_plus.png',
    '/calculator/app/style/images/icon_equal.png',
    '/calculator/app/style/images/icon_divide.png',
    '/calculator/app/style/images/icon_minus.png',
    '/calculator/app/style/images/icon_multiply.png',
    '/calculator/app/style/images/icon_plus@1.5x.png',
    '/calculator/app/style/images/icon_equal@1.5x.png',
    '/calculator/app/style/images/icon_divide@1.5x.png',
    '/calculator/app/style/images/icon_minus@1.5x.png',
    '/calculator/app/style/images/icon_multiply@1.5x.png',
    '/calculator/app/style/images/icon_plus@2x.png',
    '/calculator/app/style/images/icon_equal@2.png',
    '/calculator/app/style/images/icon_divide@2.png',
    '/calculator/app/style/images/icon_minus@2.png',
    '/calculator/app/style/images/icon_multiply@2.png',

    // config
    '/calculator/app/config.json',

    // scripts
    '/calculator/app/js/utils.js',
    '/calculator/app/js/calculator.js',
    '/calculator/app/js/calculator_sw.js',

    // updates
    '/calculator/app/js/update/api.js',
    '/calculator/app/js/update/worker_api.js',
    '/calculator/app/js/update/utils.js',
    '/calculator/app/js/update/config.js',
    '/calculator/app/js/update/format/unified_diff.js',

    // service worker helpers
    '/calculator/app/js/service/api.js',
    '/calculator/app/js/service/worker_api.js',
    '/calculator/app/js/service/utils.js',
    '/calculator/app/js/service/cache-polyfill.js',

    // protocols
    '/calculator/app/js/protocols/ipdl.js',
    '/calculator/app/js/protocols/utils/lexer.js',
    '/calculator/app/js/protocols/utils/uuid.js',
    '/calculator/app/js/protocols/protocol_helper.js',
    '/calculator/app/js/protocols/update/child.js',
    '/calculator/app/js/protocols/update/parent.js',
    '/calculator/app/js/protocols/service/child.js',
    '/calculator/app/js/protocols/service/parent.js',
    '/calculator/app/js/protocols/cachestorage/child.js',
    '/calculator/app/js/protocols/cachestorage/parent.js',
    '/calculator/app/js/protocols/cache/child.js',
    '/calculator/app/js/protocols/cache/parent.js',

    '/calculator/patches/nightly_0.0.1...nightly_master',
    '/calculator/patches/nightly_0.0.1.1...nightly_master'
  ];

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


