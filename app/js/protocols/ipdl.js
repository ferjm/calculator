'use strict';

// Ideally those should be some kind of virtual files, generated at
// runtime based on the PUpdate.ipdl file.
// But for now, I'm lazy.
importScripts('/app/js/protocols/update/child.js');
importScripts('/app/js/protocols/update/parent.js');
importScripts('/app/js/protocols/service/child.js');
importScripts('/app/js/protocols/service/parent.js');

function ParentIPDL(name, impl) {
  this.emitter = null;
  this.receiver = null;
  this.parse(name, impl);
};

var self = this;
ParentIPDL.prototype.parse = function(name, impl) {
  var desc = self[
    'P' +
    name.charAt(0).toUpperCase() + name.slice(1) +
    'Parent'
  ];

  for (var key in desc['parent']) {
    if (!(key in impl)) {
      throw new Error('Implementation mismatch');
    }
  }

  this.emitter = desc['child'];
  this.receiver = impl;
};

function ChildIPDL(name, impl) {
  this.emitter = null;
  this.receiver = null;
  this.parse(name, impl);
};

ChildIPDL.prototype.parse = function(name, impl) {
  var desc = self[
    'P' +
    name.charAt(0).toUpperCase() + name.slice(1) +
    'Child'
  ];

  for (var key in desc['child']) {
    if (!(key in impl)) {
      throw new Error('Implementation mismatch');
    }
  }

  this.emitter = desc['parent'];
  this.receiver = impl;
};


/*
// XXX Let's do all the parsing code later.
// For now, we will just return pre-build JS object.
importScripts('/app/js/protocols/utils/lexer.js');
IPDL.prototype.parse = function() {
  var lexer = new Lexer;

  lexer.addRule(/protocol/, function onNewProtocol(lexeme) {
  });

  lexer.setInput(this._getIPDLFileContent(this.impl.name));
  lexer.lex();

};

IPDL.prototype._getIPDLFileContent = function(name) {
  var xhr = new XMLHttpRequest();
  var fileName =
    '/js/protocols/' +
    'P' +
    name.charAt(0).toUpperCase() + name.slice(1) +
    '.ipdl';

  xhr.open('GET', filename, false);
  xhr.send();

  return xhr.responseText;
};
*/
