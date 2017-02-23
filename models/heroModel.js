var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var heroModel = new Schema({
    name: {type: String},
    type: {type: String},
    attribute: {type: String},
    rank: {type: Number},
    image: {type: String}
});

module.exports = mongoose.model('Hero', heroModel);