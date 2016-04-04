// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'controllers', 'models', 'services', 'ngCordova', 'ngSanitize', 'btford.socket-io'])

.run(function($ionicPlatform) {
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
})

.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('login', {
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
            url: '/signup',
            templateUrl: 'templates/signup.html',
            controller: 'SignUpController',
            resolve: {
                factoryInitialized: function (mainFactory) {
                    return mainFactory.initApp();
                }
            }
        })
        .state('privacy', {
            url: '/privacy',
            templateUrl: 'templates/privacy.html',
            controller: 'PrivacyController',
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

        .state('app', {
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
            url: '/myprofile',
            views: {
                'menuContent': {
                    templateUrl: 'templates/my_profile.html',
                    controller: 'MyProfileController'
                }
            }
        })
        .state('app.matching', {
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
        .state('app.matches', {
            url: '/matches',
            views: {
                'menuContent': {
                    templateUrl: 'templates/mymatches.html',
                    controller: 'MyMatchesController'
                }
            }
        })
        .state('app.visitors', {
            url: '/visitors',
            views: {
                'menuContent': {
                    templateUrl: 'templates/visitors.html',
                    controller: 'VisitorsController'
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

        .state('app.single', {
            url: '/messages/:userId',
            views: {
                'menuContent': {
                    templateUrl: 'templates/chat_window.html',
                    controller: 'ChatController'
                }
            }
        });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');
});
