'use strict';

macro inlineCache {
  case { _ $f } => {
    var path = require('path');
    var fs = require('fs');

    var filename = unwrapSyntax(#{$f});
    var filePath = path.resolve(process.cwd() + filename);

    var content = fs.readFileSync(filePath, 'utf8');
    letstx $c = [makeValue(content, null)];

    var type = 'text/plain';
    if (filename.indexOf('.js', filename.length - 3) !== -1) {
      type = 'application/javascript';
    } else if (filename.indexOf('.css', filename.length - 4) !== -1) {
      type = 'text/css';
    } else if (filename.indexOf('.html', filename.length - 5) !== -1) {
      type = 'text/html';
    }
    letstx $t = [makeValue(type, null)];
    letstx $com = [makePunc(',', null)];

    return #{ $f: {content: $c, opts: { 'content-type' : $t }} $com }
  }
}

var StaticResources = {
  handle: function sr_handle(e) {
    return Object.keys(this.ressources).some(function(key) {
      if (e.request.url.endsWith(key)) {
        var resource = this.resources[key];
        e.respondWith(
          new Promise(function(resolve, reject) {
            resolve(new Response(resource.content, resource.opts));
          })
        );

        return true;
      }

      return false;
    });
  },

  resources: {
    inlineCache '/app/cache.html'
    inlineCache '/app/js/service/api.js'
    inlineCache '/app/js/service/utils.js'
    inlineCache '/app/js/protocols/service/parent.js'
  }
};
