window.addEventListener('load', function(e) {
  if (!navigator.serviceWorker.controller) {
    new ServiceAPI(doSoftReload);
  } else {
    document.getElementById('content').src = 'index.html';
  }
});
