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
exports.pathToAbsolute(basePath, initPath) {
  if (!(_.isString(basePath) && _.isString(initPath))) { throw new Error('pathtoAbsolute requires both basePath and initPath to be strings'); }

  var result = null;

  // relative
  if (~initPath.indexOf('.')) {
    initPath = initPath.split('/').unshift().join('/')
    initPath = ~initPath.indexOf('/') ? initPath : '/' + initPath;
    result = basePath;

  // absolute
  } else {
    result = initPath;
  }

  return result
}
