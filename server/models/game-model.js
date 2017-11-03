const mongoose  = require('mongoose');
const Schema    = mongoose.Schema;
const _         = require('lodash');
const bcrypt    = require('bcrypt');
const validator = require('validator');
const jwt       = require('jsonwebtoken');
const config    = require('./../config/config')
const ObjectId  = Schema.Types.ObjectId


var gameSchema = new Schema({
  platform : {
    type: String,
    enum : ['psn','xboxlive']
  },
  name: String,
  description : {
    type: String,
    required : true
  },
  updated_at : {
    type : Date
  },
  users : [{
    user_id : {
      type: ObjectId,
    },
    _id : false
  }],
  teams : [{
    team_id : {
      type: ObjectId,
    },
    _id : false
  }],
  schedules : [{
    schedule_id : {
      type: ObjectId,
    },
    _id : false
  }],
  created_at : {
    type : Date
  }
})


gameSchema.pre('update',function (next) {
  var Game = this;
  var now  = new Date();
  Game.updated_at = now;
  if ( !Game.created_at ) {
    Game.created_at = now;
    next();
  }else{
    next();
  }
})

gameSchema.statics = {
  createGame(game_info) {
    var Game = new this(game_info);
    return Game.save()
      .then(doc => {
        return doc
      })
      .catch(e => {
        return promise.reject(e);
      })
  },
  listGames() {
    var Game = this;
    return Game.find({});
  },
  getGame(game_id) {
    var Game = this;
    return Game.findOne({_id : game_id})
    .then(game => {
      if (!game) {
        return Promise.reject('Game was not Found',404);
      }
      return game;
    })
    .catch(e => {
      return Promise.reject(e, 400);
    })
  },
  deleteGame(game_id) {
    var Game = this;
    return Game.deleteOne({ _id : game_id });
  },
  updateGame(game_id , game_info){
    var Game    = this;
    var options = game_info;
    return Game.findOneAndUpdate({ _id : game_id }, options , {new : true})
  }
}

var gameModel = mongoose.model('game',gameSchema);


module.exports = mongoose.model('game',gameSchema);
