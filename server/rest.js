import {
  Accounts
} from 'meteor/accounts-base';
import {
  Meteor
} from 'meteor/meteor';

const GET = Picker.filter(function(request, response) {
  return request.method == 'GET';
});
const POST = Picker.filter(function(request, response) {
  return request.method == 'POST';
});
const PUT = Picker.filter(function(request, response) {
  return request.method == 'PUT';
});
const DELETE = Picker.filter(function(request, response) {
  return request.method == 'DELETE';
});

const jwt = require('jsonwebtoken');

const bodyParser = require('body-parser');
Picker.middleware(bodyParser.raw({
  type: '*/*'
}));

const MAXIMUM_ALLOWED_SIZE = 1000000;

POST.route('/signin', function(params, request, response, next) {

  const data = JSON.parse(request.body.toString());

  // Password is required.
  if (!data.password) {
    response.statusCode = 400;
    response.setHeader('Content-Type', 'application/json');
    const result = {
      message: 'Password missing.'
    };
    response.end(JSON.stringify(result));
    return;
  }

  // Username is required.
  if (!data.username) {
    response.statusCode = 400;
    response.setHeader('Content-Type', 'application/json');
    const result = {
      message: 'Username missing.'
    };
    response.end(JSON.stringify(result));
    return;
  }

  // Retrieve the user with that username.
  const user = Accounts.findUserByUsername(data.username);

  if (!user) {
    response.statusCode = 401;
    response.setHeader('Content-Type', 'application/json');
    const result = {
      message: 'Unauthorized.'
    };
    response.end(JSON.stringify(result));
    return;
  }

  // Check the password.
  const digest = Package.sha.SHA256(data.password);
  const password = {
    digest: digest,
    algorithm: 'sha-256'
  };
  const check = Accounts._checkPassword(user, password);
  if (check.error) {
    response.statusCode = 401;
    response.setHeader('Content-Type', 'application/json');
    const result = {
      message: 'Unauthorized.'
    };
    response.end(JSON.stringify(result));
    return;
  }

  // Construct the token.
  const token = jwt.sign({
    _id: user._id,
    username: user.username
  }, 'secret');

  response.statusCode = 200;
  response.setHeader('Content-Type', 'application/json');
  const result = {
    username: user.username,
    token: token
  };
  response.end(JSON.stringify(result));
});

POST.route('/signout', function(params, request, response, next) {

  // Authorization is required.
  const authorization = request.headers['authorization'];
  if (!authorization) {
    response.statusCode = 401;
    response.setHeader('Content-Type', 'application/json');
    const result = {
      message: 'Unauthorized.'
    };
    response.end(JSON.stringify(result));
    return;
  }

  // Extract and verify the token.
  const token = authorization.substring(7);
  let decoded;
  try {
    decoded = jwt.verify(token, 'secret');
  } catch (error) {
    // TODO: Log properly.
    console.log(error);
    response.statusCode = 401;
    response.setHeader('Content-Type', 'application/json');
    const result = {
      message: 'Unauthorized.'
    };
    response.end(JSON.stringify(result));
    return;
  }

  // Check whether the token is valid.
  const is_invalid = Meteor.call('tokens.is_invalid', token);
  if (is_invalid) {
    response.statusCode = 401;
    response.setHeader('Content-Type', 'application/json');
    const result = {
      message: 'Unauthorized.'
    };
    response.end(JSON.stringify(result));
    return;
  }

  // Invalidate the token.
  Meteor.call('tokens.invalidate', token);

  response.statusCode = 200;
  response.setHeader('Content-Type', 'application/json');
  const result = {
    message: 'Signed out.'
  };
  response.end(JSON.stringify(result));
});

POST.route('/store', function(params, request, response, next) {

  // Authorization is required.
  const authorization = request.headers['authorization'];
  if (!authorization) {
    response.statusCode = 401;
    response.setHeader('Content-Type', 'application/json');
    const result = {
      message: 'Unauthorized.'
    };
    response.end(JSON.stringify(result));
    return;
  }

  // Extract and verify the token.
  const token = authorization.substring(7);
  let decoded;
  try {
    decoded = jwt.verify(token, 'secret');
  } catch (error) {
    // TODO: Log properly.
    console.log(error);
    response.statusCode = 401;
    response.setHeader('Content-Type', 'application/json');
    const result = {
      message: 'Unauthorized.'
    };
    response.end(JSON.stringify(result));
    return;
  }

  // Check whether the token is valid.
  const is_invalid = Meteor.call('tokens.is_invalid', token);
  if (is_invalid) {
    response.statusCode = 401;
    response.setHeader('Content-Type', 'application/json');
    const result = {
      message: 'Unauthorized.'
    };
    response.end(JSON.stringify(result));
    return;
  }

  // Find the user.
  const user = Accounts.findUserByUsername(decoded.username);
  console.log(user);

  // Check that the size of the data object does not exceed the maximum allowed
  // size.
  // TODO: Calculate the actual size of the data object.
  const size = request.headers['content-length'];
  if (size > MAXIMUM_ALLOWED_SIZE) {
    response.statusCode = 400;
    response.setHeader('Content-Type', 'application/json');
    const result = {
      message: 'Maximum size is 1MB.'
    };
    response.end(JSON.stringify(result));
    return;
  }

  const data = request.body;
  let content_type = request.headers['content-type'];
  if (!content_type) {
    content_type = 'application/json';
  }

  // Store the data object.
  const data_object = {
    data: request.body,
    creator: user._id,
    type: content_type,
    limit: user.profile.limit
  };
  try {
    const result = Meteor.call('data_objects.store', data_object);
    response.statusCode = 201;
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(result));
  } catch (error) {
    // TODO: Log properly.
    console.log(error);
    response.statusCode = 500;
    response.setHeader('Content-Type', 'application/json');
    const result = {
      message: 'Failed.'
    };
    response.end(JSON.stringify(result));
  }
});

