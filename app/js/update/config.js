'use strict';

var Config = {
  getUpdateUrl: function config_getUpdateUrl() {
    var promise = new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', '/config.json', true);
      xhr.send();

      xhr.onload = function() {
        // XXX Use json format directly instead of calling JSON.parse
        var json = JSON.parse(this.responseText);

        var updateUrl = this.update.url +

                        // old version
                        this.update.channel +
                        '_' +
                        json.version +

                        '...' +

                        // new version
                        this.update.channel +
                        '_' +
                        'master';
        resolve(updateUrl);
      };

      xhr.onerror = function() {
        reject(this.status);
      };
    });

    return promise;
  },

  getUpdateHeaders: function config_getUpdateHeaders() {
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
  }
};

