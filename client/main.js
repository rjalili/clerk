import angular from 'angular';
import angularMeteor from 'angular-meteor';

import dashboard from '../imports/components/dashboard/dashboard';
import '../imports/startup/routes.js';
import '../imports/startup/accounts-config.js';

angular.module('clerk', [
  angularMeteor,
  dashboard.name,
  'accounts.ui'
]);

function onReady() {
  angular.bootstrap(document, ['clerk']);
}

if (Meteor.isCordova) {
  angular.element(document).on('deviceready', onReady);
} else {
  angular.element(document).ready(onReady);
}
