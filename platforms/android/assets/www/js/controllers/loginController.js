/**
 * Created by raul on 1/5/16.
 */

angular.module('controllers').controller('LoginController', function ($scope, $q, $cordovaFacebook, $cordovaGeolocation, GenericController, User, mainFactory) {

    function init() {
        GenericController.init($scope);
        $scope.user = {email: "raul@inceptures.com", password: "12345678"};
    }

    $scope.loginWithEmail = function() {
        if (!$scope.user.email) {
           $scope.showMessage("Email cannot be empty!", 2500);
           return;
        }
        if (!$scope.user.password) {
           $scope.showMessage("Password cannot be empty!", 2500);
           return;
        }
        $scope.showMessageWithIcon("Verifying credentials...");
        $scope.getCurrentLocation();
    };

    $scope.getCurrentLocation = function () {
        var posOptions = {timeout: 10000, enableHighAccuracy: false};
        $cordovaGeolocation.getCurrentPosition(posOptions).then(successGetLocation, errorGetLocation);
    };

    function successGetLocation(position) {
        geocodeLatLng(position.coords.latitude, position.coords.longitude);
    }

    function errorGetLocation(err) {
        $scope.hideMessage();
        console.log(err);
        if (err.code == 1) {
            $scope.showMessage("Please enable GPS service to continue.", 3000);
        }
    }

    function geocodeLatLng(lat, long) {
        var geocoder = new google.maps.Geocoder;
        var latlng = {lat: parseFloat(lat), lng: parseFloat(long)};
        geocoder.geocode({'location': latlng}, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                if (results[0]) {
                    //results[0] = Full street address
                    //results[1] = locality address
                    //results[2] = postal code address
                    //results[3] = county address
                    //results[4] = state address
                    //results[5] = country address
                    var credentials = { "email": $scope.user.email, "password": $scope.user.password, "location": results[0].formatted_address, "coords": latlng };
                    mainFactory.authenticate(credentials).then(authenticateSuccess, authenticateError);
                    //$scope.$apply();
                } else {
                    $scope.showMessage('No results found', 2500);
                }
            } else {
                $scope.showMessage('Geocoder failed due to: ' + status, 2500);
            }
        });
    }

    function authenticateSuccess(response) {
        $scope.hideMessage();
        if (response.data.success) {
            $scope.setUserToLS($scope.user.email);
            User.setToken(response.data.token);
            response.data.user = $scope.parseDataFromDB(response.data.user);
            User.setUser(response.data.user);
            $scope.user.email = "";
            $scope.user.password = "";
            $scope.goToPage('app/matching');
        }
        else {
            $scope.showMessage(response.data.info, 2500);
        }
    }

    function authenticateError (response) {
        $scope.hideMessage();
        if (response.data) {
            $scope.showMessage(response.data.error, 2500);
        }
        else {
            $scope.showMessage("Something went wrong with the request!", 2500);
        }
    }

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