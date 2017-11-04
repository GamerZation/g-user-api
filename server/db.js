var mongoose  = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://hiso:1234@ds237475.mlab.com:37475/z-db");


module.exports = {mongoose}
