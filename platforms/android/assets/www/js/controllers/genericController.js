/**
 * Created by raul on 1/7/16.
 */

angular.module('controllers').service('GenericController', function($ionicLoading, $location, $timeout, $http, $cordovaFacebook, User) {
    var $scope = null;

    this.init = function (_$scope) {
        $scope = _$scope;
        $scope.posRelative = {};

        $scope.goToPage = function (page) {
            $location.path('/' + page);
        };

        $scope.showMessageWithIcon = function(message, time) {
            $ionicLoading.show({
                duration: time,
                noBackdrop: true,
                template: '<p class="item-icon-left">' + message + '<ion-spinner icon="lines"/></p>'
            });
        };

        $scope.showMessage = function(message, time) {
            $ionicLoading.show({
                duration: time === 0 ? 1000000 : time,
                noBackdrop: true,
                template: '<p class="item-no-icon-left">' + message + '</p>'
            });
        };

        $scope.hideMessage = function() {
            $ionicLoading.hide();
        };

        $scope.logout = function() {
            User.setData({});
            $cordovaFacebook.logout()
                .then(function(success) {
                    $scope.showMessage("You've been logged out successfully.", 2000);
                }, function (error) {
                    $scope.showMessage(error, 2000);
                });
        };

        $scope.removeAbsPosition = function () {
            $scope.posRelative = {'position':'relative'};
        };

        $scope.addAbsPosition = function () {
            $scope.posRelative = {};
        };
    };
});