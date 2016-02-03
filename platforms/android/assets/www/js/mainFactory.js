/**
 * Created by raul on 1/28/16.
 */


angular.module('services', []).factory('mainFactory', function($http, $q, $window) {
    var factory = { initFactory: false, connectionStr: "", url: "" };
    factory.initApp = function () {
        // create a promise
        var deferred = $q.defer();
        var promise = deferred.promise;
        if (!factory.initFactory) {
            factory.initFactory = true;
            //factory.connectionStr = "http://192.168.1.127:5800/api/sql";
            //factory.url = "http://192.168.1.127:5800/api";
            factory.connectionStr = "http://intense-dawn-9976.herokuapp.com/api/sql";
            factory.url = "http://intense-dawn-9976.herokuapp.com/api";
            deferred.resolve(factory.initFactory);
        }
        else {
            deferred.resolve(factory.initFactory);
        }
        return promise;
    };

    factory.getAppVersion = function () {
        var request = {query: "SELECT info_mathgame_version FROM info" };
        return $http.post(factory.connectionStr, request);
    };

    factory.getUserDataFromFacebook = function (token) {
        return $http.get("https://graph.facebook.com/v2.2/me", { params: { access_token: token, fields: "id,name,gender,location,website,picture", format: "json" }});
    };

    factory.getUsers = function () {
        var request = {query: "SELECT * FROM user_bricksgame ORDER BY user_bricksgame.user_bricksgame_id"};
        return $http.post(factory.connectionStr, request);
    };

    factory.registerUser = function (user) {
        var request = {query: "INSERT INTO user_bricksgame (user_bricksgame_playerid, user_bricksgame_pin, user_bricksgame_maxscore, user_bricksgame_realname, user_bricksgame_age, user_bricksgame_settings, user_bricksgame_badges) VALUES ('" + user.username + "', " + user.pin + ", 0, '" + user.name + "', " + user.age + ", '" + user.settings + "', '')"};
        return $http.post(factory.connectionStr, request);
    };

    /*** Store user's info in session store, it'll be removed when log out ***/

    factory.setUserToStorage = function (user) {
        $window.sessionStorage && $window.sessionStorage.setItem('user', user);
        return this;
    };

    factory.getUserFromStorage = function () {
        return $window.sessionStorage && $window.sessionStorage.getItem('user');
    };

    /*** Store playerID in local storage if user checked that option  ***/

    factory.setUserToLocalStorage = function (id) {
        $window.localStorage && $window.localStorage.setItem('playerID', id);
        return this;
    };

    factory.getUserFromLocalStorage = function () {
        return $window.localStorage && $window.localStorage.getItem('playerID');
    };

    return factory;
});