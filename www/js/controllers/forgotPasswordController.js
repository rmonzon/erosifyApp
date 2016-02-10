/**
 * Created by raul on 2/4/16.
 */

angular.module('controllers').controller('ForgotPasswordController', function ($scope, GenericController) {
    function init() {
        $scope.email = "";
        GenericController.init($scope);
    }

    $scope.sendEmail = function () {
        console.log($scope.email);
    };

});

