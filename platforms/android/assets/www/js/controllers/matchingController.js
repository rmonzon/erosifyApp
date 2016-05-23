/**
 * Created by raul on 2/3/16.
 */

angular.module('controllers').controller('MatchingController', function ($scope, $ionicSlideBoxDelegate, $ionicModal, $ionicPopup, GenericController, User, mainFactory) {

    function init() {
        GenericController.init($scope);
        $scope.listMatches = [];
        $scope.loadingMatches = true;
        $scope.loadingProfileImg = true;
        $scope.thumbnails = [{id: 1, url: "img/avatar.png"}, {id: 2, url: "img/avatar.png"}, {id: 3, url: "img/avatar.png"}, {id: 4, url: "img/avatar.png"}, {id: 5, url: "img/avatar.png"}, {id: 6, url: "img/avatar.png"}, {id: 7, url: "img/avatar.png"}, {id: 8, url: "img/avatar.png"}, {id: 9, url: "img/avatar.png"}];
        $scope.pictures = [{id: 1, url: "img/girl1.jpg"}, {id: 2, url: "img/girl2.jpg"}, {id: 3, url: "img/girl3.jpg"}, {id: 4, url: "img/girl4.jpg"}];
        $scope.posProfile = 0;
        $scope.userProfile = User.getUser();
        $scope.filters = {
            miles: 30,
            ageMin: 18,
            ageMax: 55,
            ageFrom: 18,
            ageTo: 35,
            gender: $scope.userProfile.gender == 'Male' ? 'Female' : 'Male',
            interest: $scope.userProfile.looking_to
        };
        var pageLoad = {
            "id": $scope.userProfile.id,
            "email": $scope.getUserFromLS(),
            "gender": $scope.filters.gender,
            "looking_to": $scope.filters.interest,
            "ages": { ageFrom: $scope.filters.ageFrom, ageTo: $scope.filters.ageTo }
        };
        $scope.getListOfMatches(pageLoad);
    }

    $scope.getListOfMatches = function (filters) {
        $scope.loadingMatches = true;
        mainFactory.getMatchesByUser(filters).then(getMatchesSuccess, getMatchesError);
    };

    function getMatchesSuccess(response) {
        $scope.listMatches = $scope.parseDataFromDB(response.data.matches);
        $scope.listMatches = filterMatchesByDistance();
        console.log($scope.listMatches);
        if ($scope.listMatches[0]) {
            $scope.currentProfile = $scope.listMatches[0];
        }
        $scope.loadingMatches = false;
    }

    function getMatchesError(response) {
        $scope.showMessage(response.data.error, 2500);
        $scope.loadingMatches = false;
    }

    function filterMatchesByDistance() {
        return $scope.listMatches.filter(function (elem) {
            return $scope.filters.miles >= $scope.calculateDistanceToUser(elem);
        });
    }

    $scope.likeProfile = function () {
        setLikeOrDislike(1);
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

    $scope.goToUserProfile = function () {
        $scope.goToPage('app/profile/' + $scope.currentProfile.id);
    };

    $scope.seeMorePics = function () {
        //open up the gallery with all user's photos
        $scope.modalGallery.show();
    };

    $ionicModal.fromTemplateUrl('templates/gallery_grid.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalGallery = modal;
    });

    $scope.closeGallery = function () {
        $scope.modalGallery.hide();
    };

    $ionicModal.fromTemplateUrl('templates/gallery_fullscreen.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalGalleryFullScreen = modal;
    });

    $scope.closeGalleryFullScreen = function () {
        $scope.modalGalleryFullScreen.hide();
    };

    $scope.openPicFullScreen = function () {
        $scope.modalGalleryFullScreen.show();
    };

    $scope.markUserAsFavorite = function () {
        $scope.currentProfile.favorite = !$scope.currentProfile.favorite;
        mainFactory.makeUserFavorite({ my_id: User.getUser().id, profile_id: $scope.currentProfile.id }).then(makeUserFavoriteSuccess, makeUserFavoriteError);
    };

    $scope.addRemoveFavorite = function () {
        $scope.currentProfile.favorite = !$scope.currentProfile.favorite;
        if ($scope.currentProfile.favorite) {
            addUserToFavs();
        }
        else {
            removeUserFromFavs();
        }
    };

    function addUserToFavs() {
        mainFactory.makeUserFavorite({ my_id: User.getUser().id, profile_id: $scope.currentProfile.id }).then(makeUserFavoriteSuccess, makeUserFavoriteError);
    }

    function removeUserFromFavs() {
        mainFactory.removeUserFromFavorite({ my_id: User.getUser().id, profile_id: $scope.currentProfile.id }).then(removeUserFavoriteSuccess, removeUserFavoriteError);
    }

    function makeUserFavoriteSuccess(response) {
        $scope.showMessage("User added to favorites", 1000);
    }

    function makeUserFavoriteError(response) {
        $scope.showMessage(response.data.error, 2500);
    }

    function removeUserFavoriteSuccess(response) {
        $scope.showMessage("User removed from favorites", 1000);
    }

    function removeUserFavoriteError(response) {
        $scope.showMessage(response.data.error, 2500);
    }

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

    $scope.openFilterOptions = function () {
        $scope.modalFilters.show();
    };

    $ionicModal.fromTemplateUrl('templates/matching_filters.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalFilters = modal;
    });

    $scope.applyFilters = function () {
        var filters = {
            "id": $scope.userProfile.id,
            "email": $scope.getUserFromLS(),
            "looking_to": $scope.filters.interest,
            "ages": { ageFrom: $scope.filters.ageFrom, ageTo: $scope.filters.ageTo }
        };
        if ($scope.filters.gender != "Everyone") {
            filters.gender = $scope.filters.gender;
        }
        $scope.getListOfMatches(filters);
        $scope.closeModal();
    };

    $scope.closeModal = function() {
        $scope.modalFilters.hide();
    };

    $scope.showMutualMatchMsg = function() {
        $scope.mutualMatchPopup = $ionicPopup.show({
            templateUrl: 'templates/mutual_match.html',
            cssClass: 'is-match-popup',
            scope: $scope
        });
    };

    $scope.closePopup = function () {
        $scope.mutualMatchPopup.close();
        $scope.posProfile++;
        $scope.currentProfile = $scope.listMatches[$scope.posProfile];
    };

    $scope.imageLoaded = function () {
        $scope.loadingProfileImg = false;
    };

    init();
});