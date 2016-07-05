var mongoose = require("mongoose");
var userScheMa = new mongoose.Schema({
    user: String,
    pwd: String
});
module.exports = mongoose.model('user', userScheMa);

