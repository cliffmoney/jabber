'use strict';

angular.module('jabbrApp')
  .controller('RoomCtrl', function ($sce, VideoStream, $location, $stateParams, $scope, Room, $state, JabbrSocket, Auth, Session, Translate, $http) {

    if (!window.RTCPeerConnection || !navigator.getUserMedia) {
      $scope.error = 'WebRTC is not supported by your browser. You can try the app with Chrome and Firefox.';
      return;
    }

    var socket = JabbrSocket;
    var stream, recordAudio, recordPeerAudio;

    VideoStream.get()
    .then(function (s) {
      stream = s;
      recordAudio = RecordRTC(stream);
      Room.init(stream);
      stream = URL.createObjectURL(stream);
      console.log("This is the object URL: " + stream);
      if (!$stateParams.roomId) {
        Room.createRoom()
        .then(function (roomId) {
          $state.go('roomId', {roomId: roomId}, {location: true});
        });
      } else {
        console.log("Attemping to join: " + $stateParams.roomId);
        Room.joinRoom($stateParams.roomId);
      }
    }, function () {
      $scope.error = 'No audio/video permissions. Please refresh your browser and allow the audio/video capturing.';
    });

    $scope.peer = {};
    $scope.partner = '';
    Room.on('peer.stream', function (peer) {
      console.log('Client connected, adding new stream');
      $scope.peer = {
        id: peer.id,
        stream: URL.createObjectURL(peer.stream)
      };
      recordPeerAudio = RecordRTC(peer.stream);
      $scope.partner = Session.getCurrentlyMessaging();
    });
    Room.on('peer.disconnected', function (peer) {
      console.log('Client disconnected, removing stream');
      $scope.peer = {}; // peer's video disappears
    });

    $scope.startDisabled = false;
    $scope.stopDisabled = true;

    $scope.getLocalVideo = function () {
      return $sce.trustAsResourceUrl(stream);
    };

    $scope.startRecording = function() {
      $scope.startDisabled = true;
      $scope.stopDisabled = false;
      recordAudio.startRecording();
      recordPeerAudio && recordPeerAudio.startRecording();
    };

    $scope.stopRecording = function() {
      $scope.startDisabled = false;
      $scope.stopDisabled = true;

      //if peer exists, record both streams
      //stop self's audio recording
      recordPeerAudio && recordAudio.stopRecording(function() {
        //stop peer's audio recording
        recordPeerAudio.stopRecording(function() {
          //get self's audio data-URL
          recordAudio.getDataURL(function (audioDataURL) {
            //get peer's audio data-URL
            recordPeerAudio.getDataURL(function (peerAudioURL) {
              var files = {
                selfAudio: {
                  type: recordAudio.getBlob().type || 'audio/wav',
                  dataURL: audioDataURL
                },
                peerAudio: {
                  type: recordPeerAudio.getBlob().type || 'audio/wav',
                  dataURL: peerAudioURL
                },
                user: {
                  user: Auth.getCurrentUser()
                }
              };
              console.log(files);

              socket.emit('audio', files);
            });

          });
        });
      });

      //if no peer, record self only
      !recordPeerAudio && recordAudio.stopRecording(function() {
         // get audio data-URL
         recordAudio.getDataURL(function(audioDataURL) {
             var files = {
                 selfAudio: {
                     type: recordAudio.getBlob().type || 'audio/wav',
                     dataURL: audioDataURL
                 },
                 peerAudio: {},
                 user: {
                   user: Auth.getCurrentUser()
                 }
             };
             socket.emit('audio', files);
          });
      });
    
    };

    socket.on("merged", function(filename) {
      console.log(filename + " successfully saved to database");
    });
  
  //-----chat stuff-----//

  $scope.targetLanguages = $scope.currentUser.languagesLearning;
  $scope.msg = "";
  $scope.targetLanguage = $scope.targetLanguages[0];
  var languageMap = {
    'English': 'en',
    'Chinese': 'zh-CN',
    'Spanish': 'es',
    'Arabic': 'ar' 
  };
  $scope.sendMsg = function() {
    if($scope.msg !== "") {
      var languageCode = languageMap[$scope.targetLanguage.language];
      $http.post('/api/translate', {
        text: $scope.msg,
        targetLanguage: languageCode
      }).success(function(translation, status) {
        var data = {
          t: translation,
          o: $scope.msg
        };
        Room.sendMsg(data, $stateParams.roomId);
        $scope.msg = "";
      });
    }

  };
  socket.on('updateChat', function(message) {
    $('#msgs').append('<li>Translated: ' + message.t + '</li>');
    $('#msgs').append('<li>Original: ' + message.o + '</li>');
  });
});
