/**
 * Created by raul on 4/1/16.
 */

angular.module('controllers').controller('UserProfileController', function ($scope, $stateParams, $ionicPopover, $ionicPopup, $ionicSlideBoxDelegate, GenericController, socket, User, mainFactory) {

    function init() {
        GenericController.init($scope);
        $scope.images = [];
        $scope.slideIndex = 0;
        $scope.user = {};
        $scope.report = { reason: "", comment: "", loading: false };
        $scope.commonFriends = [];
        $scope.profileLiked = false;
        $scope.profileDisLiked = false;
        $scope.loadingProfile = true;
        $scope.loadingFriends = false;
        $scope.loadingProfilePics = true;
        $scope.loadingNum = 0;
        $scope.numConnections = 0;
        $scope.getUserInfoFromDB();
    }

    $scope.getUserInfoFromDB = function () {
        socket.emit('new visitor notif', {
            user_id: $stateParams.userId,
            name: User.getUser().name,
            picture: User.getUser().photos[0]
        });
        mainFactory.getUserInfo($stateParams.userId).then(successCallback, errorCallback);
    };

    function successCallback(response) {
        $scope.user = $scope.parseDataFromDB(response.data.data);
        $scope.user.distance = $scope.calculateDistanceToUser($scope.user);
        if ($scope.user.liked != undefined) {
            $scope.profileLiked = $scope.user.liked == 1;
            $scope.profileDisLiked = $scope.user.liked == 0;
        }
        $scope.loadingProfile = false;
        $scope.markProfileAsVisited();
        $scope.getCommonFriends();
        $ionicSlideBoxDelegate.update();
    }

    function errorCallback(response) {
        $scope.loadingProfile = false;
        $scope.showMessage(response.data.error, 2500);
        $scope.logout();
    }

    $scope.markProfileAsVisited = function () {
        mainFactory.markProfileVisited({ my_id: User.getUser().id, profile_id: $scope.user.id }).then(markProfileVisitedSuccess, markProfileVisitedError);
    };

    function markProfileVisitedSuccess(response) {
        
    }

    function markProfileVisitedError(response) {
        $scope.showMessage(response.data.error, 2500);
    }

    $scope.likeUserProfile = function (event) {
        $scope.profileLiked = true;
        $scope.profileDisLiked = false;
        setLikeOrDislike(1, event);
    };

    $scope.dislikeUserProfile = function () {
        $scope.profileLiked = false;
        $scope.profileDisLiked = true;
        setLikeOrDislike(0);
    };

    function setLikeOrDislike(liked) {
        mainFactory.saveLikeOrDislike({ my_id: User.getUser().id, other_id: $scope.user.id, liked: liked }).then(saveLikeOrDislikeSuccess, saveLikeOrDislikeError);
    }

    function saveLikeOrDislikeSuccess(response) {
        if (response.data.isMatch) {
            $scope.userProfile = User.getUser();
            $scope.currentProfile = $scope.user;
            socket.emit('new match notif', {
                user_id: $scope.user.id,
                name: User.getUser().name,
                picture: User.getUser().photos[0]
            });
            $scope.showMutualMatchMsg();
        }
    }

    function saveLikeOrDislikeError(response) {
        $scope.showMessage(response.data.error, 2500);
    }

    $scope.showMutualMatchMsg = function() {
        $scope.data = {};
        $scope.mutualMatchPopup = $ionicPopup.show({
            templateUrl: 'templates/mutual_match.html',
            cssClass: 'is-match-popup',
            scope: $scope
        });
    };

    $scope.addRemoveFavorite = function () {
        $scope.user.favorite = !$scope.user.favorite;
        if ($scope.user.favorite) {
            addUserToFavs();
        }
        else {
            removeUserFromFavs();
        }
    };

    function addUserToFavs() {
        mainFactory.makeUserFavorite({ my_id: User.getUser().id, profile_id: $scope.user.id }).then(makeUserFavoriteSuccess, makeUserFavoriteError);
    }

    function removeUserFromFavs() {
        mainFactory.removeUserFromFavorite({ my_id: User.getUser().id, profile_id: $scope.user.id }).then(removeUserFavoriteSuccess, removeUserFavoriteError);
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

    $scope.sendMessageToUser = function () {
        if ($scope.mutualMatchPopup) {
            $scope.mutualMatchPopup.close();
        }
        $scope.goToPage('app/messages/' + $scope.user.id);
    };

    $scope.closePopup = function () {
        $scope.mutualMatchPopup.close();
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

    $scope.openReportDialog = function () {
        $scope.reportPopup = $ionicPopup.show({
            templateUrl: 'templates/report_dialog.html',
            cssClass: 'is-match-popup',
            scope: $scope
        });
    };

    $scope.closeReportPopup = function () {
        $scope.reportPopup.close();
        $scope.popover.hide();
    };

    $scope.reportUser = function () {
        $scope.report.loading = true;
        var r = { my_id: User.getUser().id, profile_id: $scope.user.id, reason: $scope.report.reason, comments: $scope.report.comment };
        mainFactory.reportUserProfile(r).then(reportUserSucess, reportUserError);
    };

    function reportUserSucess(response) {
        $scope.report = { reason: "", comment: "", loading: false };
        $scope.closeReportPopup();
        $scope.showMessage("User reported successfully!", 1500);
    }

    function reportUserError(response) {
        $scope.report = { reason: "", comment: "", loading: false };
        $scope.closeReportPopup();
        $scope.showMessage(response.data.error, 2500);
    }

    $scope.onSelectionChange = function () {
        $scope.report.showHiddenText = $scope.report.reason == "Other Reason";
    };

    $ionicPopover.fromTemplateUrl('templates/popover.html', {
        scope: $scope
    }).then(function(popover) {
        $scope.popover = popover;
    });

    $scope.getCommonFriends = function () {
        $scope.loadingFriends = true;
        mainFactory.getCommonFriends($scope.user.id).then(getCommonFriendsSuccess, getCommonFriendsError);
    };

    function getCommonFriendsSuccess(response) {
        $scope.loadingFriends = false;
        $scope.numConnections = response.data.total;
        $scope.commonFriends = convertCommonFriendsForUI(response.data.commonFriends);
    }

    function getCommonFriendsError(response) {
        $scope.loadingFriends = false;
        $scope.showMessage(response.data, 2000);
        console.log(response);
    }

    $scope.imageLoaded = function () {
        $scope.loadingNum++;
        if ($scope.loadingNum == $scope.user.photos.length) {
            $scope.loadingProfilePics = false;
            $scope.loadingNum = 0;
        }
    };

    function convertCommonFriendsForUI(array) {
        var res = [[]];
        for (var i = 0, j = 0; i < array.length; i+=3) {
            if (i % 6 === 0 && i > 0) {
                j++;
                res.push([]);
            }
            res[j].push(array.slice(i, i + 3));
        }
        return res;
    }
    
    init();
});