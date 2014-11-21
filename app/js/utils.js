'use strict';

function debug(str) {
  console.log('MainPage: ' + str);
  if ('dump' in window) {
    dump('MainPage: ' + str + '\n');
  }
}

function importScripts(script) {
  if (document.querySelector('script[src="' + script + '"]')) {
    return;
  }

  var element = document.createElement('script');
  element.setAttribute('src', script);
  element.async = false;
  element.defer = false;
  document.head.appendChild(element);
}

function populateDatabase() {
  var kCacheFiles = [
    // html
    '/calculator/app/index.html',

    // style
    '/calculator/app/style/calculator.css',

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
    '/calculator/app/js/protocols/service/parent.js'
    '/calculator/app/js/protocols/cachestorage/child.js',
    '/calculator/app/js/protocols/cachestorage/parent.js',
    '/calculator/app/js/protocols/cache/child.js',
    '/calculator/app/js/protocols/cache/parent.js'
  ];

  for (var i = 0; i < kCacheFiles.length; i++) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', kCacheFiles[i], false);
    xhr.send();

    asyncStorage.setItem(kCacheFiles[i], xhr.responseText);
  }
}
