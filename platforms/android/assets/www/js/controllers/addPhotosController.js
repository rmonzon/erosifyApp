/**
 * Created by raul on 4/11/16.
 */

angular.module('controllers').controller('AddPhotosController', function ($scope, $ionicActionSheet, $cordovaCamera, $ionicLoading, GenericController, mainFactory) {
    function init() {
        GenericController.init($scope);

        $scope.loadedPics = false;
        $scope.pics = ['raul.jpg'];
    }

    // Triggered on a button click, or some other target
    $scope.showActionSheet = function() {
        $ionicActionSheet.show({
            titleText: 'Load Profile Pictures',
            buttons: [
                { text: '<i class="icon ion-camera"></i> Take a picture' },
                { text: '<i class="icon ion-images"></i> Choose from Phone' }
            ],
            cancelText: 'Cancel',
            cancel: function() {
                console.log('CANCELLED');
            },
            buttonClicked: function(index) {
                if (index === 0) {
                    $scope.takePicture();
                }
                if (index === 1) {
                    $scope.selectPicture();
                }
                console.log('BUTTON CLICKED', index);
                return true;
            }
        });
    };

    $scope.addPic = function () {
        $scope.showActionSheet();
    };

    $scope.removePic = function (index) {
        $scope.pics.splice(index, 1);
    };




    $scope.data = { "ImageURI" :  "Select Image" };
    $scope.takePicture = function() {
        var options = {
            quality: 50,
            destinationType: Camera.DestinationType.FILE_URL,
            sourceType: Camera.PictureSourceType.CAMERA
        };
        $cordovaCamera.getPicture(options).then(
            function (imageData) {
                $scope.loadedPics = true;
                $scope.picData = imageData;
                $scope.pics.push(imageData);
                $scope.ftLoad = true;
                localStorage.setItem('fotoUp', imageData);
                $ionicLoading.show({template: 'Picture acquired...', duration: 500});
            },
            function (err) {
                $ionicLoading.show({template: 'Loading error...', duration: 2500});
            });
    };

    $scope.selectPicture = function() {
        var options = {
            quality: 50,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY
        };

        $cordovaCamera.getPicture(options).then(
            function (imageURI) {
                window.resolveLocalFileSystemURL(imageURI, function (fileEntry) {
                    $scope.loadedPics = true;
                    $scope.picData = fileEntry.nativeURL;
                    console.log(fileEntry);
                    $scope.pics.push(fileEntry.nativeURL);
                    $scope.ftLoad = true;
                });
                $ionicLoading.show({template: 'Picture acquired...', duration: 500});
            },
            function (err) {
                $ionicLoading.show({template: 'Loading error...', duration: 500});
            });
    };

    $scope.uploadPicture = function() {
        $ionicLoading.show({template: 'Sto inviando la foto...'});
        var fileURL = $scope.picData;
        var options = new FileUploadOptions();
        options.fileKey = "file";
        options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
        options.mimeType = "image/jpeg";
        options.chunkedMode = true;

        var params = {};
        params.value1 = "someparams";
        params.value2 = "otherparams";

        options.params = params;

        var ft = new FileTransfer();
        ft.upload(fileURL, encodeURI("http://www.yourdomain.com/upload.php"), viewUploadedPictures, function(error) {
            $ionicLoading.show({template: 'Errore di connessione...'});
            $ionicLoading.hide();
        }, options);
    };

    var viewUploadedPictures = function() {
        $ionicLoading.show({template: 'Sto cercando le tue foto...'});
        var server = "http://www.yourdomain.com/upload.php";
        if (server) {
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState === 4) {
                    if (xmlhttp.status === 200) {
                        document.getElementById('server_images').innerHTML = xmlhttp.responseText;
                    }
                    else {
                        $ionicLoading.show({template: 'Errore durante il caricamento...', duration: 1000});
                        return false;
                    }
                }
            };
            xmlhttp.open("GET", server, true);
            xmlhttp.send();
        }
        $ionicLoading.hide();
    };

    $scope.viewPictures = function() {
        $ionicLoading.show({template: 'Sto cercando le tue foto...'});
        var server = "http://www.yourdomain.com/upload.php";
        if (server) {
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState === 4) {
                    if (xmlhttp.status === 200) {
                        document.getElementById('server_images').innerHTML = xmlhttp.responseText;
                    }
                    else {
                        $ionicLoading.show({template: 'Errore durante il caricamento...', duration: 1000});
                        return false;
                    }
                }
            };
            xmlhttp.open("GET", server, true);
            xmlhttp.send();
        }
        $ionicLoading.hide();
    };








    init();
});