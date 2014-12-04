'use strict';

function Bridge(target, ipdl) {
  debug('Creating a bridge from ' +
        ipdl.side +
        ' to ' +
        ipdl.otherside +
        ' for ' +
        target);

  var bridge = null;
  switch (ipdl.side + '->' + ipdl.otherside) {
    case 'window->worker':
      bridge = new BridgeWindowToWorker(target);
      break;

    case 'window->serviceworker':
      bridge = new BridgeWindowToServiceWorker(target);
      break;

    case 'worker->window':
      bridge = new BridgeWorkerToWindow(target);
      break;

    case 'serviceworker->window':
      bridge = new BridgeServiceWorkerToWindow(target);
      break;

    default:
      var msg = 'Creating a bridge for ' +
                ipdl.side +
                '->' +
                ipdl.otherside +
                ' is not supported.';
      throw new Error(msg);
      break;
  }

  return bridge;
}

/**
 * BridgeWindowToWorker
 */
function BridgeWindowToWorker(target) {
  if (!target) {
    var msg = 'Need an explicit target for a window->worker bridge';
    throw new Error(msg);
  }

  this.target = target;
}

BridgeWindowToWorker.prototype.addEventListener = function(type, cb) {
  this.target.addEventListener(type, cb);
};

BridgeWindowToWorker.prototype.postMessage = function(msg) {
  this.target.postMessage(msg);
};


/**
 * BridgeWindowToServiceWorker
 */
function BridgeWindowToServiceWorker(target) {
  if (!target && !navigator.serviceWorker.controller) {
    var msg =
      'Need an explicit target for a window->serviceworker ' +
       'if the page is not controlled.';
    throw new Error(msg);
  }

  this.target = target;
}

BridgeWindowToServiceWorker.prototype.addEventListener = function(type, cb) {
  addEventListener(type, cb);
};

BridgeWindowToServiceWorker.prototype.postMessage = function(msg) {
  this.target.postMessage(msg);
};


/**
 * BridgeWorkerToWindow
 */
function BridgeWorkerToWindow(target) {
  this.target = target;
}

BridgeWorkerToWindow.prototype.addEventListener = function(type, cb) {
  addEventListener(type, cb);
};

BridgeWorkerToWindow.prototype.postMessage = function(msg) {
  postMessage(msg);
};

/**
 * BridgeServiceWorkerToWindow
 */
function BridgeServiceWorkerToWindow(target) {
  this.target = target;
}

BridgeServiceWorkerToWindow.prototype.addEventListener = function(type, cb) {
  addEventListener(type, cb);
};

BridgeServiceWorkerToWindow.prototype.postMessage = function(msg) {
  clients.getAll().then(function(windows) {
    windows.forEach(function(window) {
      window.postMessage(msg);
    });
  });
};

