# Fleek Validator

## Game Plan

- doc to route conversion
  - require
    - api docs
      - raw json
      - path to swagger file
      - default
        - primary `./config/api.json`
        - flalback `./api.json`
    - path to controller
      - default to `./controllers`
  - accept
    - authentication middleware method
      - false enacts noop
    - validator middleware method
      - false enacts noop
- functionality
  - should insert route data to this


```javascript
var fleekRouter = require('fleek-router');

fleekRouter(app, {
  controllers : 'foo/controllers', // default: /controllers
  swagger     : 'docs/swagger.json', // default: /config/api.json || /api.json
  authenicate : function *(next) { yield next; } // soon: require('fleek-athenticate')
  validate    : function *(next) { yield nex; } // soon: require('fleek-validate')
});
```
