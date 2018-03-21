var Team = require('./../models/team-model');
var User = require('./../models/user-model');
var Schedule = require('./../models/schedule-model');
var {validate_parent} = require('./../middleware/validation');
const _  = require('lodash');



exports.create_team = function(req ,res ) {
  var userData  = req.user;
  var userToken = req.token;
  var teamData  = _.pick(req.body,['team_name','description'])
  teamData.owner_id   = userData._id;
  teamData.creator_id = userData._id;
  teamData.members = [{member_id : userData._id}]
  Team.createTeam(teamData)
  .then(newTeam =>{
    res.send(newTeam)
  }).catch(e => {
    res.status(400).send(e);
  })
};

exports.add_member = function(req, res) {
  var senderData = req.user;
  var teamData = req.team;
  Team.addMember(req.body.member_id, teamData)
  .then(savedTeam => {
    res.send({ message: 'User added successfully', team_model : savedTeam })
  })
  .catch(e => {
    res.status(400).send(e);
  })
}

exports.join_team = function(req, res) {
  var userData = req.user;
  var team_id   = req.body.team_id;
  Team.addMember(userData._id, team_id)
  .then(savedTeam => {
    res.send({ message: 'User added successfully', team_model : savedTeam })
  })
  .catch(e => {
    res.status(400).send(e);
  })
}

exports.delete_team = function(req, res) {
  var team_id = req.params.team_id;
  Team.destory_team(team_id)
  .then(result => {
    res.send({ message : result });
  })
  .catch(e => {
    res.status(400).send(e);
  })
}

exports.list_team_schedules = function(req, res) {
  var team_id = req.params.team_id;
  Schedule.listTeamSchedules(team_id)
  .then(docs => {
    res.send({ schedules : docs })
  })
  .catch(e => {
    res.status(400).send(e);
  })
}

exports.list_teams = function(req, res) {
  Team.listTeams()
  .then(docs => {
    res.send({ teams : docs })
  })
  .catch(e => {
    res.status(400).send(e);
  })
}

exports.get_team = function(req , res) {
  var team_id = req.params.team_id;
  Team.getTeamInfo(team_id)
  .then(team_model => {
    res.send({ team_model })
  })
  .catch(e => {
    res.status(400).send(e);
  })
}

exports.edit_team = function(req, res) {
  var team_id = req.params.team_id;
  Team.updateTeam(team_id ,req.body)
  .then(doc => {
    res.send({ message : 'Team updated successfully ', team : doc })
  })
  .catch(e => {
    res.status(400).send(e);
  })

}

// FOR ADDING JOIN REQUESTS TO THE TEAM JOIN REQUESTS ARRAY
// USER ID STORED INSIDE THAT ARRAY AND MOST PROBABLY THE TEAM WANT TO SEE THE REQUESTS
// IN CASE OF ACCEPTING THE USER ID WILL BE REMOVED FROM THE REQUESTS AND THE USER WILL BE ADDED TO THE MEMBERS ARRAY
// IN CASE OF REJECTION THE USER ID WILL BE REMOVED -> destroy_join_request
exports.add_join_request = function(req, res) {
  var user_id = req.user._id;
  var team_id = req.params.team_id;

  Team.addJoinRequest(team_id ,user_id )
  .then(team_model => {
    res.send({ message : 'Request was sent successfuly', team_model })
  })
  .catch(e => {
    res.status(400).send(e);
  })
}


// FOR ADDING INVITATION OBJECT TO THE TEAM INVITAIONS ARRAY
// OBJECT CONTAINS parent_id  parent_type[enum -> schedule]
// IN CASE OF ACCEPTING THE INVITATION OBJECT WILL BE DELETED
// THE TEAM WILL BE ADDED TO THE PARENT ARRAY
exports.invite_team_to_parent = function(req, res) {
  var team_id     = req.params.team_id;
  var parent_id   = req.body.parent_id;
  var parent_type = req.body.parent_type;
  validate_parent(parent_id ,parent_type)
  .then(parent_model => {
    return Team.inviteTeamToParent(team_id ,parent_id ,parent_type);
  })
  .then(team_model => {
    res.send({message : 'Invitation added successfuly' , team_model });
  })
  .catch(e => {
    res.status(400).send(e);
  })
}


// FOR DELETING / REJCETING -> INVITAION OBJECT IN THE TEAM INVITAIONS ARRAY
// REQUIRE parent_id parent_type[enum -> schedule]
exports.destroy_parent_invitation = function(req, res) {
  var team_id     = req.params.team_id;
  var parent_id   = req.body.parent_id;
  var parent_type = req.body.parent_type;
  validate_parent(parent_id ,parent_type)
  .then(parent_model => {
    return Team.destroyParentInvitation(team_id ,parent_id ,parent_type);
  })
  .then(team_model => {
    res.send({ message : 'Invitation destroied successfuly' , team_model });
  })
  .catch(e => {
    res.status(400).send(e);
  })
}

// ACCEPTING INVITAION
// WILL DELETE THE INVITAION OBJECT AND ADD THE TEAM ID TO THE PARENT


// LISTING JOIN REQUESTS TO SHOW IT TO THE TEAM
// ABLE TO ACCEPT - REJECT
exports.list_join_request = function(req, res) {
  var team_id = req.params.team_id;
  Team.listJoinRequests(team_id)
  .then(join_requests => {
    res.send({ join_requests })
  })
  .catch(e => {
    res.status(400).send(e);
  })
}

exports.list_parent_invitations = function(req, res) {
  var team_id = req.params.team_id;
  Team.listParentInvitations(team_id)
  .then(parent_invitaions => {
    res.send({parent_invitaions});
  })
  .catch(e => {
    res.status(400).send(e);
  })
}

exports.accept_parent_invitation = function(req, res) {
  var team_id     = req.params.team_id;
  var child_id    = team_id;
  var child_type  = 'team';
  var parent_type = req.body.parent_type;
  var parent_id   = req.body.parent_id;
  validate_parent(parent_type, parent_id)
  .then(parent => {
    return parent.addParticipant(child_id, child_type);
  })
  .then(child => {
    return Team.destroyParentInvitation(parent_id, parent_type);
  })
  .then(team_model => {
    res.send({ message : 'Team added to parent successfully', team_model });
  })
}

// FOR REJECTING / DELETING -> USER FROM THE JOIN REQUESTS ARRAY
exports.destroy_join_request = function(req, res) {
  var user_id = req.body.user_id;
  var team_id = req.params.team_id;

  Team.destroyJoinRequest(team_id ,user_id )
  .then(team_model => {
    res.send({ message : 'User rejected successfuly' , team_model })
  })
  .catch(e => {
    res.status(400).send(e);
  })
}

exports.kick_member = function(req, res) {
  var senderData  = req.user;
  var member_id   = req.body.member_id;
  var team_id     = req.body.team_id;
  Team.removeMember(team_id ,member_id)
  .then(savedTeam => {
    res.send({ message: 'User removed successfully', team_model : savedTeam })
  })
  .catch(e => {
    res.status(400).send(e);
  })
}
