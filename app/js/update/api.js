'use strict';

importScripts('/app/js/protocols/protocol_helper.js');

function UpdateAPI() {
  var worker = new Worker('/app/js/update/worker_api.js');
  this.protocol = ProtocolHelper.newParentProtocol(worker, 'update');
}

UpdateAPI.prototype.checkForUpdate = function() {
  return this.protocol.sendCheckForUpdate();
};

UpdateAPI.prototype.applyUpdate = function(updateUrl) {
  return this.protocol.sendApplyUpdate(updateUrl);
};

