var User = require('./../models/user-model');
var Team = require('./../models/team-model');
var Schedule = require('./../models/schedule-model');

var validate_parent = function(parent_id ,parent_type) {
  if (parent_type === 'user' && parent_id) {
    return User.validateById(parent_id)
    .then((user) => {
      return Promise.resolve(user);
    })
    .catch(e => {
      return Promise.reject({ message : 'parent_id is not valid', error : e })
    })
  }else if (parent_type === 'schedule' && parent_id) {
    return Schedule.validateById(child_id)
    .then((schedule) => {
      return Promise.resolve(schedule);
    })
    .catch(e => {
      return Promise.reject({ message : 'parent_id is not valid', error : e })
    })
  }else if (parent_type === 'team' && parent_id){
    return Team.validateById(parent_id)
    .then(() => {
      return Promise.resolve();
    })
    .catch(e => {
      return Promise.reject({ message : 'parent_id is not valid', error : e })
    })
  }else {
    return Promise.reject({ message : 'parent_type is not valid' })
  }
};


var validate_child = function(child_type, child_id) {
  if (child_type === 'user' && child_id) {
    return User.validateById(child_id)
    .then((user) => {
      return Promise.resolve(user);
    })
    .catch(e => {
      return Promise.reject({ message : 'child_id is not valid', error : e })
    })
  }
  if (child_type === 'team' && child_id){
    return Team.validateById(child_id)
    .then((team) => {
      return Promise.resolve(team);
    })
    .catch(e => {
      return Promise.reject({ message : 'child_id is not valid', error : e })
    })
  }
  if (child_type === 'schedule' && child_id){
    return Schedule.validateById(child_id)
    .then((schedule) => {
      return Promise.resolve(schedule);
    })
    .catch(e => {
      return Promise.reject({ message : 'child_id is not valid', error : e })
    })
  }
}

module.exports = { validate_parent , validate_child};
