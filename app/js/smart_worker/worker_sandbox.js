'use strict';

importScripts('/calculator/app/js/smart_worker/worker_sandbox_scope.js');

/**
 * WorkerSandbox ensure a smart worker that runs on the main
 * thread can not access or pollute the global scope and have only
 * access to the APIs available to regular workers.
 */
function WorkerSandbox(url) {
  this.scope = new WorkerSandboxScope(url);
};

WorkerSandbox.prototype.get = function(target, name) {
  if (name in target) {
    return target[name];
  }

  if (name in this.scope) {
    return this.scope[name];
  }

  return undefined;
};

WorkerSandbox.prototype.has = function(target, name) {
  return true;
};

