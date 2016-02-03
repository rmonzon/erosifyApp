/**
 * Created by raul on 1/5/16.
 */

angular.module('controllers').controller('LoginController', function ($scope, $q, $http, $cordovaFacebook, $timeout, GenericController, User) {

    function init() {
        GenericController.init($scope);
    }

    $scope.loginWithEmail = function() {
        $scope.showMessageWithIcon("Verifying credentials...", 1500);
        $timeout(function() {
            $scope.goToPage('app/playlists');
        }, 1500);
    };

    //This method is executed when the user press the "Login with facebook" button
    $scope.loginWithFacebook = function() {
        $cordovaFacebook.getLoginStatus().then(function (success) {
            if (success.status === 'connected') {
                // The user is logged in and has authenticated your app, and response.authResponse supplies
                // the user's ID, a valid access token, a signed request, and the time the access token
                // and signed request each expire
                console.log('getLoginStatus', success.status);
                // Check if we have our user saved
                var user = User.getUser('facebook');
                if (!user.userID) {
                    getFacebookProfileInfo(success.authResponse)
                        .then(function (profileInfo) {
                            // For the purpose of this example I will store user data on local storage
                            User.setUser({
                                authResponse: success.authResponse,
                                userID: profileInfo.id,
                                name: profileInfo.name,
                                email: profileInfo.email,
                                picture: "http://graph.facebook.com/" + success.authResponse.userID + "/picture?type=large"
                            });
                            $scope.hideMessage();
                            $scope.goToPage('app/playlists');
                        }, function (error) {
                            $scope.showMessage(error, 2000);
                        });
                } else {
                    $scope.goToPage('app/playlists');
                }
            } else {
                // If (success.status === 'not_authorized') the user is logged in to Facebook,
                // but has not authenticated your app
                // Else the person is not logged into Facebook,
                // so we're not sure if they are logged into this app or not.
                console.log('getLoginStatus', success.status);
                $scope.showMessageWithIcon("Verifying credentials...", 0);
                // Ask the permissions you need. You can learn more about
                // FB permissions here: https://developers.facebook.com/docs/facebook-login/permissions/v2.4
                $cordovaFacebook.login(['email', 'public_profile'], fbLoginSuccess, fbLoginError);
            }
        });
    };

    var fbLoginSuccess = function(response) {
        if (!response.authResponse){
            fbLoginError("Cannot find the authResponse");
            return;
        }
        var authResponse = response.authResponse;
        getFacebookProfileInfo(authResponse).then(function(profileInfo) {
                // For the purpose of this example I will store user data on local storage
                User.setUser({
                    authResponse: authResponse,
                    userID: profileInfo.id,
                    name: profileInfo.name,
                    email: profileInfo.email,
                    picture : "http://graph.facebook.com/" + authResponse.userID + "/picture?type=large"
                });
                $scope.hideMessage();
                $scope.goToPage('app/playlists');
            }, function(error){
                $scope.showMessage(error, 2000);
            });
    };

    // This is the fail callback from the login method
    var fbLoginError = function(error) {
        console.log('fbLoginError', error);
        $scope.hideMessage();
    };

    // This method is to get the user profile info from the facebook api
    var getFacebookProfileInfo = function (authResponse) {
        var info = $q.defer();
        $cordovaFacebook.api('/me?fields=email,name&access_token=' + authResponse.accessToken, null).then(function (response) {
                console.log(response);
                info.resolve(response);
            },
            function (response) {
                console.log(response);
                info.reject(response);
            }
        );
        return info.promise;
    };

    init();
});