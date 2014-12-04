'use strict';

importScripts('/calculator/app/js/protocols/message.js');
importScripts('/calculator/app/js/protocols/store.js');

var Protocol = function(name, methods, bridge) {
  this.tag = name;

  this.methods = methods;
  this.bridge = bridge;
  this.store = new PromiseStore();

  methods._call = this.sendMethodCall.bind(this);
  bridge.recvMessage = this.recvMethodCall.bind(this);

  return methods;
};

Protocol.prototype.sendMethodCall = function(method, args) {
  var msg = new Message(this.tag, method, args);
  return this.sendMessage(msg);
};

Protocol.prototype.recvMethodCall = function(json) {
  if (!this.checkMethodCall(json)) {
    return;
  }

  var uuid = json.uuid;
  if (this.store.has(uuid)) {
    this.store.resolve(uuid, json.success, json.rv);
    return;
  }

  var self = this;
  this.methods['recv' + json.method](
    function resolve(rv) {
      var msg = new SuccessMessage(self.tag, uuid, rv);
      self.sendMessage(msg);
    },

    function reject(rv) {
      var msg = new FailureMessage(self.tag, uuid, rv);
      self.sendMessage(msg);
    },

    json.args
  );
};

Protocol.prototype.sendMessage = function(json) {
  this.bridge.postMessage(json);

  if (json.method) {
    return this.store.new(json.uuid);
  }

  return null;
};

Protocol.prototype.checkMethodCall = function(json) {
  if ('method' in json) {
    var methodName = 'recv' + json.method;
    if (!(methodName in this.methods)) {
      throw new Error('Method ' + methodName + ' does not exists');
    }
  }

  return true;
};

