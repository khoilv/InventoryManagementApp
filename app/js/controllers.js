'use strict';

(function (window, angular) {

    var imControllers = angular.module('imControllers', []);

    /**
     * Application controller
     */
    imControllers.controller('appCtrl', ['$scope', function ($scope) {

    }]);

    /**
     * Home controller
     */
    imControllers.controller('homeCtrl', [
        '$scope',
        'dbService',
        'OBJECT_STORE_NAME_PRODUCT',
        'OBJECT_STORE_NAME_VENDOR',
        'OBJECT_STORE_NAME_TYPE',
        function ($scope, dbService, OBJECT_STORE_NAME_PRODUCT, OBJECT_STORE_NAME_VENDOR, OBJECT_STORE_NAME_TYPE) {
            dbService.initDb();
            $scope.items = null;
            $scope.latestItems = null;
            
            // get and show all products
            dbService.getAll(OBJECT_STORE_NAME_PRODUCT, function (data) {
                $scope.items = data;
            });

            // get and show the 5 latest products
            dbService.getLatestItems(function (data) {
                $scope.latestItems = data;
            });
        }
    ]);

})(window, window.angular);