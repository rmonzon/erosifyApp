/**
 * Created by raul on 4/11/16.
 */

angular.module('controllers').controller('AddPhotosController', function ($scope, $ionicActionSheet, $cordovaCamera, $cordovaFileTransfer, $ionicLoading, GenericController, mainFactory) {
    function init() {
        GenericController.init($scope);

        $scope.loadedPics = false;
        $scope.pics = ['img/raul.jpg'];
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






    $scope.takePicture = function() {
        var options = {
            quality: 50,
            destinationType: Camera.DestinationType.FILE_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            targetWidth: 500,
            targetHeight: 800,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };
        $cordovaCamera.getPicture(options).then(takePictureSuccess, takePictureError);
    };

    $scope.selectPicture = function() {
        var options = {
            quality: 50,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            targetWidth: 500,
            targetHeight: 800,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };
        $cordovaCamera.getPicture(options).then(getPictureSuccess, getPictureError);
    };

    $scope.uploadImages = function () {
        var server = "http://192.168.1.5:5001/api/v1/upload";
        var options = {
            fileKey: "file",
            fileName: "avatar",
            chunkedMode: false,
            mimeType: "image/jpg"
        };
        $cordovaFileTransfer.upload(encodeURI(server), $scope.picData, options)
            .then(function(result) {
                console.log(result);
                // Success!
            }, function(err) {
                console.log(err);
                // Error
            }, function (progress) {
                // constant progress updates
                console.log("constant progress updates");
            });
    };

    $scope.uploadPicture = function() {
        $ionicLoading.show({template: 'Sending pictures...'});
        var fileURL = $scope.picData;
        var options = new FileUploadOptions();
        options.fileKey = "file";
        options.fileName = 'avatar.jpg';
        options.mimeType = "image/jpeg";
        options.chunkedMode = true;

        var params = {};
        params.value1 = "someparams";
        params.value2 = "otherparams";

        options.params = params;

        var ft = new FileTransfer();

        ft.onprogress = function(progressEvent) {
            if (progressEvent.lengthComputable) {
                console.log(progressEvent.loaded / progressEvent.total);
                //loadingStatus.setPercentage(progressEvent.loaded / progressEvent.total);
            } else {
                //loadingStatus.increment();
            }
        };

        ft.upload(fileURL, encodeURI("http://192.168.1.5:5001/api/v1/upload"), uploadPicsSuccess, uploadPicsError, options);
    };

    var uploadPicsSuccess = function (r) {
        console.log("Code = " + r.responseCode);
        console.log("Response = " + r.response);
        console.log("Sent = " + r.bytesSent);
    };

    var uploadPicsError = function (error) {
        $ionicLoading.show({template: 'Connection error...'});
        $ionicLoading.hide();
    };

    function takePictureSuccess(imageData) {
        $scope.loadedPics = true;
        $scope.picData = imageData;
        $scope.pics.push(imageData);
        localStorage.setItem('fotoUp', imageData);
        $ionicLoading.show({template: 'Picture acquired...', duration: 500});
    }

    function takePictureError(err) {
        $ionicLoading.show({template: 'Loading error...', duration: 2500});
    }

    function getPictureSuccess(imageURI) {
        window.resolveLocalFileSystemURL(imageURI, function (fileEntry) {
            $scope.loadedPics = true;
            $scope.picData = fileEntry.nativeURL;
            $scope.pics.push(fileEntry.nativeURL);
            $scope.uploadImages();
            //$scope.uploadPicture();
        });
        $ionicLoading.show({template: 'Picture acquired...', duration: 500});
    }

    function getPictureError() {
        $ionicLoading.show({template: 'Loading error...', duration: 500});
    }








    init();
});