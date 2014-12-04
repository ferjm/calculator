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
//    worker:
//      CheckForUpdate();
//      ApplyUpdate(updateUrl);
//
//    window:
//  };
//
//  *************
//  * window.js *
//  *************
//  var worker = new Worker('worker.js');
//  var protocol = ProtocolHelper.newProtocol(worker, 'update');
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
//  * worker.js *
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
//  ProtocolHelper.newProtocol(self, 'update', implementation);
//  
importScripts('/calculator/app/js/protocols/utils/uuid.js');
importScripts('/calculator/app/js/protocols/ipdl.js');

// Every protocol got a name shared between the 2 end points, and every
// message is identified by a uuid.
//
// XXX there are cases where |target| is really useless,
//     for example from serviceWorker -> window,
//     window -> serviceWorker.
//     Or even in the worker -> window case where there is no
//     subworker.
//     And so I wonder if |target| should not be an optional
//     parameter, and so |impl| would be replace by a |config|
//     object.
var IPDLProtocol = function(target, name, impl) {
  if (!target) {
    throw new Error(name + ': |target| can\'t be ' + target);
  }

  var ipdl = new IPDL(name, impl);

  var bridge = this.makeBridge(target, ipdl);
  return new Protocol(bridge, name, ipdl);
};

IPDLProtocol.prototype.makeBridge = function(target, ipdl) {
  function throwNotSupported(side, otherside) {
    var msg = 'Creating a bridge from ' +
              side +
              ' to ' +
              otherside +
              ' is not supported.';
    throw new Error(msg);
  }

  var bridge = {
    addEventListener: function(type, callback) {
      addEventListener(type, callback);
    },

    postMessage: function(msg) {
      target.postMessage(msg);
    }
  };

  debug('Creating a bridge from ' +
        ipdl.side +
        ' to ' +
        ipdl.otherside +
        ' for ' +
        target);

  switch (ipdl.side) {
    case 'window':

      switch (ipdl.otherside) {
        case 'worker':
          bridge.addEventListener = function(type, callback) {
            target.addEventListener(type, callback);
          };
          break;

        case 'serviceworker':
          break;

        default:
          throwNotSupported(ipdl.side, ipdl.otherside);
          break;
      }
      break;


      case 'worker':
        switch (ipdl.otherside) {
          case 'window':
            bridge.postMessage = function(msg) {
              postMessage(msg);
            };
            break;

          default:
            throwNotSupported(ipdl.side, ipdl.otherside);
            break;
        }
        break;

      case 'serviceworker':
        switch (ipdl.otherside) {
          case 'window':
            bridge.postMessage = function(msg) {
              clients.getAll().then(function(windows) {
                windows.forEach(function(window) {
                  window.postMessage(msg);
                });
              });
            };
            break;

          default:
            throwNotSupported(ipdl.side, ipdl.otherside);
            break;
        }
        break;
    }

  return bridge;
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
    schema.receiver['recv' + data.method].call(schema.receiver, promise);
  };

  return schema.emitter;
};

Protocol.prototype.sendMessage = function(json) {
  json.tag = this.name;

  if (!'uuid' in json) {
    throw new Error('Message does not have an uuid');
  }

  this.target.postMessage(json);

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
  var json = msg.data;

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

