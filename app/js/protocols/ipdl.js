'use strict';

importScripts('/calculator/app/js/protocols/ipdl_parser.js');

function IPDL(name, impl) {
  this.ast = null;
  this.emitter = null;
  this.receiver = null;

  this.parse(name, impl);
}

IPDL.prototype.parse = function(name, impl) {
  var ast = parser.parse(this._getFileContent(name))[this.getSide()];

  for (var key in ast) {
    if (key.startsWith('recv') && (!impl || !(key in impl))) {
      throw new Error('Implementation mismatch: ' + key);
    }
  }

  this.emitter = ast;
  this.receiver = impl;
};

IPDL.prototype.getSide = function() {
  // XXX This is a bit weak...
  try {
    window;
    return 'window';
  } catch(e) {
  }

  try {
    postMessage;
    return 'worker';
  } catch(e) {
  }

  return 'serviceworker';
};

IPDL.prototype._getFileContent = function(name) {
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

