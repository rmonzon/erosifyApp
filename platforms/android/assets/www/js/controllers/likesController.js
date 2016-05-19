/**
 * Created by raul on 2/24/16.
 */

angular.module('controllers').controller('LikesController', function ($scope, GenericController, mainFactory, User) {

    function init() {
        GenericController.init($scope);
        $scope.listLikes = [];
        $scope.myLikes = [];
        $scope.loadingLikes = true;
        $scope.noResults = false;
        $scope.getListOfLikes();
    }

    $scope.getListOfLikes = function () {
        mainFactory.getWhoLikedMe({ my_id: User.getUser().id }).then(getMyLikesSuccess, getMyLikesError);
    };

    function getMyLikesSuccess(response) {
        for (var i = 0, len = response.data.likes.length; i < len; ++i) {
            response.data.likes[i].id = response.data.likes[i].user_one_id;
        }
        $scope.listLikes = $scope.parseDataFromDB(response.data.likes);
        convertDataForUI();
        if ($scope.listLikes.length == 0) {
            $scope.noResults = true;
        }
        $scope.loadingLikes = false;
    }

    function getMyLikesError(response) {
        $scope.showMessage(response.data.error, 2500);
        $scope.loadingLikes = false;
    }
    
    function convertDataForUI() {
        for (var i = 0, len = $scope.listLikes.length; i < len; i+=3) {
            $scope.myLikes.push($scope.listLikes.slice(i, i + 3));
        }
    }

    $scope.goToProfile = function (id) {
        $scope.goToPage('app/profile/' + id);
    };

    init();
});