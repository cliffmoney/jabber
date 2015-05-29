var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    conn = mongoose.connection,
    url = require("url"),
    path = require("path"),
    fs = require('fs'),
    Grid = require('gridfs-stream');
    Grid.mongo = mongoose.mongo;


    module.exports = function(userId, cb){
      var gfs = Grid(conn.db);
      var streams = [];
      gfs.files.find({ metadata: {userId: userId} }).toArray(function (err, files) {
          if (err) {
               throw (err);
          }
          files.forEach(function (file){
            var readStream = gfs.createReadStream({
               filename: file.filename
            });
            streams.push(readStream);
          });
          cb(streams);
      });
    }

