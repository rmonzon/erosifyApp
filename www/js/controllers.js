angular.module('controllers', []).controller('AppCtrl', function($scope, User, GenericController, mainFactory) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    function init() {
        GenericController.init($scope);
        $scope.user = User.getUser();
        $scope.notifications = { unreadMessages: 0 };
        
        $scope.getNotifications();
    }

    $scope.goToSettings = function (ev) {
        ev.stopPropagation();
        $scope.goToPage('app/settings');
    };

    $scope.getNotifications = function () {
        mainFactory.getNewNotifications().then(getNewNotificationsSuccess, getNewNotificationsError);
    };

    function getNewNotificationsSuccess(response) {
        console.log(response.data.notifications);
        $scope.notifications.unreadMessages = response.data.notifications;
    }

    function getNewNotificationsError(response) {
        $scope.showMessage(response.data.error, 2500);
    }

    init();
});
