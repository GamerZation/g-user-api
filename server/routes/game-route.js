var app    = require('express')
var router = app.Router();
var {authenticate_user} = require('./../middleware/authentication');
var {authenticate_team_member} = require('./../middleware/authentication');
var {authenticate_schedule_creator} = require('./../middleware/authentication');
var gameController = require('./../controllers/game-controller');

router.get('/', authenticate_user, gameController.list_games)

router.get('/:game_id', authenticate_user, gameController.get_game)

router.post('/', authenticate_user, gameController.create_game);

router.post('/:game_id/:child_type/:child_id', authenticate_user, gameController.add_child);

router.post('/', authenticate_user, gameController.create_game);


router.put('/:game_id', authenticate_user, gameController.edit_game);

router.delete('/:game_id', authenticate_user, gameController.delete_game);


module.exports = router;
