'use strict';

window.addEventListener('load', function(e) {
  getFile('/calculator/app/style/calculator.css', function(data) {
    document.getElementById('text').value = data;
  });

  getFile('/calculator/patches/nightly_0.0.1...nightly_master', function(data) {
    document.getElementById('patch').value = data;
  });

  window.updateAPI = new UpdateAPI();
  updateAPI.checkForUpdate().then(function(rv) {
    console.log(formatLength(rv));
  });

  updateAPI.applyUpdate('/calculator/patches/nightly_0.0.1...nightly_master').then(function(rv) {
    var result = document.getElementById('result');
    for (var filename in rv) {
      result.value += filename + '\n\n';
      result.value += rv[filename] + '\n';
    }
  });
});

function getFile(url, callback) {
  var xhr = new XMLHttpRequest();
  var nocacheUrl = url + ((/\?/).test(url) ? "&" : "?") + (new Date()).getTime();
  xhr.open('GET', nocacheUrl, true);
  xhr.send();

  xhr.addEventListener('load', function(e) {
    callback(this.responseText);
  });

  xhr.addEventListener('error', function(e) {
    callback('');
  });
};

function formatLength(bytes) {
  var prefix = ['','K','M','G','T','P','E','Z','Y'];
  var i = 0;
  for (; bytes > 1024 && i < prefix.length; ++i) {
    bytes /= 1024;
  }
  return (Math.round(bytes * 100) / 100) + ' ' + prefix[i] + 'B';
};
