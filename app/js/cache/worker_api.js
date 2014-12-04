'use strict';

importScripts('/calculator/app/js/protocols/protocol_helper.js');

function CacheAPI() {
  this.protocol = new IPDLProtocol('cache');
}

CacheAPI.prototype.put = function(key, response) {
  return response.text().then(function(data) {
    return this.protocol.sendPut(key, data);
  }.bind(this));
};

CacheAPI.prototype.delete = function(key) {
  return this.protocol.sendDelete(key);
};

CacheAPI.prototype.getAll = function(files) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
};

CacheAPI.prototype.addAll = function(files) {
  return new Promise(function(resolve, reject) {
    return resolve();
  });
};
