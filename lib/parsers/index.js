
module.exports = function (docs) {
  var version = (docs || {}).swagger;
  var parser;

  if (parseInt(version, 10) === 2) {
    parser = require('./versions/2.x');
  } else {
    throw new Error('Swagger version ' + version + ' not suppeorted');
  }

  return new parser(docs);
}
