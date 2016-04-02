/**
 * Created by raul on 2/3/16.
 */

angular.module('controllers').controller('MatchingController', function ($scope, GenericController) {

    function init() {
        GenericController.init($scope);
    }

    $scope.likeProfile = function () {
        console.log("You liked her!");
    };

    $scope.dislikeProfile = function () {
        console.log("You didn't like her!");
    };

    init();
});