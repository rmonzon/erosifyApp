/**
 * Created by raul on 2/3/16.
 */

angular.module('controllers').controller('MatchingController', function ($scope, $ionicSlideBoxDelegate, GenericController, mainFactory) {

    function init() {
        GenericController.init($scope);
        $scope.listMatches = [];
        $scope.loadingMatches = true;
        $scope.posProfile = 0;
        $scope.getListOfMatches();
    }

    $scope.getListOfMatches = function () {
        mainFactory.getMatchesByUser({ "email": $scope.getUserFromLS() }).then(getMatchesSuccess, getMatchesError);
    };

    function getMatchesSuccess(response) {
        console.log(response.data.matches);
        $scope.listMatches = $scope.parseDataFromDB(response.data.matches);
        if ($scope.listMatches[0]) {
            $scope.currentProfile = $scope.listMatches[0];
        }
        else {
            //handle error when there are no results to show
        }
        $scope.loadingMatches = false;
    }

    function getMatchesError(response) {
        $scope.showMessage(response.data.error, 2500);
        $scope.loadingMatches = false;
    }

    $scope.likeProfile = function () {
        console.log("You liked her!");
        $scope.posProfile++;
        $scope.currentProfile = $scope.listMatches[$scope.posProfile];
        //store LIKE in the BD
    };

    $scope.dislikeProfile = function () {
        console.log("You didn't like her!");
        $scope.posProfile++;
        $scope.currentProfile = $scope.listMatches[$scope.posProfile];
        //store DISLIKE in the BD
    };

    $scope.skipProfile = function () {

    };

    $scope.goPreviousProfile = function () {

    };

    $scope.goToProfile = function () {
        //count current user as a visitor
    };

    $scope.seeMorePics = function () {
        //open up the gallery with all user's photos
    };


    $scope.nextPic = function() {
        $ionicSlideBoxDelegate.next();
    };

    $scope.previousPic = function() {
        $ionicSlideBoxDelegate.previous();
    };

    // Called each time the slide changes
    $scope.slideChanged = function(index) {
        $scope.slideIndex = index;
    };

    init();
});