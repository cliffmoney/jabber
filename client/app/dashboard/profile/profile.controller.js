'use strict';

angular.module('jabbrApp')
  .controller('ProfileCtrl', function ($scope, $stateParams, User, $http) {
    $scope.userProfile = {};

    
    $scope.partnerRequest = function() {
      $http.post('/api/partnerships', {
        requester: $scope.currentUser._id,
        recipient: $stateParams.userId,
        body: "You have a new language partner request!"
      }).success(function(data, status) {
        $scope.successfulRequest = true;
      }).error(function(error) {
        console.log(error);
      });
    };
  
    $scope.userProfile = User.getProfile({id: $stateParams.userId});
    // $http.get('/api/users/' + $stateParams.userId + '/profile')
    //   .success(function(profile, status) {
    //     console.log(profile);
    //     $scope.userProfile = profile;
    //   }).error(function(error) {

    //   });
      
  });
