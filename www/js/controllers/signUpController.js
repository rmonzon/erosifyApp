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

        //$scope.datepickerObject = {
        //    titleLabel: 'Select your birthday',  //Optional
        //    todayLabel: 'Today',  //Optional
        //    closeLabel: 'Close',  //Optional
        //    setLabel: 'Set',  //Optional
        //    setButtonType : 'button-assertive',  //Optional
        //    todayButtonType : 'button-assertive',  //Optional
        //    closeButtonType : 'button-assertive',  //Optional
        //    inputDate: new Date(),  //Optional
        //    mondayFirst: true,  //Optional
        //    //  disabledDates: disabledDates, //Optional
        //    //weekDaysList: weekDaysList, //Optional
        //    //monthList: monthList, //Optional
        //    templateType: 'popup', //Optional
        //    showTodayButton: 'true', //Optional
        //    modalHeaderColor: 'bar-positive', //Optional
        //    modalFooterColor: 'bar-positive', //Optional
        //    from: new Date(1935, 1, 1), //Optional
        //    to: new Date(1998, 1, 1),  //Optional
        //    callback: function (val) {  //Mandatory
        //        $scope.datePickerCallback(val);
        //    },
        //    dateFormat: 'MM-dd-yyyy', //Optional
        //    closeOnSelect: false //Optional
        //};

        initComboboxes();
    }

    $scope.datePickerCallback = function (val) {
        if (typeof(val) === 'undefined') {
            console.log('No date selected');
        } else {
            console.log('Selected date is : ', val)
        }
    };

    function initComboboxes() {
        for (var i = 1; i <= 31; i++) {
            $scope.days.push(i);
        }
        for (i = 1998; i >= 1935; i--) {
            $scope.years.push(i);
        }
    }

    $scope.signUp = function() {
        if (!$scope.user.email) {
            $scope.showMessage("Email cannot be empty!", 2500);
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
            "pictures": ["profile.png"],
            "age": calculateAge()
        };
        $scope.showMessageWithIcon("Creating account...");
        mainFactory.createAccount(userObj).then(successCallBack, errorCallBack);
    };

    function calculateAge() {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
        var diffYears = yyyy - parseInt($scope.user.year);
        var a = mm * 30 + dd, b = parseInt($scope.user.month) * 30 + parseInt($scope.user.day);
        return a < b ? diffYears - 1 : diffYears;
    }

    function successCallBack(response) {
        $scope.hideMessage();
        console.log(response);
        $scope.goToPage('app/matching');
    }

    function errorCallBack(response) {
        $scope.hideMessage();
        $scope.showMessage(response.data.error, 3000);
    }

    init();
});