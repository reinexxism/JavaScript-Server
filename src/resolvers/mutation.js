const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  AuthenticationError,
  ForbiddenError
} = require('apollo-server-express');
require('dotenv').config();
const gravatar = require('../util/gravatar');

module.exports = {
  newNote: async (parent, args, { models, user }) => {
    if (!user) {
      throw new AuthenticationError('You must signed in to create a note!');
    }
    return await models.Note.create({
      content: args.content,
      author: mongoose.Types.ObjectId(user.id)
    });
  },
  deleteNote: async (parent, { id }, { models, user }) => {
    // user가 아니면 인증 에러 던지기
    if (!user) {
      throw new AuthenticationError('You must signed in to delete a note!');
    }
    // 노트 찾기
    const note = await models.Note.findById(id);
    // note 소유자와 현재 사용자가 불일치하면 접근 에러 던지기
    if (note && String(note.author) !== user.id) {
      throw new ForbiddenError(
        "You don't have permissions to delete this note"
      );
    }
    try {
      await note.remove();
      return true;
    } catch (err) {
      return false;
    }
  },
  updateNote: async (parent, { content, id }, { models, user }) => {
    if (!user) {
      throw new AuthenticationError('You must be signed in to update a note!');
    }

    const note = await models.Note.findById(id);
    if (note && String(note.author) !== user.id) {
      throw new ForbiddenError("You don't have permissions to update the note");
    }
    return await models.Note.findOneAndUpdate(
      {
        _id: id
      },
      {
        $set: {
          content
        }
      },
      {
        new: true
      }
    );
  },
  signUp: async (parent, { username, email, password }, { models }) => {
    email = email.trim().toLowerCase();
    // password hashing
    const hashed = await bcrypt.hash(password, 10);
    // create gravatar URL
    const avatar = gravatar(email);
    try {
      const user = await models.User.create({
        username,
        email,
        avatar,
        password: hashed
      });
      // create JWT & return
      return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    } catch (err) {
      console.log(err);
      // throw an error when problem is occurred while creating account
      throw new Error('Error creating account');
    }
  },
  signIn: async (parent, { username, email, password }, { models }) => {
    if (email) {
      email = email.trim().toLowerCase();
    }

    // email 혹은 username을 사용해서 db에서 사용자를 탐색
    const user = await models.User.findOne({
      $or: [{ email }, { username }]
    });
    // 인증 에러 : 사용자를 찾지 못한 경우
    if (!user) {
      throw new AuthenticationError('Error Sign in!');
    }
    // 인증 에러 : 비밀번호가 일치하지 않는 경우
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new AuthenticationError('Error signing in!');
    }

    return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  }
};
