/**
 * Created by raul on 1/7/16.
 */

angular.module('controllers').service('GenericController', function($q, $ionicLoading, $rootScope, $location, $timeout, $window, $cordovaGeolocation, $cordovaToast, User, mainFactory) {
    var $scope = null;

    this.init = function (_$scope) {
        $scope = _$scope;
        $scope.posRelative = {};
        $scope.inputType = 'password';

        $scope.goToPage = function (page) {
            $location.path('/' + page);
        };

        $scope.goToProfile = function (id) {
            $scope.goToPage('app/profile/' + id);
        };

        $scope.showMessageWithIcon = function (message, time) {
            $ionicLoading.show({
                duration: time,
                noBackdrop: false,
                template: '<p class="item-icon-left">' + message + '<ion-spinner></ion-spinner></p>'
            });
        };

        $scope.showMessage = function (message, time) {
            $ionicLoading.show({
                duration: time === 0 ? 1000000 : time,
                noBackdrop: true,
                template: '<p class="item-no-icon-left">' + message + '</p>'
            });
        };

        $scope.hideMessage = function () {
            $ionicLoading.hide();
        };

        $scope.logout = function () {
            if ($scope.getUserFromLS().password) {
                mainFactory.doLogOut({"email": $scope.getUserFromLS().email}).then(successLogout, errorLogout);
            }
            else {
                // Facebook logout
                facebookConnectPlugin.logout(function () {
                    $timeout(function () {
                        $scope.goToPage('home');
                    }, 500);
                }, function (fail) {
                    $scope.showMessage(fail, 2000);
                });
            }
            $scope.removeUserFromLS();
        };

        function successLogout(response) {
            $scope.goToPage('home');
        }

        function errorLogout(response) {
            $scope.hideMessage();
            $scope.showMessage(response.data.error, 2500);
        }

        $scope.validateEmail = function (email) {
            var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
            return re.test(email);
        };

        $scope.removeHideClass = function (id) {
            $timeout(function () {
                var classList = document.querySelector(id).className;
                document.querySelector(id).className = classList.replace('hide', '');
            }, 100);
        };

        $scope.setUserToLS = function (user_data) {
            $window.localStorage.setItem('userInfo', JSON.stringify(user_data));
        };

        $scope.getUserFromLS = function () {
            var obj = null;
            if ($window.localStorage.facebook_user) {
                obj = JSON.parse($window.localStorage.facebook_user);
            }
            if ($window.localStorage.userInfo) {
                obj = JSON.parse($window.localStorage.userInfo);
            }
            return obj;
        };

        $scope.removeUserFromLS = function () {
            $window.localStorage.removeItem('userInfo');
        };

        $scope.showHidePassword = function () {
            $scope.inputType = $scope.inputType == 'text' ? 'password' : 'text';
        };

        $scope.calculateAge = function (user) {
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth() + 1; //January is 0!
            var yyyy = today.getFullYear();
            var diffYears = yyyy - parseInt(user.year);
            var a = mm * 30 + dd, b = parseInt(user.month) * 30 + parseInt(user.day);
            return a < b ? diffYears - 1 : diffYears;
        };

        $scope.getDateFormatted = function (today) {
            var dd = today.getDate();
            var mm = today.getMonth() + 1; //January is 0!
            var yyyy = today.getFullYear();
            if (dd < 10) {
                dd = '0' + dd
            }
            if (mm < 10) {
                mm = '0' + mm
            }
            return mm + '-' + dd + '-' + yyyy;
        };

        $scope.getDateTimeFormatted = function (date) {
            var hours = date.getHours(), minutes = date.getMinutes(), secs = date.getSeconds();
            hours = hours < 10 ? '0' + hours : hours;
            minutes = minutes < 10 ? '0' + minutes : minutes;
            secs = secs < 10 ? '0' + secs : secs;
            var time = hours + ':' + minutes + ':' + secs;
            return $scope.getDateFormatted(date) + " " + time;
        };

        $scope.formatDateToTime = function (date) {
            var hours = date.getHours(), minutes = date.getMinutes(), ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0' + minutes : minutes;
            return hours + ':' + minutes + ' ' + ampm;
        };

        $scope.convertFromUTCtoLocalTime = function (date) {
            date = new Date(date).toString();
            return $scope.getDateTimeFormatted(new Date(date));
        };

        $scope.calculateDistanceToUser = function (user) {
            var coordsA = JSON.parse(user.coordinates), coordsB = JSON.parse(User.getUser().coordinates);
            var userACoords = new google.maps.LatLng(coordsA.lat, coordsA.lng);
            var userBCoords = new google.maps.LatLng(coordsB.lat, coordsB.lng);
            var distance = google.maps.geometry.spherical.computeDistanceBetween(userACoords, userBCoords);
            distance = $scope.convertFromMetersToMiles(distance);
            return Math.round(distance * 10) / 10;
        };

        $scope.convertFromMetersToMiles = function (i) {
            return i * 0.000621371192;
        };

        $scope.parseDataFromDB = function (users) {
            var d = [], t = "", a = {};
            if (Array.isArray(users)) {
                for (var i = 0, len = users.length; i < len; ++i) {
                    cleanImagesUrls(users[i]);
                    if (users[i].languages)
                        users[i].languages = users[i].languages.join(', ');
                    if (users[i].date) {
                        d = users[i].date.split('T')[0].split('-');
                        users[i].date = d[1] + "/" + d[2] + "/" + d[0];
                    }
                    if (users[i].location) {
                        users[i].location = parseAddress(users[i].location);
                    }
                    if (users[i].sent_date) {
                        users[i].full_date = $scope.getDateTimeFormatted(new Date(users[i].sent_date));
                        t = $scope.formatDateToTime(new Date(users[i].full_date));
                        d = users[i].full_date.split(' ')[0].split('-');
                        users[i].sent_date = d[0] + "/" + d[1] + "/" + d[2];
                        users[i].time = t;
                        a = new Date(users[i].full_date).toString().split(' ');
                        users[i].full_date = a[1] + " " + a[2] + ", " + a[3];
                    }
                }
            }
            else {
                cleanImagesUrls(users);
                if (users.languages)
                    users.languages = users.languages.join(', ');
                if (users.date) {
                    d = users.date.split('T')[0].split('-');
                    users.date = d[1] + "/" + d[2] + "/" + d[0];
                }
                if (users.location) {
                    users.location = parseAddress(users.location);
                }
                if (users.sent_date) {
                    users.full_date = $scope.getDateTimeFormatted(new Date(users.sent_date));
                    t = $scope.formatDateToTime(new Date(users.full_date));
                    d = users.full_date.split(' ')[0].split('-');
                    users.sent_date = d[0] + "/" + d[1] + "/" + d[2];
                    users.time = t;
                    a = new Date(users.full_date).toString().split(' ');
                    users.full_date = a[1] + " " + a[2] + ", " + a[3];
                }
                //we might need to parse more data in the future
            }
            return users;
        };

        function parseAddress(address) {
            address = address.split(',');
            var l = address.length;
            address = address[l - 3] + "," + address[l - 2] + "," + address[l - 1];
            if (address[0] == " ") {
                address = spliceSlice(address, 0, 1);
            }
            address = address.replace(/\d+/g, '');
            var fIndex = address.indexOf(','), lIndex = address.lastIndexOf(',');
            if (address[fIndex - 1] == " ") {
                address = spliceSlice(address, fIndex - 1, 1);
            }
            if (address[lIndex - 1] == " ") {
                address = spliceSlice(address, lIndex - 1, 1);
            }
            if (address.includes('USA') || address.includes('EE. UU.')) {
                address = address.replace(', USA', '');
                address = address.replace(', EE. UU.', '');
            }
            return address;
        }

        function spliceSlice(str, index, count, add) {
            return str.slice(0, index) + (add || "") + str.slice(index + count);
        }

        function cleanImagesUrls(user) {
            user.photos = [];
            if (user.facebook_id) {
                user.photos.push("https://graph.facebook.com/" + user.facebook_id + "/picture?type=large");
            }
            if (user.facebook_photos) {
                for (var i = 0, len = user.facebook_photos.length; i < len; ++i) {
                    //user.photos.push("https://graph.facebook.com/" + user.facebook_photos[i] + "/picture?access_token=" + $scope.getUserFromLS().fbToken);
                    user.photos.push(user.facebook_photos[i]);
                }
            }
            if (user.pictures) {
                for (i = 0, len = user.pictures.length; i < len; ++i) {
                    user.photos.push(ENV.AMAZON_S3 + "/profiles/user_" + user.id + "/" + user.pictures[i]);
                }
            }
        }

        $scope.escapeInvalidChars = function (str) {
            return str.replace("'", "''");
        };

        $scope.parseFacebookData = function (user) {
            if (user.languages && user.languages.length > 0) {
                for (var i = 0; i < user.languages.length; i++) {
                    user.languages[i] = user.languages[i].name;
                }
            }
            else {
                user.languages = ["English"];
            }
            if (user.gender) {
                //to capitalize first letter
                user.gender = user.gender.charAt(0).toUpperCase() + user.gender.slice(1);
            }
            if (user.work && user.work.length > 0) {
                user.work = user.work[0].position.name + " at " + user.work[0].employer.name;
            }
            else {
                user.work = "";
            }
            if (user.education && user.education.length > 0) {
                user.education = user.education[user.education.length - 1].school.name;
            }
            else {
                user.education = "";
            }
            if (user.birthday) {
                var dob = user.birthday.split('/');
                user.birthday = dob[0] + "-" + dob[1] + "-" + dob[2];
                user.day = dob[1];
                user.month = dob[0];
                user.year = dob[2];
            }
            if (user.friends) {
                user.friends = user.friends.data;
            }
            if (user.picture) {
                user.pictureSm = user.picture.data.url;
                user.picture = "http://graph.facebook.com/" + user.id + "/picture?type=large";
            }
            if (user.photos) {
                var photos = [];
                for (i = 0; i < user.photos.data.length; i++) {
                    photos.push("https://graph.facebook.com/" + user.photos.data[i].id + "/picture?access_token=" + user.fb_token);
                }
                user.photos = photos;
            }
            return user;
        };

        // This method is to get the user profile info from the facebook api
        $scope.getFacebookProfileInfo = function (authResponse) {
            var info = $q.defer();
            facebookConnectPlugin.api('/me?fields=id,first_name,name,email,picture,gender,birthday,languages,education,work,friends,photos&access_token=' + authResponse.accessToken, null,
                function (response) {
                    info.resolve(response);
                },
                function (response) {
                    console.log(response);
                    info.reject(response);
                }
            );
            return info.promise;
        };

        $scope.getCurrentLocation = function () {
            var posOptions = {timeout: 10000, enableHighAccuracy: false};
            return $cordovaGeolocation.getCurrentPosition(posOptions);
        };

        $scope.errorGetLocation = function (err) {
            $scope.hideMessage();
            console.log(err);
            if (err.code == 1) {
                $scope.showMessage("Please enable GPS service to continue.", 3000);
                return;
            }
            $scope.showMessage("Error getting your current location.", 3000);
        };

        $scope.convertDataForUI = function (array) {
            var newArray = [];
            for (var i = 0, len = array.length; i < len; i += 3) {
                newArray.push(array.slice(i, i + 3));
            }
            return newArray;
        };

        $scope.getNotifications = function () {
            mainFactory.getNewNotifications().then(getNewNotificationsSuccess, getNewNotificationsError);
        };

        function getNewNotificationsSuccess(response) {
            $rootScope.notifications = response.data.notifications;
            $rootScope.notifications.newNotif = $rootScope.notifications.new_likes > 0 || $rootScope.notifications.new_matches > 0 || $rootScope.notifications.new_visitors > 0 || $rootScope.notifications.unread_msg > 0;
            if ($rootScope.notifications.newNotif) {
                $scope.showNativeToast('You have new notifications');
            }
        }

        function getNewNotificationsError(response) {
            $scope.showMessage(response.data.error, 2500);
        }

        /**
         * Cantor pairing function to generate a uniquely encoded number based off two different numbers, a < b must be true
         * @param a
         * @param b
         * @returns {*}
         */
        $scope.generateUniqueNumber = function (a, b) {
            return 1 / 2 * (a + b) * (a + b + 1) + b;
        };

        $scope.showNativeToast = function (msg) {
            $cordovaToast.show(msg, 'short', 'bottom').then(function (success) {
                // success
            }, function (error) {
                // error
            });
        };

        $scope.showNotification = function (notif) {
            $scope.notification = notif;
            $scope.notification.visible = true;
            $timeout(function () {
                if ($scope.notification) {
                    $scope.notification.visible = false;
                }
            }, 6000);
        };

        $scope.viewNotification = function () {
            if ($scope.notification.is_message) {
                $scope.notification.visible = false;
                $scope.goToPage('app/messages/' + $scope.notification.sender_id);   
            }
        };

        $scope.openTermsOfService = function () {
            window.open('http://www.erosify.com/pages/terms.html', '_system');
        };

        $scope.openPrivacyPolicy = function () {
            window.open('http://www.erosify.com/pages/privacy.html', '_system');
        };
    };
});