'use strict';

angular.module('jabbrApp')
  .factory('Translate', function ($http) { 
  //--------converts characters to html----------------
    /**
     * (c) 2012 Steven Levithan <http://slevithan.com/>
     * MIT license
     */
    if (!String.prototype.codePointAt) {
        String.prototype.codePointAt = function (pos) {
            pos = isNaN(pos) ? 0 : pos;
            var str = String(this),
                code = str.charCodeAt(pos),
                next = str.charCodeAt(pos + 1);
            // If a surrogate pair
            if (0xD800 <= code && code <= 0xDBFF && 0xDC00 <= next && next <= 0xDFFF) {
                return ((code - 0xD800) * 0x400) + (next - 0xDC00) + 0x10000;
            }
            return code;
        }; 
    };

    /**
     * Encodes special html characters
     * @param string
     * @return {*}
     */
    var html_encode = function(string) {
        var ret_val = '';
        for (var i = 0; i < string.length; i++) { 
            if (string.codePointAt(i) > 127) {
                ret_val += '&#' + string.codePointAt(i) + ';';
            } else {
                ret_val += string.charAt(i);
            }
        }
        return ret_val;
    };
    //-----------is it okay to use the above? found it on stack overflow----------
    var translate = function(string) {
      var baseUrl = 'https://www.googleapis.com/language/translate/v2?key=AIzaSyCnCsQto6YXS5YZH-tKay95podBNk9WHM8';
      var query = '&q='+string+'&target=EN';
      var url = baseUrl + query;
      return $http({
        method: 'GET',
        url: url
      }).then(function(resp) {
        return resp.data.data.translations[0].translatedText;
      });
    };

    return {
      translate: translate,
      toHtml: html_encode
    }
  });