'use strict';

var PCacheStorageParent = {
  'child': {
    sendMatch: function(request) {
      return this._call(
        'Match',
        {
          'request': request
        }
      );
    }
  },

  'parent': {
  }
};
