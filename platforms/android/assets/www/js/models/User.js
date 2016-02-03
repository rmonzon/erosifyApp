/**
 * Created by raul on 1/8/16.
 */

angular.module('models', []).service('User', function () {
    var user = {};
    // user object definition:
    //{
    //    "status": "connected",
    //    "authResponse": {
    //        "accessToken": "CSKJASLSDD232323",
    //        "expiresIn": "1234693737",
    //        "session_key": "true",
    //        "userID": "1212098239872498523"
    //    },
    //}

    var setUser = function(user_data) {
        window.localStorage.starter_facebook_user = JSON.stringify(user_data);
    };

    var getUser = function(){
        return JSON.parse(window.localStorage.starter_facebook_user || '{}');
    };

    var updateAttr = function (key, value) {
        user[key] = value;
    };

    return {
        getUser: getUser,
        setUser: setUser,
        updateAttr: updateAttr
    };
});