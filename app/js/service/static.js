'use strict';

var StaticResources = {
  handle: function sr_handle(e) {
    if (e.request.url.endsWith('cache.html')) {
      var resource = this.resources['cache.html'];
      e.respondWith(
        new Promise(function(resolve, reject) {
          resolve(resource);
        })
      );

      return true;
    }

    return false;
  },

  'resources': {
    'cache.html':
      new Response(
        '<html>' +
        '  <head> ' +
        '    <title>Cache Polyfill</title>' +
        '    <script src="js/cachestorage/api.js"></script>' +
        '  </head>' +
        '</html>',
        {
          'headers': { 'content-type': 'text/html' }
        }
      )
  }
};
