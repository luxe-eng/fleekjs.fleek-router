'use strict'

let koa    = require('koa');
let router = require('../../lib/router');
let app    = koa();

const PORT = 7000;

router(app, {
  swagger: './swagger.json'
});

app.listen(PORT);
console.log('Listening on port ' + PORT);
