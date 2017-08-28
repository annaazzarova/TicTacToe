var Game = require('models/game').Game;
var HttpError = require('error').HttpError;

exports.get = function (req, res) {
    res.render('games');
};
