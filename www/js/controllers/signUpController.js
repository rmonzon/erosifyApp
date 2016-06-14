/**
 * Created by raul on 1/5/16.
 */

angular.module('controllers').controller('SignUpController', function ($scope, $cordovaGeolocation, GenericController, mainFactory, User) {

    function init() {
        GenericController.init($scope);
        $scope.days = [];
        $scope.months = [
            { value: 1, text: "January" },
            { value: 2, text: "February" },
            { value: 3, text: "March" },
            { value: 4, text: "April" },
            { value: 5, text: "May" },
            { value: 6, text: "June" },
            { value: 7, text: "July" },
            { value: 8, text: "August" },
            { value: 9, text: "September" },
            { value: 10, text: "October" },
            { value: 11, text: "November" },
            { value: 12, text: "December" }
        ];
        $scope.years = [];
        $scope.user = {};
        // $scope.user = {
        //     email: "heidi@gmail.com",
        //     password: "123123123",
        //     name: "Heidi",
        //     full_name: "Smith",
        //     dob: "11-27-1991",
        //     gender: "Female",
        //     looking_to: "Date",
        //     age: 24,
        //     month: "11",
        //     day: "27",
        //     year: "1991"
        // };
        $scope.wrongCredentials = false;

        initComboboxes();
    }

    function initComboboxes() {
        for (var i = 1; i <= 31; i++) {
            $scope.days.push(i);
        }
        for (i = 1998; i >= 1935; i--) {
            $scope.years.push(i);
        }
    }

    $scope.checkAccountAvailability = function () {
        if (!$scope.validateEmail($scope.user.email)) {
            $scope.showMessage("Please enter a valid email address!", 2500);
            return;
        }
        mainFactory.checkEmailAvailability({"email": $scope.user.email}).then(successCheckEmail, errorCheckEmail);
    };

    function successCheckEmail(response) {
        if (!response.data.success) {
            $scope.wrongCredentials = true;
            $scope.showMessage(response.data.error, 3000);
        }
        else {
            if (response.data.existEmail) {
                $scope.wrongCredentials = true;
                $scope.showMessage("There's another account using that email!", 2500);
            }
            else {
                $scope.wrongCredentials = false;
            }
        }
    }

    function errorCheckEmail(response) {
        $scope.wrongCredentials = true;
        $scope.showMessage(response.data ? response.data.error : "Server error connection", 3000);
    }

    $scope.signUp = function() {
        if ($scope.wrongCredentials) {
            $scope.showMessage("There's another account using that email!", 2500);
            return;
        }
        if (!$scope.user.email) {
            $scope.showMessage("Email cannot be empty!", 2500);
            return;
        }
        if (!$scope.validateEmail($scope.user.email)) {
            $scope.showMessage("Please enter a valid email address!", 2500);
            return;
        }
        if (!$scope.user.password) {
            $scope.showMessage("Password cannot be empty!", 2500);
            return;
        }
        if (!$scope.user.name) {
            $scope.showMessage("Name cannot be empty!", 2500);
            return;
        }
        if (!$scope.user.gender) {
            $scope.showMessage("Gender cannot be empty!", 2500);
            return;
        }
        if (!$scope.user.day || !$scope.user.month || !$scope.user.year) {
            $scope.showMessage("Birthday cannot be empty!", 2500);
            return;
        }
        $scope.showMessageWithIcon("Creating account...");
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
                    var userObj = {
                        "email": $scope.user.email,
                        "password": $scope.user.password,
                        "name": $scope.user.name,
                        "full_name": "",
                        "dob": $scope.user.month + "-" + $scope.user.day + "-" + $scope.user.year,
                        "gender": $scope.user.gender,
                        "age": $scope.calculateAge($scope.user),
                        "location": results[0].formatted_address.replace('EE. UU.', 'USA'),
                        "pictures": "'{1.jpg}'",
                        "languages": "'{English}'",
                        "coords": latlng,
                        "looking_to": $scope.user.looking_to
                    };
                    console.log(userObj);
                    mainFactory.createAccount(userObj).then(successCallBack, errorCallBack);
                } else {
                    $scope.showMessage('No results found', 2500);
                }
            } else {
                $scope.showMessage('Geocoder failed due to: ' + status, 2500);
            }
        });
    }

    function successCallBack(response) {
        $scope.hideMessage();
        $scope.setUserToLS({ email: $scope.user.email, password: $scope.user.password });
        User.setToken(response.data.token);
        response.data.user = $scope.parseDataFromDB(response.data.user);
        User.setUser(response.data.user);
        $scope.goToPage('add_photos');
    }

    function errorCallBack(response) {
        $scope.hideMessage();
        console.log(response);
        $scope.showMessage(response.data.error, 3000);
    }

    init();
});