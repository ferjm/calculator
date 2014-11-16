'use strict';

var Config = {
  getUpdateUrl: function() {
    // XXX Instead of revision if would be funny to use 'since'
    // instead at it means we won't have to retrieve the latest
    // revision number (master), and instead only the last update date
    // will be stored.
    return this.update.url + this.revision + '...' + 'master';
  },

  getUpdateHeaders: function() {
    return this.update.headers;
  },

  "update": {
    "channel": "nightly",
    "url": "https://api.github.com/repos/mozilla/calculator/compare/",
    // Unified diff is not a perfect format for delta update.
    // That said, it let us start crafting a framework on top of
    // github, and experiment.
    "headers": {
      "Accept" : "application/vnd.github.v3.patch"
    }
  },
  "revision": "d6d84070dffa389c8"
};

