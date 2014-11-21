'use strict';

var PCacheParent = {
  'child': {
    sendPut: function(key, response) {
      return this._call(
        'Put',
        {
          'key': key,
          'response': response,
        }
      );
    },

    sendDelete: function(key) {
      return this._call(
        'Delete',
        {
          'key': key
        }
      );
    }

  },

  'parent': {
  }
};
