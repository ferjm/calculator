'use strict';

importScripts('/calculator/app/js/protocols/protocol_helper.js');

function ServiceAPI(callback) {
  var kWorkerUrl = '/calculator/app/service_worker.js';
  var kWorkerOptions = {
    'scope': [ '/calculator/app/' ]
  };

  navigator.serviceWorker.register(kWorkerUrl, kWorkerOptions).then(
    (function onSuccess(worker) {
      // XXX This should be done automagically by the platform.
      //     in the meantime let's emulate it.
      if (!navigator.serviceWorker.current) {
        navigator.serviceWorker.current = worker;
      }

      var target = {
        addEventListener: function(type, callback) {
          addEventListener(type, callback);
        },

        postMessage: function(msg) {
          worker.active.postMessage(msg);
        }
      };

      this.protocol = ProtocolHelper.newProtocol(target, 'service');

      callback && callback();
      debug('Registered');
    }).bind(this),

    (function onError(e) {
      debug('Not registered: ' + e);
    }).bind(this)
  );
};

ServiceAPI.prototype.applyUpdate = function(updatedFiles) {
  return this.protocol.sendApplyUpdate(updatedFiles);
};

