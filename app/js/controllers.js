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
            //dbService.initDb();
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
            dbService.getAllPublishedItems(function (items) {
                $scope.items = $scope.formatData(items);
            });

            // get and show the 5 latest products
            dbService.getLatestPublishedItems(function (items) {
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
                dbService.searchPublishedItems(searchValue, function (items) {
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
        '$uibModal',
        '$log',
        'dbService',
        'OBJECT_STORE_NAME_PRODUCT',
        'OBJECT_STORE_NAME_VENDOR',
        'OBJECT_STORE_NAME_TYPE',
        function ($scope, $uibModal, $log, dbService, OBJECT_STORE_NAME_PRODUCT, OBJECT_STORE_NAME_VENDOR, OBJECT_STORE_NAME_TYPE) {
            $scope.totalItems = null;
            $scope.averagePrice = null;
            $scope.items = null;
            $scope.activeProductList = 'active-tab';
            $scope.activeVendorList = '';

            // get and show all products
            showAllItems();

            $scope.onTabChange = function (tab) {
                if (tab == 'product') {
                    $scope.activeProductList = 'active-tab';
                    $scope.activeVendorList = '';
                    dbService.getAll(OBJECT_STORE_NAME_PRODUCT, function (items) {
                        $scope.items = $scope.formatData(items);
                    });
                } else {
                    $scope.activeProductList = '';
                    $scope.activeVendorList = 'active-tab';
                    dbService.getAll(OBJECT_STORE_NAME_VENDOR, function (items) {
                        $scope.items = items;
                    });
                }
            };

            $scope.addProduct = function () {
                var modalInst = $uibModal.open({
                    animation: true,
                    templateUrl: 'partials/dashboard/popup/addProduct.html',
                    controller: 'PopupAddProductCtrl',
                    size: 'lg',
                    resolve: {
                    }
                });
                
                modalInst.result.then(function (newItem) { // function called when modal closed
                    $log.info(newItem);
                    $scope.item = newItem;
                }, function () { // function called when modal rejected
                    $log.info('Modal dismissed at: ' + new Date());
                });
            };

            $scope.editProduct = function (itemId) {
                var modalInst = $uibModal.open({
                    animation: true,
                    templateUrl: 'partials/dashboard/popup/editProduct.html',
                    controller: 'PopupEditProductCtrl',
                    size: 'lg',
                    resolve: {
                        itemId: function () {
                            return itemId;
                        }
                    }
                });

                modalInst.result.then(function (item) { // function called when modal closed
                    $log.info(item);
                    dbService.updateItem(item, function (data) {
                        $log.info(data);
                        showAllItems();
                    });
                }, function () { // function called when modal rejected
                    $log.info('Modal dismissed at: ' + new Date());
                });
            };

            function showAllItems() {
                dbService.getAll(OBJECT_STORE_NAME_PRODUCT, function (items) {
                    var sumPrice = 0, total = items.length;
                    angular.forEach(items, function (item) {
                        sumPrice += parseFloat(item.price);
                    });
                    $scope.totalItems = total;
                    $scope.averagePrice = sumPrice/total;
                    $scope.items = $scope.formatData(items);
                });
            }
        }
    ]);

    imControllers.controller('PopupAddProductCtrl', [
        '$scope',
        '$uibModalInstance',
        'dbService',
        'OBJECT_STORE_NAME_VENDOR',
        'OBJECT_STORE_NAME_TYPE',
        function ($scope, $uiModalInstance, dbService, OBJECT_STORE_NAME_VENDOR, OBJECT_STORE_NAME_TYPE) {
            $scope.vendors = null;
            $scope.types = null;
            $scope.item = {
                id: 0,
                name: null,
                vendor_id: null,
                type_id: null,
                serial_number: null,
                price: null,
                weight: null,
                color: null,
                release_date: null,
                published: 0,
                photo: null,
                created_date: null
            };

            dbService.getAll(OBJECT_STORE_NAME_VENDOR, function (vendors) {
                $scope.vendors = vendors;
            });
            dbService.getAll(OBJECT_STORE_NAME_TYPE, function (types) {
                $scope.types = types;
            });

            $scope.submitProduct = function () {
                $uiModalInstance.close($scope.item);
            };
            $scope.cancel = function () {
                $uiModalInstance.dismiss('cancel');
            };
        }
    ]);

    imControllers.controller('PopupEditProductCtrl', [
        '$scope',
        '$uibModalInstance',
        '$log',
        'convertDate',
        'dbService',
        'itemId',
        'OBJECT_STORE_NAME_VENDOR',
        'OBJECT_STORE_NAME_TYPE',
        function ($scope, $uiModalInstance, $log, convertDate, dbService, itemId, OBJECT_STORE_NAME_VENDOR, OBJECT_STORE_NAME_TYPE) {
            $scope.vendors = null;
            $scope.types = null;
            $scope.item = null;

            $scope.dateOptions = {
                formatYear: 'yy',
                maxDate: new Date(2020, 5, 22),
                minDate: new Date(2000, 1, 1),
                startingDay: 1
            };
            $scope.popup = {
                opened: false
            };
            $scope.open = function() {
                $scope.popup.opened = true;
            };

            dbService.getItem(itemId, function (item) {
                $scope.item = item;
            });
            dbService.getAll(OBJECT_STORE_NAME_VENDOR, function (vendors) {
                $scope.vendors = vendors;
            });
            dbService.getAll(OBJECT_STORE_NAME_TYPE, function (types) {
                $scope.types = types;
            });

            $scope.submitProduct = function () {
                $scope.item.release_date = convertDate($scope.item.release_date);
                $uiModalInstance.close($scope.item);
            };
            $scope.cancel = function () {
                $uiModalInstance.dismiss('cancel');
            };
        }
    ]);

})(window, window.angular);