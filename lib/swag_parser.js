
module.exports = function (docs) {
  if (parseInt(version, 10) === 2) {
    return new parsers['2.x'](docs);
  } else {
    throw new Error('Swagger version ' + version + ' not suppeorted');
  }
}


////////////////////////////////////////////////////////////////////////////////
//
// Parser
//
////////////////////////////////////////////////////////////////////////////////


var Parser = function (docs) { this.docs = docs || {}; }

// get the version
Parser.prototype.version = function () { return this.docs.swagger; }

// get the paths array
Parser.prototype.paths = function () { return this.docs.paths; };

// return sanitized path array
//
// [{
//   path         : [String],
//   method       : [String],
//   controller   : [String],
//   authRequired : [Boolean],
//   restricted   : [Boolean]
// }]
Parser.prototype.sanitizedRoutes = function {
  return this.docs.paths;
}

// get the controller for the provided path
Parser.prototype.pathController = function (path) { return null; };


////////////////////////////////////////////////////////////////////////////////
//
// Parser Versions
//
////////////////////////////////////////////////////////////////////////////////


var parsers = {};

//
// v 1.x
//


// LOL


//
// v 2.x
//


parsers['2.x'] = new Parser();

parsers['2.x'].prototype.pathController = function (path) {
  return Object.keys(this.docs.path)[0];
}


parsers['2.x'].prototype.sanitizedRoutes = function () {
  var routes = [];

  _.each(this.docs.paths, function (pathConfig, pathRoute) {
    _.each(pathConfig, constructPathObj(pathRoute));
  });

  function constructPathObj (pathRoute) {
    return function (endpointConfig, methodType) {
      try {
        if (_.isString(pathRoute) && _.isString methodType && _.isString(endpointConfig.tags[0])) {
          reoutes.push({
            path         : pathRoute ,
            method       : methodType.toLowerCase(),
            controller   : endpointConfig.tags[0]
            authRequired : !!(_.includes(routeConfig[keyOf].tags, 'authenticated'),
            restricted   : !!(_.includes(routeConfig[keyOf].tags, 'restricted'),
            details      : endpointConfig
          });
        } else {
          throw new Error('Invalid route configuration');
        }
      } catch (e) {
        console.error('Ignored route: (' + methodType + ' ' + pathRoute + ') because of error');
        console.error(e.stack);
      }
    }
  }
}
