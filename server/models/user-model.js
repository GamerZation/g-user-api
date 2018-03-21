const mongoose  = require('mongoose');
const Schema    = mongoose.Schema;
const _         = require('lodash');
const bcrypt    = require('bcrypt');
const validator = require('validator');
const jwt       = require('jsonwebtoken');
const config    = require('./../config/config')
const ObjectId  = Schema.Types.ObjectId;

var UserSchema = new Schema({
  first_name : {
    type: String,
    required : false
  },
  last_name : {
    type: String,
    required : false
  },
  email: {
    type: String,
    required : true,
    unique : true,
    validate : {
      validator : validator.isEmail,
      message  : '{VALUE} is not valid email'
    }
  },
  password : {
    type: String,
    required : true,
    minlenght: 6
  },
  friends: [{
    user_id: ObjectId,
    _id: false
  }],
  bio : {
    type: String,
    required : false
  },
  age : {
    type : Number,
    required : false
  },
  platform : {
    type : String,
    required : false,
    enum : ['psn','xboxlive']
  },
  region : {
    type : String,
    required : false
  },
  friend_requests : [{
    user_id : ObjectId,
    _id : false
  }],
  invitations : [{
    parent_id : ObjectId,
    parent_type : {
      type: String,
      enum : ['team','schedule']
    },
    _id : false
  }],
  tokens : [{
    os : {
      type: String,
      required: false,
      enum : ['web']
    },
    token : {
      type: String,
      required: false
    }
  }],
  updated_at : {
    type : Date
  },
  created_at : {
    type : Date
  }
});

// MIDDLEWARE -- PRE SAVE-UPDATE-DELETE
// SETTING PASSWORD --- HASHING
UserSchema.pre('save',function (next) {
  var user = this;
  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      })
    })
  }else{
    next();
  }
})
// setting dates
UserSchema.pre('save',function (next) {
  var user = this;
  var now  = new Date();
  user.updated_at = now;
  if ( !user.created_at ) {
    user.created_at = now;
    next();
  }else{
    next();
  }
})
UserSchema.pre('update',function (next) {
  var user = this;
  var now  = new Date();
  user.updated_at = now;
  if ( !user.created_at ) {
    user.created_at = now;
    next();
  }else{
    next();
  }
})
UserSchema.pre('update',function (next) {
  var user = this;
  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      })
    })
  }else{
    next();
  }
})

// CLASS METHODS (STATICS)

UserSchema.statics = {
  validateUser({email,password}) {
    var User = this;

    return User.findOne({email}).then((user) => {
      if (!user) {
        return Promise.reject();
      }
      return new Promise((resolve, reject) => {
        bcrypt.compare(password.toString(), user.password, (err, res) => {
          if (res) {
            resolve(user);
          } else {
            reject({message: 'Wrong password',status : '400'});
          }
        });
      });
    })
  },
  validateById(user_id) {
    var User = this;
    return User.findOne({_id : user_id})
    .then(user => {
      if (!user) {
        return Promise.reject();
      }
      return user;
    })
    .catch(e => {
      return Promise.reject(e);
    })
  },
  addFriend(reciever_id, sender_id) {
    var User = this;
    return User.findOneAndUpdate(
      { _id : reciever_id },
      {
        $addToSet : { friends : { user_id : sender_id } }
      },
      {new: true}
    )
    .then(reciever_model => {
      return User.findOneAndUpdate(
        { _id : sender_id },
        {
          $addToSet : { friends : { user_id : reciever_id } },
          $pull     : { friend_requests : { user_id : reciever_id } }
        },
        {new: true }
      )
      .then(sender_model => {
        return sender_model
      })
    })
    .catch(e => {
      return Promise.reject(e);
    })
  },
  destroyFriendRequest(reciever_id, sender_id) {
    var User = this;
    return User.findOneAndUpdate(
      { _id : reciever_id },
      { $pull : {friend_requests : { user_id : sender_id }} },
      {new : true}
    ).then(user_model => {
      return user_model
    })
    .catch(e => {
      return Promise.reject(e);
    })
  },
  inviteUserToParent(user_id ,parent_id , parent_type) {
    var User = this;
    if (parent_type === 'schedule') {
      update = { invitations : { parent_id , parent_type } }
    }
    if (parent_type === 'team') {
      update = { invitations : {  parent_id , parent_type } }
    }
    return User.findOneAndUpdate(
      { _id : user_id },
      { $addToSet : update },
      { new : true }
    )
    .then(doc => {
      return doc;
    })
    .catch(e => {
      return Promise.reject(e);
    })
  },
  destroyParentInvitation(user_id ,parent_id) {
    var User = this;
    return User.findOneAndUpdate(
      { _id: user_id } ,
      { $pull : { invitations : { parent_id } } },
      { new : true }
    )
    .then(doc => {
      if (!doc) {
        return Promise.reject('not found');
      }
      return doc;
    })
    .catch(e => {
      return Promise.reject(e);
    })
  },
  findByToken (token) {
    var user = this;
    try {
      var decoded = jwt.verify(token, config.JWT_SECRET);
    } catch(err) {
      return Promise.reject();
    }
    return user.findOne({
      _id : decoded._id,
      'tokens.token' : token
    })
  },
  listUserFriends(user_id) {
    var User = this;
    return User.findOne({ _id : user_id })
    .then(user => {
      return user.friends;
    })
    .catch(e => {
      return Promise.reject(e);
    })
  },
  getUserInfo(user_id) {
    var User = this;
    return User.findOne({_id : user_id});
  },
  listUsers() {
    var User = this;
    return User.find()
  },
  updateUserInfo(user_id ,userData) {
    var User = this;
    var options = _.pick(userData, ['first_name','last_name','password','bio','region','platform']);
    return User.findOneAndUpdate({_id : user_id},options,{new: true})
    .then(doc => {
      return doc;
    }).catch(e => {
      return Promise.reject(e);
    })
  },
  removeFriend(friend_id , sender_id) {
    var User = this;
    return User.findOneAndUpdate({ _id : sender_id} , { $pull :{
      friends : { user_id : friend_id } }
    }, {new : true})
    .then(savedUser => {
      return User.findOneAndUpdate({ _id : friend_id }, { $pull :{
        friends : { user_id : sender_id } }
      }, {new : true})
      .then(savedFriend => {
        return savedUser;
      })
    })
    .catch(e => {
      return Promise.reject(e);
    })
  },
  addFriendRequest(reciever_id, sender_id) {
    var User = this;
    return User.findOneAndUpdate(
      { _id : reciever_id },
      { $addToSet : { friend_requests : { user_id : sender_id } } },
      { new : true }
    )
    .then(user_model => {
      return user_model;
    })
    .catch(e => {
      return Promise.reject(e);
    })
  }
}
// INSTANCE METHODS (METHODS)
UserSchema.methods.generateAuthToken = function() {
  var user = this;
  var token = jwt.sign({ _id : user._id.toHexString()}, config.JWT_SECRET);
  user.tokens.push({token : token});
  return user.save()
    .then(savedUser => {
      return { token , savedUser }
    });
}

UserSchema.methods.destroySessionToken = function(token) {
  var user = this;
  return user.update({
    $pull: {
      tokens: {token}
    }
  });
}

var UserModel =  mongoose.model('user',UserSchema);


module.exports = mongoose.model('user',UserSchema);;
