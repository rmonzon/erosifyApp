/**
 * Created by raul on 1/7/16.
 */

angular.module('controllers').service('GenericController', function($ionicLoading, $location, $timeout, $window, $cordovaFacebook, User, mainFactory) {
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
            if (User.getUserFb().userID) {
                $cordovaFacebook.logout().then(function (success) {
                    $scope.goToPage('home');
                }, function (error) {
                    $scope.showMessage(error, 2000);
                });
            }
            else {
                mainFactory.doLogOut({"email": $scope.getUserFromLS().email}).then(successLogout, errorLogout);
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
                    users[i].pictures = cleanImagesUrls(users[i]);
                    if (users[i].languages)
                        users[i].languages = users[i].languages.join(', ');
                    if (users[i].date) {
                        //users[i].date = $scope.convertFromUTCtoLocalTime(users[i].date);
                        d = users[i].date.split('T')[0].split('-');
                        users[i].date = d[1] + "/" + d[2] + "/" + d[0];
                    }
                    if (users[i].location) {
                        users[i].location = parseAddress(users[i].location);
                    }
                    if (users[i].sent_date) {
                        //review date time coming from DB, check if it's UTC or not
                        //users[i].full_date = $scope.convertFromUTCtoLocalTime(users[i].sent_date);
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
                users.pictures = cleanImagesUrls(users);
                if (users.languages)
                    users.languages = users.languages.join(', ');
                if (users.date) {
                    //users.date = $scope.convertFromUTCtoLocalTime(users.date);
                    d = users.date.split('T')[0].split('-');
                    users.date = d[1] + "/" + d[2] + "/" + d[0];
                }
                if (users.location) {
                    users.location = parseAddress(users.location);
                }
                if (users.sent_date) {
                    //users.full_date = $scope.convertFromUTCtoLocalTime(users.sent_date);
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
            if (user.pictures) {
                return user.pictures.map(function (u) {
                    return ENV.AMAZON_S3 + "/profiles/user_" + user.id + "/" + u;
                });
            }
            return [];
        }

        $scope.escapeInvalidChars = function (str) {
            return str.replace("'", "''");
        };
    };
});