/**
 * Created by raul on 4/1/16.
 */

angular.module('controllers').controller('MyProfileController', function ($scope, $timeout, $ionicSlideBoxDelegate, GenericController, User, mainFactory) {

    function init() {
        GenericController.init($scope);
        $scope.images = [];
        $scope.slideIndex = 0;
        $scope.user = {};
        $scope.getUserInfo();
        $scope.removeHideClass('#profile-menu-icon');
    }

    $scope.getUserInfo = function () {
        mainFactory.getUserInfo({ "email": $scope.getUserFromLS() }).then(successCallback, errorCallback);
    };

    function successCallback(response) {
        response.data.data = $scope.parseDataFromDB(response.data.data);
        User.setUser(response.data.data);
        $scope.user = User.getUser();
        $ionicSlideBoxDelegate.update();
    }

    function errorCallback(response) {
        $scope.showMessage(response.data.error, 2500);
        $scope.logout();
    }

    $scope.nextPic = function() {
        $ionicSlideBoxDelegate.next();
    };

    $scope.previousPic = function() {
        $ionicSlideBoxDelegate.previous();
    };

    // Called each time the slide changes
    $scope.slideChanged = function(index) {
        $scope.slideIndex = index;
    };
    
    init();
});