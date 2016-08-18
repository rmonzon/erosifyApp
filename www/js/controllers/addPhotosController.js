/**
 * Created by raul on 4/11/16.
 */

angular.module('controllers').controller('AddPhotosController', function ($scope, $ionicActionSheet, $cordovaCamera, $cordovaFileTransfer, GenericController, mainFactory, User) {
    function init() {
        GenericController.init($scope);

        $scope.picNumber = 0;
        $scope.totalPics = 0;
        $scope.loadedPics = true;
        $scope.pics = ["", "", "", "", "", ""];
        $scope.progressW = [0, 0, 0, 0, 0, 0];
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
                    $scope.takePictureWithCamera();
                }
                if (index === 1) {
                    $scope.selectPictureFromLib();
                }
                return true;
            }
        });
    };

    $scope.addPic = function (index) {
        $scope.totalPics++;
        $scope.picNumber = index + 1;
        $scope.showActionSheet();
    };

    $scope.removePic = function (index) {
        mainFactory.removeImageFromS3({ user_id: User.getUser().id, file_name: $scope.picNumber + ".jpg" }).then(function (response) {
            $scope.totalPics--;
            $scope.pics.splice(index, 1);
        }, function (err) {
            $scope.showMessage(err, 2000);
        });
    };

    function createArrayOfImgs() {
        var pics = [];
        for (var i = 1; i <= $scope.totalPics; ++i) {
            pics.push(i + ".jpg");
        }
        pics = "'{" + pics.join(",") + "}'";
        return pics;
    }

    $scope.continueToMatching = function () {
        if ($scope.totalPics < 1) {
            $scope.showMessage("You must upload at least one picture!", 2000);
            return;
        }
        if (!$scope.pics[0]) {
            $scope.showMessage("You have to select a profile picture!", 2000);
            return;
        }
        
        //update user pictures in the db
        $scope.showMessageWithIcon("Saving your photos...");
        var pics = createArrayOfImgs();
        mainFactory.updateNewUserPics({ user_id: User.getUser().id, amazon_pics: pics }).then(function (response) {
            response.data.user = $scope.parseDataFromDB(response.data.user);
            User.setUser(response.data.user);
            $scope.hideMessage();
            $scope.goToPage('app/matching');
        }, function (err) {
            $scope.hideMessage();
            $scope.showMessage("Something went wrong with the request!", 2000);
        });
    };

    $scope.takePictureWithCamera = function() {
        var options = {
            quality: 70,
            destinationType: Camera.DestinationType.FILE_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            targetWidth: 1000,
            targetHeight: 1000,
            allowEdit: false,
            encodingType: Camera.EncodingType.JPEG,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false,
            correctOrientation: true
        };
        $cordovaCamera.getPicture(options).then(function (imageURI) {
            $scope.showMessage("Uploading picture...");
            $scope.picData = imageURI;
            uploadToS3(imageURI);
        }, function (err) {
            console.log(err);
            $scope.hideMessage();
            $scope.showMessage('Error taking the picture!', 2500);
        });
    };

    $scope.selectPictureFromLib = function() {
        var options = {
            quality: 70,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            targetWidth: 1000,
            targetHeight: 1000,
            allowEdit: false,
            encodingType: Camera.EncodingType.JPEG,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false,
            correctOrientation: true
        };
        $cordovaCamera.getPicture(options).then(function (imageURI) {
            $scope.showMessage("Uploading picture...");
            $scope.picData = imageURI;
            uploadToS3(imageURI);
        }, function (err) {
            $scope.hideMessage();
            $scope.showMessage('Error getting the picture!', 2500);
        });
    };

    function uploadToS3(imageURI) {
        var fileName = $scope.picNumber + ".jpg";
        var file = {
            file_name: fileName,
            file_type: "image/jpeg",
            user_id: User.getUser().id
        };
        mainFactory.getSignS3(file).then(function (response) {
            $scope.uploadImageToAmazon(response.data.data, imageURI, fileName);
        }, function (response) {
            console.log(response);
            $scope.showMessage(response.data.error, 3000);
        });
    }

    $scope.uploadImageToAmazon = function (data, imageURI, fileName) {
        var Uoptions = {
            fileKey: "file",
            fileName: fileName,
            mimeType: "image/jpeg",
            chunkedMode: false,
            headers: {
                connection: "close"
            },
            params: {
                "key": "profiles/user_" + User.getUser().id + "/" + fileName,
                "AWSAccessKeyId": data.awsKey,
                "acl": "public-read",
                "policy": data.policy,
                "signature": data.signature,
                "Content-Type": "image/jpeg"
            }
        };
        $cordovaFileTransfer.upload(data.baseUrl, imageURI, Uoptions)
            .then(function (result) {
                $scope.pics[$scope.picNumber - 1] = data.url;
                $scope.hideMessage();
                $scope.loadedPics = true;
            }, function (err) {
                $scope.hideMessage();
                $scope.showMessage("Upload image failed!", 2000);
            }, function (progress) {
                $scope.progressW[$scope.picNumber - 1] = $scope.picNumber - 1 === 0 ? progress.loaded * 59 / progress.total : progress.loaded * 27 / progress.total;
            });
    };

    init();
});