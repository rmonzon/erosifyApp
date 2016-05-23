/**
 * Created by raul on 2/25/16.
 */

angular.module('controllers').controller('VisitorsController', function ($scope, GenericController, mainFactory, User) {
    function init() {
        GenericController.init($scope);
        $scope.listVisitors = [];
        $scope.myVisitors = [];
        $scope.loadingVisitors = true;
        $scope.noResults = false;
        $scope.getListOfVisitors();
    }

    $scope.getListOfVisitors = function () {
        mainFactory.getMyVisitors({ my_id: User.getUser().id }).then(getMyVisitorsSuccess, getMyVisitorsError);
    };

    function getMyVisitorsSuccess(response) {
        $scope.listVisitors = $scope.parseDataFromDB(response.data.visitors);
        convertDataForUI();
        if ($scope.listVisitors.length == 0) {
            $scope.noResults = true;
        }
        $scope.loadingVisitors = false;
    }

    function getMyVisitorsError(response) {
        $scope.showMessage(response.data.error, 2500);
        $scope.loadingVisitors = false;
    }

    function convertDataForUI() {
        for (var i = 0, len = $scope.listVisitors.length; i < len; i+=3) {
            $scope.myVisitors.push($scope.listVisitors.slice(i, i + 3));
        }
    }

    init();
});