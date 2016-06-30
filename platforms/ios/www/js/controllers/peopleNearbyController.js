/**
 * Created by raul on 2/24/16.
 */

angular.module('controllers').controller('PeopleNearbyController', function ($scope, $timeout, $cordovaGeolocation, $ionicModal, GenericController, mainFactory, User) {

    function init() {
        GenericController.init($scope);
        $scope.totalFound = 0;
        $scope.searching = true;
        $scope.humanAddress = "";
        $scope.loadingNum = 0;
        $scope.filters = {
            miles: 30,
            ageMin: 18,
            ageMax: 55,
            ageFrom: 18,
            ageTo: 35,
            gender: User.getUser().gender == 'Male' ? 'Female' : 'Male',
            interest: User.getUser().looking_to
        };
        $scope.findPeopleNearby();
    }

    $scope.findPeopleNearby = function () {
        var posOptions = {timeout: 10000, enableHighAccuracy: false};
        $cordovaGeolocation.getCurrentPosition(posOptions).then(successGetLocation, errorGetLocation);
    };

    function successGetLocation(position) {
        geocodeLatLng(position.coords.latitude, position.coords.longitude);
    }

    function errorGetLocation(err) {
        $scope.searching = false;
        console.log(err);
        $scope.showMessage(err, 3000);
    }

    function geocodeLatLng(lat, long) {
        var geocoder = new google.maps.Geocoder;
        var latlng = {lat: parseFloat(lat), lng: parseFloat(long)};
        geocoder.geocode({'location': latlng}, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                if (results[1]) {
                    $scope.humanAddress = results[0].formatted_address.replace('EE. UU.', 'USA');
                    User.updateAttr('coordinates', JSON.stringify(latlng));
                    User.updateAttr('location', $scope.humanAddress);
                    $scope.getPeopleNearbyFromDB(latlng);
                } else {
                    $scope.showMessage('No results found', 2500);
                }
            } else {
                $scope.showMessage('Geocoder failed due to: ' + status, 2500);
            }
        });
    }
    
    $scope.getPeopleNearbyFromDB = function () {
        var state = $scope.humanAddress.split(',');
        state = state[state.length - 2].split(' ')[1];
        var req = {
            id: User.getUser().id,
            state: state,
            looking_to: $scope.filters.interest,
            ages: { ageFrom: $scope.filters.ageFrom, ageTo: $scope.filters.ageTo }
        };
        if ($scope.filters.gender != "Everyone") {
            req.gender = $scope.filters.gender;
        }
        mainFactory.findPeopleNearMe(req).then(findPeopleNearMeSuccess, findPeopleNearMeError);
    };

    function findPeopleNearMeSuccess(response) {
        $scope.people = $scope.parseDataFromDB(response.data.people);
        parseDataForUI();
    }

    function findPeopleNearMeError(response) {
        $scope.showMessage(response.data.error, 2000);
        $scope.searching = false;
    }

    function parseDataForUI() {
        $scope.totalFound = 0;
        var newArray = [[]], three = 0;
        for (var i = 0, len = $scope.people.length; i < len; ++i) {
            var dist = $scope.calculateDistanceToUser($scope.people[i]);
            if (dist <= $scope.filters.miles) {
                if (newArray[three].length == 3) {
                    newArray.push([]);
                    three++;
                }
                $scope.people[i].distance = dist;
                newArray[three].push($scope.people[i]);
                $scope.totalFound++;
            }
        }
        $scope.people = newArray;
        $scope.$broadcast('scroll.refreshComplete');
    }

    $scope.imageLoaded = function () {
        $scope.loadingNum++;
        if ($scope.loadingNum == $scope.totalFound) {
            $scope.searching = false;
            $scope.loadingNum = 0;
        }
    };

    $ionicModal.fromTemplateUrl('templates/matching_filters.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalFilters = modal;
    });

    $scope.openFilterOptions = function () {
        $scope.modalFilters.show();
    };

    $scope.applyFilters = function () {
        $scope.searching = true;
        var state = $scope.humanAddress.split(',');
        state = state[state.length - 2].split(' ')[1];
        var req = {
            id: User.getUser().id,
            state: state,
            ages: { ageFrom: $scope.filters.ageFrom, ageTo: $scope.filters.ageTo }
        };
        if ($scope.filters.interest) {
            req.looking_to = $scope.filters.interest;
        }
        if ($scope.filters.gender != "Everyone") {
            req.gender = $scope.filters.gender;
        }
        mainFactory.findPeopleNearMe(req).then(findPeopleNearMeSuccess, findPeopleNearMeError);
        $scope.closeModal();
    };

    $scope.closeModal = function() {
        $scope.modalFilters.hide();
    };

    init();
});