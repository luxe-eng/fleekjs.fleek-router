# Fleek Router

[![Build Status](https://travis-ci.org/fleekjs/fleek-router.svg)](https://travis-ci.org/fleekjs/fleek-router) [![npm](https://img.shields.io/npm/l/express.svg)](https://github.com/fleekjs/fleek-router/blob/master/LICENSE)  [![Dependencies](https://img.shields.io/david/fleekjs/fleek-router.svg)](https://david-dm.org/fleekjs/fleek-router) [![Join the chat at https://gitter.im/fleekjs/fleek-router](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/fleekjs/fleek-router?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Middleware router that merges swagger docs with matching controllers.

Quick reference:
- Controllers for a route are determined by the `x-controller` tag in the route+method docs
  - `spaggerDoc.paths['/users']['x-controller']` -> controller name
- Authentication is set per route by including an `authenticate` tag for the route+method
  - `swaggerdoc.paths['/users/:id/edit'].tags = [fooController, authenticate]`
- Validate is run on all routes
  - Fleek has a build in validator matching inputs from the docs with inputs from the route. Custom validation can be used


## Key

- [Usage](#usage)
  - [Basic](#basic)
  - [Fully Custom (paths)](#fully-custom-paths)
  - [Fully Custom (objects)](#fully-custom-objects)
  - [Koa on Fleek](#koa-on-fleek)
- [Configuration](#configuration)
  - [`config.versionPrefix`](#configversionprefix)
  - [`config.languanePrefix`](#configlanguageprefix)
  - [`config.basePath`](#configbasepath)
  - [`config.swagger`](#configswagger)
  - [`config.controllers`](#configcontrollers)
  - [`config.authenticate`](#configauthenticate)
  - [`config.validate`](#configvalidate)
- [Reference Material](#reference-material)
- [Authors](#authors)

## Usage

### Basic

- Controllers are pulled from the `./controllers` directory
- Swagger docs will be retrieved from `./api.json`, `/swagger.json`, `/config/api.json`, or `/config/swagger.json` in that order
- [Full example](/examples/basic)

```javascript
var koa         = require('koa');
var fleekRouter = require('fleek-router');
var app = koa();

fleekRouter(app);

app.listen(3000);
```

### Fully Custom (paths)

- Controllers are pulled from the `./custom/controllers` directory
- Swagger docs are pulled from `./custom/docs.json`
- [**TODO** Full example]()

```javascript
var koa         = require('koa');
var fleekRouter = require('fleek-router');
var app = koa();

fleekRouter(app, {
  controllers : './controllers',
  swagger      : './custom/docs.json'
  authenicate : require('./some_auth_middleware'),
  validate    : require('./some_val_middleware'),
  response    : true
});

app.listen(3000);
```

### Fully custom (objects)

- Controllers are mapped to the object
- Swagger docs are parsed from the object provided
- [**TODO** Full example]()

```javascript
var koa         = require('koa');
var fleekRouter = require('fleek-router');
var app = koa();

fleekRouter(app, {
  authenicate : require('./some/auth/middleware'),
  validate    : require('./some/val/middleware'),
  swagger      : require('./some/swagger/generator')(),
  controllers : {
    foo : function () {
      this.body = { success: true };
    }
  }
});

app.listen(3000);
```

### Koa on fleek

- Controllers are pulled from the `./controllers` directory
- Swagger docs will be retrieved from `./api.json`, `/swagger.json`, `/config/api.json`, or `/config/swagger.json` in that order
- validate and authenticate will use the fleek middleware
- [**TODO** Full example]()

```javascript
var koa         = require('koa');
var fleekRouter = require('fleek-router');
var app = koa();

fleekRouter(app, {
  authenicate : true,
  validate    : { // powered by fleek-validator
    error : function *(err, next) {
      this.body = 'uh oh! validation failed',
      console.log(err);
    }
  }
});

app.listen(3000);
```

## Configuration


### config.versionPrefix

#### [optional]

#### summary

- adds a version prefix

#### accepts

- `String` - use the string passed in as the prefix
- `Boolean` - if true, use the `version_prefix` property from the swagger docs

```javascript
config.versionPrefix = 'v1';
// OR
config.versionPrefix = true;
```


### config.languagePrefix

#### [optional]

#### summary

- adds a version prefix

#### accepts

- `String` - use the string passed in as the prefix
- `Boolean` - if true, use the `language_prefix` property from the swagger docs

```javascript
config.languagePrefix = 'en';
// OR
config.languagePrefix = true;
```

### config.basePath

#### [optional]

#### summary

- adds a version prefix

#### accepts

- `String` - use the string passed in as the prefix
- `Boolean` - if true, use the `basePath` property from the swagger docs

```javascript
config.basePath = 'v1/en';
// OR
config.basePath = true;
```


### config.swagger

#### [optional]

#### summary

- sets the swagger documentation source for compiling routes.

#### accepts

- `Object` - javascript object mapping to the swagger doc format exactly
- `String` - path to the swagger json file (relative or absolute)
- `Undefined` - attempts to find the config in the following places `./api.json`, `./swagger.json`, `./config/api.json`, and `./config/swagger.json`

```javascript
config.swagger = undefined; // attempts to resolve internally
// OR
config.swagger = './some/relative/swag.json';
// OR
config.swagger = '/some/absolute/swagger.json';
// OR
config.swagger = require('./a/function/returning/swag')();
```


### config.controllers

#### [optional]

#### summary

- sets the controllers used to map routes from the swagger documentation
- **controllers are mapped using the first element in the `tag` array of the route+method documenation**
- nested controllers are allowed, but must be `.` delimited in the tag


#### accepts

- `Object` - javascript object of controllers
- `String` - path to the controllers directory (relative or absolute)
- `Undefined` - defaults to

```javascript
config.controllers = undefined; // defaults to ./controllers
// OR
config.controllers = './some/relative/controllers';
// OR
config.controllers = '/some/absolute/controllers';
// OR
config.controllers = {
  foo : function *() {}, // maps to `foo` tag
  bar : {
    biz : function *() {} // maps to `bar.biz` tag
  }
};
```

### config.authenticate

#### [optional]

#### summary

- sets the authentication method for the secured routes
- **applies to any route with the `authenticate` tag**

#### accepts

- `Function` - function to use for authentication
- `Boolean` - if true, use the `fluent-authenticate` middleware

```javascript
config.authenticate = true; // use `fluent-authenticate`
// OR
config.authenticate = function *(next) {
  var isAuth = someAuthCheck(this);
  if (isAuth) {
    yield next;
  } else {
    this.status = 401;
    this.body   = 'Not Authorized';
  }
}
```


### config.validate

#### [optional]

#### summary

- sets the validation method

#### accepts

- `Function` - function to use for validation
- `Boolean` - if true, use the `fluent-validate` middleware

```javascript
config.validate = true; // use `fluent-validate`
// OR
config.validate = function *(next) {
  var valid = true;

  if (this.pathname === '/') {
    valid = someValidator.rooValidate(this);

  } else if (this.pathname === 'user') {
    valid  = someValidator.userValidator(this);
  }

  if (valid) {
    yield next;
  } else {
    this.status = 400;
    this.body   = 'Invalid data Submitted'
  }
}
```

### config.middleware

#### [optional]

#### summary

- middleware to fire before the controller
- used to make changes for every request after all fleek middleware has fired

#### accepts

- `Function*` - function to execute
- `Array` - array of functions to execture in order

```javascript
config.middleware = function *(next) {
  console.log('Route middleware passed!');
  console.log('Executing controller: ' + this.routeConfig.controller);
  yield next;
}

// OR

config.middleware = [
  function *(next) {
    console.log('1');
    yield next;
  },
  function *(next) {
    console.log('2');
    yield next;
  }
]

```

## Reference Material

#### Swagger

- [Home](http://swagger.io/)
- [Editor Demo](http://editor.swagger.io/)
- [Documentation](https://github.com/swagger-api/swagger-spec/blob/master/versions/2.0.md)

#### By the authors

- [Hart Engineering](http://engineering.hart.com/)


## Authors

- [John Hofrichter](https://github.com/johnhof)
- [Peter A. Tariche](https://github.com/ptariche)
- [Lan Nguyen](https://github.com/lan-nguyen91)

_Built and maintained with [<img width="15px" src="http://hart.com/wp-content/themes/hart/img/hart_logo.svg">](http://hart.com/) by the [Hart](http://hart.com/) team._
