var app                        = require('express');
var router                     = app.Router();
var {authenticate_user}        = require('./../middleware/authentication');
var {authenticate_team_member} = require('./../middleware/authentication');
var teamController             = require('./../controllers/team-controller');


// POST -- CREATE TEAM
router.post('/',authenticate_user ,teamController.create_team);

// POST -- ADD MEMEBER -- MUST BE CHILD
router.post('/member',authenticate_team_member ,teamController.add_member);

// POST -- JOIN TEAM -- IF TEAM IS NOT CLOSED -- MUSTN'T BE A CHILD
router.post('/join',authenticate_user ,teamController.join_team);

// POST -- KICK TEAM MEMBER FROM THE TEAM  -- MUST BE A MEMBER
// TODO ; MUST BE TEAM OWNER OR CREATOR OR AT LEAST ADMIN
// TODO ; USERS MUST HAVE A ROLES IN THAT TEAM
router.post('/kick_member',authenticate_team_member ,teamController.kick_member);

// DELETE -- DESTROY TEAM -- MUST BE THE OWNER OR THE CREATOR
router.delete('/:team_id',authenticate_team_member ,teamController.delete_team);

// GET -- LIST TEAMS
// TODO ; HIDE PRIVATE TEAMS
router.get('/', authenticate_user ,teamController.list_teams);

// GET -- LIST TEAM SCHEDULES
// TODO ; FOR NOW THE USER MUST BE A TEAM MEMBER
router.get('/:team_id/schedules', authenticate_user ,teamController.list_team_schedules);

// GET -- GET TEAM INFO
// TODO ; USER CAN'T FIND THIS TEAM IF IT'S A PRIVATE OR CLOSED
router.get('/:team_id', authenticate_user ,teamController.get_team);

// PUT -- EDIT TEAM
// TODO MUST BE ADMIN OR OWNER OR CREATOR
router.put('/:team_id', authenticate_team_member ,teamController.edit_team);

// POST -- ADD THE USER ID TO THE TEAM JOIN REQUESTS
// BODY -- parent_type -- parent_id
// PARAMS -- team_id
router.post('/:team_id/join_requests', authenticate_user , teamController.add_join_request)

// DELETE -- REJECT USER FROM JOINING THE TEAM
router.delete('/:team_id/join_requests', authenticate_user , teamController.destroy_join_request)

// DELETE -- REJECT USER FROM JOINING THE TEAM
router.get('/:team_id/join_requests', authenticate_user , teamController.list_join_request)

// POST SEND INVITATION  TO TEAM
// MOST PROBABLY FROM SCHEDULES
// PARAMS -- team_id
// BODY   -- parent_id -- parent_type
router.post('/:team_id/invitations', authenticate_user ,teamController.invite_team_to_parent);

// GET INVITATIONS SENT TO TEAM
// MOST PROBABLY FROM SCHEDULES
// PARAMS -- team_id
router.get('/:team_id/invitations', authenticate_user ,teamController.list_parent_invitations);


// DELETE -- REJECT -- UNDO -- INVITAION --> REMOVE IT FROM THE TEAM
// PARAMS -- team_id
// BODY   -- parent_id -- parent_type
router.delete('/:team_id/invitations' ,authenticate_user ,teamController.destroy_parent_invitation);

// PUT -- ACCEPT -> INVITAION --> REMOVE IT FROM THE TEAM AND ADD THE TEAM TO THE PARENT
// PARAMS -- team_id
// BODY   -- parent_id -- parent_type
router.put('/:team_id/invitations' ,authenticate_user ,teamController.accept_parent_invitation);


//  -- ACCEPTING USER IN THE TEAM MUST BE DONE THROUGH ADD MEMEBER REQUEST
// TODO ADD MEMEBER SHOULD DESTROY THE JOIN REQUEST BEFORE ADDING

module.exports = router;
