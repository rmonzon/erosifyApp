/**
 * Created by raul on 4/4/16.
 */

angular.module('controllers').controller('SettingsController', function ($scope, GenericController, $ionicPopup, mainFactory, User) {

    function init() {
        GenericController.init($scope);
        $scope.removeHideClass('#settings-menu-icon');
    }

    $scope.logOut = function () {
        $scope.logout();
    };

    $scope.deleteAccount = function () {
        $scope.deleteAccountPopup = $ionicPopup.show({
            templateUrl: 'templates/delete_account_dialog.html',
            cssClass: 'delete-photo-popup',
            scope: $scope
        });
    };

    $scope.deleteAccountPermanently = function () {
        mainFactory.deleteAccount({my_id: User.getUser().id}).then(deleteAccountSuccess, deleteAccountError);
    };

    function deleteAccountSuccess(response) {
        $scope.deleteAccountPopup.close();
        $scope.goToPage('home');
    }

    function deleteAccountError(response) {
        $scope.deleteAccountPopup.close();
        $scope.showMessage("There was something wrong, please try again.", 2500);
    }

    $scope.closeDeleteAccountConfirm = function () {
        $scope.deleteAccountPopup.close();
    };

    init();
});