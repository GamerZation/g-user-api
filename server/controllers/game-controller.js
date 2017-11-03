var Team = require('./../models/team-model');
var User = require('./../models/user-model');
var Schedule = require('./../models/schedule-model');
var Game = require('./../models/game-model');
const _  = require('lodash');



exports.list_games = function(req , res) {
  Game.listGames()
  .then(games => {
    res.send({ games })
  })
  .catch(e => {
    res.status(400).send(e);
  })
}
exports.get_game = function(req, res) {
  var game_id = req.params.game_id;
  Game.getGame(game_id)
  .then(game => {
    res.send({ game_model : game });
  })
  .catch((e, status) => {
    res.status( status || 400 ).send(e);
  })
}
exports.add_child = function(req, res) {
  var game_id    = req.params.game_id;
  var child_type = req.params.child_type;
  var child_id   = req.params.child_id;
  Game.addChild()
}
exports.create_game = function(req, res) {
  var game_info = _.pick(req.body, ['platform','name','description']);
  Game.createGame(game_info)
  .then(game => {
    res.send({ game_model : game });
  })
  .catch(e => {
    res.status(422).send(e);
  })
}
exports.edit_game = function(req, res) {
  var game_id   = req.params.game_id;
  var game_info = _.pick(req.body, ['platform','name','description']);
  Game.updateGame(game_id, game_info)
  .then(game => {
    res.send({ game_model : game })
  })
  .catch(e => {
    res.status(422).send(e);
  })
}
exports.delete_game = function(req, res) {
  var game_id = req.params.game_id;
  Game.deleteGame(game_id)
  .then(() => {
    res.send({ message: 'Game was deleted successfully' })
  })
  .catch(e => {
    res.status(404).send(e);
  })
}
