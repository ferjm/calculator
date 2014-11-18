'use strict';

var Config = {
  getUpdateInfos: function config_getUpdateUrl() {
    var promise = new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', '/calculator/app/config.json?' + Date.now(), true);
      xhr.send();

      xhr.onload = function() {
        // XXX Use json format directly instead of calling JSON.parse
        var json = JSON.parse(this.responseText);

        var updateUrl = json.update.url +

                        // old version
                        json.update.channel +
                        '_' +
                        json.update.version +

                        '...' +

                        // new version
                        json.update.channel +
                        '_' +
                        'master';

        var updateHeaders = json.update.headers;

        resolve({
          'url': updateUrl,
          'headers': updateHeaders
        });
      };

      xhr.onerror = function() {
        reject(this.status);
      };
    });

    return promise;
  }
};

