/* eslint global-require: "off" */

const mochaGlobals = require('./.globals.json').globals;

window.mocha.setup('bdd');
window.onload = function windowOnLoad() {
  window.mocha.checkLeaks();
  window.mocha.globals(Object.keys(mochaGlobals));
  window.mocha.run();
  require('./setup')(window);
};
