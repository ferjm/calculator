'use strict';

// IPDLProtocol is designed to create a point-to-point communication
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
//  var protocol = new IPDLProtocol('update', worker);
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
//  var protocol = new IPDLProtocol('update');
//
//  protocol.recvCheckForUpdate = function(resolve, reject, args) {
//    var xhr = new XMLHttpRequest();
//    xhr.open('GET', kServerUrl, true);
//    xhr.send();
//    xhr.onload = function() {
//      resolve(this.responseText);
//    };
//    
//    xhr.onerror = function() {
//      reject(this.status);
//    };
//  };
//
//  protocol.recvApplyUpdate = function(resolve, reject, args) {
//    applyUpdate(args.updateUrl).then(
//      function success(rv) {
//        resolve(rv);
//      },
//
//      function error(rv) {
//        reject(rv);
//      }
//    );
//  };
//  
importScripts('/calculator/app/js/protocols/utils/uuid.js');
importScripts('/calculator/app/js/protocols/ipdl.js');
importScripts('/calculator/app/js/protocols/bridge.js');

// Every protocol got a name shared between the 2 end points, and every
// message is identified by a uuid.
var IPDLProtocol = function(name, target) {
  var ipdl = new IPDL(name);
  var bridge = new Bridge(ipdl, target);
  return new Protocol(name, ipdl.ast[ipdl.side], bridge);
};

var Protocol = function(name, methods, bridge) {
  this.name = name;
  this.bridge = bridge;
  this._queue = {};

  var self = this;

  bridge.recvMessage = function(msg) {
    var json = self.recvMessage(msg);
    if (!json) {
      return;
    }

    if ('method' in json) {
      var methodName = 'recv' + json.method;
      if (!(methodName in methods)) {
        throw new Error('Method ' + methodName + ' does not exists');
      }
    }

    methods._recv(json);
  };

  methods._call = function(name, args) {
    return self.sendMessage({
      'uuid': generateUUID(),
      'method': name,
      'args': args
    });
  };

  methods._recv = function(data) {
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

    methods['recv' + data.method].call(methods,
                                       promise.resolve,
                                       promise.reject,
                                       data.args);
  };

  return methods;
};

Protocol.prototype.sendMessage = function(json) {
  json.tag = this.name;

  if (!'uuid' in json) {
    throw new Error('Message does not have an uuid');
  }

  this.bridge.postMessage(json);

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

