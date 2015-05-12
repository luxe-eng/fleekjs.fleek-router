# Fleek Validator

Middleware router that merges swagger docs with matching controllers.

Quick reference:
- Controllers for a route are determined by the first tag in the route+method docs
  - `spaggerDoc.paths['/users'].get.tags[0]` -> controller name
- Authentication is set per route by including an `authenticate` tag for the route+method
  - `swaggerdoc.paths['/users/:id/edit'].tags = [fooController, authenticate]`
- Validate is run on all routes
  - Fleek has a build in validator matching inputs from the docs with inputs from the route. Custom validation can be used


## Key

- [Usage](#Usage)
  - [Basic](#basic)
  - [Fully Custom (paths)](#fully-custom-paths)
  - [Fully Custom (objects)](#fully-custom-objects)
  - [Koa on Fleek](#koa-on-fleek)
- [Configuration](#configuration)
  - [`config.swagger`](#configswagger)
  - [`config.controllers`](#configcontrollers)
  - [`config.authenticate`](#configauthenticate)
  - [`config.validate`](#configvalidate)
- [Authors](#authors)

## Usage

### Basic

- Controllers are pulled from the `./controllers` directory
- Swagger docs will be retrieved from `./api.json`, `/swagger.json`, `/config/api.json`, or `/config/swagger.json` in that order
- [**TODO** Full example]()

``javascript
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

``javascript
var koa         = require('koa');
var fleekRouter = require('fleek-router');
var app = koa();

fleekRouter(app, {
  controllers : './controllers',
  swager      : './custom/docs.json'
  authenicate : require('./some_auth_middleware'),
  validate    : require('./some_val_middleware')
});

app.listen(3000);
```

### Fully custom (objects)

- Controllers are mapped to the object
- Swagger docs are parsed from the object provided
- [**TODO** Full example]()

``javascript
var koa         = require('koa');
var fleekRouter = require('fleek-router');
var app = koa();

fleekRouter(app, {
  authenicate : require('./some/auth/middleware'),
  validate    : require('./some/val/middleware')
  swager      : require(./some/swagger/generator)(),
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

``javascript
var koa         = require('koa');
var fleekRouter = require('fleek-router');
var app = koa();

fleekRouter(app, {
  authenicate : true,
  validate    : true
});

app.listen(3000);
```

## Configuration



### config.swagger

#### [required]

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

#### [required]

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

### config.inject

#### [optional]

#### summary

- middleware to fire before the controller
- used to make changes for every request after all fluent middleware has fired

#### accepts

- `Function` - function to use for validation

```javascript
config.inject = function *(next) {
  console.log('Route middleware passed!');
  console.log('Executing controller: ' + this.routeConfig.controller);
  yield next;
}
```

## Authors

- [John Hofrichter](https://github.com/johnhof)
- [Peter A. Tariche](https://github.com/ptariche)
