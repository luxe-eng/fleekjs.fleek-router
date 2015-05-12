'use strict';


var _             = require('lodash');
var fs            = require('fs');
var route         = require('koa-router');
var configHelpers = require('./config_helpers');
var helpers       = require('./helpers');
var parsers       = require('./parsers');

const cwd = process.cwd();

var pathSplit = module.parent.filename.split('/');
pathSplit.pop();
const relPath = pathSplit.join('/');

//
// Router
//

var router = function(app, config) {
  config = config || {};

  // docs

  const docs = configHelpers.parseSwaggerDocs(relPath, config.swagger);

  // make sure the docs are valid
  if (!docs) { throw new Error('Nox swagger documentation file recovered. Check the configuration'); }

  // parser

  var parser = parsers(docs);
  if (!parser) { throw new Error('Swagger version ' + docs.swagger + ' not supported'); }

  // prefix's
  var prefix = '';
  prefix = configHelpers.addPrefix('language_prefix', prefix, config, docs);
  prefix = configHelpers.addPrefix('version_prefix', prefix, config, docs);
  prefix = configHelpers.addPrefix('basePath', prefix, config, docs);

  // controllers

  // controller files directory
  config.controllers = config.controllers || './controllers'
  if (_.isString(config.controllers)) {
    config.controllers = helpers.pathToAbsolute(relPath, config.controllers);

  // only accept controller object otherwise
  } else if (!_.isObject(config.controllers)) {
    throw new Error('No controllers found, check the configuration');
  }

  //
  // build routes
  //

  var authenticate   = configHelpers.getAuthenticateFunction(config);
  var validate       = configHelpers.getValidateFunction(config);
  var inject         = config.inject || function *(next) { yield next; };
  const publicRouter = new route();
  const secureRouter = new route();

  _.each(parser.sanitizedRoutes(), function(routeObj) {

    // attempt to build controllers with the format `[ctrlName].[property].[property]...`
    var controller;
    var methodHandler;
    var ctrlNamespace = routeObj.controller.split('.');
    var ctrlPrimary   = ctrlNamespace.shift();

    if (!ctrlPrimary) { throw new Error('Controller name ' + routeObj.controller + ' not formatted properly'); }

    if (_.isString(config.controllers)) {
      controller = require(config.controllers + '/' + ctrlPrimary);
    } else {
      controller = config.controllers[ctrlPrimary];
    }

    // drill down the controller properties
    while (_.isObject(controller) && ctrlNamespace.length) {
      controller = controller[ctrlNamespace.shift()];
    }

    if (!_.isObject(controller)) { throw new Error('Controller ' + routeObj.controller + ' does not exist'); }

    var methodHandler = controller[routeObj.method];
    if (!_.isFunction(methodHandler)) { throw new Error('Method ' + routeObj.method + ' does not exist for controller' + routeObj.controller); }

    function* bindRouteData (next) {
      this.routeConfig = routeObj;
      yield next;
    }

    if (!routeObj.restricted) {
      var path = helpers.joinPaths(prefix, routeObj.path);

      if (routeObj.authRequired) {
        secureRouter[routeObj.method](path, bindRouteData, authenticate, validate, inject, methodHandler);
      } else {
        publicRouter[routeObj.method](path, bindRouteData, validate, inject, methodHandler);
      }
    }
  });


  app.use(publicRouter.middleware());
  app.use(secureRouter.middleware());
}

module.exports = router;
