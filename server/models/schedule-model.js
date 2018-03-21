const mongoose  = require('mongoose');
const Schema    = mongoose.Schema;
const _         = require('lodash');
const bcrypt    = require('bcrypt');
const validator = require('validator');
const jwt       = require('jsonwebtoken');
const config    = require('./../config/config')
const ObjectId  = Schema.Types.ObjectId;
var job = require('node-schedule');
var moment = require('moment');

var scheduleSchema = new Schema({
  name : {
    type: String,
    required : true
  },
	description : {
    type: String,
    required : true
  },
  parent_type : {
    type: String,
    required : true,
    enum : ['user','team']
  },
  parent_id : {
    type: ObjectId,
    required : true
  },
  available : {
    type: Boolean,
    default : true
  },
  participants : [{
    type: {
      type: String,
      enum: ['team','user']
    },
    participant_id : {
      type: ObjectId
    },
    _id : false
  }],
  creator_id : {
    type: ObjectId,
    required : false
  },
  start_time : {
    type: Date,
    required : false
  },
  platform : {
    type: String,
    enum : ['psn','xboxlive']
  },
	end_time : {
    type: Date,
    required : false
  },
  invitaions : [],
  join_requests : [{
    child_id : ObjectId,
    _id : false
  }],
  privacy : {
    type: String,
    enum : ['private','public']
  },
  game : {
    type: String,
    required : false
  },
  updated_at : {
    type : Date
  },
  created_at : {
    type : Date
  }
});

// MIDDLEWARE -- PRE SAVE-UPDATE-DELETE



// UserSchema.pre('save',function (next) {
//   next();
// })
// setting dates

scheduleSchema.pre('save',function (next) {
  var Schedule = this;
  var now  = new Date();
  Schedule.updated_at = now;
  var expire_date = new Date(Schedule.end_time);
  job.scheduleJob(expire_date, function(){
    Schedule.setEnded();
  });
  if ( !Schedule.created_at ) {
    Schedule.created_at = now;
    next();
  }else{
    next();
  }
})

// scheduleSchema.pre('save',function (next) {
//   var Schedule = this;
//   if (ObjectId.isValid(Schedule.parent_id)) {
//     next();
//   }else{
//     return Promise.reject();
//   }
//
// })

scheduleSchema.pre('update',function (next) {
  var Schedule = this;
  var now  = new Date();
  Schedule.updated_at = now;
  if ( !Schedule.created_at ) {
    Schedule.created_at = now;
    next();
  }else{
    next();
  }
})

// CLASS METHODS (STATICS)
scheduleSchema.statics = {
  createSchedule(scheduleData) {
    var schedule = new this(scheduleData);
    schedule.participants.push({ participant_id : schedule.parent_id , type : scheduleData.parent_type });
    return schedule.save()
    .then(doc => {
      return doc;
    })
    .catch(e => {
      return Promise.reject(e);
    })
  },
  validateById(schedule_id) {
    var Schedule = this;
    return Schedule.findOne({_id : schedule_id})
    .then(schedule => {
      if (!schedule) {
        return Promise.reject();
      }
      return schedule;
    })
    .catch(e => {
      return Promise.reject(e);
    })
  },
  validateUserOwnership(user_id, schedule_id) {
    var Schedule = this;
    return Schedule.findOne({ creator_id : user_id , _id : schedule_id })
  },
  addJoinRequest(schedule_id ,child_type ,child_id) {
    var Schedule = this;
    return Schedule.findOneAndUpdate(
      { _id : schedule_id, parent_type : child_type },
      { $addToSet : { join_requests : { child_id } }  },
      { new : true }
    )
    .then(scheduleModel => {
      if (!scheduleModel) {
        return Promise.reject({ message : 'schedule was not found' })
      }
      return scheduleModel;
    })
    .catch(e => {
      return Promise.reject(e);
    })
  },
  destroyJoinRequest(schedule_id ,child_type ,child_id) {
    var Schedule = this;
    return Schedule.findOneAndUpdate(
      { _id : schedule_id, parent_type : child_type },
      { $pull : { join_requests : { child_id } }  },
      { new : true }
    )
    .then(doc => {
      if (!scheduleModel) {
        return Promise.reject({ message : 'Not found' })
      }
      return scheduleModel;
    })
    .catch(e => {
      return Promise.reject(e);
    })
  },
  acceptJoinRequest(schedule_id ,child_type ,child_id) {
    var Schedule = this;
    return Schedule.findOneAndUpdate(
      { _id : schedule_id, parent_type : child_type },
      { $pull : { join_requests : { child_id } }  },
      { new : true }
    )
    .then(schedule_doc => {
      if (!schedule_doc) {
        return Promise.reject('Not found');
      }
      return schedule_doc.update(
        { $addToSet : { participants : { type : child_type , participant_id : child_id } } },
        { new : true }
      ).then(() => {
        schedule_doc.participants.push( { type : child_type , participant_id : child_id } )
        return schedule_doc;
      })
    })
    .catch(e => {
      return Promise.reject(e);
    })
  },
  joinSchedule(schedule_id, { participant_id , type }) {
    var Schedule = this;
    return Schedule.findOneAndUpdate(
      { _id : schedule_id } ,
      { $addToSet : { participants : {  participant_id , type } } },
      { new : true }
     )
     .then(doc => {
       if (!doc) {
         return Promise.reject({ message : 'Schedule was not found' });
       }
       return doc;
     })
     .catch(e => {
       return Promise.reject(e)
     })
  },
  kickParticipant(schedule_id, participant_id) {
    var Schedule = this;
    return Schedule.findOneAndUpdate(
      { _id : schedule_id},
      { $pull : { participants : { participant_id } } },
      {new : true}
    )
  },
  listSchedules() {
    var Schedule = this;
    return Schedule.find();
  },
  getSchedule(schedule_id) {
    var Schedule = this;
    return Schedule.findOne({ _id : schedule_id })
  },
  listUserSchedules(user_id) {
    var Schedule = this;
    return Schedule.find({ $or : [{ participants : { user_id } } , { creator_id : user_id} ] })
  },
  listTeamSchedules(team_id) {
    var Schedule = this;
    return Schedule.find({ $or : [{ participants : { team_id } } , { parent_id : team_id } ] })
  },
  updateSchedule(schedule_id , schedule_info) {
    var Schedule = this;
    var options  = schedule_info;
    return Schedule.findOneAndUpdate({ _id : schedule_id }, options, {new : true})
  },
  deleteSchedule(schedule_id) {
    var Schedule = this;
    return Schedule.deleteOne({ _id : schedule_id })
  }
}
scheduleSchema.methods = {
  setEnded() {
    var schedule = this;
    schedule.available = false;
    schedule.save()
  },
  addParticipant(participant_id, participant_type) {
    var schedule = this;
    schedule.update(
      { $addToSet : { participants : { type : child_type , participant_id : child_id } } }
    )
    .then(success => {
      schedule.participants.push({ type : child_type , participant_id : child_id })
      return
    })
  }
}
var schduleModel =  mongoose.model('schedule',scheduleSchema);


module.exports = mongoose.model('schedule',scheduleSchema);
