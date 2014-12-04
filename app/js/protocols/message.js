'use strict';

importScripts('/calculator/app/js/protocols/utils/uuid.js');

function Message(tag, method, args) {
  this.tag = tag;
  this.uuid = generateUUID();

  this.method = method;
  this.args = args;
};

function SuccessMessage(tag, uuid, rv) {
  this.tag = tag;
  this.uuid = uuid;

  this.rv = rv;
  this.success = true;
}

function FailureMessage(tag, uuid, rv) {
  this.tag = tag;
  this.uuid = uuid;

  this.rv = rv;
  this.success = false;
}

var MessageHelper = {
  validate: function(msg) {
  }
};
