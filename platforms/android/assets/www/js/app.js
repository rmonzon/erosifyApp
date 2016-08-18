// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in mainController.js
angular.module('starter', ['ionic', 'controllers', 'models', 'services', 'ngCordova', 'ngSanitize', 'btford.socket-io'])

.run(function($ionicPlatform, mainFactory, User) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });

    //handle Cordova resume (enter foreground) and pause (enter background events)
    $ionicPlatform.on('resume', function() {
        console.log("App is active again!");
        mainFactory.setUserStatus({ my_id: User.getUser().id, status: 1 }).then(function (response) {
        }, function (response) {
            console.log(response);
        });
    });

    $ionicPlatform.on('pause', function() {
        //Do something here on entering background
        console.log("App is in background mode");
        mainFactory.setUserStatus({ my_id: User.getUser().id, status: 0 }).then(function (response) {
        }, function (response) {
            console.log(response);
        });
    });
})

.config(function($stateProvider, $urlRouterProvider, $compileProvider, $animateProvider, $ionicConfigProvider) {
    $compileProvider.debugInfoEnabled(false);
    $animateProvider.classNameFilter( /\banimated\b/ );
    $ionicConfigProvider.scrolling.jsScrolling(false);
    $stateProvider
        .state('home', {
            url: '/home',
            templateUrl: 'templates/home.html',
            controller: 'HomeController',
            resolve: {
                factoryInitialized: function (mainFactory) {
                    return mainFactory.initApp();
                }
            }
        })
        .state('login', {
            cache: false,
            url: '/login',
            templateUrl: 'templates/login.html',
            controller: 'LoginController',
            resolve: {
                factoryInitialized: function (mainFactory) {
                    return mainFactory.initApp();
                }
            }
        })
        .state('signup', {
            cache: false,
            url: '/signup',
            templateUrl: 'templates/signup.html',
            controller: 'SignUpController',
            resolve: {
                factoryInitialized: function (mainFactory) {
                    return mainFactory.initApp();
                }
            }
        })
        .state('forgot_password', {
            url: '/forgot_password',
            templateUrl: 'templates/forgot_password.html',
            controller: 'ForgotPasswordController',
            resolve: {
                factoryInitialized: function (mainFactory) {
                    return mainFactory.initApp();
                }
            }
        })
        .state('add_photos', {
            url: '/add_photos',
            templateUrl: 'templates/add_photos.html',
            controller: 'AddPhotosController',
            resolve: {
                factoryInitialized: function (mainFactory) {
                    return mainFactory.initApp();
                }
            }
        })

        .state('app', {
            cache: false,
            url: '/app',
            abstract: true,
            templateUrl: 'templates/menu.html',
            controller: 'AppCtrl',
            resolve: {
                factoryInitialized: function (mainFactory) {
                    return mainFactory.initApp();
                }
            }
        })
        .state('app.settings', {
            url: '/settings',
            views: {
                'menuContent': {
                    templateUrl: 'templates/settings.html',
                    controller: 'SettingsController'
                }
            }
        })
        .state('app.myprofile', {
            cache: false,
            url: '/myprofile',
            views: {
                'menuContent': {
                    templateUrl: 'templates/my_profile.html',
                    controller: 'MyProfileController'
                }
            }
        })
        .state('app.userprofile', {
            cache: false,
            url: '/profile/:userId',
            views: {
                'menuContent': {
                    templateUrl: 'templates/user_profile.html',
                    controller: 'UserProfileController'
                }
            }
        })
        .state('app.matching', {
            cache: false,
            url: '/matching',
            views: {
                'menuContent': {
                    templateUrl: 'templates/matching.html',
                    controller: 'MatchingController'
                }
            }
        })
        .state('app.peoplenearby', {
            url: '/peoplenearby',
            views: {
                'menuContent': {
                    templateUrl: 'templates/peoplenearby.html',
                    controller: 'PeopleNearbyController'
                }
            }
        })
        .state('app.search', {
            cache: false,
            url: '/search',
            views: {
                'menuContent': {
                    templateUrl: 'templates/search.html',
                    controller: 'SearchController'
                }
            }
        })
        .state('app.visitors', {
            cache: false,
            url: '/visitors',
            views: {
                'menuContent': {
                    templateUrl: 'templates/visitors.html',
                    controller: 'VisitorsController'
                }
            }
        })
        .state('app.matches', {
            cache: false,
            url: '/matches',
            views: {
                'menuContent': {
                    templateUrl: 'templates/mymatches.html',
                    controller: 'MyMatchesController'
                }
            }
        })
        .state('app.likes', {
            cache: false,
            url: '/likes',
            views: {
                'menuContent': {
                    templateUrl: 'templates/likes.html',
                    controller: 'LikesController'
                }
            }
        })
        .state('app.favorites', {
            cache: false,
            url: '/favorites',
            views: {
                'menuContent': {
                    templateUrl: 'templates/favorites.html',
                    controller: 'FavoritesController'
                }
            }
        })
        .state('app.messages', {
            url: '/messages',
            views: {
                'menuContent': {
                    templateUrl: 'templates/messages.html',
                    controller: 'MessagesController'
                }
            }
        })

        .state('app.chat', {
            url: '/messages/:userId',
            views: {
                'menuContent': {
                    templateUrl: 'templates/chat_window.html',
                    controller: 'ChatController'
                }
            }
        });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/home');
});
