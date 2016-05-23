/**
 * Created by raul on 3/3/16.
 */

angular.module('services').directive('ngEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if(event.which === 13) {
                scope.$apply(function(){
                    scope.$eval(attrs.ngEnter);
                });
                event.preventDefault();
            }
        });
    };
});

angular.module('services').directive('ngLoadImage', function() {
    return function(scope, element, attrs) {
        element.bind("load", function(event) {
            scope.$apply(function() {
                scope.$eval(attrs.ngLoadImage);
            });
        });
    };
});

angular.module('services').directive('uiMultiRange', function ($compile) {
    return {
        restrict: 'E',
        scope: {
            ngModelMin: '=',
            ngModelMax: '=',
            ngMin: '=',
            ngMax: '=',
            ngStep: '='
        },
        link: link
    };

    ////////////////////

    function link ($scope, $element, $attrs) {
        var min, max, step, $inputMin = angular.element('<input type="range">'), $inputMax;
        if (typeof $scope.ngMin != 'undefined') {
            min = $scope.ngMin;
            $inputMin.attr('min', min);
        } else {
            min = 0;
        }
        if (typeof $scope.ngMax != 'undefined') {
            max = $scope.ngMax;
            $inputMin.attr('max', max);
        } else {
            max = 100;
        }
        if (typeof $scope.ngStep != 'undefined') {
            $inputMin.attr('step', $scope.ngStep);
        }
        $inputMax = $inputMin.clone();
        $inputMin.attr('ng-model', 'ngModelMin');
        $inputMax.attr('ng-model', 'ngModelMax');
        $compile($inputMin)($scope);
        $compile($inputMax)($scope);
        $element.append($inputMin).append($inputMax);
        $scope.ngModelMin = $scope.ngModelMin || min;
        $scope.ngModelMax = $scope.ngModelMax || max;

        $scope.$watch('ngModelMin', function (newVal, oldVal) {
            if (newVal > $scope.ngModelMax) {
                $scope.ngModelMin = oldVal;
            }
        });

        $scope.$watch('ngModelMax', function (newVal, oldVal) {
            if (newVal < $scope.ngModelMin) {
                $scope.ngModelMax = oldVal;
            }
        });
    }
});