var _          = require('lodash');
var BaseParser = require('./../base_parser');

var VersionParser = function () {
  BaseParser.apply(this, arguments);
}

VersionParser.prototype = Object.create(BaseParser);

VersionParser.prototype.pathController = function (path) {
  return Object.keys(this.docs.path)[0];
}

VersionParser.prototype.sanitizedRoutes = function () {
  var routes = [];

  _.each(this.docs.paths, function (pathConfig, pathRoute) {
    _.each(pathConfig, constructPathObj(pathRoute));
  });

  function constructPathObj (pathRoute) {
    return function (endpointConfig, methodType) {
      try {
        if (_.isString(pathRoute) && _.isString(methodType) && _.isString(endpointConfig.tags[0])) {
          routes.push({
            path         : pathRoute,
            method       : methodType.toLowerCase(),
            controller   : endpointConfig.tags[0],
            authRequired : !!(_.includes(endpointConfig.tags, 'authenticated')),
            restricted   : !!(_.includes(endpointConfig.tags, 'restricted')),
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

  return routes;
}

module.exports = VersionParser;
