/**
 * Created by raul on 5/18/16.
 */

angular.module('controllers').controller('ChatController', function($scope, $stateParams, $ionicScrollDelegate, $sanitize, $timeout, GenericController, socket, User, mainFactory) {

    function init() {
        GenericController.init($scope);
        $scope.user = User.getUser();
        $scope.chat = { connected: false };
        $scope.messages = [];

        $scope.typing = false;
        $scope.lastTypingTime = null;
        $scope.TYPING_TIMER_LENGTH = 400;

        //var isIOS = ionic.Platform.isWebView() && ionic.Platform.isIOS();

        //Add colors
        $scope.COLORS = [
            '#e21400', '#91580f', '#f8a700', '#f78b00',
            '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
            '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
        ];
        $scope.getUserInfoFromDB();
    }

    $scope.getUserInfoFromDB = function () {
        mainFactory.getUserInfo($stateParams.userId).then(successCallback, errorCallback);
    };

    function successCallback(response) {
        $scope.userInfo = $scope.parseDataFromDB(response.data.data);
        console.log($scope.userInfo);
    }

    function errorCallback(response) {
        $scope.showMessage(response.data.error, 2500);
    }

    socket.on('connect',function() {
        //Add user called nickname
        $scope.chat.connected = true;
        //socket.emit('add user', $scope.user.userID);
        socket.emit('add user', $stateParams.userId);

        socket.on('new message', function (data) {
            if (data.message && data.username) {
                $scope.addMessageToList(data.username, true, data.message);
            }
        });

        //Whenever the server emits 'typing', show the typing message
        socket.on('typing', function (data) {
            addChatTyping(data);
        });

        // Whenever the server emits 'stop typing', kill the typing message
        socket.on('stop typing', function (data) {
            removeChatTyping(data.username);
        });

        // Whenever the server emits 'user joined', log it in the chat body
        socket.on('user joined', function (data) {
            $scope.addMessageToList("", false, data.username + " joined");
            $scope.addMessageToList("", false, message_string(data.numUsers));
        });

        // Whenever the server emits 'user left', log it in the chat body
        socket.on('user left', function (data) {
            $scope.addMessageToList("", false, data.username + " left");
            $scope.addMessageToList("", false, message_string(data.numUsers));
        });
    });

    // Return message string depending on the number of users
    function message_string(number_of_users) {
        return number_of_users === 1 ? "there's 1 participant" : "there are " + number_of_users + " participants";
    }

    // Adds the visual chat typing message
    function addChatTyping (data) {
        $scope.addMessageToList(data.username, true, " is typing");
    }

    // Removes the visual chat typing message
    function removeChatTyping (username) {
        $scope.messages = $scope.messages.filter(function(element) {
            var typingContent = username + " is typing";
            return element.username != username || element.content != typingContent;
        });
    }

    function getUsernameColor(username) {
        // Compute hash code
        var hash = 7;
        for (var i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + (hash << 5) - hash;
        }
        // Calculate color
        var index = Math.abs(hash % $scope.COLORS.length);
        return $scope.COLORS[index];
    }

    $scope.sendUpdateTyping = function () {
        if ($scope.chat.connected) {
            if (!$scope.typing) {
                $scope.typing = true;
                socket.emit('typing');
            }
        }
        $scope.lastTypingTime = (new Date()).getTime();
        $timeout(function () {
            var typingTimer = (new Date()).getTime();
            var timeDiff = typingTimer - $scope.lastTypingTime;
            if (timeDiff >= $scope.TYPING_TIMER_LENGTH && $scope.typing) {
                socket.emit('stop typing');
                $scope.typing = false;
            }
        }, $scope.TYPING_TIMER_LENGTH);
    };

    $scope.addMessageToList = function (username, style_type, message) {
        //The input is sanitized For more info read this link
        username = $sanitize(username);

        //Get color for user
        var color = style_type ? getUsernameColor(username) : null;

        // Push the messages to the messages list.
        $scope.messages.push({
            content: message == " is typing" ? username + $sanitize(message) : $sanitize(message),
            style: style_type,
            username: username,
            color: color,
            date: new Date()
        });

        // Scroll to bottom to read the latest
        $ionicScrollDelegate.scrollBottom(true);
    };

    $scope.updateTyping = function () {
        $scope.sendUpdateTyping();
    };

    $scope.sendMessage = function () {
        socket.emit('new message', $scope.chat.message);
        $scope.addMessageToList($stateParams.userId, true, $scope.chat.message);
        socket.emit('stop typing');
        $scope.chat.message = "";
    };

    init();
}).filter('nl2br', ['$filter',
    function($filter) {
        return function(data) {
            if (!data) return data;
            return data.replace(/\n\r?/g, '<br />');
        };
    }
]);