/**
 * Created by raul on 5/2/16.
 */

angular.module('controllers').controller('SearchController', function ($scope, GenericController, mainFactory, User) {

    function init() {
        GenericController.init($scope);
        $scope.listResults = [];
        $scope.loadingResults = false;
        $scope.noResults = false;
        $scope.uiData = {};
    }

    $scope.getSearchResults = function () {
        console.log($scope.uiData.searchTerms);
        mainFactory.searchProfiles({ criteria: $scope.uiData.searchTerms, my_id: User.getUser().id }).then(getSearchResultsSuccess, getSearchResultsError);
    };

    function getSearchResultsSuccess(response) {
        $scope.listResults = $scope.parseDataFromDB(response.data.results);
        if ($scope.listResults.length == 0) {
            $scope.noResults = true;
        }
        $scope.loadingResults = false;
    }

    function getSearchResultsError(response) {
        $scope.showMessage(response.data.error, 2500);
        $scope.loadingResults = false;
    }

    $scope.goToProfile = function (id) {
        $scope.goToPage('app/profile/' + id);
    };

    init();
});