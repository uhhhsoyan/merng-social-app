const { model, Schema } = require('mongoose');

// Note: we will handle flagging required fields in GraphQL
const userSchema = new Schema({
  username: String,
  password: String,
  email: String,
  createdAt: String
});

module.exports = model('User', userSchema);