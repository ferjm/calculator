'use strict';

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
