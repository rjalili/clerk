import { DataObjects } from '../imports/api/data_objects.js';
import '../imports/api/tokens.js';

Meteor.startup(() => {

  Accounts.onCreateUser(function(options, user) {
    user.profile = options.profile || {};
    // Setting default plan to `free`.
    user.profile.plan = 'free';
    user.profile.limit = 1;

    return user;
  });

  // Once per minute, delete all data objects that have expired.
  Meteor.setInterval(() => {

    DataObjects.remove({
      expires_at: {
        $lte: new Date()
      }
    });

  }, 60000);

});
