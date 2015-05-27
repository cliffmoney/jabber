'use strict';

angular.module('jabbrApp')
  .controller('ProfileCtrl', function ($scope, $stateParams, User, $http) {
    $scope.userProfile = {};

    $scope.partnerRequest = function() {
      $http.post('/api/users/' + $scope.currentUser._id + '/partnerships', {
        requester: $scope.currentUser._id,
        recipient: $stateParams.userId,
        body: "You have a new language partner request!"
      }).success(function(data, status) {
        $scope.successfulRequest = true;
      }).error(function(error) {
        console.log(error);
      });
    };
  
    $http.get('/api/users/' + $stateParams.userId + '/profile')
      .success(function(profile, status) {
        console.log(profile);
        $scope.userProfile = profile;
      }).error(function(error) {

      });
      
  });
