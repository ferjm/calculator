

importScripts('/calculator/app/js/smart_worker/worker_sandbox.js');

/**
 * SmartWorker is designed to save resources on low-memory devices,
 * while optimizing usage of resources on higher devices.
 */
function SmartWorker(url) {
  'use strict';

  var kLowResources = false;
  if (!kLowResources) {
    return new Worker(url);
  }

  function VirtualWorker(url) {
    importScripts(url);
  }

  VirtualWorker.prototype = {
    onerror: null,
    onmessage: null,

    postMessage: function vw_postMessage(message, transferable) {
      var event = new CustomEvent('message_virtualworker_');
      event.data = message;
      window.dispatchEvent(event);
    },

    terminate: function vw_terminate() {
      // XXX Needs to implement this.
      delete this._scope;
    },

    addEventListener: function vw_addEventListener(type, callback) {
      window.addEventListener(type + '_workerscope_', callback);
    } 
  };

  return new VirtualWorker(url);
};

