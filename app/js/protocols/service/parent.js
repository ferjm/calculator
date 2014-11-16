'use strict';

var PServiceParent = {
  'child': {
    sendApplyUpdate: function(updatedFiles) {
      return this._call(
        'ApplyUpdate',
        {
          'updatedFiles': updatedFiles
        }
      );
    }
  },
  
  'parent': {
  }
};
