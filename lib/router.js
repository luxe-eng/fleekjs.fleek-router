'use strict';

var _             = require('lodash');
var genit         = require('genit');
var fs            = require('fs');
var route         = require('koa-router');
var configHelpers = require('./config_helpers');
var helpers       = require('./helpers');
var parsers       = require('fleek-parser');
var documentation = require('swagger-injector');

const cwd = process.cwd();

var pathSplit = module.parent.filename.split('/');
pathSplit.pop();
const relPath = pathSplit.join('/');

//
// Router
//

var router = function (app, _config) {
  var config = _.clone(_config, true) || {};

  // docs
  var docs;
  if (typeof config.swagger == "object") docs = config.swagger;
  else docs = configHelpers.parseSwaggerDocs(relPath, config.swagger);

  // make sure the docs are valid
  if (!docs) { throw new Error('No swagger documentation file recovered. Check the configuration'); }

  // parser

  var swagger = parsers.parse(docs);

  if (!swagger) { throw new Error('Parser fail to parse swagger document'); }

  // prefix's
  var prefix = '';
  prefix = configHelpers.addPrefix('language_prefix', prefix, config, docs);
  prefix = configHelpers.addPrefix('basePath', prefix, config, docs);
  // controllers

  // controller files directory
  config.controllers = config.controllers || './controllers';
  if (_.isString(config.controllers)) {
    config.controllers = helpers.pathToAbsolute(relPath, config.controllers);

  // only accept controller object otherwise
  } else if (!_.isObject(config.controllers)) {
    throw new Error('No controllers found, check the configuration');
  }

  //
  // build routes
  //

  var authenticate = configHelpers.getAuthenticateFunction(config);
  var validate = configHelpers.getValidateFunction(config, docs, app);
  var response = configHelpers.getResponseFunction(config, docs, app);
  var middleware = function *(next) { yield next; };

  if (genit.isGenerator(config.middleware)) {
    middleware = config.middleware;

  } else if (config.middleware && config.middleware.length) {
    let midSet = [];
    _.each(config.middleware, function (func) { if (genit.isGenerator(func)) midSet.push(func); });

    let mCount = midSet.length;
    middleware = function *(next) {
      let ctx = this;
      let noop = function *() {};

      for (let i = 0; i < mCount; i++) {
        yield midSet[i].call(ctx, noop);
      }

      yield next;
    };
  }

  const publicRouter = new route();
  const secureRouter = new route();

  //method in local parser has been move to fleek-parser
  _.each(swagger.sanitizedRoutes, function (routeObj) {

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

    if (!_.isObject(controller)) { throw new Error('Controller [' + routeObj.controller + '] does not exist'); }

    /* adding in execution path to config */
    methodHandler = (routeObj.details && routeObj.details['x-controller-method']) ? controller[routeObj.details['x-controller-method']] : controller[routeObj.method];
    if (routeObj.details && _.isString(routeObj.details.execute)) {
      var parts = routeObj.details.execute.split('/');
      try {
        if (parts.length == 1) {
          parts.unshift(config.controllers + '/' + routeObj.controller);
        } else {
          if (parts[0] == "") {
            parts[0] = cwd;
          } else {
            parts.unshift(cwd);
          }
        }
        let mName = parts.pop();
        let mPath = parts.join('/');
        var mod = parts.length == 1 ? controller : require(mPath);
        if (!mod[mName]) {
          throw 'method ' + mName + ' does not exist in the module ' + mPath;
        }
        var _oldMethodHandler = methodHandler;
        if (genit.isGenerator(methodHandler)) {
          methodHandler = function* (){
            yield _oldMethodHandler.apply(this,arguments);
            let func = mod[mName];
            if (genit.isGenerator(func)) {
              yield func.apply(this, arguments);
            } else {
              func.apply(this, arguments);
            }
          }
        } else {
          methodHandler = function (){
            _oldMethodHandler.apply(this,arguments);
            mod[mName];
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    /* end adding in exection path to config */
    if (!methodHandler) throw new Error('Method [' + routeObj.method.toUpperCase() + '] does not exist for controller: ' + routeObj.controller);
    if (!genit.isGenerator(methodHandler)) throw new Error('Method [' + routeObj.method.toUpperCase() + '] of controller [' + routeObj.controller + '] is not a generator');

    function * bindRouteData (next) {
      this.fleek             = this.fleek || {};
      this.fleek.controllers = this.fleek.controllers || swagger.controllers;
      this.fleek.routeConfig = routeObj;
      yield next;
    }

    var path = helpers.joinPaths(prefix, routeObj.path);
    if (routeObj.authRequired) {
      secureRouter[routeObj.method](path, bindRouteData, response, authenticate, validate, middleware, methodHandler);
    } else {
      publicRouter[routeObj.method](path, bindRouteData, response, validate, middleware, methodHandler);
    }
  });


  if (config.documentation) {
    config.documentation = _.isObject(config.documentation) ?  config.documentation : {};
    config.documentation.swagger = config.documentation.swagger || docs;
    app.use(documentation.koa(config.documentation));
  }

  app.use(publicRouter.middleware());
  app.use(secureRouter.middleware());
};

module.exports = router;
