/**
 * Created by raul on 2/25/16.
 */

angular.module('controllers').controller('VisitorsController', function ($scope, GenericController) {
    function init() {
        GenericController.init($scope);
        $scope.matches = [
            [
                {name: 'Amanda', id: 1, date: "14/02/2016", online: false, new: false,verified: true,  pic: "img/avatar.png"},
                {name: 'Jennifer', id: 2, date: "02/19/2016", online: true, new: true,verified: false,  pic: "img/profile.png"},
                {name: 'rigoberta', id: 3, date: "01/24/2016", online: false, new: true,verified: true,  pic: "img/avatar.png"}
            ],
            [
                {name: 'Diana', id: 4, date: "Yesterday", online: false, new: false,verified: true,  pic: "img/avatar.png"},
                {name: 'Samantha', id: 5, date: "12/23/2015", online: true, new: true,verified: true,  pic: "img/avatar.png"},
                {name: 'April', id: 6, date: "02/14/2016", online: false, new: false,verified: false,  pic: "img/avatar.png"}
            ],
            [
                {name: 'Amanda', id: 1, date: "14/02/2016", online: false, new: false,verified: false,  pic: "img/avatar.png"},
                {name: 'Jennifer', id: 2, date: "02/19/2016", online: true, new: false,verified: true,  pic: "img/profile.png"},
                {name: 'Lucy', id: 3, date: "01/24/2016", online: false, new: true,verified: true,  pic: "img/avatar.png"}
            ],
            [
                {name: 'Diana', id: 4, date: "Yesterday", online: false, new: true,verified: true,  pic: "img/avatar.png"},
                {name: 'Samantha', id: 5, date: "12/23/2015", online: true, new: false,verified: false,  pic: "img/avatar.png"},
                {name: 'April', id: 6, date: "02/14/2016", online: false, new: false,verified: true,  pic: "img/avatar.png"}
            ]
        ];
    }

    $scope.goToProfile = function (name) {
        console.log("go to profile " + name);
    };

    init();
});