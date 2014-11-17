'use strict';

importScripts('/app/js/protocols/protocol_helper.js');

function ServiceAPI() {
  var kWorkerUrl = '/app/service_worker.js';
  var kWorkerOptions = {
    'scope': [ '/app/foo/' ]
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

      this.protocol =
        ProtocolHelper.newParentProtocol(target, 'service');

      debug('Registered');
    }).bind(this),

    (function onError(e) {
      debug('Not registered: ' + e);
    }).bind(this)
  );
};

ServiceAPI.prototype.applyUpdate = function(updatedFiles) {
  if (!navigator.serviceWorker.current.active) {
    console.log('This page is not managed by a service worker');
    return;
  }

  return this.protocol.sendApplyUpdate(updatedFiles);
};

