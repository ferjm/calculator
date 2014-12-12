'use strict';

/*
 * XXX In the ipdl file this is possible to add a |debug|
 * instruction in front of a protocol, or a particular side.
 * It would be nice to reflect this |debug| keyword here.
 */

var BridgeHelper = {
  map: {
    'window->worker': BridgeWindowToWorker,
    'worker->window': BridgeWorkerToWindow,
    'window->serviceworker': BridgeWindowToServiceWorker,
    'serviceworker->window': BridgeServiceWorkerToWindow
  },

  createNewBridge: function bh_createNewBridge(tag, ipdl, target) {
    if (!tag) {
      throw new Error('Bridge needs a tag.');
    }

    if (!ipdl) {
      throw new Error('Bridge needs an ipdl description.');
    }

    var direction = ipdl.side + '->' + ipdl.otherside;
    var bridge = this.map[direction];
    if (!bridge) {
      throw new Error('Bridge for ' +
                      direction +
                      ' is not implemented.');
    }

    return new bridge(tag, ipdl, target);
  }
};

/**
 * Bridge
 */
function Bridge(tag, ipdl, target) {
  debug(
    'Creating a bridge for ' +
    ipdl.side + '->' + ipdl.otherside +
    ' for ' +
    target +
    ' (' + tag + ')'
  );

  this.tag = tag;
  this.ipdl = ipdl;
  this.target = target;

  // The ipdl file format allow a debug keyword to debug
  // messages sent from one side to an other side.
  this.debug = ipdl.ast.sides.find(function(side) {
    return ipdl.side == side.name;
  }, this).debug;

  this.listenMessage();
}

Bridge.prototype = {
  listenMessage: function bridge_listenMessage() {
    throw new Error('Not implemented.');
  },

  forwardMessage: function bridge_forwardMessage() {
    throw new Error('Not implemented.');
  },

  handleEvent: function bridge_handleEvent(e) {
    var json = e.data;
    if (!this.checkMessage(json)) {
      return;
    }

    if (!'recvMessage' in this) {
      return;
    }

    this.dump(json, true);

    this.recvMessage(json);
  },

  postMessage: function bridge_postMessage(json) {
    if (!this.checkMessage(json)) {
      return;
    }

    this.dump(json);

    this.forwardMessage(json);
  },

  checkMessage: function bridge_checkMessage(json) {
    if (!'tag' in json) {
      throw new Error('Message does not have a tag.');
    }

    if (!'uuid' in json) {
      throw new Error('Message does not have an uuid.');
    }

    if (json.tag !== this.tag) {
      return false;
    }

    return true;
  },

  dump: function bridge_dump(json, revert) {
    if (this.debug) {
      var direction = revert ?
        this.ipdl.otherside + '->' + this.ipdl.side :
        this.ipdl.side + '->' + this.ipdl.otherside;

      debug('[' + this.tag + '] ' + direction);
      for (var prop in json) {
        debug(prop + ': ' + json[prop]);
      }
    }
  }
};


/**
 * BridgeWindowToWorker
 */
function BridgeWindowToWorker(tag, ipdl, target) {
  Bridge.call(this, tag, ipdl, target);

  if (!this.target) {
    var msg = 'Need an explicit target for a ' +
              this.side +
              '->' +
              this.otherside + 
              ' bridge.';
    throw new Error(msg);
  }
}

BridgeWindowToWorker.prototype = Object.create(Bridge.prototype);

BridgeWindowToWorker.prototype.listenMessage = function() {
  this.target.addEventListener('message', this);
};

BridgeWindowToWorker.prototype.forwardMessage = function(json) {
  this.target.postMessage(json);
};

/**
 * BridgeWindowToServiceWorker
 */
function BridgeWindowToServiceWorker(tag, ipdl, target) {
  Bridge.call(this, tag, ipdl, target || navigator.serviceWorker.controller);

  if (!this.target) {
    var msg = 'Need an explicit target for a ' +
              this.side +
              '->' +
              this.otherside +
              ' bridge if the page is not controlled.';
    throw new Error(msg);
  }
}

BridgeWindowToServiceWorker.prototype = Object.create(Bridge.prototype);

BridgeWindowToServiceWorker.prototype.listenMessage = function() {
  addEventListener('message', this);
};

BridgeWindowToServiceWorker.prototype.forwardMessage = function(json) {
  this.target.postMessage(json);
};


/**
 * BridgeWorkerToWindow
 */
function BridgeWorkerToWindow(tag, ipdl, target) {
  Bridge.call(this, tag, ipdl, target);
}

BridgeWorkerToWindow.prototype = Object.create(Bridge.prototype);

BridgeWorkerToWindow.prototype.listenMessage = function() {
  addEventListener('message', this);
};

BridgeWorkerToWindow.prototype.forwardMessage = function(json) {
  postMessage(json);
};


/**
 * BridgeServiceWorkerToWindow
 */
function BridgeServiceWorkerToWindow(tag, ipdl, target) {
  Bridge.call(this, tag, ipdl, target);
}

BridgeServiceWorkerToWindow.prototype = Object.create(Bridge.prototype);

BridgeServiceWorkerToWindow.prototype.listenMessage = function() {
  addEventListener('message', this);
};

BridgeServiceWorkerToWindow.prototype.forwardMessage = function(json) {
  clients.getAll().then(function(windows) {
    windows.forEach(function(window) {
      window.postMessage(json);
    });
  });
};

