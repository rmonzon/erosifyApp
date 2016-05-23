/**
 * Created by raul on 4/1/16.
 */

angular.module('controllers').controller('UserProfileController', function ($scope, $stateParams, $ionicPopover, $ionicPopup, $ionicSlideBoxDelegate, GenericController, User, mainFactory) {

    function init() {
        GenericController.init($scope);
        $scope.images = [];
        $scope.slideIndex = 0;
        $scope.user = {};
        $scope.report = { reason: "", comment: "", loading: false };
        $scope.commonFriends = [];
        $scope.profileLiked = false;
        $scope.profileDisLiked = false;
        $scope.getCommonFriends();
        $scope.numConnections = calculateNumConnections($scope.commonFriends);
        $scope.getUserInfoFromDB();
    }

    $scope.getUserInfoFromDB = function () {
        mainFactory.getUserInfo($stateParams.userId).then(successCallback, errorCallback);
    };

    function successCallback(response) {
        $scope.user = $scope.parseDataFromDB(response.data.data);
        $scope.user.distance = $scope.calculateDistanceToUser($scope.user);
        if ($scope.user.liked != undefined) {
            $scope.profileLiked = $scope.user.liked == 1;
            $scope.profileDisLiked = $scope.user.liked == 0;
        }
        $scope.markProfileAsVisited();
        $ionicSlideBoxDelegate.update();
    }

    function errorCallback(response) {
        $scope.showMessage(response.data.error, 2500);
        $scope.logout();
    }

    $scope.markProfileAsVisited = function () {
        mainFactory.markProfileVisited({ my_id: User.getUser().id, profile_id: $scope.user.id }).then(markProfileVisitedSuccess, markProfileVisitedError);
    };

    function markProfileVisitedSuccess(response) {
        console.log(response.data);
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
            console.log("It's a match!");
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
        //open chat window with that user
        $scope.goToPage('app/messages/' + $scope.user.id);
    };

    $scope.sendMessage = function () {
        //open chat window with that user
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
        $scope.commonFriends = [
            [
                [
                    { name: "Samantha", pic: ENV.AMAZON_S3 + "/profiles/user_20/1.jpg" },
                    { name: "Emily", pic: ENV.AMAZON_S3 + "/profiles/user_21/1.jpg" },
                    { name: "Jessica", pic: ENV.AMAZON_S3 + "/profiles/user_23/1.jpg" }
                ],
                [
                    { name: "Bethany", pic: ENV.AMAZON_S3 + "/profiles/user_27/1.jpg" },
                    { name: "Nathan", pic: ENV.AMAZON_S3 + "/profiles/user_28/1.jpg" },
                    { name: "Keith", pic: ENV.AMAZON_S3 + "/profiles/user_30/1.jpg" }
                ]
            ],
            [
                [
                    { name: "Lola", pic: ENV.AMAZON_S3 + "/profiles/user_26/1.jpg" },
                    { name: "Emily", pic: ENV.AMAZON_S3 + "/profiles/user_21/1.jpg" },
                    { name: "Jessica", pic: ENV.AMAZON_S3 + "/profiles/user_23/1.jpg" }
                ]
            ]
        ];
    };

    function calculateNumConnections() {
        var num = 0;
        for (var i = 0, len = $scope.commonFriends.length; i < len; ++i) {
            for (var j = 0, leng = $scope.commonFriends[i].length; j < leng; ++j) {
                for (var k = 0, lengt = $scope.commonFriends[i][j].length; k < lengt; ++k) {
                    num++;
                }
            }
        }
        return num;
    }
    
    init();
});