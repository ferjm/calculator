'use strict';

importScripts('/calculator/app/js/protocols/protocol_helper.js');

function UpdateAPI() {
  var worker = new SmartWorker('/calculator/app/js/update/worker_api.js');
  this.protocol = new IPDLProtocol('update', worker);
}

UpdateAPI.prototype.checkForUpdate = function() {
  return this.protocol.sendCheckForUpdate();
};

UpdateAPI.prototype.applyUpdate = function(updateUrl) {
  return this.protocol.sendApplyUpdate(updateUrl);
};

