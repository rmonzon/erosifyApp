/**
 * Created by raul on 2/3/16.
 */

angular.module('controllers').controller('MatchingController', function ($scope, GenericController) {

    function init() {
        GenericController.init($scope);
        $scope.searchTerm = "";
        $scope.messages = [
            { user: 'Amanda', id: 1, lastMsg: "Shall we go dinner tonight?", verified: true },
            { user: 'Jennifer', id: 2, lastMsg: "Hi there!", verified: true },
            { user: 'Lucy', id: 3, lastMsg: "Hi there!", verified: false },
            { user: 'Diana', id: 4, lastMsg: "Hi there!", verified: true },
            { user: 'Samantha', id: 5, lastMsg: "Hi there!", verified: false },
            { user: 'April', id: 6, lastMsg: "Hi there!", verified: false }
        ];
    }

    $scope.clearSearch = function () {
        $scope.searchTerm = "";
    };

    init();
})
.controller('PlaylistCtrl', function($scope, $stateParams) {});