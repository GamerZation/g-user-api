var express     = require('express')
var bodyParser  = require('body-parser')
var {mongoose}  = require('./db');
var db          = mongoose.connection;
const config    = require('./config/config');

mongoose.Promise = Promise;

var app = express();


var user     = require('./routes/user-route.js');
var team     = require('./routes/team-route.js');
var schedule = require('./routes/schedule-route.js');
var game     = require('./routes/game-route.js');

app.use(bodyParser.json());


app.use('/z_users', user);
app.use('/z_teams', team);
app.use('/z_schedules', schedule);
app.use('/z_games', game);

app.listen(config.PORT , () => {
  console.log('server is running at', config.PORT);
});
