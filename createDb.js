var mongoose = require('mongoose');
var User = require('models/user').User;
var async = require('async');

async.series([
    open,
    dropDatabase,
    requireModels,
    createUsers,
    close
], function(err){
    console.log(arguments);
});

function open(callback) {
    mongoose.connection.on('open', callback)
}

function dropDatabase(callback) {
    var db = mongoose.connection.db;
    db.dropDatabase(callback);
}

function requireModels(callback) {
    require('models/user');
    async.each(Object.keys(mongoose.models), function (modelName, callback) {
        mongoose.models[modelName].ensureIndexes(callback);
    }, callback);
}

function createUsers(callback) {

    var users = [
        {username: 'User1', password: '123'},
        {username: 'User2', password: '111'},
        {username: 'User3', password: '222'}
    ];
    async.each(users, function (userData, callback) {
        var user = new mongoose.models.User(userData);
        user.save(callback);
    }, callback);
}

function close(callback) {
    mongoose.disconnect(callback);
}
mongoose.connection.on('open', function () {
    mongoose.connection.dropDatabase(function (err) {
        if (err) throw err;

    });
});