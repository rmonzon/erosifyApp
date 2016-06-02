/**
 * Created by raul on 1/8/16.
 */

angular.module('models', []).service('User', function ($window) {
    var user = {}, token = "";

    var setToken = function (t) {
        token = t;
    };

    var getToken = function () {
        return token;
    };

    var setUserFb = function(user_data) {
        $window.localStorage.facebook_user = JSON.stringify(user_data);
    };

    var getUserFb = function() {
        return JSON.parse($window.localStorage.facebook_user || '{}');
    };

    var setUser = function(user_data) {
        user = user_data;
    };

    var getUser = function() {
        return user;
    };

    var updateAttr = function (key, value) {
        user[key] = value;
    };

    return {
        getUser: getUser,
        setUser: setUser,
        updateAttr: updateAttr,
        getToken: getToken,
        setToken: setToken,
        setUserFb: setUserFb,
        getUserFb: getUserFb
    };
});