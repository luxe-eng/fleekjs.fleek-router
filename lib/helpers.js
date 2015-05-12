var _ = require('lodash');

//
// Path to absolute
//
// normalize both relative and absolute paths to be absolue (relative start with `.`)
//
// Parameters:
//   basePath
//     [String] - base path to resolve relative paths
//
//   initPath
//     [String] - path to build to, abolute or relative
//
//
exports.pathToAbsolute = function (basePath, initPath) {
  if (!(_.isString(basePath) && _.isString(initPath))) { throw new Error('pathtoAbsolute requires both basePath and initPath to be strings'); }

  var result = null;

  // relative
  if (~initPath.indexOf('.')) {
    pathSplit = initPath.split('/')
    pathSplit.shift();
    initPath = pathSplit.join('/');
    initPath = ~initPath.indexOf('/') ? initPath : '/' + initPath;
    result   = basePath + initPath;

  // absolute
  } else {
    result = initPath;
  }

  return result;
}
