
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
      var event = new CustomEvent('message_virtualworker_', {
        detail: {
          data: message
        }
      });
      window.dispatchEvent(event);
    },

    terminate: function vw_terminate() {
      delete this._scope;
    },

    addEventListener: function vw_addEventListener(type, callback) {
      window.addEventListener(type + '_workerscope_', callback);
    } 
  };

  return new VirtualWorker(url);
};

function WorkerSandboxScope(url)  {
  var urlHelper = document.createElement('a');
  urlHelper.href = url;

  for (var prop in this.location) {
    if (typeof urlHelper[prop] === 'function') {
      this.location[prop] = urlHelper[prop].bind(urlHelper);
    } else {
      this.location[prop] = urlHelper[prop];
    }
  }

  this.self = this;
};

WorkerSandboxScope.prototype = {
  // DedicatedWorkerGlobalScope
  self: null,
  onmessage: null,

  // WorkerGlobalScope Properties
  console: window.console,
  performance: {
    now: window.performance.now.bind(window.performance)
  },
  location: {
    // URLUtilsReadOnly Properties
    href: null,
    protocol: null,
    host: null,
    hostname: null,
    origin: null,
    port: null,
    pathname: null,
    search: null,
    hash: null,

    // URLUtilsReadOnly Methods
    toString: null
  },

  navigator: {
    // NavigatorID
    appCodeName: window.navigator.appCodeName,
    appName: window.navigator.appName,
    appVersion: window.navigator.appVersion,
    platform: window.navigator.platform,
    product: window.navigator.product,
    userAgent: window.navigator.userAgent,
    taintEnabled: false,

    // NavigatorOnLine
    onLine: window.navigator.onLine,

    // NavigatorLanguage
    language: window.navigator.language,
    languages: window.navigator.languages
  },

  // WorkerGlobalScope Methods
  close: null,
  dump: dump.bind(window),
  importScripts: function(src) { /* inlined */ },

  // Event Handlers
  onclose: null,
  onerror: null,
  ononline: null,
  onoffline: null,

  // EventTarget
  addEventListener: function(type, callback) {
    window.addEventListener(type + '_virtualworker_', callback);
  },
  removeEventListener: function(type, callback) {
    window.removeEventListener(type + '_virtualworker_', callback);
  },
  dispatchEvent: window.dispatchEvent.bind(window),

  // WindowBase64
  atob: window.atob.bind(window),
  btoa: window.btoa.bind(window),

  // WindowTimers
  setInterval: window.setInterval.bind(window),
  clearInterval: window.clearInterval.bind(window),
  setTimeout: window.setTimeout.bind(window),
  clearTimeout: window.clearTimeout.bind(window),

  postMessage: function(message) {
    var event = new CustomEvent('message_workerscope_', {
      detail: {
        data: message
      }
    });
    window.dispatchEvent(event);
  },
  XMLHttpRequest: window.XMLHttpRequest,
  Worker: window.Worker,
  URL: window.URL,
  TextEncoder: window.TextEncoder,
  TextDecoder: window.TextDecoder,
  ImageData: window.ImageData,

  // XXX Need to fake a sync read.
  FileReaderSync: null,

  // Default Objects
  Object: window.Object,
  Array: window.Array,
  Promise: window.Promise,
  JSON: window.JSON,
  Date: window.Date,
  Error: window.Error
};

/**
 * WorkerSandbox ensure a smart worker that runs on the main
 * thread can not access or pollute the global scope and have only
 * access to the APIs available to regular workers.
 */
function WorkerSandbox(url) {
  this.scope = new WorkerSandboxScope(url);
};

WorkerSandbox.prototype.get = function(target, name) {
  if (name in target) {
    return target[name];
  }

  if (name in this.scope) {
    return this.scope[name];
  }

  return undefined;
};

WorkerSandbox.prototype.has = function(target, name) {
  return true;
};

