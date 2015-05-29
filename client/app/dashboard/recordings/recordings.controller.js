'use strict';

angular.module('jabbrApp')
  .controller('RecordingsCtrl', function ($scope, $sce, Auth, Recording,
                                          User, $stateParams, JabbrSocket) {
    $scope.userRecordings = [];
    $scope.oneRecording = undefined;
    $scope.recordingsURL = [];
    var socket = JabbrSocket;
    var currentUser = Auth.getCurrentUser();
    
    ss(socket).removeAllListeners("sendRecording"); 

    ss(socket).on("sendRecording", function(recording){
      recording.pipe(blobStream())
      .on('finish', function(){
        var url = this.toBlobURL();
        $scope.recordingsURL.push(url);
        console.log($scope.recordingsURL);
       })
    });

    ss(socket).emit("getRecording", currentUser.email);

    // ==========

    // $scope.getUserRecordings = function() {
    //   Recording.getUserRecordings(function(res) {
    //     // console.log(res.recordings);
    //     console.log(456);
    //     $scope.userRecordings = res.recordings;
    //   });
    // };

    // $scope.getUserRecordings();
    // // ==========


    // $scope.parseDate = function(unixDate) {
    //   var foo = new Date(unixDate);
    //   return foo.toDateString();
    // };


  })
  .controller('RecordingCtrl', function ($scope, Auth, Recording,
                                         $stateParams) {
    $scope.userRecordings = [];
    $scope.oneRecording = undefined;
    $scope.foobar = 'barfoo';

    // ==========
    // use $stateParams.recordingId
    $scope.getOneRecording = function() {
      Recording.getOneRecording({ id: $stateParams.recordingId }, function(res) {
        console.log(res);
        console.log(123);
        // console.log(res.recording);
        $scope.oneRecording = res;
      });
    };

    $scope.getOneRecording();
    // ===========

    $scope.parseDate = function(unixDate) {
      var foo = new Date(unixDate);
      return foo.toDateString();
    };


  })
  ;
