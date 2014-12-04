'use strict';

function Bridge(tag, ipdl, target) {
  if (!tag) {
    throw new Error('Bridge needs a tag');
  }

  debug('Creating a bridge from ' +
        ipdl.side +
        ' to ' +
        ipdl.otherside +
        ' for ' +
        target +
        '(' + tag + ')');

  var bridge = null;
  switch (ipdl.side + '->' + ipdl.otherside) {
    case 'window->worker':
      bridge = new BridgeWindowToWorker(tag, target);
      break;

    case 'window->serviceworker':
      bridge = new BridgeWindowToServiceWorker(tag, target);
      break;

    case 'worker->window':
      bridge = new BridgeWorkerToWindow(tag, target);
      break;

    case 'serviceworker->window':
      bridge = new BridgeServiceWorkerToWindow(tag, target);
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
function BridgeWindowToWorker(tag, target) {
  if (!target) {
    var msg = 'Need an explicit target for a window->worker bridge';
    throw new Error(msg);
  }

  this.tag = tag;
  this.target = target;

  target.addEventListener('message', this);
}

BridgeWindowToWorker.prototype.handleEvent = function(e) {
  if (this.checkMessage(e.data) && 'recvMessage' in this) {
    this.recvMessage(e.data);
  }
};

BridgeWindowToWorker.prototype.checkMessage = function(json) {
  if (!'tag' in json) {
    throw new Error('Message does not have a tag');
  }

  if (!'uuid' in json) {
    throw new Error('Message does not have an uuid');
  }

  if (json.tag !== this.tag) {
    return false;
  }

  return true;
};

BridgeWindowToWorker.prototype.postMessage = function(json) {
  if (this.checkMessage(json)) {
    this.target.postMessage(json);
  }
};


/**
 * BridgeWindowToServiceWorker
 */
function BridgeWindowToServiceWorker(tag, target) {
  if (!target && !navigator.serviceWorker.controller) {
    var msg =
      'Need an explicit target for a window->serviceworker ' +
       'if the page is not controlled.';
    throw new Error(msg);
  }

  this.tag = tag;
  this.target = target || navigator.serviceWorker.controller;

  addEventListener('message', this);
}

BridgeWindowToServiceWorker.prototype.handleEvent = function(e) {
  if (this.checkMessage(e.data) && 'recvMessage' in this) {
    this.recvMessage(e.data);
  }
};

BridgeWindowToServiceWorker.prototype.checkMessage = function(json) {
  if (!'tag' in json) {
    throw new Error('Message does not have a tag');
  }

  if (!'uuid' in json) {
    throw new Error('Message does not have an uuid');
  }

  if (json.tag !== this.tag) {
    return false;
  }

  return true;
};

BridgeWindowToServiceWorker.prototype.postMessage = function(json) {
  if (this.checkMessage(json)) {
    this.target.postMessage(json);
  }
};


/**
 * BridgeWorkerToWindow
 */
function BridgeWorkerToWindow(tag, target) {
  this.tag = tag;
  this.target = target;

  addEventListener('message', this);
}

BridgeWorkerToWindow.prototype.handleEvent = function(e) {
  if (this.checkMessage(e.data) && 'recvMessage' in this) {
    this.recvMessage(e.data);
  }
};

BridgeWorkerToWindow.prototype.checkMessage = function(json) {
  if (!'tag' in json) {
    throw new Error('Message does not have a tag');
  }

  if (!'uuid' in json) {
    throw new Error('Message does not have an uuid');
  }

  if (json.tag !== this.tag) {
    return false;
  }

  return true;
};

BridgeWorkerToWindow.prototype.postMessage = function(json) {
  if (this.checkMessage(json)) {
    postMessage(json);
  }
};

/**
 * BridgeServiceWorkerToWindow
 */
function BridgeServiceWorkerToWindow(tag, target) {
  this.tag = tag;
  this.target = target;

  addEventListener('message', this);
}

BridgeServiceWorkerToWindow.prototype.handleEvent = function(e) {
  if (this.checkMessage(e.data) && 'recvMessage' in this) {
    this.recvMessage(e.data);
  }
};

BridgeServiceWorkerToWindow.prototype.checkMessage = function(json) {
  if (!'tag' in json) {
    throw new Error('Message does not have a tag');
  }

  if (!'uuid' in json) {
    throw new Error('Message does not have an uuid');
  }

  if (json.tag !== this.tag) {
    return false;
  }

  return true;
};

BridgeServiceWorkerToWindow.prototype.postMessage = function(json) {
  if (this.checkMessage(json)) {
    clients.getAll().then(function(windows) {
      windows.forEach(function(window) {
        window.postMessage(json);
      });
    });
  }
};

