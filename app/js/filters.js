'use strict';

(function (window, angular) {

    var imFilters = angular.module('imFilters', []);

    imFilters.filter('weight', function () {
        return function (w) {
            if (isNaN(w) || w < 0) {
                return w;
            } else {
                return w + ' g';
            }
        }
    });

})(window, window.angular);
