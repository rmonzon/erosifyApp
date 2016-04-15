angular.module('controllers', []).config(['$compileProvider', function($compileProvider) {
        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|file|blob|cdvfile):|data:image\//);
    }
]).controller('AppCtrl', function($scope, $timeout, User, GenericController) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    function init() {
        GenericController.init($scope);
        $scope.user = User.getUser();
        $scope.profile = {
            name: "Laura Ramos",
            age: 23,
            verified: true,
            online: true,
            location: "Miami, FL",
            languages: "English, Spanish",
            aboutMe: "Lorem ipsum dolor sit amet, conset cteur adisiping elit. Lorem ipsum dolor...",
            work_education: "Account Manager lorem ipsum dolor..."
        };
    }

    $scope.goToSettings = function (ev) {
        ev.stopPropagation();
        $scope.goToPage('app/settings');
    };

    init();
});
