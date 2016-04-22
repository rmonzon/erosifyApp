/**
 * Created by raul on 1/8/16.
 */

angular.module('models', []).service('User', function ($window) {
    var user = {}, token = "";
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

    var setToken = function (t) {
        token = t;
    };

    var getToken = function () {
        return token;
    };

    var setUser = function(user_data) {
        user_data.pictures = cleanImagesUrls(user_data);
        user = user_data;
        //$window.localStorage.starter_facebook_user = JSON.stringify(user_data);
    };

    var getUser = function() {
        return user;
        //return $window.localStorage && $window.localStorage.getItem('userId');
        //return JSON.parse($window.localStorage.starter_facebook_user || window.localStorage.userLogin || '{}');
    };

    var updateAttr = function (key, value) {
        user[key] = value;
    };

    function cleanImagesUrls(user) {
        return user.pictures.map(function (u) {
            return ENV.SERVICE_URL + "/profiles/user_" + user.id + "/" + u;
        });
    }

    return {
        getUser: getUser,
        setUser: setUser,
        updateAttr: updateAttr,
        getToken: getToken,
        setToken: setToken
    };
});