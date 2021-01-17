(function() {
  function vendorModule() {
    'use strict';

    self.process = { env: {} };
    return { 'default': self['Babel'] };
  }

  console.log('does it work?', vendorModule());

  define('@babel/core', [], vendorModule);
})();