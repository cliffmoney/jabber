'use strict';

var _ = require('lodash');
var Partnership = require('./partnership.model');
var Message = require('../message/message.model');
var mongoose = require('mongoose');
var uuid = require('node-uuid');


// Get list of partnerships that belong to user and have a room
exports.index = function(req, res) {
  var userId = mongoose.Types.ObjectId(req.user._id);
  Partnership.find( {$and:[ {confirmed: true}, {$or:[ {'recipient':userId}, {'requester':userId}]}]})
    .populate('recipient requester')
    .exec(function(err, partnerships) {
      if(err) { return handleError(res, err); }
      return res.json(200, partnerships);
    });
};


// Get a single partnership
exports.show = function(req, res) {
  Partnership.findById(req.params.id, function (err, partnership) {
    if(err) { return handleError(res, err); }
    if(!partnership) { return res.send(404); }
    return res.json(partnership);
  });
};

// Creates a new partnership in the DB.
exports.create = function(req, res) {
  // first convert strings into mongoose Object id's
  var fromId = mongoose.Types.ObjectId(req.body.requester);
  var toId = mongoose.Types.ObjectId(req.body.recipient);
  // first create a new message that gets sent to request recipient
  Message.create({
    from: fromId,
    to: toId,
    type: 'partnerRequest',
    body: req.body.body
  }, function(err, message) {
    if(err) { return handleError(res, err); }
    // now create the partnership
    Partnership.create({
        requester: fromId,
        recipient: toId,
        messages: [message._id]
      }, function(err, partnership) {
      if(err) { return handleError(res, err); }
      // now update the message to reference the partnership. this is awful code, will change later
      Message.findById(message._id, function(err, message) {
        message._partnership = partnership._id;
        message.save(function (err) {

          if (err) return handleError(err);
          return res.json(201, partnership);
        });
      });
    });
  });
};

// Updates an existing partnership in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Partnership.findById(req.params.id, function (err, partnership) {
    if (err) { return handleError(res, err); }
    if(!partnership) { return res.send(404); }
    if(partnership.confirmed === false) {
      partnership.confirmed = true;
      partnership.room_id = uuid.v4();
      partnership.save(function (err) {
        if (err) { return handleError(res, err); }
        console.log('created room');
        return res.json(200, partnership);
      });
    } else {
      console.log('room not created again');
      return res.json(404);
    }
  });
};

// Deletes a partnership from the DB.
exports.destroy = function(req, res) {
  Partnership.findById(req.params.id, function (err, partnership) {
    if(err) { return handleError(res, err); }
    if(!partnership) { return res.send(404); }
    partnership.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}