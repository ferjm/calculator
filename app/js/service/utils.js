'use strict';

// |caches| is not working in chrome nor firefox right now, so let's
// use indexedDB as a temporary backend.
importScripts('/calculator/app/js/service/cache-polyfill.js');

// XXX Firefox compat with latest spec
if ('getServiced' in clients) {
  clients.getAll = clients.getServiced;
}

// XXX Add more String compat with Chrome since Etienne does not like
//     indexOf!
if (!String.prototype.contains) {
  String.prototype.contains = function() {
    return String.prototype.indexOf.apply(this, arguments) !== -1;
  };
}

if (!String.prototype.startsWith) {
  Object.defineProperty(String.prototype, 'startsWith', {
    enumerable: false,
    configurable: false,
    writable: false,
    value: function(searchString, position) {
      position = position || 0;
      return this.lastIndexOf(searchString, position) === position;
    }
  });
}

if (!String.prototype.endsWith) {
  Object.defineProperty(String.prototype, 'endsWith', {
    value: function(searchString, position) {
      var subjectString = this.toString();
      if (position === undefined || position > subjectString.length) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
    }
  });
}

function debug(str) {
  console.log('ServiceWorker: ' + str);

  if ('dump' in self) {
    dump('ServiceWorker: ' + str + '\n');
  }
}

function getContentType(filename) {
  if (filename.endsWith('.css')) {
    return 'text/css';
  } else if (filename.endsWith('.json')) {
    return 'application/json';
  } else if (filename.endsWith('.js')) {
    return 'application/javascript';
  } else if (filename.endsWith('.png')) {
    return 'image/png';
  } else if (filename.endsWith('.html')) {
    return 'text/html';
  } else if (filename.endsWith('.png')) {
    return 'image/png';
  }

  return 'text/plain';
};

function ServiceWorker() {
  // lifecycle events
  addEventListener('activate', this);
  addEventListener('install', this);
  addEventListener('beforeevicted', this);
  addEventListener('evicted', this);

  // network events
  addEventListener('fetch', this);

  // misc events
  addEventListener('message', this);
};

ServiceWorker.prototype.handleEvent = function(e) {
  if (!this['on' + e.type]) {
    return;
  }

  this['on' + e.type].call(this, e);
};

