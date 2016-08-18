/**
 * Created by raul on 2/24/16.
 */

angular.module('controllers').controller('MyMatchesController', function ($scope, $rootScope, GenericController, mainFactory, User) {

    function init() {
        GenericController.init($scope);
        $scope.listMatches = [];
        $scope.myMatches = [];
        $scope.loadingMatches = true;
        $scope.loadingImg = true;
        $scope.noResults = false;
        $scope.loadingNum = 0;
        $scope.getListMatches();
    }

    $scope.getListMatches = function () {
        mainFactory.getMyMatches({ my_id: User.getUser().id }).then(getMyMatchesSuccess, getMyMatchesError);
    };

    function getMyMatchesSuccess(response) {
        $rootScope.notifications.new_matches = 0;
        $scope.listMatches = $scope.parseDataFromDB(response.data.matches);
        $scope.myMatches = $scope.convertDataForUI($scope.listMatches);
        $scope.noResults = false;
        if ($scope.listMatches.length == 0) {
            $scope.noResults = true;
            $scope.loadingImg = false;
        }
        $scope.loadingMatches = false;
        $scope.$broadcast('scroll.refreshComplete');
    }

    function getMyMatchesError(response) {
        $scope.showMessage(response.data.error, 2500);
        $scope.loadingMatches = false;
    }

    $scope.imageLoaded = function () {
        $scope.loadingNum++;
        if ($scope.loadingNum == $scope.listMatches.length) {
            $scope.loadingImg = false;
            $scope.loadingNum = 0;
        }
    };

    init();
});