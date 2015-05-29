/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');

module.exports = function(app) {

  // Insert routes below
  app.use('/api/users/:id/messages', require('./api/message'));
  app.use('/api/partnerships', require('./api/partnership'));
  // if something starts with api/recordings, use subrouter
  app.use('/api/recordings', require('./api/recording'));
  app.use('/api/users', require('./api/user'));

  app.use('/auth', require('./auth'));

  // All undefined asset or api routes should return a 404
  // regex is below
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendfile(app.get('appPath') + '/index.html');
    });
};
