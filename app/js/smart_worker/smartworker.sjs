'use strict';

macro inlineCache {
  case { _ $f } => {
    var path = require('path');
    var fs = require('fs');

    var filename = unwrapSyntax(#{$f});
    var filePath = path.resolve(process.cwd() + filename);

    var content = fs.readFileSync(filePath, 'utf8');

    var imports = null;
    var regexp = /importScripts\('([\/a-z_0-9-\.]+)'\)/i;
    while ((imports = content.match(regexp)) != null) {
      var scriptFilename = imports[1];
      var scriptFilepath = path.resolve(process.cwd() + scriptFilename);
      var scriptContent = fs.readFileSync(scriptFilepath.replace('calculator', ''), 'utf8');

      content = content.replace(imports[0], scriptContent);
    }

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

    return #{ $f: {content: $c, opts: { 'headers': { 'content-type' : $t }}} $com }
  }
}

var kLowResources = false;

var SmartWorkers = {
  handle: function sr_handle(e) {
    return Object.keys(this.resources).some(function(key) {
      if (!kLowResources) {
        return false;
      }

      if (e.request.url.contains(key)) {
        var resource = this.resources[key];
        e.respondWith(
          new Promise(function(resolve, reject) {
            var code =
              '(function() {' +
              '  var scope = new Proxy(' +
              '    {},' +
              '    new WorkerSandbox("' + e.request.url + '"));' +
              '' +
              '  (function() {' +
              '    with(scope) {' +
              '      "use strict";' +
              '      (function() {' +
              '        ' + resource.content +
              '      }).call(this);' +
              '    }' +
              '  }).call(scope);' +
              '})();';

            resolve(new Response(code, resource.opts));
          })
        );

        return true;
      }

      return false;
    }, this);
  },

  resources: {
    inlineCache '/app/js/update/worker_api.js'
  }
};
