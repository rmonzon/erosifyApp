/**
 * Created by raul on 2/3/16.
 */

angular.module('controllers').controller('MatchingController', function ($scope, $ionicSlideBoxDelegate, $ionicModal, $ionicPopup, GenericController, User, mainFactory) {

    function init() {
        GenericController.init($scope);
        $scope.listMatches = [];
        $scope.loadingMatches = true;
        $scope.posProfile = 0;
        $scope.userProfile = User.getUser();
        $scope.filters = { miles: 30, ageMin: 18, ageMax: 55, from: 18, to: 40, gender: 'Women', interest: "Date" };
        $scope.getListOfMatches();
    }

    $scope.getListOfMatches = function () {
        mainFactory.getMatchesByUser({ "email": $scope.getUserFromLS() }).then(getMatchesSuccess, getMatchesError);
    };

    function getMatchesSuccess(response) {
        //console.log(response.data.matches);
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

    $scope.likeProfile = function (event) {
        setLikeOrDislike(1, event);
    };

    $scope.dislikeProfile = function () {
        setLikeOrDislike(0);
    };

    $scope.skipProfile = function () {
        if ($scope.posProfile < $scope.listMatches.length - 1) {
            $scope.posProfile++;
            $scope.currentProfile = $scope.listMatches[$scope.posProfile];
        }
    };

    $scope.goPreviousProfile = function () {
        if ($scope.posProfile > 0) {
            $scope.posProfile--;
            $scope.currentProfile = $scope.listMatches[$scope.posProfile];
            //make sure to undo the LIKE or DISLIKE for this user
        }
    };

    $scope.goToProfile = function () {
        //count current user as a visitor
    };

    $scope.seeMorePics = function () {
        //open up the gallery with all user's photos
    };

    $scope.markUserAsFavorite = function () {
        $scope.currentProfile.favorite = !$scope.currentProfile.favorite;
        mainFactory.makeUserFavorite({ my_id: User.getUser().id, profile_id: $scope.currentProfile.id }).then(makeUserFavoriteSuccess, makeUserFavoriteError);
    };

    function setLikeOrDislike(liked) {
        mainFactory.saveLikeOrDislike({ my_id: User.getUser().id, other_id: $scope.currentProfile.id, liked: liked }).then(saveLikeOrDislikeSuccess, saveLikeOrDislikeError);
    }

    function saveLikeOrDislikeSuccess(response) {
        if (response.data.isMatch) {
            console.log("It's a match!");
            $scope.showMutualMatchMsg();
        }
        else {
            $scope.posProfile++;
            $scope.currentProfile = $scope.listMatches[$scope.posProfile];
        }
    }

    function saveLikeOrDislikeError(response) {
        $scope.showMessage(response.data.error, 2500);
    }

    function makeUserFavoriteSuccess(response) {
        $scope.showMessage("User added to favorites", 1000);
    }

    function makeUserFavoriteError(response) {
        $scope.showMessage(response.data.error, 2500);
    }

    $scope.openFilterOptions = function () {
        $scope.modal.show();
    };

    $ionicModal.fromTemplateUrl('templates/modal.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
    });

    $scope.applyFilters = function () {
        
        $scope.modal.hide();
    };

    $scope.closeModal = function() {
        $scope.modal.hide();
    };

    $scope.showMutualMatchMsg = function() {
        $scope.data = {};
        $scope.mutualMatchPopup = $ionicPopup.show({
            templateUrl: 'templates/mutual_match.html',
            cssClass: 'is-match-popup',
            scope: $scope
        });
    };

    $scope.sendMessage = function () {
        //open chat window with that user
    };

    $scope.closePopup = function () {
        $scope.mutualMatchPopup.close();
        $scope.posProfile++;
        $scope.currentProfile = $scope.listMatches[$scope.posProfile];
    };



    init();
});