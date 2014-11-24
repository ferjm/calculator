'use strict';

importScripts('/calculator/app/js/async_storage.js');
importScripts('/calculator/app/js/protocols/protocol_helper.js');

window.addEventListener('load', function() {
  var kCacheFiles = [
    // html
    '/calculator/app/index.html',

    // style
    '/calculator/app/style/calculator.css',

    // images
    //'/calculator/app/style/images/icon_plus.png',
    //'/calculator/app/style/images/icon_equal.png',
    //'/calculator/app/style/images/icon_divide.png',
    //'/calculator/app/style/images/icon_minus.png',
    //'/calculator/app/style/images/icon_multiply.png',

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


    // Caching those for now since fetch isn't working properly
    '/calculator/patches/nightly_0.0.1...nightly_master',
    '/calculator/patches/nightly_0.0.1.1...nightly_master'
  ];

  if (!navigator.serviceWorker.controller) {
    var count = kCacheFiles.length;
    var cacheFile = function(i) {
      var name = kCacheFiles[i];

      var xhr = new XMLHttpRequest();
      xhr.open('GET', name, true);
      xhr.send();

      xhr.onload = (function(name) {
        var key = location.protocol + '//' + location.host + name;
        asyncStorage.setItem(key, this.responseText, function() {
          count--;
          if (count === 0) {
            new ServiceAPI(function() {
              // XXX I have seen some crashes!!!. So setTimeout :/
              setTimeout(function() {
                location = location;
              });
            })
          } else {
            cacheFile(i+1);
          }
        });
      }).bind(xhr, name);
    }
    cacheFile(0);
  } else {
    setTimeout(function() {
      document.getElementById('content').src =
        '/calculator/app/index.html';
    });
  }

  var implementation = {
    recvMatch: function(promise) {
      var key = promise.args.key;
      if (!key.startsWith('http')) {
        key = location.protocol + '//' + location.host + promise.args.key;
      }

      debug('recvMatch: ' + key);
      asyncStorage.getItem(key, function(value) {
        promise.resolve(value);
      });
    }
  }

  var target = {
    addEventListener: function(type, callback) {
      addEventListener(type, callback);
    },

    postMessage: function(msg) {
      navigator.serviceWorker.controller.postMessage(msg);
    }
  };
  ProtocolHelper.newChildProtocol(target, 'cacheStorage', implementation);
});
