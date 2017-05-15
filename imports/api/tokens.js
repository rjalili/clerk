import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

const InvalidTokens = new Mongo.Collection('invalid_tokens');

Meteor.methods({

  // Invalidate a token.
  'tokens.invalidate' (token) {

    // Check that the token is as it should be.
    check(token, String);

    // Store it.
    InvalidTokens.insert({
      token: token
    });

  },

  // Check whether a token is invalid.
  'tokens.is_invalid' (token) {

    // Check that the token is as it should be.
    check(token, String);

    // Search for it. If found, the token is invalid.
    return  InvalidTokens.findOne({
      token: token
    });

  }
});
