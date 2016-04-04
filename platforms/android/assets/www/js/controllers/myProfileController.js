/**
 * Created by raul on 4/1/16.
 */

angular.module('controllers').controller('MyProfileController', function ($scope, $http, $timeout, $ionicSlideBoxDelegate, GenericController, User, mainFactory) {

    function init() {
        GenericController.init($scope);
        $scope.images = [];
        $scope.slideIndex = 0;
        $scope.user = {};
        $scope.getUserInfo();
    }

    $scope.getUserInfo = function () {
        //mainFactory.getUserInfo({ "email": User.getUser().email }).then(successCallback, errorCallback);
        mainFactory.getUserInfo({ "email": "raul@inceptures.com" }).then(successCallback, errorCallback);
    };

    function successCallback(response) {
        $scope.user = response.data.data;
        $scope.user.pictures = $scope.user.pictures.map(function (val) {
            return "img/" + val;
        });
        $ionicSlideBoxDelegate.update();
    }

    function errorCallback(response) {
        $scope.hideMessage();
        console.log(response);
        //$scope.showMessage(response.data.error, 2500);
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