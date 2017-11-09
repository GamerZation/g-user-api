var User = require('./../models/user-model');
var Team = require('./../models/team-model');
var Schedule = require('./../models/schedule-model');
var {validate_child} = require('./../middleware/validation');
var {validate_parent} = require('./../middleware/validation');
const _  = require('lodash');

exports.create_user = function(req,res) {
  var userData = _.pick(req.body,['email','password','first_name','last_name','bio','platform','region']);
  var user = new User(userData);
  user.save().then((userModel) => {
    res.send(_.pick(userModel,['email','id','first_name','last_name','region','platform']));
  }).catch((e) => {
    res.status(400).send(e);
  })
}
exports.auth_user = function(req,res) {
  var userData = _.pick(req.body,['email','password']);
  User.validateUser(userData).then(user => {
    return user.generateAuthToken();
  }).then(({token , savedUser}) => {
    var user_model = savedUser
    user_model.password = undefined;
    user_model.tokens = undefined;
    res.send({ token  , user_model  });
  }).catch(e => {
    res.status(400).send(e)
  });
}

exports.list_user_friends = function(req, res) {
  var user_id = req.params.user_id;
  User.listUserFriends(user_id)
  .then(friends => {
    res.send({ friends })
  })
  .catch(e => {
    res.status(404).send(e);
  })
}

exports.list_user_schedules = function(req, res) {
  var user_id = req.params.user_id;
  Schedule.listUserSchedules(user_id)
  .then(schedules => {
    res.send({ schedules })
  })
  .catch(e => {
    res.status(404).send(e);
  })
}

exports.list_users = function(req, res) {
  User.listUsers()
  .then(docs => {
    res.send({ users : docs });
  })
  .catch(e => {
    res.status(400).send(e);
  })
}

exports.get_user = function(req,res) {
  var user_id = req.params.user_id;
  User.getUserInfo(user_id)
  .then(user_model => {
    user_model.password = undefined;
    user_model.tokens   = undefined;
    res.send({user_model})
  })
  .catch(e => {
    res.status(404).send(e);
  })
}

exports.list_user_teams = function(req, res) {
  var user_id = req.params.user_id;
  Team.listUserTeams(user_id)
  .then(docs => {
    res.send({ teams : docs })
  })
  .catch(e => {
    res.status(400).send(e);
  })
}

exports.update_user = function(req, res) {
  var userData = req.body;
  var user_id  = req.user._id;
  User.updateUserInfo(user_id,userData)
  .then((user_model) => {
    user_model.password = undefined;
    user_model.tokens   = undefined;
    res.send({message : 'user updated successfully' , user_model})
  }).catch(e => {
    res.status(400).send(e);
  })
}

exports.destroy_user = function(req, res) {
  req.user.destroySessionToken(req.token)
  .then(userDoc => {
    res.send('Session destroyed successfully');
  }).catch(e => {
    res.status(401).send(e);
  })
}

exports.add_friend = function(req, res) {
  var senderModel = req.user;
  var recieverId  = req.params.user_id;
  User.addFriend(recieverId ,senderModel._id)
  .then(user_model => {
    user_model.password = undefined;
    user_model.tokens   = undefined;
    res.send({message : 'User added successfully', user_model });
  })
  .catch(e => {
    res.status(400).send();
  })

}
exports.add_friend_request = function(req, res) {
  var sender_id   = req.user._id;
  var reciever_id = req.params.user_id;
  User.addFriendRequest(reciever_id, sender_id)
  .then(user_model => {
    res.send({ message : 'Friend request was sent successfully', user_model });
  })
  .catch(e => {
    res.status(400).send(e);
  })
}

// FOR REJECTING AND UNDOING A FRIEND REQUEST
// THE RECIEVER IS THE PERSON WHO RECIEVED THE FRIEND REQUEST -- HAS THE SENDER ID INSIDE HIS DOC
// THE SENDER IS THE PERSON WHO CREATED AND SENT THE FRIEND REQUEST
exports.destroy_friend_request = function(req, res) {
  var reciever_id   = req.params.reciever_id;
  var sender_id     = req.params.sender_id;
  User.destroyFriendRequest(reciever_id, sender_id)
  .then(reciever_model => {
    res.send(reciever_model);
  })
  .catch(e => {
    res.status(400).send(e);
  })
}


// FOR INVITING USER TO TEAM OR SCHEDULE
// PARENT ID STORED INSIDE AN ARRAY MOST PROBABLY THE USER WANNA SEE THE INVITATIONS MORE THAN THE PARENT
// AFTER INVITATION ACCEPTED THE INVITATION WILL BE REMOVED AND THE USER WILL BE ADDED TO THE PARENT
exports.invite_user_to_parent = function(req, res) {
  var user_id     = req.params.user_id;
  var parent_id   = req.body.parent_id;
  var parent_type = req.body.parent_type;
  validate_parent(parent_id, parent_type)
  .then(() => {
    return User.inviteUserToParent(user_id, parent_id, parent_type);
  })
  .then(user_model => {
    user_model.password = undefined;
    user_model.tokens   = undefined;
    res.send({ message : 'invitaions was added successfuly' , user_model })
  })
  .catch(e => {
    res.status(400).send(e);
  })
}

// FOR DESTROING INVITATIONS IN USER
// IT WILL SHOULD BE DESTROYED IN THESE CASES - ACCEPTING THE INVITAION - CANCELING THE INVITAION - REJECTING THE INVITAION
// AFTER DESTROING THE INVITAION THE USER MUST BE ADDED TO THE PARENT IN CASE OF ACCEPTENCE
exports.destroy_parent_invitation = function(req, res) {
  var user_id   = req.params.user_id;
  var parent_id = req.body.parent_id;
  User.destroyParentInvitation(user_id, parent_id)
  .then(user_model => {
    var userModel = _.pick()
    res.send({message : 'Invitaion destroyed successfuly' , user_model})
  })
  .catch(e => {
    res.status(400).send(e);
  })
}

//

// FOR REMOVING ADDED FRIEND FROM BOTH
exports.remove_friend = function(req, res) {
  var senderModel = req.user;
  var friend_id = req.params.user_id;
  User.removeFriend(friend_id ,senderModel._id)
  .then(user_model => {
    user_model.password = undefined;
    user_model.tokens   = undefined;
    res.send({message: 'user removed successfully', user_model});
  })
  .catch(e => {
    res.status(400).send(e);
  })

}
//
