'use strict';

addEventListener('load', function onLoad(e) {
  window.serviceAPI = new ServiceAPI(function() {
    lookForUpdates();
  });
});

function formatLength(bytes) {
  var prefix = ['','K','M','G','T','P','E','Z','Y'];
  var i = 0;
  for (; bytes > 1024 && i < prefix.length; ++i) {
    bytes /= 1024;
  }
  return (Math.round(bytes * 100) / 100) + ' ' + prefix[i] + 'B';
};

function lookForUpdates() {
  var updateAPI = new UpdateAPI();
  updateAPI.checkForUpdate().then(function(rv) {
    // There is no difference between the current version and the
    // next version.
    if (rv === 0) {
      return;
    }

    var length = formatLength(rv);
    var str = 'Update found (' + length + '). Apply it ?';
    if (!window.confirm(str)) {
      return;
    }

    updateAPI.applyUpdate().then(function(rv) {
      window.serviceAPI.applyUpdate(rv).then(function(rv) {
        setTimeout(function() {
          document.location.reload(true);
        });
      });
    });
  });
}

