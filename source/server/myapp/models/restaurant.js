var mongoose = require("mongoose");
var userScheMa = new mongoose.Schema({
  rname : String,
  addr : String,
  tel : String,
  feature : String
});
module.exports = mongoose.model('restaurant', userScheMa);
