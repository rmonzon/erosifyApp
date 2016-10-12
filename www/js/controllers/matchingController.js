/**
 * Created by raul on 2/3/16.
 */

angular.module('controllers').controller('MatchingController', function ($scope, $ionicSlideBoxDelegate, $ionicModal, $ionicPopup, GenericController, socket, User, mainFactory) {

    function init() {
        GenericController.init($scope);
        $scope.listMatches = [];
        $scope.loadingMatches = true;
        $scope.loadingProfileImg = true;
        $scope.posProfile = 0;
        $scope.userProfile = User.getUser();
        $scope.filters = {
            miles: 30,
            ageMin: 18,
            ageMax: 55,
            ageFrom: 18,
            ageTo: 35,
            gender: {'Female' : $scope.userProfile.gender == 'Male', 'Male': $scope.userProfile.gender == 'Female'},
            interest: $scope.userProfile.looking_to
        };
        var pageLoad = {
            "id": $scope.userProfile.id,
            "email": $scope.getUserFromLS().email,
            "gender": $scope.userProfile.gender,
            "looking_to": $scope.filters.interest,
            "ages": { ageFrom: $scope.filters.ageFrom, ageTo: $scope.filters.ageTo }
        };
        $scope.getListOfMatches(pageLoad);
    }

    $scope.getListOfMatches = function (filters) {
        $scope.loadingMatches = true;
        $scope.posProfile = 0;
        $scope.loadingProfileImg = true;
        mainFactory.getMatchesByUser(filters).then(getMatchesSuccess, getMatchesError);
    };

    function getMatchesSuccess(response) {
        $scope.listMatches = $scope.parseDataFromDB(response.data.matches);
        $scope.listMatches = filterMatchesByDistance();
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
        if ($scope.filters.miles == 100) {
            return $scope.listMatches;
        }
        else {
            return $scope.listMatches.filter(function (elem) {
                var dist = $scope.calculateDistanceToUser(elem);
                return $scope.filters.miles >= dist;
            });
        }
    }

    $scope.likeProfile = function () {
        $scope.loadingProfileImg = true;
        $scope.listMatches[$scope.posProfile].profileLiked = true;
        $scope.listMatches[$scope.posProfile].profileDisLiked = false;
        setLikeOrDislike(1);
    };

    $scope.dislikeProfile = function () {
        $scope.loadingProfileImg = true;
        $scope.listMatches[$scope.posProfile].profileLiked = false;
        $scope.listMatches[$scope.posProfile].profileDisLiked = true;
        setLikeOrDislike(0);
    };

    $scope.skipProfile = function () {
        $scope.loadingProfileImg = true;
        if ($scope.posProfile < $scope.listMatches.length - 1) {
            $scope.posProfile++;
            $scope.currentProfile = $scope.listMatches[$scope.posProfile];
        }
    };

    $scope.goPreviousProfile = function () {
        $scope.loadingProfileImg = true;
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

    $scope.openPicFullScreen = function (index) {
        $ionicSlideBoxDelegate.slide(index);
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
            socket.emit('new match notif', {
                user_id: $scope.currentProfile.id,
                name: $scope.currentProfile.name,
                picture: $scope.currentProfile.photos[0]
            });
            $scope.showMutualMatchMsg();
        }
        else {
            $scope.posProfile++;
            if ($scope.posProfile < $scope.listMatches.length) {
                $scope.currentProfile = $scope.listMatches[$scope.posProfile];
            }
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
            "email": $scope.getUserFromLS().email,
            "ages": { ageFrom: $scope.filters.ageFrom, ageTo: $scope.filters.ageTo }
        };
        if ($scope.filters.interest) {
            filters.looking_to = $scope.filters.interest;
        }
        if (!$scope.filters.gender['Male'] || !$scope.filters.gender['Female']) {
            filters.gender = $scope.filters.gender['Male'] ? 'Male' : 'Female';
        }
        $scope.getListOfMatches(filters);
        $scope.closeModal();
    };

    $scope.selectGender = function(option) {
        $scope.filters.gender[option] = !$scope.filters.gender[option];
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

    $scope.sendMessageToUser = function () {
        $scope.mutualMatchPopup.close();
        $scope.goToPage('app/messages/' + $scope.currentProfile.id);
    };

    $scope.imageLoaded = function () {
        $scope.loadingProfileImg = false;
    };

    init();
});