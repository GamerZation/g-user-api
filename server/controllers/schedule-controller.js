var Team = require('./../models/team-model');
var User = require('./../models/user-model');
var Schedule = require('./../models/schedule-model');
const _  = require('lodash');
var { validate_parent ,validate_child } = require('./../middleware/validation');

exports.create_schedule = function(req, res) {
  var scheduleInfo   = _.pick(req.body, ['name' , 'description' , 'parent_type', 'parent_id', 'end_time']);

  scheduleInfo.creator_id = req.user._id;

  validate_parent(scheduleInfo.parent_id ,scheduleInfo.parent_type)
  .then(() => {
    return Schedule.createSchedule(scheduleInfo);
  })
  .then(newSchedule => {
    res.send({ message : 'schedule created successfully', schedule_model : newSchedule});
  })
  .catch(e => {
    res.status(400).send(e);
  })
}

exports.update_schedule = function(req, res) {
  var schedule_id = req.params.schedule_id;
  var schedule_info = req.body;
  Schedule.updateSchedule(schedule_id, schedule_info)
  .then(schedule_model => {
    res.send({ message: 'Schedule updated successfully', schedule_model });
  })
  .catch(e => {
    res.status(422).send(e);
  })
}

exports.list_schedules = function(req, res) {
  Schedule.listSchedules()
  .then(docs => {
    res.send({ schedules : docs })
  })
  .catch(e => {
    res.status(400).send(e);
  })
}

exports.join_schedule = function(req, res) {
  var schedule_info = { participant_id : req.body.participant_id , type : req.body.type }
  var schedule_id   = req.params.schedule_id
  Schedule.joinSchedule(schedule_id, schedule_info)
  .then(doc => {
    res.send({message : 'participants added successfully', schedule_model : doc})
  })
  .catch(e => {
    res.status(400).send(e);
  })
}

exports.kick_participant = function(req, res) {
  var schedule_id = req.params.schedule_id;
  var participant_id = req.body.participant_id
  Schedule.kickParticipant(schedule_id, participant_id)
  .then(doc => {
    res.send({message : 'participants kicked successfully', schedule_model : doc})
  })
  .catch(e => {
    res.status(404).send(e);
  })
}

exports.delete_schedule = function(req, res) {
  var schedule_id = req.params.schedule_id;
  Schedule.deleteSchedule(schedule_id)
  .then(() => {
    res.send({message : 'Schedule deleted successfully'});
  })
  .catch(e => {
    res.status(400).send(e);
  })
}

exports.get_schedule = function(req, res) {
  var schedule_id = req.params.schedule_id;
  Schedule.getSchedule(schedule_id)
  .then(schedule => {
    res.send({ schedule_model : schedule });
  })
  .catch(e => {
    res.status(404).send(e);
  })
}

// TO ADD JOIN REQUEST TO THE SCHEDULE CHILD INVITAIONS ARRAY
// CHILD ID STORED INSIDE THAT ARRAY AND MOST PROBABLY THE SCHEDULE WANT TO SEE THE REQUESTS
// ACTIONS TO BE TAKEN FROM THE PARENT -- ACCEPT -- REJECT
// ON ACCEPT REMOVE THE ID FROM INVITAIONS AND ADD TO THE SCHEDULE PARTICEPANT
// ON REJECT REMOVE THE ID FROM INVITAIONS
exports.add_join_request = function(req, res) {
  var schedule_id = req.params.schedule_id;
  var child_id    = req.body.child_id;
  var child_type  = req.body.child_type;
  validate_child(child_type, child_id)
  .then(child => {
    return Schedule.addJoinRequest(schedule_id ,child_type ,child_id)
  })
  .then(schedule_model => {
    res.send({ message: 'join request was sent successfully ' , schedule_model })
  })
  .catch(e => {
    res.status(400).send(e);
  })
}

// FOR REJECTING / DELETING THE CHILD REQUEST FROM THE JOIN REQUESTS ARRAY
exports.destroy_join_request = function(req ,res) {
  var schedule_id = req.params.schedule_id;
  var child_id    = req.body.child_id;
  var child_type  = req.body.child_type;

  validate_child(child_type ,child_id )
  .then(child => {
    return Schedule.destroyJoinRequest(schedule_id ,child_type ,child_id)
  })
  .then(schedule_model => {
    res.send({ message : 'Join request destroyed successfuly' , schedule_model })
  })
  .catch(e => {
    res.status(400).send(e);
  })
}
