'use strict';

addEventListener('load', function onLoad(e) {
  window.serviceAPI = new ServiceAPI();

  if (documentIsManaged()) {
    lookForUpdates();
  }
});

function documentIsManaged() {
  return document.location.toString().indexOf('foo') !== -1;
}

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
    var length = formatLength(rv);
    var str = 'Update found (' + length + 'b). Apply it ?';
    if (!window.confirm(str)) {
      return;
    }

    updateAPI.applyUpdate('/calculator/patches/pink.patch').then(function(rv) {
      window.serviceAPI.applyUpdate(rv).then(function(rv) {
        document.location.reload();
      });
    });
  });
}

