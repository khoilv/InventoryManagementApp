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
            $scope.searchText = null;
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

            $scope.hasMenuUp = function (fieldName) {
                var status = getOrderStatus(fieldName);
                return (status == ORDER_BY_NONE || status == ORDER_BY_DESC);
            };
            
            $scope.hasMenuDown = function (fieldName) {
                var status = getOrderStatus(fieldName);
                return (status == ORDER_BY_NONE || status == ORDER_BY_ASC);
            };

            $scope.sortItems = function (fieldName) {
                var status, index = $scope.sorts.priority.indexOf(fieldName);
                if ( index != -1) {
                    delete $scope.sorts.priority[index];
                    $scope.sorts.priority = $scope.sorts.priority.filter(function (element) {
                        return !!element;
                    });
                }
                $scope.sorts.priority.push(fieldName);
                index = $scope.sorts.field.indexOf(fieldName);
                status = $scope.sorts.status[index];
                if (status == ORDER_BY_NONE || status == ORDER_BY_DESC) {
                    status = ORDER_BY_ASC;
                } else if (status == ORDER_BY_ASC) {
                    status = ORDER_BY_DESC;
                }
                $scope.sorts.status[index] = status;
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
            
            function getOrderStatus (fieldName) {
                var index = $scope.sorts.field.indexOf(fieldName);
                return $scope.sorts.status[index];
            }
        }
    ]);

})(window, window.angular);