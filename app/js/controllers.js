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
        '$filter',
        'dbService',
        'formatDate',
        'OBJECT_STORE_NAME_PRODUCT',
        'OBJECT_STORE_NAME_VENDOR',
        'OBJECT_STORE_NAME_TYPE',
        'ORDER_BY_NONE',
        'ORDER_BY_ASC',
        'ORDER_BY_DESC',
        function ($scope, $filter, dbService, formatDate, OBJECT_STORE_NAME_PRODUCT, OBJECT_STORE_NAME_VENDOR, OBJECT_STORE_NAME_TYPE, ORDER_BY_NONE, ORDER_BY_ASC, ORDER_BY_DESC) {
            dbService.initDb();
            $scope.items = null;
            $scope.latestItems = null;
            $scope.sorts = {
                field: ['name', 'vendor_name', 'type_name', 'serial_number', 'price', 'weight', 'color', 'release_date', 'photo'],
                status: [ORDER_BY_NONE, ORDER_BY_NONE, ORDER_BY_NONE, ORDER_BY_NONE, ORDER_BY_NONE, ORDER_BY_NONE, ORDER_BY_NONE, ORDER_BY_NONE, ORDER_BY_NONE],
                priority: []
            };

            // get and show all products
            dbService.getAll(OBJECT_STORE_NAME_PRODUCT, function (items) {
                $scope.items = formatData(items);
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

            // search for products
            $scope.searchItems = function (searchValue) {
                var index = searchValue.indexOf('.');
                if (index > 0) searchValue = searchValue.substring(0, index);
                dbService.searchItems(searchValue, function (items) {
                    $scope.items = formatData(items);
                });
            };

            $scope.sortItems = function (fieldName) {
                var index = $scope.sorts.field.indexOf(fieldName);
                var status = $scope.sorts.status[index];
                if (status == ORDER_BY_NONE || status == ORDER_BY_DESC) {
                    status = ORDER_BY_ASC;
                } else if (status == ORDER_BY_ASC) {
                    status = ORDER_BY_DESC;
                }
                $scope.sorts.status[index] = status;
                console.log($scope.sorts);
                console.log($scope.items);
            };

            function formatData(items) {
                if (Array.isArray(items) && items.length > 0) {
                    var i, length = items.length, item = null;
                    for (i = 0; i < length; i++) {
                        item = items[i];
                        dbService.getVendor(item.vendor_id, item);
                        dbService.getType(item.type_id, item);
                        items[i] = item;
                    }
                }
                return items;
            }

        }
    ]);

})(window, window.angular);