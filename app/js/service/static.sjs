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

    return #{ $f: {content: $c, opts: { 'headers': { 'content-type' : $t }}} $com }
  }
}

var StaticResources = {
  handle: function sr_handle(e) {
    return Object.keys(this.resources).some(function(key) {
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
    }, this);
  },

  resources: {
    inlineCache '/app/cache.html'
    inlineCache '/app/service_worker_files.js'
    inlineCache '/app/js/utils.js'
    inlineCache '/app/js/string-polyfill.js'
    inlineCache '/app/js/async_storage.js'
    inlineCache '/app/js/protocols/bridge.js'
    inlineCache '/app/js/protocols/ipdl.js'
    inlineCache '/app/js/protocols/protocol.js'
    inlineCache '/app/js/protocols/message.js'
    inlineCache '/app/js/protocols/store.js'
    inlineCache '/app/js/protocols/ipdl_parser.js'
    inlineCache '/app/js/protocols/protocol_helper.js'
    inlineCache '/app/js/protocols/utils/uuid.js'
    inlineCache '/app/js/protocols/ipdl/PCache.ipdl'
    inlineCache '/app/js/protocols/ipdl/PCacheStorage.ipdl'
    inlineCache '/app/js/protocols/ipdl/PService.ipdl'
    inlineCache '/app/js/protocols/ipdl/PUpdate.ipdl'
    inlineCache '/app/js/cachestorage/utils.js'
    inlineCache '/app/js/cachestorage/api.js'
    inlineCache '/app/js/cache/api.js'
    inlineCache '/app/js/service/api.js'
    inlineCache '/app/js/smart_worker/api.js'
    inlineCache '/app/js/smart_worker/worker_sandbox.js'
    inlineCache '/app/js/smart_worker/worker_sandbox_scope.js'
    inlineCache '/app/js/service/smartworker.js'
  }
};
