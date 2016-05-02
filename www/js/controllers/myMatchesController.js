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
        convertDataForUI();
        if ($scope.listMatches.length == 0) {
            $scope.noResults = true;
        }
        $scope.loadingMatches = false;
    }

    function getMyMatchesError(response) {
        $scope.showMessage(response.data.error, 2500);
        $scope.loadingMatches = false;
    }

    function convertDataForUI() {
        for (var i = 0, len = $scope.listMatches.length; i < len; i+=3) {
            $scope.myMatches.push($scope.listMatches.slice(i, i + 3));
        }
    }

    $scope.goToProfile = function (id) {
        $scope.goToPage('app/profile/' + id);
    };

    init();
});