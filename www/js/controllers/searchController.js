/**
 * Created by raul on 5/2/16.
 */

angular.module('controllers').controller('SearchController', function ($scope, GenericController, mainFactory, User) {

    function init() {
        GenericController.init($scope);
        $scope.listResults = [];
        $scope.loadingResults = false;
        $scope.noResults = false;
        $scope.loadingNum = 0;
        $scope.uiData = {};
    }

    $scope.getSearchResults = function () {
        $scope.loadingResults = true;
        mainFactory.searchProfiles({ criteria: $scope.uiData.searchTerms, my_id: User.getUser().id }).then(getSearchResultsSuccess, getSearchResultsError);
    };

    function getSearchResultsSuccess(response) {
        $scope.listResults = $scope.parseDataFromDB(response.data.results);
        $scope.noResults = $scope.listResults.length == 0;
    }

    function getSearchResultsError(response) {
        $scope.showMessage(response.data.error, 2500);
        $scope.loadingResults = false;
    }

    $scope.imageLoaded = function () {
        $scope.loadingNum++;
        if ($scope.loadingNum == $scope.listResults.length) {
            $scope.loadingResults = false;
            $scope.loadingNum = 0;
        }
    };

    init();
});