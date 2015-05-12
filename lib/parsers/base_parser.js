
var Parser = function (docs) {
  this.docs = docs || {};
}

// get the version
Parser.prototype.version = function () {
  return this.docs.swagger;
}

// get the paths array
Parser.prototype.paths = function () {
  return this.docs.paths;
};

// return sanitized path array
//
// [{
//   path         : [String],
//   method       : [String],
//   controller   : [String],
//   authRequired : [Boolean],
//   restricted   : [Boolean]
// }]
Parser.prototype.sanitizedRoutes = function () {
  return this.docs.paths;
}

// get the controller for the provided path
Parser.prototype.pathController = function (path) {
  return null;
};


module.exports = Parser;
