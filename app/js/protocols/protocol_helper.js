'use strict';

// ProtocolHelper is designed to create a point-to-point communication
// mechanism.
// This communication can happens between 2 windows, 2 workers, or a
// window and worker.
//
// An simple example to use it would be:
//
//  ****************
//  * PUpdate.ipdl *
//  ****************
//  protocol PUpdate
//  {
//    child:
//      CheckForUpdate();
//      ApplyUpdate(updateUrl);
//
//    parent:
//  };
//
//  *******************************************
//  * PUpdateParent.js (virtual file)         *
//  *******************************************
//
//  var PUpdate = {
//    'child': {
//      sendCheckForUpdate: function() {
//        return this._call(
//          'CheckForUpdate'
//        );
//      },
//
//      sendApplyUpdate: function(updateUrl) {
//        return this._call(
//          'ApplyUpdate',
//          {
//            'updateUrl': updateUrl
//          }
//        );
//      }
//    },
//
//    'parent': {
//    }
//  };
//
//  *******************************************
//  * PUpdateChild.js (virtual file)          *
//  *******************************************
//
//  var PUpdate = {
//    'child': {
//      recvCheckForUpdate: function(/* Promise */ promise) {
//      },
//
//      recvApplyUpdate: function(/* Promise */ promise) {
//      }
//    },
//
//    'parent': {
//    }
//  };
//
//  *************
//  * parent.js *
//  *************
//  var worker = new Worker('child.js');
//  var protocol = ProtocolHelper.newParentProtocol(worker, 'update');
//
//  protocol.sendCheckForUpdate().then(
//    function success(rv) {
//      // do something with the result.
//    ),
//
//    function error(rv) {
//      // do something with the result.
//    }
//  );
//
//  protocol.sendApplyUpdate(updateUrl).then(
//    function success(rv) {
//      // do something with the result.
//    },
//
//    function error(rv) {
//      // do something with the result.
//    }
//  );
//
//  *************
//  * child.js *
//  *************
//  var implementation = {
//    recvCheckForUpdate: function(msg) {
//      var xhr = new XMLHttpRequest();
//      xhr.open('GET', kServerUrl, true);
//      xhr.send();
//      xhr.onload = function() {
//        msg.resolve(this.responseText);
//      };
//    
//      xhr.onerror = function() {
//        msg.reject(this.status);
//      };
//    },
//
//    recvApplyUpdate: function(msg) {
//      applyUpdate(msg.args.updateUrl).then(
//        function success(rv) {
//          msg.resolve(rv);
//        },
//
//        function error(rv) {
//          msg.reject(rv);
//        }
//      );
//    }
//  };
//
//  ProtocolHelper.newChildProtocol(self, 'update', implementation);
//  
importScripts('/calculator/app/js/protocols/utils/uuid.js');
importScripts('/calculator/app/js/protocols/ipdl.js');

var ProtocolHelper = {
};

// Every protocol got a name shared between the 2 end points, and every
// message is identified by a uuid.
// A uuid is used instead of a simple id that is incremented mostly
// because this code is designed to live into a ServiceWorker which
// can be killed at any time, and results into ids beeing resetted.
//
// Every protocol is defined at runtime and then marked as frozen.
// The protocol API is passed via |impl|, so the 2 sides of the protocol
// can implement different APIs.
//
// Ideally the protocols would be defined using something known, such
// as IPDL: https://developer.mozilla.org/en-US/docs/IPDL/Tutorial
ProtocolHelper.newParentProtocol = function(target, name, impl) {
  var ipdl = new ParentIPDL(name, impl);
  return new Protocol(target, name, ipdl);
};

ProtocolHelper.newChildProtocol = function(target, name, impl) {
  var ipdl = new ChildIPDL(name, impl);
  return new Protocol(target, name, ipdl);
};

var Protocol = function(target, name, schema) {
  this.target = target;
  this.name = name;
  this._queue = {};

  var self = this;

  target.addEventListener('message', function(msg) {
    var json = self.recvMessage(msg);
    if (!json) {
      return;
    }

    if ('method' in json) {
      var methodName = 'recv' + json.method;
      if (!(methodName in schema.receiver)) {
        throw new Error('Method ' + methodName + ' does not exists');
      }
    }

    schema._recv(json);
  });

  schema.emitter._call = function(name, args) {
    return self.sendMessage({
      'uuid': generateUUID(),
      'method': name,
      'args': args
    });
  };

  schema._recv = function(data) {
    var resolveCallback = null;
    var rejectCallback = null;
    var promise = new Promise(function(resolve, reject) {
      resolveCallback = resolve;
      rejectCallback = reject;
    });

    promise.resolve = function(rv) {
      self.sendMessage({
        'uuid': data.uuid,
        'success': true,
        'rv': rv
      });
      resolveCallback(rv);
    };

    promise.reject = function(rv) {
      self.sendMessage({
        'uuid': data.uuid,
        'success': false,
        'rv': rv
      });

      rejectCallback(rv);
    };

    promise.args = data.args;
    schema.receiver['recv' + data.method].call(schema, promise);
  };

  return schema.emitter;
};

Protocol.prototype.sendMessage = function(json) {
  json.tag = this.name;

  if (!'uuid' in json) {
    throw new Error('Message does not have an uuid');
  }

  if (this.target.navigator) {
    postMessage(JSON.stringify(json));
  } else {
    this.target.postMessage(JSON.stringify(json));
  }

  if (json.method) {
    var resolveCallback = null;
    var rejectCallback = null;
    var promise = new Promise(function(resolve, reject) {
      resolveCallback = resolve;
      rejectCallback = reject;
    });
    promise.resolve = resolveCallback;
    promise.reject = rejectCallback;

    this._queue[json.uuid] = promise;
    return promise;
  }

  return null;
};

Protocol.prototype.recvMessage = function(msg) {
  var json = JSON.parse(msg.data);

  if (!'tag' in json) {
    throw new Error('Message does not have a tag');
  }

  if (!'uuid' in json) {
    throw new Error('Message does not have an uuid');
  }

  if (json.tag !== this.name) {
    return;
  }

  var uuid = json.uuid;
  if (this._queue[uuid]) {
    var promise = this._queue[uuid];
    if (json.success) {
      promise.resolve(json.rv);
    } else {
      promise.reject(json.rv);
    }

    delete this._queue[uuid];
    return null;
  }

  return json;
};

