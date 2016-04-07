/**
 * Created by raul on 4/4/16.
 */

angular.module('controllers').controller('SettingsController', function ($scope, GenericController, User, mainFactory) {

    function init() {
        GenericController.init($scope);
        $scope.user = {};
        $scope.removeHideClass('#settings-menu-icon');
    }

    $scope.logOut = function () {
        $scope.logout();
    };

    $scope.deleteAccount = function () {
        console.log("Are you sure you want to delete your account?");
    };

    init();
});