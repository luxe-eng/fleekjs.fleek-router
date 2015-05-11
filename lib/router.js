'use strict';


var _ = require('lodash');
var fs = require('fs');

const cwd = process.cwd();

/*
Valid route methods: get, put, post, delete, options, trace, head
*/

var router = {};
var keyOf;
var i = 0;

_.each(APIDocumentation.paths, function(buildRoute, index) {

  keyOf = Object.keys(buildRoute)[0];
  try {
    if (_.includes(buildRoute[keyOf].tags) != 'restricted') {
      router[i] = {};
      router[i].path = index ? index : false;
      router[i].method = Object.keys(buildRoute)[0] ? Object.keys(buildRoute)[0] : false;
      router[i].controller = require('../controllers/' + buildRoute[keyOf].tags[0] + '.js')[Object.keys(buildRoute)[0]] ? require('../controllers/' + buildRoute[keyOf].tags[0] + '.js')[Object.keys(buildRoute)[0]] : false;
      if (_.includes(buildRoute[keyOf].tags, 'authenticated')) router[i].authRequired = true;
      else router[i].authRequired = false;
      i++;
    }
  } catch (e) {
    console.error('Failed to append children to object for router because: ' + e);
  }
});


var router = function(config) {
  config = config || {};
  var docs = null;
  console.log(module.parent.filename);
  var relPath = module.parent.filename.split('/').pop().join('/');
  console.log(relpath);

  //
  // config.swagger
  //
  // accept:
  //   [Undefined ] - attempt to find (swagger.json || api.jsonP
  //     OR
  //   [String] - path to docs
  //     OR
  //   [Object] - swagger object
  //

  // if the swagger property is a path
  if (_.isString(config.swagger)) {

    // relative path
    if (~config.swagger.indexOf('.')) {
        var extPath = config.swagger.split('/').unshift().join('/');
        if (fs.existsSync(relPath + extPath)) {
          docs = require(relPath + extPath);
        } else {
          throw new Error ('Swagger file does not exist: ' + relPath + extPath);
        }

    // absolute path
    if (fs.existsSync(config.swagger)) {
      docs = require(config.swagger);
    } else {
      throw new Error('Swagger json file does not exist: ' + config.swagger);
    }

    // if the swagger property is an object
  } else if (_.isObject(config.swagger)) {
    docs = config.swagger;

  // try to find the swagger doc in a few different places
  } else {
    if (fs.existsSync(cwd + '/api.json')) {
      docs = cwd + '/api.json';
    } else if (fs.existsSync(cwd + '/swagger.json')) {
      docs = cwd + '/swagger.json';
    } else if (fs.existsSync(cwd + '/config/api.json')) {
      docs = cwd + '/config/api.json';
    } else if (fs.existsSync(cwd + '/config/swagger.json')) {
      docs = cwd + '/swagger/swagger.json';
    } else {

    }
  }


  var docs =
}

module.exports = router;
