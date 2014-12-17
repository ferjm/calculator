'use strict';

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
    var event = new CustomEvent('message_workerscope_');
    event.data = message;
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

