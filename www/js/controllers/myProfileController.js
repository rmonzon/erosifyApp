/**
 * Created by raul on 4/1/16.
 */

angular.module('controllers').controller('MyProfileController', function ($scope, $timeout, $ionicSlideBoxDelegate, $cordovaCamera, $cordovaFileTransfer, $ionicActionSheet, GenericController, User, mainFactory) {

    function init() {
        GenericController.init($scope);
        $scope.images = [];
        $scope.slideIndex = 0;
        $scope.loadingNum = 0;
        $scope.user = {};
        $scope.editingProfile = false;
        $scope.loadingProfile = true;
        $scope.loadingProfilePics = true;

        $scope.picNumber = 0;
        $scope.totalPics = 0;
        $scope.loadedPics = true;
        $scope.picsEdited = false;
        $scope.pics = ["", "", "", "", "", ""];
        $scope.progressW = [0, 0, 0, 0, 0, 0];
        
        $scope.getMyInfo();
        $scope.removeHideClass('#profile-menu-icon');
    }

    $scope.getMyInfo = function () {
        mainFactory.me({ "email": $scope.getUserFromLS().email }).then(successCallback, errorCallback);
    };

    function successCallback(response) {
        response.data.data = $scope.parseDataFromDB(response.data.data);
        User.setUser(response.data.data);
        $scope.user = User.getUser();
        $scope.loadingProfile = false;
        $ionicSlideBoxDelegate.update();
        for (var i = 0; i < $scope.user.pictures.length; i++) {
            $scope.pics[i] = $scope.user.pictures[i];
        }
    }

    function errorCallback(response) {
        $scope.loadingProfile = false;
        $scope.showMessage(response.data.error, 2500);
        $scope.logout();
    }
    
    $scope.enableEditProfile = function () {
        $scope.editingProfile = true;
    };

    $scope.saveProfileChanges = function () {
        if (!$scope.pics[0]) {
            $scope.showMessage("You have to select a profile picture!", 2000);
            return;
        }
        //update user pictures in the db
        $scope.showMessageWithIcon("Saving your photos...");
        var pics = createArrayOfImgs();
        mainFactory.updateNewUserPics({ user_id: User.getUser().id, pics: pics }).then(function (response) {
            response.data.user = $scope.parseDataFromDB(response.data.user);
            User.setUser(response.data.user);
            $scope.hideMessage();

            var obj = {
                user_id: $scope.user.id,
                work: $scope.user.work ? $scope.escapeInvalidChars($scope.user.work) : "",
                education: $scope.user.education ? $scope.escapeInvalidChars($scope.user.education) : "",
                aboutme: $scope.user.aboutme ? $scope.escapeInvalidChars($scope.user.aboutme) : "",
                languages: $scope.user.languages ? "{" + $scope.user.languages + "}" : "{English}",
                looking_to: $scope.user.looking_to ? $scope.user.looking_to : null
            };
            mainFactory.updateUserInfo(obj).then(successUpdateUserInfo, errorUpdateUserInfo);
        }, function (err) {
            $scope.hideMessage();
            $scope.showMessage(err);
        });
    };

    function successUpdateUserInfo(response) {
        response.data.user = $scope.parseDataFromDB(response.data.user);
        User.setUser(response.data.user);
        $scope.user = User.getUser();
        $scope.showMessage("Profile update successfully!", 1500);
        $scope.editingProfile = false;
        $ionicSlideBoxDelegate.update();
    }

    function errorUpdateUserInfo(response) {
        $scope.showMessage(response.data.error, 2500);
        $scope.editingProfile = false;
    }

    $scope.nextPic = function() {
        $ionicSlideBoxDelegate.next();
    };

    $scope.previousPic = function() {
        $ionicSlideBoxDelegate.previous();
    };

    // Called each time the slide changes
    $scope.slideChanged = function(index) {
        $scope.slideIndex = index;
    };

    $scope.imageLoaded = function () {
        $scope.loadingNum++;
        if ($scope.loadingNum == $scope.user.pictures.length) {
            $scope.loadingProfilePics = false;
            $scope.loadingNum = 0;
        }
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
            $scope.picsEdited = true;
        }, function (err) {
            $scope.showMessage(err, 2000);
        });
    };

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
            saveToPhotoAlbum: false
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
                $scope.picsEdited = true;
                $scope.progressW[$scope.picNumber - 1] = 0;
            }, function (err) {
                $scope.hideMessage();
                $scope.showMessage("Upload image failed!", 2000);
                $scope.progressW[$scope.picNumber - 1] = 0;
            }, function (progress) {
                $scope.progressW[$scope.picNumber - 1] = $scope.picNumber - 1 === 0 ? progress.loaded * 59 / progress.total : progress.loaded * 27 / progress.total;
            });
    };

    function createArrayOfImgs() {
        var pics = [];
        for (var i = 0; i < $scope.pics.length; ++i) {
            if ($scope.pics[i]) {
                if ($scope.pics[i].indexOf('facebook') == -1) {
                    var p = i + 1;
                    pics.push(p + ".jpg");
                }
                else {
                    pics.push($scope.pics[i]);
                }
            }
        }
        pics = "'{" + pics.join(",") + "}'";
        return pics;
    }
    
    init();
});