/**
 * Created by raul on 2/24/16.
 */

angular.module('controllers').controller('PeopleNearbyController', function ($scope, $timeout, GenericController) {

    function init() {
        GenericController.init($scope);
        $scope.matches = [
            [
                {name: 'Amanda', id: 1, distance: "0.2 mi", online: false,verified: false,  pic: "img/avatar.png"},
                {name: 'Jennifer', id: 2, distance: "4.5 mi", online: true,verified: false,  pic: "img/profile.png"},
                {name: 'rigoberta', id: 3, distance: "1.3 mi", online: false,verified: true,  pic: "img/avatar.png"}
            ],
            [
                {name: 'Diana', id: 4, distance: "1.3 mi", online: false,verified: false,  pic: "img/avatar.png"},
                {name: 'Samantha', id: 5, distance: "1.4 mi", online: true,verified: true,  pic: "img/avatar.png"},
                {name: 'April', id: 6, distance: "0.3 mi", online: false,verified: false,  pic: "img/avatar.png"}
            ],
            [
                {name: 'Amanda', id: 1, distance: "4.0 mi", online: false,verified: false,  pic: "img/avatar.png"},
                {name: 'Jennifer', id: 2, distance: "8.1 mi", online: true,verified: false,  pic: "img/profile.png"},
                {name: 'Lucy', id: 3, distance: "2.0 mi", online: false,verified: false,  pic: "img/avatar.png"}
            ],
            [
                {name: 'Diana', id: 4, distance: "1.3 mi", online: false,verified: false,  pic: "img/avatar.png"},
                {name: 'Samantha', id: 5, distance: "1.3 mi", online: true,verified: false,  pic: "img/avatar.png"},
                {name: 'April', id: 6, distance: "1.3 mi", online: false,verified: false,  pic: "img/avatar.png"}
            ]
        ];
        $scope.totalFound = $scope.matches.length;
        $scope.searching = true;
        $scope.findPeopleNearby();
    }

    $scope.findPeopleNearby = function () {
        $timeout(function () {
            $scope.searching = false;
        }, 3000);
    };

    $scope.goToProfile = function (name) {
        console.log("go to profile " + name);
    };

    init();
});