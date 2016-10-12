/**
 * Created by raul on 1/5/16.
 */

angular.module('controllers').controller('HomeController', function ($scope, $q, $timeout, $cordovaGeolocation, GenericController, User, mainFactory) {

    function init() {
        GenericController.init($scope);
        $scope.user = {};
        $scope.checkUserLoggedIn();
    }

    $scope.signUpWithFacebook = function() {
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
                if (results[1]) {
                    $scope.hideMessage();
                    $scope.geoResults = {results: results, latlng: latlng};

                    facebookConnectPlugin.getLoginStatus(function (success) {
                        if (success.status === 'connected') {
                            $scope.fbResponse = success;
                            getFbProfileInfo();
                        } else {
                            $scope.loginStatusFb = success.status;
                            facebookConnectPlugin.login(['email', 'public_profile', 'user_friends', 'user_likes', 'user_photos', 'user_birthday', 'user_education_history', 'user_work_history'], fbLoginSuccess, fbLoginError);
                        }
                    });
                } else {
                    $scope.showMessage('No results found', 2500);
                }
            } else {
                $scope.showMessage('Geocoder failed due to: ' + status, 2500);
            }
        });
    }

    function getFbProfileInfo() {
        $scope.getFacebookProfileInfo($scope.fbResponse.authResponse).then(function (profileInfo) {
            profileInfo.fb_token = $scope.fbResponse.authResponse.accessToken;
            $scope.user = $scope.parseFacebookData(profileInfo);
            $scope.showMessageWithIcon("Verifying credentials...");
            mainFactory.checkEmailAvailability({"email": $scope.user.email}).then(successCheckEmail, errorCheckEmail);
        }, function (fail) {
            console.log('profile info fail', fail);
        });
    }

    function doAuthentication() {
        $scope.hideMessage();
        $scope.showMessageWithIcon("Verifying credentials...");
        var credentials = {
            "email": $scope.user.email,
            "password": "",
            "location": $scope.geoResults.results[0].formatted_address.replace('EE. UU.', 'USA'),
            "coords": $scope.geoResults.latlng,
            "friends": $scope.user.friends
        };
        mainFactory.authenticate(credentials).then(authenticateSuccess, authenticateError);
    }

    // This is the success callback from the login method
    var fbLoginSuccess = function(response) {
        if (!response.authResponse) {
            fbLoginError("Cannot find the authResponse");
            return;
        }
        $scope.fbResponse = response;
        //check if user has an account
        getFbProfileInfo();
    };

    // This is the fail callback from the login method
    var fbLoginError = function(error){
        console.log('fbLoginError', error);
        $scope.showMessage(error.errorUserMessage, 3000);
    };

    function successCheckEmail(response) {
        if (response.data.existEmail) {
            doAuthentication();
        }
        else {
            var userObj = {
                "email": $scope.user.email,
                "password": "",
                "name": $scope.user.first_name,
                "full_name": $scope.user.name,
                "dob": $scope.user.birthday,
                "gender": $scope.user.gender,
                "age": $scope.calculateAge($scope.user),
                "work": $scope.user.work,
                "education": $scope.user.education,
                "location": $scope.geoResults.results[0].formatted_address.replace('EE. UU.', 'USA'),
                "facebook_photos": "'{" + $scope.user.photos.join(',') + "}'",
                "languages": "'{" + $scope.user.languages.join(',') + "}'",
                "coords": $scope.geoResults.latlng,
                "looking_to": "Date", //todo:find a way to get this from the user. $scope.user.looking_to
                "facebook_id": $scope.user.id,
                "friends": $scope.user.friends
            };
            $scope.hideMessage();
            $scope.showMessageWithIcon("Registering your account...");
            mainFactory.createAccountFacebook(userObj).then(successCallBack, errorCallBack);
        }
    }

    function errorCheckEmail(response) {
        $scope.showMessage(response.data ? response.data.error : "Server error connection", 3000);
    }

    /* Callbacks for create account */
    function successCallBack(response) {
        $scope.hideMessage();
        $scope.setUserToLS({ email: $scope.user.email, password: "" });
        User.setToken(response.data.token);
        response.data.user = $scope.parseDataFromDB(response.data.user);
        User.setUser(response.data.user);
        $scope.goToPage('app/matching');
    }

    function errorCallBack(response) {
        $scope.hideMessage();
        console.log(response);
        $scope.showMessage("Something went wrong, please try again.", 3000);
    }

    /* Callbacks for authenticate */
    function authenticateSuccess(response) {
        $scope.hideMessage();
        if (response.data.success) {
            $scope.setUserToLS({ email: $scope.user.email, password: "" });
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

    $scope.checkUserLoggedIn = function () {
        $scope.user = $scope.getUserFromLS();
        if ($scope.user) {
            if (!$scope.user.password) {
                $timeout (function () {
                    $scope.signUpWithFacebook();
                }, 500);
            }
        }
    };

    init();
});