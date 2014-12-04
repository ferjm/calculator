'use strict';

importScripts('/calculator/app/js/protocols/ipdl_parser.js');

function IPDL(name) {
  this.ast = parser.parse(this._getFileContent(name));
  this.side = this.getSide();
  this.otherside = this.getOtherSide();
}

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

IPDL.prototype.getOtherSide = function() {
  return this.ast.sides.find(function(side) {
    return this.side != side.name;
  }, this).name;
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