GET.route('/get/:key', function(params, request, response, next) {

  const key = params.key;

  // Retrieve the data object with that key.
  try {
    const result = Meteor.call('data_objects.retrieve', key);
    if (!result) {
      response.statusCode = 404;
      response.setHeader('Content-Type', 'application/json');
      const result = {
        message: 'Not found.'
      };
      response.end(JSON.stringify(result));
      return;
    }
    response.statusCode = 200;
    response.setHeader('Content-Type', result.type);
    response.end(Buffer.from(result.data, 'binary'));
  } catch (error) {
    // TODO: Log properly.
    console.log(error);
    response.statusCode = 500;
    response.setHeader('Content-Type', 'application/json');
    const result = {
      message: 'Failed.'
    };
    response.end(JSON.stringify(result));
    return;
  }
});

PUT.route('/update/:key', function(params, request, response, next) {

  const key = params.key;

  // Authorization is required.
  const authorization = request.headers['authorization'];
  if (!authorization) {
    response.statusCode = 401;
    response.setHeader('Content-Type', 'application/json');
    const result = {
      message: 'Unauthorized.'
    };
    response.end(JSON.stringify(result));
    return;
  }

  // Extract and verify the token.
  const token = authorization.substring(7);
  let decoded;
  try {
    decoded = jwt.verify(token, 'secret');
  } catch (error) {
    // TODO: Log properly.
    console.log(error);
    response.statusCode = 401;
    response.setHeader('Content-Type', 'application/json');
    const result = {
      message: 'Unauthorized.'
    };
    response.end(JSON.stringify(result));
    return;
  }

  // Check whether the token is valid.
  const is_invalid = Meteor.call('tokens.is_invalid', token);
  if (is_invalid) {
    response.statusCode = 401;
    response.setHeader('Content-Type', 'application/json');
    const result = {
      message: 'Unauthorized.'
    };
    response.end(JSON.stringify(result));
    return;
  }

  // Find the user.
  const user = Accounts.findUserByUsername(decoded.username);

  // Check that the size of the data object does not exceed the maximum allowed
  // size.
  const size = request.headers['content-length'];
  if (size > MAXIMUM_ALLOWED_SIZE) {
    response.statusCode = 400;
    response.setHeader('Content-Type', 'application/json');
    const result = {
      message: 'Maximum size is 1MB.'
    };
    response.end(JSON.stringify(result));
    return;
  }

  let new_data = request.body;
  let new_content_type = request.headers['content-type'];
  if (!new_content_type) {
    new_content_type = 'application/json';
  }

  // Retrieve the data object with that key.
  let existing_data_object = null;
  try {
    existing_data_object = Meteor.call('data_objects.retrieve', key, false);
    if (!existing_data_object) {
      response.statusCode = 404;
      response.setHeader('Content-Type', 'application/json');
      const result = {
        message: 'Not found.'
      };
      response.end(JSON.stringify(result));
      return;
    }
  } catch (error) {
    // TODO: Log properly.
    console.log(error);
    response.statusCode = 500;
    response.setHeader('Content-Type', 'application/json');
    const result = {
      message: 'Failed.'
    };
    response.end(JSON.stringify(result));
    return;
  }

  if (request.headers['update-fields']) {

    // Try to convert the existing data object to JSON.
    let existing_json = null;
    try {
      existing_json = JSON.parse(existing_data_object.data.toString());
    } catch (error) {
      // TODO: Log properly.
      console.log(error);
      response.statusCode = 400;
      response.setHeader('Content-Type', 'application/json');
      const result = {
        message: 'Not JSON.'
      };
      response.end(JSON.stringify(result));
      return;
    }

    // Try to convert the new data object to JSON.
    let new_json = null;
    try {
      new_json = JSON.parse(new_data.toString());
    } catch (error) {
      // TODO: Log properly.
      console.log(error);
      response.statusCode = 400;
      response.setHeader('Content-Type', 'application/json');
      const result = {
        message: 'Not JSON.'
      };
      response.end(JSON.stringify(result));
      return;
    }

    new_data = new Buffer.from(JSON.stringify(_.extend(existing_json, new_json)));
  }

  try {
    Meteor.call('data_objects.update', key, new_data, new_content_type);
    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/json');
    const result = {
      message: 'Updated.'
    };
    response.end(JSON.stringify(result));
    response.end();
    return;
  } catch (error) {
    // TODO: Log properly.
    console.log(error);
    response.statusCode = 500;
    response.setHeader('Content-Type', 'application/json');
    const result = {
      message: 'Failed.'
    };
    response.end(JSON.stringify(result));
    return;
  }
});