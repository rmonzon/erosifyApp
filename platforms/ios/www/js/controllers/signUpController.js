/**
 * Created by raul on 1/5/16.
 */

angular.module('controllers').controller('SignUpController', function ($scope, GenericController) {

    function init() {
        GenericController.init($scope);
    }

    $scope.loginWithEmail = function() {

        $scope.goToPage('app/playlists');
    };

    init();
});