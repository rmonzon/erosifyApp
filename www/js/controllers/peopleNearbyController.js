/**
 * Created by raul on 2/24/16.
 */

angular.module('controllers').controller('PeopleNearbyController', function ($scope, $timeout, $cordovaGeolocation, GenericController) {

    function init() {
        GenericController.init($scope);
        $scope.matches = [
            [
                {name: 'Amanda', id: 1, distance: "0.2 mi", online: false,verified: false,  pic: "img/avatar.png"},
                {name: 'Jennifer', id: 2, distance: "4.5 mi", online: true,verified: false,  pic: "img/profile.png"},
                {name: 'rigoberta', id: 3, distance: "1.3 mi", online: false,verified: true,  pic: "img/avatar.png"}
            ],
            [
                {name: 'Diana', id: 4, distance: "1.3 mi", online: false,verified: false,  pic: "img/avatar.png"},
                {name: 'Samantha', id: 5, distance: "1.4 mi", online: true,verified: true,  pic: "img/avatar.png"},
                {name: 'April', id: 6, distance: "0.3 mi", online: false,verified: false,  pic: "img/avatar.png"}
            ],
            [
                {name: 'Amanda', id: 1, distance: "4.0 mi", online: false,verified: false,  pic: "img/avatar.png"},
                {name: 'Jennifer', id: 2, distance: "8.1 mi", online: true,verified: false,  pic: "img/profile.png"},
                {name: 'Lucy', id: 3, distance: "2.0 mi", online: false,verified: false,  pic: "img/avatar.png"}
            ],
            [
                {name: 'Diana', id: 4, distance: "1.3 mi", online: false,verified: false,  pic: "img/avatar.png"},
                {name: 'Samantha', id: 5, distance: "1.3 mi", online: true,verified: false,  pic: "img/avatar.png"},
                {name: 'April', id: 6, distance: "1.3 mi", online: false,verified: false,  pic: "img/avatar.png"}
            ]
        ];
        $scope.totalFound = $scope.matches.length;
        $scope.searching = true;
        $scope.humanAddress = "";
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
                    //results[0] = Full street address
                    //results[1] = locality address
                    //results[2] = postal code address
                    //results[3] = county address
                    //results[4] = state address
                    //results[5] = country address


                    $scope.searching = false;
                    $scope.humanAddress = results[2].formatted_address;
                    console.log(results);
                    $scope.$apply();
                } else {
                    $scope.showMessage('No results found', 2500);
                }
            } else {
                $scope.showMessage('Geocoder failed due to: ' + status, 2500);
            }
        });
    }

    $scope.goToProfile = function (name) {
        console.log("go to profile " + name);
    };

    init();
});