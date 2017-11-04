var User = require('./../models/user-model');
var Team = require('./../models/team-model');
var Schedule = require('./../models/schedule-model');

var validate_parent = function(parent_type, parent_id) {
  if (parent_type === 'user' && parent_id) {
    return User.validateById(parent_id)
    .then((user) => {
      return Promise.resolve(user);
    })
    .catch(e => {
      return Promise.reject({ message : 'parent_id is not valid', error : e })
    })
  }
  if (parent_type === 'team' && parent_id){
    return Team.validateById(parent_id)
    .then(() => {
      return Promise.resolve();
    })
    .catch(e => {
      return Promise.reject({ message : 'parent_id is not valid', error : e })
    })
  }
};


var validate_game_child = function(child_type, child_id) {
  console.log(child_type,child_id);
  if (child_type === 'users' && child_id) {
    return User.validateById(child_id)
    .then((user) => {
      return Promise.resolve(user);
    })
    .catch(e => {
      return Promise.reject({ message : 'parent_id is not valid', error : e })
    })
  }
  if (child_type === 'teams' && child_id){
    return Team.validateById(child_id)
    .then((team) => {
      return Promise.resolve(team);
    })
    .catch(e => {
      return Promise.reject({ message : 'parent_id is not valid', error : e })
    })
  }
  if (child_type === 'schedules' && child_id){
    return Schedule.validateById(child_id)
    .then((schdule) => {
      return Promise.resolve(schedule);
    })
    .catch(e => {
      return Promise.reject({ message : 'parent_id is not valid', error : e })
    })
  }
}

module.exports = { validate_parent , validate_game_child};
