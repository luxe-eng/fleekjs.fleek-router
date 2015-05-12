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
// Bind Routes
//
// Parameters:
//   app
//     [Object] - Koa server
//
//   config
//     [Object] - router config
//
//       config.controllers
//         [Object] - object of controllers
//           OR
//         [String] - path to controllers
//           OR
//         [Undefined] - default to path /controllers
//
//       config.authenticate
//         [Boolean] - if true, use fleek authenticate
//           OR
//         [Function] - run on every secure route
//
//       config.validate
//         [Boolean] - if true, use fleek validator
//           OR
//         [Function] - function to run on every route
//
//       config.inject
//         [Function] - function to run on every route
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
      if (routeObj.authRequired) {
        secureRouter[routeObj.method](routeObj.path, bindRouteData, authenticate, validate, inject, methodHandler);
      } else {
        publicRouter[routeObj.method](routeObj.path, bindRouteData, validate, inject, methodHandler);
      }
    }
  });


  app.use(publicRouter.middleware());
  app.use(secureRouter.middleware());
}

module.exports = router;
