/**
 * Created by raul on 2/3/16.
 */

angular.module('controllers').controller('MessagesController', function ($scope, $timeout, GenericController, User, mainFactory) {

    function init() {
        GenericController.init($scope);
        $scope.searchTerm = "";
        $scope.loadingMessages = true;
        $scope.messages = [];
        $scope.userId = User.getUser().id;
        $scope.getMessages();
    }

    $scope.getMessages = function () {
        mainFactory.getUserMessages().then(getUserMessagesSuccess, getUserMessagesError);
    };

    function getUserMessagesSuccess(response) {
        $scope.messages = $scope.parseDataFromDB(response.data.messages);
        $scope.loadingMessages = false;
        $scope.$broadcast('scroll.refreshComplete');
    }

    function getUserMessagesError(response) {
        if (response.data) {
            $scope.showMessage(response.data.error, 2500);
        }
        else {
            $scope.showMessage("Something went wrong with the request!", 2500);
        }
        $scope.loadingMessages = false;
    }

    $scope.refreshTasks = function() {
        console.log('Refreshing');
        $timeout(function() {
            $scope.$broadcast('scroll.refreshComplete');
        }, 100000);
    };

    $scope.openConversation = function (m) {
        if (m.numUnreadMsg) {
            $rootScope.notifications.unread_msg -= m.numUnreadMsg;
        }
        $scope.goToPage('app/messages/' + m.id);
    };

    init();
});