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
        'formatDate',
        'OBJECT_STORE_NAME_PRODUCT',
        'OBJECT_STORE_NAME_VENDOR',
        'OBJECT_STORE_NAME_TYPE',
        function ($scope, dbService, formatDate, OBJECT_STORE_NAME_PRODUCT, OBJECT_STORE_NAME_VENDOR, OBJECT_STORE_NAME_TYPE) {
            dbService.initDb();
            $scope.items = null;
            $scope.latestItems = null;

            // get and show all products
            dbService.getAll(OBJECT_STORE_NAME_PRODUCT, function (items) {
                if (Array.isArray(items) && items.length > 0) {
                    var i, length = items.length, item = null;
                    for (i = 0; i < length; i++) {
                        item = items[i];
                        dbService.getVendor(item.vendor_id, item);
                        dbService.getType(item.type_id, item);
                        item.release_date = formatDate(item.release_date);
                        items[i] = item;
                    }
                    $scope.items = items;
                }
            });

            // get and show the 5 latest products
            dbService.getLatestItems(function (items) {
                if (Array.isArray(items) && items.length > 0) {
                    var i, length = items.length, item = null;
                    for (i = 0; i < length; i++) {
                        item = items[i];
                        dbService.getVendor(item.vendor_id, item);
                        items[i] = item;
                    }
                    $scope.latestItems = items;
                }
            });
        }
    ]);

})(window, window.angular);