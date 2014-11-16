'use strict';

function debug(str) {
  console.log('MainPage: ' + str);
  if ('dump' in window) {
    dump('MainPage: ' + str + '\n');
  }
}

function importScripts(script) {
  if (document.querySelector('script[src="' + script + '"]')) {
    return;
  }

  var element = document.createElement('script');
  element.setAttribute('src', script);
  element.async = false;
  element.defer = false;
  document.head.appendChild(element);
}

