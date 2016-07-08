/**
 * Created by raul on 2/24/16.
 */

angular.module('controllers').controller('LikesController', function ($scope, $rootScope, GenericController, mainFactory, User) {

    function init() {
        GenericController.init($scope);
        $scope.listLikes = [];
        $scope.myLikes = [];
        $scope.loadingLikes = true;
        $scope.noResults = false;
        $scope.loadingImg = true;
        $scope.loadingNum = 0;
        $scope.getListOfLikes();
    }

    $scope.getListOfLikes = function () {
        mainFactory.getWhoLikedMe({ my_id: User.getUser().id }).then(getMyLikesSuccess, getMyLikesError);
    };

    function getMyLikesSuccess(response) {
        $rootScope.notifications.new_likes = 0;
        for (var i = 0, len = response.data.likes.length; i < len; ++i) {
            response.data.likes[i].id = response.data.likes[i].user_one_id;
        }
        $scope.listLikes = $scope.parseDataFromDB(response.data.likes);
        $scope.myLikes = $scope.convertDataForUI($scope.listLikes);
        if ($scope.listLikes.length == 0) {
            $scope.noResults = true;
            $scope.loadingImg = false;
        }
        $scope.loadingLikes = false;
        $scope.$broadcast('scroll.refreshComplete');
    }

    function getMyLikesError(response) {
        $scope.showMessage(response.data.error, 2500);
        $scope.loadingLikes = false;
    }

    $scope.imageLoaded = function () {
        $scope.loadingNum++;
        if ($scope.loadingNum == $scope.listLikes.length) {
            $scope.loadingImg = false;
            $scope.loadingNum = 0;
        }
    };

    init();
});