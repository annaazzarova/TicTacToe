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
    owner: {            //создатель игры
        type: String,
        required: true
    },
    /*
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },*/
    opponent: {         //присоединенный игрок
        type: String,
        default: ''
    },
    term: {         //присоединенный игрок
        type: String,
        default: 'owner'
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
            ['?', '?', '?'],
            ['?', '?', '?'],
            ['?', '?', '?']
        ]
    }
});
schema.methods.checkState = function() {
    return this.state === 'ready';
};

schema.methods.checkDraw = function () {
    var field = this.field;
    var count_empty = 0;
    for (i=0; i < field.length; ++i) {
        for (j=0; j < field[i].length; ++j) {
            if (field[j][i] == '?') { count_empty += 1;}
        }
    }

    if (count_empty == 1) {
        return true;
    }
    return false;
}



schema.methods.checkDoneState = function() {
    var field = this.field;
    console.log (field.length);
    console.log (field);
    if ((field[0][0] != '?' && field[1][1] != '?' && field[2][2]!= '?') ||
        (field[0][2] != '?' && field[1][1] != '?' && field[2][0]!= '?') ||
        (field[0][0] != '?' && field[0][1] != '?' && field[0][2]!= '?') ||
        (field[1][0] != '?' && field[1][1] != '?' && field[1][2]!= '?') ||
        (field[2][0] != '?' && field[2][1] != '?' && field[2][2]!= '?') ||
        (field[0][0] != '?' && field[1][0] != '?' && field[2][0]!= '?') ||
        (field[0][1] != '?' && field[1][1] != '?' && field[2][1]!= '?') ||
        (field[0][2] != '?' && field[1][2] != '?' && field[2][2]!= '?')) {
        return true;
    }
    return false;
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

schema.statics.doStep = function(coloumn, row, gameToken, callback) {
    var Game = this;
    async.waterfall([
        function(callback) {
            Game.findOne({gameToken: gameToken}, callback);
        },
        function(game, callback) {
            if (game.field[row][coloumn] == '?'){
                var term = '';
                var cellValue = '?'
                if (game.term == 'owner') {
                    term = 'opponent'
                    cellValue = 'X'
                } else {
                    term = 'owner';
                    cellValue = 'O'
                }

                game.term = term;
                game.field[row][coloumn] = cellValue;

                if (game.checkDoneState()) {
                    game.gameResult = game.term;
                    game.state = 'done'
                }
                if (game.checkDraw()) {
                    game.gameResult = 'draw';
                    game.state = 'done';
                }
                Game.update({ gameToken: gameToken}, {field: game.field, term: game.term, gameResult: game.gameResult, state: game.state}, function(err, game) {
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
                game.state = 'playing';
                Game.update({ gameToken: gameToken}, { opponent: game.opponent, state: game.state }, function(err, game) {
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
