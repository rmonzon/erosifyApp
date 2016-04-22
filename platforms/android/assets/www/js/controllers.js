angular.module('controllers', []).controller('AppCtrl', function($scope, $timeout, User, GenericController) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    function init() {
        GenericController.init($scope);
        $scope.user = User.getUser();
    }

    $scope.goToSettings = function (ev) {
        ev.stopPropagation();
        $scope.goToPage('app/settings');
    };

    init();
});
