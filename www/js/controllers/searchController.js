/**
 * Created by raul on 5/2/16.
 */

angular.module('controllers').controller('SearchController', function ($scope, $timeout, GenericController, mainFactory, User) {

    function init() {
        GenericController.init($scope);
        $scope.listResults = [];
        $scope.loadingResults = false;
        $scope.noResults = false;
        $scope.loadingImg = false;
        $scope.loadingNum = 0;
        $scope.uiData = {};
        $scope.heightScroll = window.innerHeight - 110;
    }

    $scope.getSearchResults = function () {
        document.getElementById('search-input').blur();
        $scope.loadingResults = true;
        $scope.loadingImg = true;
        $scope.noResults = false;
        mainFactory.searchProfiles({ criteria: $scope.uiData.searchTerms, my_id: User.getUser().id }).then(getSearchResultsSuccess, getSearchResultsError);
    };

    function getSearchResultsSuccess(response) {
        $scope.listResults = $scope.parseDataFromDB(response.data.results);
        if ($scope.listResults.length == 0) {
            $scope.noResults = true;
            $scope.loadingImg = false;
        }
        $scope.loadingResults = false;
    }

    function getSearchResultsError(response) {
        $scope.showMessage(response.data.error, 2500);
        $scope.loadingResults = false;
    }

    $scope.imageLoaded = function () {
        $scope.loadingNum++;
        if ($scope.loadingNum == $scope.listResults.length) {
            $scope.loadingImg = false;
            $scope.loadingNum = 0;
        }
    };

    $scope.loadMoreResults = function () {
        console.log("loading more results");
        $timeout(function () {
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }, 1000);
    };

    // $scope.$on('$stateChangeSuccess', function() {
    //     $scope.loadMoreResults();
    // });

    $scope.moreDataCanBeLoaded = function () {
        return false;
    };

    init();
});