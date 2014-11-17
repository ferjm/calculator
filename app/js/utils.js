'use strict';

function debug(str) {
  console.log('MainPage: ' + str);
  if ('dump' in window) {
    dump('MainPage: ' + str + '\n');
  }
}

function importScripts(script) {
  var prefix = '';
  if (document.location.toString().indexOf('github') !== -1) {
    prefix = '/calculator';
  }

  if (document.querySelector('script[src="' + prefix + script + '"]')) {
    return;
  }

  var element = document.createElement('script');
  element.setAttribute('src', script);
  element.async = false;
  element.defer = false;
  document.head.appendChild(element);
}

