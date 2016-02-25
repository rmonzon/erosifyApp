/**
 * Created by raul on 2/3/16.
 */

angular.module('controllers').controller('MatchingController', function ($scope, GenericController) {

    function init() {
        GenericController.init($scope);
        $scope.searchTerm = "";
        $scope.messages = [
            { user: 'Amanda', id: 1, lastMsg: "Shall we go dinner tonight?", unreadMsg: true, verified: true, fav: true, date: "14/02/2016", online: false },
            { user: 'Jennifer', id: 2, lastMsg: "Hi there!", unreadMsg: false, verified: true, fav: false, date: "02/19/2016", online: true },
            { user: 'Lucy', id: 3, lastMsg: "Hi there!", unreadMsg: false, verified: false, fav: false, date: "01/24/2016", online: false },
            { user: 'Diana', id: 4, lastMsg: "Hi there!", unreadMsg: true, verified: true, fav: false, date: "Yesterday", online: false },
            { user: 'Samantha', id: 5, lastMsg: "Hi there!", unreadMsg: true, verified: false, fav: true, date: "12/23/2015", online: true },
            { user: 'April', id: 6, lastMsg: "Hi there!", unreadMsg: false, verified: false, fav: true, date: "02/14/2016", online: false },
            { user: 'Amanda', id: 1, lastMsg: "Shall we go dinner tonight?", unreadMsg: true, verified: true, fav: true, date: "14/02/2016", online: false },
            { user: 'Jennifer', id: 2, lastMsg: "Hi there!", unreadMsg: false, verified: true, fav: false, date: "02/19/2016", online: true },
            { user: 'Lucy', id: 3, lastMsg: "Hi there!", unreadMsg: false, verified: false, fav: false, date: "01/24/2016", online: false },
            { user: 'Diana', id: 4, lastMsg: "Hi there!", unreadMsg: true, verified: true, fav: false, date: "Yesterday", online: false },
            { user: 'Samantha', id: 5, lastMsg: "Hi there!", unreadMsg: true, verified: false, fav: true, date: "12/23/2015", online: true },
            { user: 'April', id: 6, lastMsg: "Hi there!", unreadMsg: false, verified: false, fav: true, date: "02/14/2016", online: false }
        ];
    }

    $scope.clearSearch = function () {
        $scope.searchTerm = "";
    };

    init();
})
.controller('PlaylistCtrl', function($scope, $stateParams) {});