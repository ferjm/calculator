'use strict';

var PUpdateParent = {
  'child': {
    sendCheckForUpdate: function() {
      return this._call(
        'CheckForUpdate'
      );
    },

    sendApplyUpdate: function(updateUrl) {
      return this._call(
        'ApplyUpdate',
        {
          'updateUrl': updateUrl
        }
      );
    }
  },

  'parent': {
  }
};
