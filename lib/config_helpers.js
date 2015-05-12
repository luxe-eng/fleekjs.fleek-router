var _       = require('lodash');
var fs      = require('fs')
var helpers = require('./helpers');

const cwd = process.cwd();

//
// Parse Swagger Docs
//
// Parameters:
//   relPath
//     [String] - path of location called from
//
//   docSrc
//     [Undefined] - attempt to find (swagger.json || api.jsonP
//       OR
//     [String] - path to docs
//       OR
//     [Object] - swagger object
//
exports.parseSwaggerDocs = function (relPath, docSrc) {
  var docs = null;

  // if the swagger property is a path
  if (_.isString(docSrc)) {
    docSrc = hepers.pathToAbsolute(relPath, docSrc);

    if (fs.existsSync(docSrc)) {
      docs = require(docSrc);
    } else {
      throw new Error('Swagger json file does not exist: ' + docSrc);
    }

    // if the swagger property is an object
  } else if (_.isObject(docSrc)) {
    docs = docSrc;

  // try to find the swagger doc in a few different places
  } else {
    _.each([
      '/api.json',
      '/swagger.json',
      '/config/api.json',
      '/config/swagger.json'
    ], function (path) {
      if (fs.existsSync(cwd + path)) {
        docs = require(cwd + path);
      }
    });
  }

  if (docs) {
    return docs;
  } else {
    throw new Error('Could not find swagger documentation file');
  }
}

//
// Get Authenticate Function
//
// Parameters:
//   config
//     [Object] - router configuration
//
//     authenticate
//       [Boolean] - if true, use fleek-authenticate
//         OR
//       [Function] - custom function
//         OR
//       [Undefined] - no-op
//
exports.getAuthenticateFunction = function (config) {
  if (config.authenticate === true) {
    throw new Error('uh-oh! fleek-authenticator isn\'t implemented yet. try back later');
    return fleekAuthenticate; // TODO: implement this

  } else if (_.isFunction(config.authenticate)) {
    return config.authenticate;

  } else {
    return function *(next) { yield next; }
  }
}

//
// Get Validate Function
//
// Parameters:
//   config
//     [Object] - router configuration
//
//     validate
//       [Boolean] - if true, use fleek-validate
//         OR
//       [Function] - custom function
//         OR
//       [Undefined] - no-op
//
exports.getValidateFunction = function (config) {
  if (config.validate === true) {
    throw new Error('uh-oh! fleek-validate isn\'t implemented yet. try back later');
    return fleekValidate // TODO: implement this

  } else if (_.isFunction(config.validate)) {
    return config.validate;

  } else {
    return function *(next) { yield next; }
  }
}

//
// Get Validate Function
//
// Parameters:
//
//   prefixName
//     [String] - prefix property name
//
//   path
//     [String] - path to prefix to
//
//   config
//     [Object] - router configuration
//
//     {prefixName}
//       [Boolean] - if true, use the prefix from the docs
//         OR
//       [String] - custom prefix
//
//    docs
//      [Object] - swagger docs
//
exports.addPrefix = function (prefixName, path, config, docs) {
  var result = path;
  var prefixVal = config[prefixName];
  if (prefixVal) {
    if (_.isString(prefixVal)) {
      result = helpers.joinPaths(prefixVal, path);

    } else if (prefixVal === true) {
      var docPrefixVal = docs[prefixName];
      if (docPrefixVal) {
        result = helpers.joinPaths(docPrefixVal, path);
      } else {
        throw new Error('could not find a prefix property ' + prefixName + ' in the swagger documentation');
      }
    }
  }

  return result;
}
