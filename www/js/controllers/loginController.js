/**
 * Created by raul on 1/5/16.
 */

angular.module('controllers').controller('LoginController', function ($scope, $q, $cordovaFacebook, $cordovaGeolocation, GenericController, User, mainFactory) {

    function init() {
        GenericController.init($scope);
        $scope.user = {email: "heidi@gmail.com", password: "123123123"};
        //$scope.user = {email: "", password: ""};
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
        $scope.loginStatusFb = 'noFacebook';
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
                    if ($scope.loginStatusFb === 'connected' || $scope.loginStatusFb === 'noFacebook') {
                        $scope.hideMessage();
                        $scope.showMessageWithIcon("Verifying credentials...");
                        var credentials = {
                            "email": $scope.user.email,
                            "password": $scope.user.password,
                            "location": results[0].formatted_address.replace('EE. UU.', 'USA'),
                            "coords": latlng,
                            "friends": $scope.user.friends
                        };
                        mainFactory.authenticate(credentials).then(authenticateSuccess, authenticateError);
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
                            "location": results[0].formatted_address.replace('EE. UU.', 'USA'),
                            "facebook_photos": "'{" + $scope.user.photos.join(',') + "}'",
                            "languages": "'{" + $scope.user.languages.join(',') + "}'",
                            "coords": latlng,
                            "looking_to": "Date", //todo:find a way to get this from the user. $scope.user.looking_to
                            "facebook_id": $scope.user.id,
                            "friends": $scope.user.friends
                        };
                        $scope.hideMessage();
                        $scope.showMessageWithIcon("Registering your account...");
                        mainFactory.createAccountFacebook(userObj).then(successCallBack, errorCallBack);
                    }
                } else {
                    $scope.showMessage('No results found', 2500);
                }
            } else {
                $scope.showMessage('Geocoder failed due to: ' + status, 2500);
            }
        });
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
        $scope.showMessage(response.data.error, 3000);
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

    $scope.loginWithFacebook = function() {
        facebookConnectPlugin.getLoginStatus(function (success) {
            if (success.status === 'connected') {
                $scope.loginStatusFb = success.status;
                $scope.getFacebookProfileInfo(success.authResponse).then(function (profileInfo) {
                    profileInfo.fb_token = success.authResponse.accessToken;
                    $scope.user = $scope.parseFacebookData(profileInfo);
                    $scope.showMessageWithIcon("Retrieving location...");
                    $scope.getCurrentLocation().then(successGetLocation, $scope.errorGetLocation);
                }, function (fail) {
                    console.log('profile info fail', fail);
                });
            } else {
                $scope.loginStatusFb = success.status;
                facebookConnectPlugin.login(['email', 'public_profile', 'user_friends', 'user_likes', 'user_photos', 'user_birthday', 'user_education_history', 'user_work_history'], fbLoginSuccess, fbLoginError);
            }
        });
    };

    // This is the success callback from the login method
    var fbLoginSuccess = function(response) {
        if (!response.authResponse) {
            fbLoginError("Cannot find the authResponse");
            return;
        }
        var authResponse = response.authResponse;
        $scope.getFacebookProfileInfo(authResponse).then(function (profileInfo) {
            profileInfo.fb_token = authResponse.accessToken;
            $scope.user = $scope.parseFacebookData(profileInfo);
            //check if user has an account
            mainFactory.checkEmailAvailability({"email": $scope.user.email}).then(successCheckEmail, errorCheckEmail);
        }, function (fail) {
            console.log('profile info fail', fail);
        });
    };

    // This is the fail callback from the login method
    var fbLoginError = function(error){
        console.log('fbLoginError', error);
        $scope.showMessage(error.errorUserMessage, 3000);
    };

    function successCheckEmail(response) {
        if (response.data.existEmail) {
            $scope.loginStatusFb = 'connected';
        }
        $scope.showMessageWithIcon("Retrieving location...");
        $scope.getCurrentLocation().then(successGetLocation, $scope.errorGetLocation);
    }

    function errorCheckEmail(response) {
        $scope.showMessage(response.data ? response.data.error : "Server error connection", 3000);
    }

    init();
});
