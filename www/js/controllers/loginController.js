/**
 * Created by raul on 1/5/16.
 */

angular.module('controllers').controller('LoginController', function ($scope, $q, $cordovaFacebook, $cordovaGeolocation, GenericController, User, mainFactory) {

    function init() {
        GenericController.init($scope);
        //$scope.user = {email: "raul@inceptures.com", password: "12345678"};
        $scope.user = {email: "", password: ""};
    }

    $scope.loginWithEmail = function () {
        if ($scope.user.email == undefined) {
            if (!$scope.validateEmail($scope.user.email)) {
                $scope.showMessage("Invalid email address!", 2500);
                return;
            }
        }
        if (!$scope.user.email) {
            $scope.showMessage("Email cannot be empty!", 2500);
            return;
        }
        if (!$scope.user.password) {
            $scope.showMessage("Password cannot be empty!", 2500);
            return;
        }
        $scope.showMessageWithIcon("Retrieving location...");
        $scope.getCurrentLocation().then(successGetLocation, $scope.errorGetLocation);
    };
    
    function successGetLocation(position) {
        geocodeLatLng(position.coords.latitude, position.coords.longitude);
    }

    function geocodeLatLng(lat, long) {
        var geocoder = new google.maps.Geocoder;
        var latlng = {lat: parseFloat(lat), lng: parseFloat(long)};
        geocoder.geocode({'location': latlng}, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                if (results[0]) {
                    $scope.hideMessage();
                    $scope.showMessageWithIcon("Verifying credentials...");
                    var credentials = {
                        "email": $scope.user.email,
                        "password": $scope.user.password,
                        "location": results[0].formatted_address.replace('EE. UU.', 'USA'),
                        "coords": latlng
                    };
                    mainFactory.authenticate(credentials).then(authenticateSuccess, authenticateError);
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
            $scope.setUserToLS({ email: $scope.user.email, password: $scope.user.password });
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

    function authenticateError(response) {
        $scope.hideMessage();
        if (response.data) {
            $scope.showMessage(response.data.error, 2500);
        }
        else {
            $scope.showMessage("Something went wrong with the request!", 2500);
        }
    }

    //This method is executed when the user press the "Login with facebook" button
    $scope.loginWithFacebook = function () {
        $cordovaFacebook.getLoginStatus().then(function (success) {
            if (success.status === 'connected') {
                // The user is logged in and has authenticated your app, and response.authResponse supplies
                // the user's ID, a valid access token, a signed request, and the time the access token
                // and signed request each expire
                // Check if we have our user saved
                var user = $scope.getUserFromLS();
                if (!user.email) {
                    $scope.getFacebookProfileInfo(success.authResponse).then(function (profileInfo) {
                        console.log(profileInfo);
                        // For the purpose of this example I will store user data on local storage
                        $scope.setUserToLS({ email: profileInfo.email, password: "" });
                        $scope.user.email = profileInfo.email;

                        $scope.showMessageWithIcon("Retrieving location...");
                        $scope.getCurrentLocation();
                    }, function (error) {
                        $scope.showMessage(error, 2000);
                    });
                } else {
                    $scope.setUserToLS({ email: user.email, password: "" });
                    $scope.user.email = user.email;
                    $scope.showMessageWithIcon("Retrieving location...");
                    $scope.getCurrentLocation();
                }
            } else {
                // If (success.status === 'not_authorized') the user is logged in to Facebook,
                // but has not authenticated your app
                // Else the person is not logged into Facebook,
                // so we're not sure if they are logged into this app or not.
                console.log('getLoginStatus', success.status);
                $scope.showMessageWithIcon("Verifying credentials...");
                $cordovaFacebook.login([
                    'email',
                    'public_profile',
                    'user_friends',
                    'user_birthday',
                    'user_likes',
                    'user_work_history',
                    'user_education_history'
                ], fbLoginSuccess, fbLoginError);
            }
        });
    };

    var fbLoginSuccess = function (response) {
        if (!response.authResponse) {
            fbLoginError("Cannot find the authResponse");
            return;
        }
        var authResponse = response.authResponse;
        $scope.getFacebookProfileInfo(authResponse).then(function (profileInfo) {
            User.setUser({
                authResponse: authResponse,
                userID: profileInfo.id,
                name: profileInfo.name,
                email: profileInfo.email,
                picture: "http://graph.facebook.com/" + authResponse.userID + "/picture?type=large"
            });
            $scope.hideMessage();
            $scope.goToPage('app/matching');
        }, function (error) {
            $scope.showMessage(error, 2000);
        });
    };

    // This is the fail callback from the login method
    var fbLoginError = function (error) {
        console.log('fbLoginError', error);
        $scope.hideMessage();
    };

    init();
});