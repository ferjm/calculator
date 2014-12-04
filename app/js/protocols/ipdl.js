'use strict';

importScripts('/calculator/app/js/protocols/ipdl_parser.js');

function ParentIPDL(name, impl) {
  this.emitter = null;
  this.receiver = null;
  this.parse(name, impl);
};

var self = this;
ParentIPDL.prototype.parse = function(name, impl) {
  var ast = parser.parse(this._getFileContent(name));
  for (var key in ast.child) {
    if (key.startsWith('recv') && (!impl || !(key in impl))) {
      throw new Error('Implementation mismatch: ' + key);
    }
  }

  this.emitter = ast.child;
  this.receiver = impl;
};

ParentIPDL.prototype._getFileContent = function(name) {
  var xhr = new XMLHttpRequest();
  var filename =
    '/calculator/app/js/protocols/ipdl/' +
    'P' +
    name.charAt(0).toUpperCase() + name.slice(1) +
    '.ipdl';

  xhr.open('GET', filename, false);
  xhr.send();

  return xhr.responseText;
};

function ChildIPDL(name, impl) {
  this.emitter = null;
  this.receiver = null;
  this.parse(name, impl);
};

ChildIPDL.prototype.parse = function(name, impl) {
  var ast = parser.parse(this._getFileContent(name));
  for (var key in ast.parent) {
    if (key.startsWith('recv') && (!impl || !(key in impl))) {
      throw new Error('Implementation mismatch: ' + key);
    }
  }

  this.emitter = ast.parent;
  this.receiver = impl;
};

ChildIPDL.prototype._getFileContent = function(name) {
  var xhr = new XMLHttpRequest();
  var filename =
    '/calculator/app/js/protocols/ipdl/' +
    'P' +
    name.charAt(0).toUpperCase() + name.slice(1) +
    '.ipdl';

  xhr.open('GET', filename, false);
  xhr.send();

  return xhr.responseText;
};
