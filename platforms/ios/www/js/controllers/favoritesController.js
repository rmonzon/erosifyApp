/**
 * Created by raul on 2/24/16.
 */

angular.module('controllers').controller('FavoritesController', function ($scope, GenericController, mainFactory, User) {

    function init() {
        GenericController.init($scope);
        $scope.listFavorites = [];
        $scope.loadingFavs = true;
        $scope.noResults = false;
        $scope.loadingNum = 0;
        $scope.getListOfFavorites();
    }

    $scope.getListOfFavorites = function () {
        mainFactory.getFavoritesByUser({ profile_id: User.getUser().id }).then(getFavoritesSuccess, getFavoritesError);
    };

    function getFavoritesSuccess(response) {
        $scope.listFavorites = $scope.parseDataFromDB(response.data.favorites);
        if ($scope.listFavorites.length == 0) {
            $scope.noResults = true;
            $scope.loadingFavs = false;
        }
    }

    function getFavoritesError(response) {
        $scope.showMessage(response.data.error, 2500);
        $scope.loadingFavs = false;
    }

    $scope.imageLoaded = function () {
        $scope.loadingNum++;
        if ($scope.loadingNum == $scope.listFavorites.length) {
            $scope.loadingFavs = false;
            $scope.loadingNum = 0;
        }
    };

    init();
});