const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError } = require('apollo-server');

const { validateRegisterInput, validateLoginInput } = require('../../util/validators');
const { SECRET_KEY } = require('../../config.js')
const User = require('../../models/User');

function generateToken(user) {
  return jwt.sign({
    id: user.id,
    email: user.email,
    username: user.username
  }, SECRET_KEY, { expiresIn: '1h' });
}

module.exports = {
  Mutation: {
    async login(_, { username, password }) {
      const {errors, valid} = validateLoginInput(username, password);
      const user = await User.findOne({ username });

      if (!valid) {
        throw new UserInputError('Errors', { errors });
      }
      if (!user) {
        errors.general = 'User not found';
        throw new UserInputError('User not found', { errors })
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        errors.general = 'Wrong credentials';
        throw new UserInputError('Wrong credentials', { errors })
      }

      const token = generateToken(user);

      return {
        ...user._doc,
        id: user._id,
        token
      }
      
    },
    // Function is called with up to 4 params -> register(parent, args, context, info).
    // Parent allows access to previous mutation if needed, rarely use context and info.
    // Below we use args only (destructured)
    async register(_, { registerInput: { username, email, password, confirmPassword }}) {
      // Validate user data
      const { valid, errors } = validateRegisterInput(username, email, password, confirmPassword);
      if (!valid) {
        throw new UserInputError('Errors', { errors });
      }

      // Make sure user does not already exist
      const user = await User.findOne({ username });
      if (user) {
        throw new UserInputError('Username is taken', {
          // Errors object will be used by front end
          errors: {
            username: 'This username is taken'
          }
        })
      }
      
      password = await bcrypt.hash(password, 12); // 12 is number of rounds

      const newUser = new User({
        email,
        username,
        password,
        createdAt: new Date().toISOString()
      })

      const res = await newUser.save();

      const token = generateToken(res);

      return {
        ...res._doc,
        id: res._id,
        token
      }
    },
  }
}