/**
 * Created by raul on 2/3/16.
 */

angular.module('controllers').controller('MessagesController', function ($scope, $timeout, GenericController, mainFactory) {

    function init() {
        GenericController.init($scope);
        $scope.searchTerm = "";
        $scope.loadingMessages = true;
        $scope.messages = [];
        $scope.getMessages();
    }

    $scope.getMessages = function () {
        mainFactory.getUserMessages().then(getUserMessagesSuccess, getUserMessagesError);
    };

    function getUserMessagesSuccess(response) {
        $scope.messages = $scope.parseDataFromDB(response.data.messages);
        $scope.loadingMessages = false;
    }

    function getUserMessagesError(response) {
        $scope.showMessage(response.data.error, 2500);
    }

    $scope.clearSearch = function () {
        $scope.searchTerm = "";
    };

    init();
});