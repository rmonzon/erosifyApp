/**
 * Created by raul on 2/24/16.
 */

angular.module('controllers').controller('FavoritesController', function ($scope, GenericController) {

    function init() {
        GenericController.init($scope);
        $scope.matches = [
                {name: 'Amanda', id: 1, age: "23", online: false,verified: false,  pic: "img/avatar.png"},
                {name: 'Jennifer', id: 2, age: "27", online: true,verified: false,  pic: "img/profile.png"},
                {name: 'Ashley', id: 3, age: "19", online: false,verified: false,  pic: "img/avatar.png"},
                {name: 'Diana', id: 4, age: "31", online: false,verified: true,  pic: "img/avatar.png"},
                {name: 'Samantha', id: 5, age: "28", online: true,verified: false,  pic: "img/avatar.png"},
                {name: 'April', id: 6, age: "25", online: false,verified: true,  pic: "img/avatar.png"}
        ];
    }

    $scope.goToProfile = function (name) {
        console.log("go to profile " + name);
    };

    init();
});