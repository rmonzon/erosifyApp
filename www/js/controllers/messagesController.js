/**
 * Created by raul on 2/3/16.
 */

angular.module('controllers').controller('MessagesController', function ($scope, $timeout, $rootScope, GenericController, User, mainFactory) {

    function init() {
        GenericController.init($scope);
        $scope.searchTerm = "";
        $scope.loadingMessages = true;
        $scope.deleteMode = false;
        $scope.selectedItems = 0;
        $scope.messages = [];
        $scope.userId = User.getUser().id;
        $scope.getMessages();
    }

    $scope.getMessages = function () {
        mainFactory.getUserMessages().then(getUserMessagesSuccess, getUserMessagesError);
    };

    function getUserMessagesSuccess(response) {
        $scope.messages = $scope.parseDataFromDB(response.data.messages);
        applyAllMessages(false);
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
            m.numUnreadMsg = 0;
            m.unread = 0;
        }
        $scope.goToPage('app/messages/' + m.id);
    };

    $scope.removeMultiMessages = function () {
        if ($scope.selectedItems > 0) {
            var selectedMsgs = [];
            for (var i = 0; i < $scope.messages.length; ++i) {
                if ($scope.messages[i].selected) {
                    selectedMsgs.push($scope.messages[i].id);
                }
            }
            mainFactory.deleteConversations({ ids: selectedMsgs, my_id: $scope.userId }).then(function () {
                for (var i = 0; i < $scope.messages.length; ++i) {
                    if ($scope.messages[i].selected) {
                        $scope.messages.splice(i, 1);
                    }
                }
                $scope.disableDeleteMode();
            }, function (response) {
                $scope.showMessage(response.data.error);
            });
        }
    };

    $scope.enterDeleteMode = function (index) {
        $scope.deleteMode = true;
        $scope.messages[index].selected = true;
        $scope.selectedItems++;
    };

    $scope.clickOnMessage = function (index) {
        if ($scope.deleteMode) {
            if ($scope.messages[index].selected) {
                $scope.selectedItems--;
            }
            else {
                $scope.selectedItems++;
            }
            $scope.messages[index].selected = !$scope.messages[index].selected;
        }
        else {
            $scope.openConversation($scope.messages[index]);
        }
    };

    $scope.disableDeleteMode = function () {
        $scope.deleteMode = false;
        $scope.selectedItems = 0;
        applyAllMessages(false);
    };

    function applyAllMessages(value) {
        for (var i = 0; i < $scope.messages.length; ++i) {
            $scope.messages[i].selected = value;
        }
    }

    init();
});