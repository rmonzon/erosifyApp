/**
 * Created by raul on 5/18/16.
 */

angular.module('controllers').controller('ChatController', function($scope, $stateParams, $ionicScrollDelegate, $sanitize, $timeout, GenericController, socket, User, mainFactory) {

    function init() {
        GenericController.init($scope);
        $scope.user = User.getUser();
        $scope.chat = { connected: true };
        $scope.messages = [];
        $scope.typing = false;
        $scope.lastTypingTime = null;
        $scope.TYPING_TIMER_LENGTH = 400;

        //Add colors
        $scope.COLORS = [
            '#e21400', '#91580f', '#f8a700', '#f78b00',
            '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
            '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
        ];
        getConversationId();
        initChatSocket();
        $scope.getUserInfoFromDB();
    }

    function getConversationId() {
        var a = parseInt($stateParams.userId) < $scope.user.id ? parseInt($stateParams.userId) : $scope.user.id;
        var b = parseInt($stateParams.userId) > $scope.user.id ? parseInt($stateParams.userId) : $scope.user.id;
        $scope.conversation_id = $scope.generateUniqueNumber(a, b);
    }

    $scope.getUserInfoFromDB = function () {
        mainFactory.getUserInfo($stateParams.userId).then(successCallback, errorCallback);
    };

    function successCallback(response) {
        $scope.userInfo = $scope.parseDataFromDB(response.data.data);
        mainFactory.getConversation($scope.userInfo.id).then(function (response) {
            buildMessageHistory(response.data.conversation);
        }, getConversationError);
    }

    function errorCallback(response) {
        $scope.showMessage(response.data.error, 2500);
    }

    function getConversationError(response) {
        $scope.showMessage(response.data.error, 2500);
    }

    function buildMessageHistory(conv) {
        var conversation = $scope.parseDataFromDB(conv);
        var name = "", date = "";
        for (var i = 0, len = conversation.length; i < len; ++i) {
            if (date != conversation[i].full_date) {
                date = conversation[i].full_date;
                name = "Date Divider";
                $scope.addMessageToListFromDB(name, true, conversation[i].full_date, conversation[i].sent_date, conversation[i].time);
            }
            name = conversation[i].sender_id == $scope.user.id ? $scope.user.name : $scope.userInfo.name;
            $scope.addMessageToListFromDB(name, true, conversation[i].message, conversation[i].sent_date, conversation[i].time);
        }
    }

    $scope.addMessageToListFromDB = function (name, style_type, message, sent_date, time) {
        //Get color for user
        var color = style_type ? getUserColor(name) : null;

        // Push the messages to the messages list.
        $scope.messages.push({
            content: message,
            style: style_type,
            name: name,
            color: color,
            date: sent_date,
            time: time
        });

        // Scroll to bottom to read the latest
        $ionicScrollDelegate.scrollBottom(true);
    };

    // Adds the visual chat typing message
    function addChatTyping (data) {
        $scope.addMessageToList(data.name, true, " is typing");
    }

    // Removes the visual chat typing message
    function removeChatTyping (name) {
        $scope.messages = $scope.messages.filter(function(element) {
            var typingContent = name + " is typing";
            return element.name != name || element.content != typingContent;
        });
    }

    function getUserColor(name) {
        // Compute hash code
        var hash = 7;
        for (var i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + (hash << 5) - hash;
        }
        // Calculate color
        var index = Math.abs(hash % $scope.COLORS.length);
        return $scope.COLORS[index];
    }

    $scope.sendUpdateTyping = function () {
        if ($scope.chat.connected) {
            if (!$scope.typing) {
                $scope.typing = true;
                socket.emit('typing', $scope.conversation_id);
            }
        }
        $scope.lastTypingTime = (new Date()).getTime();
        $timeout(function () {
            var typingTimer = (new Date()).getTime();
            var timeDiff = typingTimer - $scope.lastTypingTime;
            if (timeDiff >= $scope.TYPING_TIMER_LENGTH && $scope.typing) {
                socket.emit('stop typing', $scope.conversation_id);
                $scope.typing = false;
            }
        }, $scope.TYPING_TIMER_LENGTH);
    };

    $scope.addMessageToList = function (name, style_type, message) {
        //The input is sanitized For more info read this link
        name = $sanitize(name);

        //Get color for user
        var color = style_type ? getUserColor(name) : null;

        // Push the messages to the messages list.
        $scope.messages.push({
            content: message == " is typing" ? name + message : message,
            style: style_type,
            name: name,
            color: color,
            date: new Date(),
            time: $scope.formatDateToTime(new Date())
        });

        // Scroll to bottom to read the latest
        $ionicScrollDelegate.scrollBottom(true);
    };

    $scope.updateTyping = function () {
        $scope.sendUpdateTyping();
    };

    $scope.sendMessage = function () {
        if ($scope.chat.message) {
            socket.emit('new message', {
                room: $scope.conversation_id,
                message: $scope.chat.message
            });
            socket.emit('new message notif', {
                sender_id: $scope.user.id,
                user_id: $stateParams.userId,
                name: $scope.user.name,
                picture: $scope.user.photos[0]
            });
            $scope.addMessageToList($scope.user.name, true, $scope.chat.message);
            socket.emit('stop typing', $scope.conversation_id);

            var req = {
                sender_id: $scope.user.id,
                receiver_id: $scope.userInfo.id,
                msg: $scope.escapeInvalidChars($scope.chat.message),
                sent_date: $scope.getDateTimeFormatted(new Date()),
                unread: 1
            };
            mainFactory.saveMessage(req).then(saveMessageSuccess, saveMessageError);
        }
    };

    function saveMessageSuccess(response) {
        $scope.chat.message = "";
    }

    function saveMessageError(response) {
        socket.emit('stop typing', $scope.conversation_id);
        $scope.showMessage(response.data.error, 2500);
    }

    function initChatSocket() {
        socket.emit('subscribe', $scope.conversation_id);

        //Add name of the connected user
        socket.emit('add user', {name: $scope.user.name, room: $scope.conversation_id});

        socket.on('new message', function (data) {
            if (data.message && data.name) {
                $scope.addMessageToList(data.name, true, data.message);
                //mark message received as viewed
                mainFactory.markMessageAsViewedByUser({
                    my_id: User.getUser().id,
                    user_id: $scope.userInfo.id
                }).then(function (response) {
                    console.log(response.data);
                }, function (response) {
                    console.log(response.data);
                });
            }
        });

        //Whenever the server emits 'typing', show the typing message
        socket.on('typing', function (data) {
            addChatTyping(data);
        });

        // Whenever the server emits 'stop typing', kill the typing message
        socket.on('stop typing', function (data) {
            removeChatTyping(data.name);
        });

        // Whenever the server emits 'user joined', log it in the chat body
        // socket.on('user joined', function (data) {
        //     $scope.addMessageToList("", false, data.name + " joined");
        //     $scope.addMessageToList("", false, message_string(data.numUsers));
        // });
        //
        // // Whenever the server emits 'user left', log it in the chat body
        // socket.on('user left', function (data) {
        //     $scope.addMessageToList("", false, data.name + " left");
        //     $scope.addMessageToList("", false, message_string(data.numUsers));
        // });

        // socket.on('connect', function() {
        //
        // });
    }

    init();
}).filter('nl2br', ['$filter',
    function($filter) {
        return function(data) {
            if (!data) return data;
            return data.replace(/\n\r?/g, '<br />');
        };
    }
]);