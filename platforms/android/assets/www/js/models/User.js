/**
 * Created by raul on 1/8/16.
 */

angular.module('models', []).service('User', function () {
    var user = {}, token = "";

    var setToken = function (t) {
        token = t;
    };

    var getToken = function () {
        return token;
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
        setToken: setToken
    };
});