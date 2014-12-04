'use strict';

importScripts('/calculator/app/js/protocols/message.js');

// Every protocol got a name shared between the 2 end points, and
// every message is identified by a uuid.
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

