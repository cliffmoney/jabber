// SOCKET IO CONFIGURATION

'use strict';
var User = require('../api/user/user.model'),
    uuid = require('node-uuid'),
    rooms = {},
    userIds = {};
//audio stuff
var ss = require('socket.io-stream');
var saveRecording = require('../api/recording/recording');
var sendRecording = require('../api/recording/sendRecording')

module.exports = function (socketio) {

  socketio.on('connection', function (socket) {
    console.log("Client has Connected");
    socket.emit('firstContact');
    var currentRoom, id;

  // -----------SOCKET ON DISCONNECT START--------------
    socket.on('disconnect', function () {
      console.log("Client Disconnected");
      if (!currentRoom || !rooms[currentRoom]) {
        return;
      }
      delete rooms[currentRoom][rooms[currentRoom].indexOf(socket)];
      rooms[currentRoom].forEach(function (socket) {
        if (socket) {
          socket.emit('peer.disconnected', { id: id });
        }
      });
    });
  // -----------SOCKET ON DISCONNECT END----------------------

  //------------SOCKET ON CREATE ROOM START-------------------
    socket.on('checkRoom', function(data){
      // check if a room has already been created or not
      var roomid = data.roomid;
      if(rooms[roomid]){socket.emit('openRoom')}
      else{createRoom(data);}

    });
    var createRoom = function(data){
      currentRoom = data.roomid || uuid.v4();
      console.log("Created Room: " + currentRoom);
      rooms[currentRoom] = [socket];
      id = userIds[currentRoom] = 0;
      socket.emit("openRoom", {roomid:currentRoom, 'id': id})
    };
  //------------SOCKET ON CREATE ROOM END---------------------
  //------------SOCKET ON JOINROOM START----------------------
    socket.on('joinRoom',function(data){
      currentRoom = data.roomid;
      userIds[currentRoom] += 1;
      id = userIds[currentRoom];
      socket.emit('enterRoom', {'roomid': currentRoom, 'id':id})
      var room = rooms[currentRoom];
      room.forEach(function(s){
        s.emit('peer.connected',{'id':id});
      });
      room[id] = socket;
      console.log('Peer connected to room', currentRoom, 'with #', id);
    });

  //------------SOCKET ON JOINROOM END-----------------------

  //------------SOCKET ON MSG START--------------------------
    socket.on('msg', function (data) {
      var to = parseInt(data.to, 10);
      console.log('Two variables: ' + rooms[currentRoom] + 'and' + rooms[currentRoom][to]);
      if (rooms[currentRoom] && rooms[currentRoom][to]) {
        console.log('Redirecting message to', to, 'by', data.by);
        rooms[currentRoom][to].emit('msg', data);
      } else {
        console.warn('Invalid user');
      }
    });
  //------------SOCKET ON MSG END----------------------------

  //------------SOCKET ON AUDIO START------------------------
    socket.on('audio', function(audio){
      var fileName = uuid.v4();
      saveRecording({
        audio : audio.audio.dataURL,
        filename : fileName + '.wav',
        userId: audio.user.user.email
      },
        function(filename){
          socket.emit('savedFile', fileName + '.wav');
        });
    });
  //------------SOCKET ON AUDIO END--------------------------


    ss(socket).on('getRecording', function(userId){
      sendRecording(userId,
        function (wavStreams) {
          wavStreams.forEach( function(eachStream) {
            eachStream.on('error', function (err) {
              console.log('An error occurred!', err);
              throw err;
            });
            var stream = ss.createStream();
            ss(socket).emit('sendRecording', stream);
            eachStream.pipe(stream);
          });
        });
      });
    });

};

