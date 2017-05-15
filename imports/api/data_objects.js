import {
  check,
  Match
} from 'meteor/check';
import {
  Meteor
} from 'meteor/meteor';
import {
  Random
} from 'meteor/random';

export const DataObjects = new Mongo.Collection('data_objects');

if (Meteor.isServer) {
  Meteor.publish('DataObjects', function() {
    return DataObjects.find({
      creator: this.userId
    });
  });
}

Meteor.methods({

  // Store a data object.
  'data_objects.store' (data_object) {

    // Check that everything is as it should be.
    check(data_object, Object);
    check(data_object.creator, String);
    check(data_object.type, String);
    check(data_object.data, Match.Any);

    // Generate a random key for it.
    const KEY_SIZE = 30;
    const key = Random.id(KEY_SIZE);
    data_object.key = key;

    // Set its creation and expiration date.
    const ONE_HOUR = 60 * 60 * 1000;
    const created_at = new Date();
    data_object.created_at = created_at;
    const expires_at = new Date(created_at.getTime() + ONE_HOUR);
    data_object.expires_at = expires_at;

    // Set how many downloads have been done.
    // If downloadsLeft equals to limit then the object must be deleted.
    data_object.downloadsLeft = 0;

    // Store it.
    DataObjects.insert(data_object);

    return {
      key: key,
      expires_at: expires_at
    };
  },

  // Retrieve the data object that is associated with a key, and possibly
  // remove the data object after that.
  'data_objects.retrieve' (key) {

    // Check that everything is as it should be.
    check(key, String);

    // Find the data object with that key.
    const data_object = DataObjects.findOne({
      key: key
    });

    if (data_object) {
      // If downloadsLeft attribute equals to limit - 1 then remove it.
      if (data_object.downloadsLeft == data_object.limit - 1) {
        DataObjects.remove({
          _id: data_object._id
        });
      }
      // Else update its downloadsLeft value.
      else {
        var updateVal = data_object.downloadsLeft += 1;
        DataObjects.update({
          key: key
        }, {
          $set: {
            downloadsLeft: updateVal
          }
        });
      }
    }

    return data_object;
  },

  // Update the data in a data object that is associated with a key. Update
  // also their type.
  'data_objects.update' (key, new_data, new_type) {

    // Check that the key is as it should be.
    check(key, String);
    check(new_type, String);
    check(new_data, Match.Any);

    DataObjects.update({
      key: key
    }, {
      $set: {
        data: new_data,
        type: new_type
      }
    });
  }
});