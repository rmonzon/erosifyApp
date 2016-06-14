/**
 * Created by raul on 2/24/16.
 */

angular.module('controllers').controller('MyMatchesController', function ($scope, GenericController, mainFactory, User) {

    function init() {
        GenericController.init($scope);
        $scope.listMatches = [];
        $scope.myMatches = [];
        $scope.loadingMatches = true;
        $scope.noResults = false;
        $scope.getListMatches();
    }

    $scope.getListMatches = function () {
        mainFactory.getMyMatches({ my_id: User.getUser().id }).then(getMyMatchesSuccess, getMyMatchesError);
    };

    function getMyMatchesSuccess(response) {
        $scope.listMatches = $scope.parseDataFromDB(response.data.matches);
        $scope.myMatches = $scope.convertDataForUI($scope.listMatches);
        if ($scope.listMatches.length == 0) {
            $scope.noResults = true;
        }
        $scope.loadingMatches = false;
    }

    function getMyMatchesError(response) {
        $scope.showMessage(response.data.error, 2500);
        $scope.loadingMatches = false;
    }

    init();
});