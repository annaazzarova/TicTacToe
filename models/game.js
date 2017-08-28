var crypto = require('crypto');
var util = require('util');
var async = require('async');
var User = require('models/game').User;
var mongoose = require('../libs/mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    gameToken:{         //ID игры
        type: String,
        unique: true,
        required: true
    },
    /*owner: {            //создатель игры
        type: String,
        required: true
    },*/
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    opponent: {         //присоединенный игрок
        type: String,
        default: ''
    },
    size: {             //размер игрового поля
        type: Number,
        default: 3
    },
    gameDuration: {     //продолжительность игры
        type: Number
    },
    gameResult: {       //результат игры
        type: String,
        default: ''
    },
    state: {            //состояние игры
        type: String,
        default: 'ready'
    },
    created: {
        type: Date,
        default: Date.now
    },
    field: {
        type: Array,
        default: [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ]
    }
});
schema.methods.checkState = function() {
    return this.state === 'ready';
};

function generate(length) {
    var ints =[0,1,2,3,4,5,6,7,8,9];
    var chars=['a','b','c','d','e','f','g','h','j','k','l','m','n','o','p','r','s','t','u','v','w','x','y','z'];
    var out='';
    for(var i=0; i<length; i++){
        var ch = Math.random(1,2);
        if(ch < 0.5){
            var ch2 = Math.ceil(Math.random(1,ints.length)*10);
            out += ints[ch2];
        }else{
            var ch2 = Math.ceil(Math.random(1,chars.length)*10);
            out += chars[ch2];
        }
    }
    return out;
};

schema.statics.doStep = function(row, coloumn, gameToken, callback) {
    var Game = this;
    async.waterfall([
        function(callback) {
            Game.findOne({gameToken: gameToken}, callback);
        },
        function(game, callback) {
            if (!game.field[row][coloumn]){
                game.field[row][coloumn] = 1;
                Game.update({ gameToken: gameToken}, {field: game.field}, function(err, game) {
                    if (err) throw err;
                });
                callback(null, game);
            }
        }
    ], callback);
};

schema.statics.join = function(opponent, gameToken, callback) {
    var Game = this;
    async.waterfall([
        function(callback) {
            Game.findOne({gameToken: gameToken}, callback);
        },
        function(game, callback) {
            if (!game.opponent){
                game.opponent = opponent;
                Game.update({ gameToken: gameToken}, { opponent: game.opponent }, function(err, game) {
                    if (err) throw err;
                });
                callback(null, game);
            }
        }
    ], callback);
};

schema.statics.createGame = function(username, size,  callback) {
    var Game = this;
    var gameToken = generate(6);
    async.waterfall([
        function(callback) {
            Game.findOne({owner: username}, callback);
        },
        function(game, callback) {
            if (game) {
                if (game.checkState()) {
                    callback(null, game);
                } else {
                    var game = new Game({owner: username, size: size, gameToken: gameToken});
                    game.save(function(err) {
                        if (err) return callback(err);
                        callback(null, game);
                    });
                }
            } else {
                var game = new Game({owner: username, size: size, gameToken: gameToken});
                game.save(function(err) {
                    if (err) return callback(err);
                    callback(null, game);
                });
            }
        }
    ], callback);
};

exports.Game = mongoose.model('Game', schema);
