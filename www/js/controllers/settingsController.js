/**
 * Created by raul on 4/4/16.
 */

angular.module('controllers').controller('SettingsController', function ($scope, GenericController, User, mainFactory) {

    function init() {
        GenericController.init($scope);
        $scope.user = {};
        $scope.getUserInfo();
        $scope.removeHideClass('#settings-menu-icon');
    }

    $scope.getUserInfo = function () {
        //mainFactory.getUserInfo({ "email": User.getUser().email }).then(successCallback, errorCallback);
        mainFactory.getUserInfo({ "email": "raul@inceptures.com" }).then(successCallback, errorCallback);
    };

    function successCallback(response) {
        $scope.user = response.data.data;
    }

    function errorCallback(response) {
        $scope.hideMessage();
        console.log(response);
        //$scope.showMessage(response.data.error, 2500);
    }

    $scope.logOut = function () {
        console.log("logout here");
    };

    $scope.deleteAccount = function () {
        console.log("Are you sure you want to delete your account?");
    };

    init();
});