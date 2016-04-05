/**
 * Created by raul on 1/7/16.
 */

angular.module('controllers').service('GenericController', function($ionicLoading, $location, $timeout, $window, $cordovaFacebook, User) {
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

        $scope.logout = function () {
            $scope.removeUserFromLS();
            mainFactory.doLogOut({"email": $scope.getUserFromLS()}).then(successLogout, errorLogout);
        };

        function successLogout(response) {
            $scope.goToPage('login');
        }

        function errorLogout (response) {
            $scope.hideMessage();
            $scope.showMessage(response.data.error, 2500);
        }

        $scope.logoutFacebook = function() {
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

        $scope.validateEmail = function (email) {
            var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
            return re.test(email);
        };

        $scope.removeHideClass = function (id) {
            $timeout(function () {
                var classList = document.querySelector(id).className;
                document.querySelector(id).className = classList.replace('hide', '');
            }, 100);
        };

        $scope.setUserToLS = function(user_data) {
            $window.localStorage.setItem('userId', user_data);
            //$window.localStorage.starter_facebook_user = JSON.stringify(user_data);
        };

        $scope.getUserFromLS = function() {
            return $window.localStorage && $window.localStorage.getItem('userId');
            //return JSON.parse($window.localStorage.starter_facebook_user || window.localStorage.userLogin || '{}');
        };

        $scope.removeUserFromLS = function () {
            $window.localStorage.removeItem('userId');
        };
    };
});