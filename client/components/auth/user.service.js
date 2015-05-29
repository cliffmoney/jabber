'use strict';

angular.module('jabbrApp')
  .factory('User', function ($resource) {
    return $resource('/api/users/:id/:controller', {
      id: '@_id'
    },
    {
      changePassword: {
        method: 'PUT',
        params: {
          controller:'password'
        }
      },
      get: {
        method: 'GET',
        params: {
          id:'me'
        }
      },
      getSuggestedPartners: {
        method: 'GET',
        params: {
          id: 'suggestedPartners'
        }
      },
      getProfile: {
        method: 'GET',
      }
    });
  });
