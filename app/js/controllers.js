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
            dbService.getLatestItems(function (items) {
                var latestItems = [], latestItem = null;
                items.forEach(function (item) {
                    latestItem = {"photo": item.photo, "name": item.name, "price": item.price, "vendor_logo": null, "vendor_name": null};
                    dbService.getVendor(item.vendor_id, latestItem);
                    latestItems.push(latestItem);
                });
                $scope.latestItems = latestItems;
            });
        }
    ]);

})(window, window.angular);