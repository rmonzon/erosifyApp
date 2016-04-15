/**
 * Created by raul on 1/5/16.
 */

angular.module('controllers').controller('SignUpController', function ($scope, GenericController, mainFactory) {

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
        $scope.addAbsPosition();
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
        $scope.showMessage(response.data.error, 3000);
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

        var userObj = {
            "email": $scope.user.email,
            "password": $scope.user.password,
            "name": $scope.user.name,
            "lastname": "Rivero",
            "dob": $scope.user.month + "-" + $scope.user.day + "-" + $scope.user.year,
            "gender": $scope.user.gender,
            "age": calculateAge(),
            "location": getLocation()
        };
        $scope.showMessageWithIcon("Creating account...");
        mainFactory.createAccount(userObj).then(successCallBack, errorCallBack);
    };

    function getLocation() {
        //we'll get this later from Geolocation APIs
        return "Miami, FL";
    }

    function calculateAge() {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!
        var yyyy = today.getFullYear();
        var diffYears = yyyy - parseInt($scope.user.year);
        var a = mm * 30 + dd, b = parseInt($scope.user.month) * 30 + parseInt($scope.user.day);
        return a < b ? diffYears - 1 : diffYears;
    }

    function successCallBack(response) {
        $scope.hideMessage();
        $scope.goToPage('add_photos');
    }

    function errorCallBack(response) {
        $scope.hideMessage();
        $scope.showMessage(response.data.error, 3000);
    }

    init();
});