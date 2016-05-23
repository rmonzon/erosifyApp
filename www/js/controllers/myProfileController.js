/**
 * Created by raul on 4/1/16.
 */

angular.module('controllers').controller('MyProfileController', function ($scope, $timeout, $ionicSlideBoxDelegate, GenericController, User, mainFactory) {

    function init() {
        GenericController.init($scope);
        $scope.images = [];
        $scope.slideIndex = 0;
        $scope.user = {};
        $scope.editingProfile = false;
        $scope.getMyInfo();
        $scope.removeHideClass('#profile-menu-icon');
    }

    $scope.getMyInfo = function () {
        mainFactory.me({ "email": $scope.getUserFromLS() }).then(successCallback, errorCallback);
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
    
    $scope.enableEditProfile = function () {
        $scope.editingProfile = true;
    };

    function escapeInvalidChars(str) {
        return str.replace("'", "''");
    }

    $scope.saveProfileChanges = function () {
        var obj = {
            user_id: $scope.user.id,
            work: $scope.user.work ? escapeInvalidChars($scope.user.work) : "",
            education: $scope.user.education ? escapeInvalidChars($scope.user.education) : "",
            aboutme: $scope.user.aboutme ? escapeInvalidChars($scope.user.aboutme) : "",
            languages: $scope.user.languages ? "{" + $scope.user.languages + "}" : "{English}",
            looking_to: $scope.user.looking_to ? $scope.user.looking_to : null
        };
        mainFactory.updateUserInfo(obj).then(successUpdateUserInfo, errorUpdateUserInfo);
    };

    function successUpdateUserInfo(response) {
        $scope.showMessage("Profile update successfully!", 1500);
        $scope.editingProfile = false;
    }

    function errorUpdateUserInfo(response) {
        $scope.showMessage(response.data.error, 2500);
        $scope.editingProfile = false;
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