var express = require('express');
var router = express.Router();
var app = express();
var checkAuth = require('middleware/checkAuth');
var Game = require('models/game').Game;
var User = require('models/game').User;
var HttpError = require('error').HttpError;
var size = 3;


/* GET home page. */
router.get('/', function(req, res, next) {
    Game.find(function (err, games){
        res.render('games', {games: games});
    });
});

router.get('/games', function(req, res, next) {
    Game.find(function (err, games){
        res.render('games', {games: games});
    });
});

router.get('/games/:id', function(req, res, next) {
    Game.findOne({gameToken: req.params.id}, function (err, game){
        res.render('game', {game: game});
    });
});

router.get('/games/update_fields', function(req, res, next) {
    Game.findOne({gameToken: req.params.id}, function (err, game){
        res.json(game.field);
    });
});

router.get('/login', require('./login').get);
router.post('/login', require('./login').post);
router.post('/logout', require('./logout').post);
//router.get('/games', checkAuth, require('./games').get);

router.post('/games/new', function(req, res, next) {
    var user = res.locals.user;
    Game.createGame(user, size, function (err, game){
        if (err) {
            if (err instanceof  HttpError) {
                return next(new HttpError(403, err.message))
            } else {
                return next(err);
            }
        }
        res.json(game);
    });
});


router.post('/games/do_step', function(req, res, next) {
    var row = req.body.row;
    var colomn = req.body.colomn;
    var gameToken = req.body.gameToken;
    Game.doStep(row, colomn, gameToken, function (err, game){
        if (err) {
            if (err instanceof  HttpError) {
                return next(new HttpError(403, err.message))
            } else {
                return next(err);
            }
        }
        res.json(game);
    });

});

router.post('/games/join', function(req, res, next) {
    var opponent = req.body.username;
    var gameToken = req.body.gameToken;
    Game.join(opponent, gameToken, function (err, game){
        if (err) {
            if (err instanceof  HttpError) {
                return next(new HttpError(403, err.message))
            } else {
                return next(err);
            }
        }
        res.json(game);
    });

});

module.exports = router;
