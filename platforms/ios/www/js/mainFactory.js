/**
 * Created by raul on 1/28/16.
 */


angular.module('services', []).factory('mainFactory', function($http, $q, $window, User) {
    var factory = { initFactory: false, connectionStr: "", apiUrl: "" };
    factory.initApp = function () {
        // create a promise
        var deferred = $q.defer();
        var promise = deferred.promise;
        if (!factory.initFactory) {
            factory.initFactory = true;
            factory.connectionStr = ENV.SERVICE_URL + "/api/v1";
            factory.apiUrl = ENV.SERVICE_URL + "/api/v1";
            deferred.resolve(factory.initFactory);
        }
        else {
            deferred.resolve(factory.initFactory);
        }
        return promise;
    };

    factory.createAccount = function (req) {
        return $http.post(factory.connectionStr + "/create_account", req);
    };

    factory.authenticate = function (req) {
        return $http.post(factory.connectionStr + "/authentication", req);
    };

    factory.me = function (req) {
        return $http.post(factory.connectionStr + "/me", req, { headers: { token: User.getToken() }});
    };

    factory.doLogOut = function (req) {
        return $http.post(factory.connectionStr + "/logout", req);
    };

    factory.checkEmailAvailability = function (req) {
        return $http.post(factory.connectionStr + "/check_email", req);
    };

    factory.getMatchesByUser = function (req) {
        return $http.post(factory.connectionStr + "/matches", req);
    };

    factory.makeUserFavorite = function (req) {
        return $http.post(factory.connectionStr + "/add_favorite", req);
    };

    factory.removeUserFromFavorite = function (req) {
        return $http.post(factory.connectionStr + "/remove_favorite", req);
    };

    factory.getFavoritesByUser = function (req) {
        return $http.post(factory.connectionStr + "/favorites", req);
    };

    factory.saveLikeOrDislike = function (req) {
        return $http.post(factory.connectionStr + "/like", req);
    };

    factory.getWhoLikedMe = function (req) {
        return $http.post(factory.connectionStr + "/wholikedme", req);
    };

    factory.getMyMatches = function (req) {
        return $http.post(factory.connectionStr + "/mymatches", req);
    };

    factory.getUserInfo = function (uid) {
        return $http.get(factory.connectionStr + "/user/" + uid, { headers: { token: User.getToken(), my_id: User.getUser().id }});
    };

    factory.markProfileVisited = function (req) {
        return $http.post(factory.connectionStr + "/visited_profile", req);
    };

    factory.getMyVisitors = function (req) {
        return $http.post(factory.connectionStr + "/myvisitors", req);
    };

    factory.searchProfiles = function (req) {
        return $http.post(factory.connectionStr + "/search", req);
    };

    factory.getSignS3 = function (file) {
        return $http.get(factory.connectionStr + "/sign_s3", { headers: file });
    };

    factory.removeImageFromS3 = function (file) {
        return $http.get(factory.connectionStr + "/remove_froms3", { headers: file });
    };

    factory.updateNewUserPics = function (req) {
        return $http.post(factory.connectionStr + "/update_pics", req);
    };

    factory.reportUserProfile = function (req) {
        return $http.post(factory.connectionStr + "/report_user", req);
    };

    factory.updateUserInfo = function (req) {
        return $http.post(factory.connectionStr + "/update_profile", req);
    };

    factory.getUserMessages = function () {
        return $http.get(factory.connectionStr + "/messages", { headers: { token: User.getToken(), my_id: User.getUser().id }});
    };

    factory.getNewNotifications = function () {
        return $http.get(factory.connectionStr + "/notifications", { headers: { token: User.getToken(), my_id: User.getUser().id }});
    };

    factory.saveMessage = function (req) {
        return $http.post(factory.connectionStr + "/save_message", req);
    };

    factory.getConversation = function (id) {
        return $http.get(factory.connectionStr + "/conversation", { headers: { token: User.getToken(), my_id: User.getUser().id, user_id: id }});
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
}).factory('socket', function(socketFactory) {
    var myIoSocket = io.connect(ENV.CHAT_SERVER_URL);
    return socketFactory({ ioSocket: myIoSocket });
});