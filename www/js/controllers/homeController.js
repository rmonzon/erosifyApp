/**
 * Created by raul on 1/5/16.
 */

angular.module('controllers').controller('HomeController', function ($scope, GenericController) {

    function init() {
        GenericController.init($scope);
        $scope.user = {};
    }

    $scope.sigUpWithFacebook = function () {
        
    };



    init();
});