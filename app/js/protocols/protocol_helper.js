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
  this.methods = methods;
  this.bridge = bridge;

  this._queue = {};

  methods._call = this.sendMethodCall.bind(this);
  bridge.recvMessage = this.recvMethodCall.bind(this);

  return methods;
};

Protocol.prototype.sendMethodCall = function(name, args) {
  var msg = new Message(name, args);
  return this.sendMessage(msg);
};

Protocol.prototype.recvMethodCall = function(msg) {
  var json = this.recvMessage(msg);
  if (!json) {
    return;
  }

  if ('method' in json) {
    var methodName = 'recv' + json.method;
    if (!(methodName in this.methods)) {
      throw new Error('Method ' + methodName + ' does not exists');
    }
  }

  var self = this;
  this.methods[methodName](
    function resolve(rv) {
      var msg = new SuccessMessage(json.uuid, rv);
      self.sendMessage(msg);
    },

    function reject(rv) {
      var msg = new FailureMessage(json.uuid, rv);
      self.sendMessage(msg);
    },

    json.args
  );
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

function Message(method, args) {
  this.uuid = generateUUID();
  this.method = method;
  this.args = args;
};

function SuccessMessage(uuid, rv) {
  this.uuid = uuid;
  this.rv = rv;
  this.success = true;
}

function FailureMessage(uuid, rv) {
  this.uuid = uuid;
  this.rv = rv;
  this.success = false;
}
