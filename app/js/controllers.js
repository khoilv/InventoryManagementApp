'use strict';

(function (window, angular) {

    var imControllers = angular.module('imControllers', []);

    /**
     * Application controller
     */
    imControllers.controller('appCtrl', ['$scope', 'dbService', function ($scope, dbService) {
        $scope.homeActive = 'active';
        $scope.dashboardActive = '';

        $scope.onMenuSelect = function (menu) {
            if (menu == 'home') {
                $scope.homeActive = 'active';
                $scope.dashboardActive = '';
            } else {
                $scope.homeActive = '';
                $scope.dashboardActive = 'active';
            }
        };

        $scope.formatData = function (items) {
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
            $scope.active = 'active';
            $scope.items = null;
            $scope.latestItems = null;
            $scope.searchText = '';
            $scope.sorts = {
                field: ['name', 'vendor_name', 'type_name', 'serial_number', 'price', 'weight', 'color', 'release_date', 'photo'],
                status: [ORDER_BY_NONE, ORDER_BY_NONE, ORDER_BY_NONE, ORDER_BY_NONE, ORDER_BY_NONE, ORDER_BY_NONE, ORDER_BY_NONE, ORDER_BY_NONE, ORDER_BY_NONE],
                priority: []
            };

            // get and show all products
            dbService.getAll(OBJECT_STORE_NAME_PRODUCT, function (items) {
                $scope.items = $scope.formatData(items);
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
                    resetSort();
                    $scope.items = $scope.formatData(items);
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
                if (index == -1) index = $scope.sorts.priority.indexOf('-' + fieldName);
                if (index != -1) removeOrderByField(index);
                index = $scope.sorts.field.indexOf(fieldName);
                status = $scope.sorts.status[index];
                if (status == ORDER_BY_NONE) {
                    status = ORDER_BY_ASC;
                    $scope.sorts.priority.push(fieldName);
                } else if (status == ORDER_BY_ASC) {
                    status = ORDER_BY_DESC;
                    $scope.sorts.priority.push('-' + fieldName);
                } else if (status == ORDER_BY_DESC) {
                    status = ORDER_BY_NONE;
                }
                $scope.sorts.status[index] = status;
                //console.log($scope.sorts.priority);
                $scope.items = $filter('orderBy')($scope.items, $scope.sorts.priority);
            };

            function getOrderStatus(fieldName) {
                var index = $scope.sorts.field.indexOf(fieldName);
                return $scope.sorts.status[index];
            }

            function removeOrderByField(index) {
                var priority = $scope.sorts.priority;
                delete priority[index];
                priority = priority.filter(function (element) {
                    return !!element;
                });
                $scope.sorts.priority = priority;
            }

            function resetSort() {
                $scope.sorts = {
                    field: ['name', 'vendor_name', 'type_name', 'serial_number', 'price', 'weight', 'color', 'release_date', 'photo'],
                    status: [ORDER_BY_NONE, ORDER_BY_NONE, ORDER_BY_NONE, ORDER_BY_NONE, ORDER_BY_NONE, ORDER_BY_NONE, ORDER_BY_NONE, ORDER_BY_NONE, ORDER_BY_NONE],
                    priority: []
                };
            }
        }
    ]);

    /**
     * Dashboard controller
     */
    imControllers.controller('dashboardCtrl', [
        '$scope',
        'dbService',
        'OBJECT_STORE_NAME_PRODUCT',
        'OBJECT_STORE_NAME_VENDOR',
        'OBJECT_STORE_NAME_TYPE',
        function ($scope, dbService, OBJECT_STORE_NAME_PRODUCT, OBJECT_STORE_NAME_VENDOR, OBJECT_STORE_NAME_TYPE) {
            $scope.totalItems = null;
            $scope.averagePrice = null;
            $scope.items = null;

            // get and show all products
            dbService.getAll(OBJECT_STORE_NAME_PRODUCT, function (items) {
                var sumPrice = 0, total = items.length;
                angular.forEach(items, function (item) {
                   sumPrice += parseFloat(item.price);
                });
                $scope.totalItems = total;
                $scope.averagePrice = sumPrice/total;
                $scope.items = $scope.formatData(items);
                console.log($scope.items);
            });
        }
    ]);

})(window, window.angular);