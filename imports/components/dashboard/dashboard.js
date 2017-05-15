import angular from 'angular';
import angularMeteor from 'angular-meteor';
import {
  Accounts
} from 'meteor/accounts-base';
import {
  Meteor
} from 'meteor/meteor';

import template from './dashboard.html';
import {
  DataObjects
} from '../../api/data_objects.js';

class DashboardCtrl {

  constructor($scope) {
    $scope.viewModel(this);
    this.subscribe('DataObjects');
    this.helpers({
      currentUser() {
        return Meteor.user();
      },
      loggedIn() {
        return Meteor.userId();
      },
      data_objects() {
        return DataObjects.find({});
      }
    })
  }

  updateDownloadLimit(limit) {
    document.getElementById('msg').innerHTML = '';
    var limitInt = parseInt(limit);
    if (Meteor.user().profile.plan === 'free') {
      if (limitInt > 10 || limitInt < 1) {
        document.getElementById('msg').innerHTML = 'With the free plan your download limit can take values from 1 to 10. Upgrade for more.';
      } else {
        Meteor.users.update(Meteor.userId(), {
          $set: {
            "profile.limit": limitInt
          }
        }, function(err) {
          if (err)
            document.getElementById('msg').innerHTML = 'A server error occured.';
          else
            document.getElementById('msg').innerHTML = 'Limit updated successfully.';
        });
      }
    } else if (Meteor.user().profile.plan === 'popular') {

    } else if (Meteor.user().profile.plan === 'enterprise') {}
  }
}

export default angular.module('dashboard', [
    angularMeteor
  ])
  .component('dashboard', {
    templateUrl: 'imports/components/dashboard/dashboard.html',
    controller: ['$scope', DashboardCtrl]
  });