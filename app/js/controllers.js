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
        'ITEM_TYPE_PRODUCT',
        'ITEM_TYPE_VENDOR',
        'ITEM_TYPE_TYPE',
        'ORDER_BY_NONE',
        'ORDER_BY_ASC',
        'ORDER_BY_DESC',
        function ($scope, $filter, dbService, ITEM_TYPE_PRODUCT, ITEM_TYPE_VENDOR, ITEM_TYPE_TYPE, ORDER_BY_NONE, ORDER_BY_ASC, ORDER_BY_DESC) {
            $scope.active = 'active';
            $scope.items = null;
            $scope.latestItems = null;
            $scope.searchText = '';
            $scope.sorts = {
                field: ['name', 'vendor_name', 'type_name', 'serial_number', 'price', 'weight', 'color', 'release_date', 'photo'],
                status: [ORDER_BY_NONE, ORDER_BY_NONE, ORDER_BY_NONE, ORDER_BY_NONE, ORDER_BY_NONE, ORDER_BY_NONE, ORDER_BY_NONE, ORDER_BY_NONE, ORDER_BY_NONE],
                priority: []
            };

            //dbService.initDb();

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
        'utilService',
        'dbService',
        'ITEM_TYPE_PRODUCT',
        'ITEM_TYPE_VENDOR',
        'ITEM_TYPE_TYPE',
        function ($scope, $uibModal, $log, utilService, dbService, ITEM_TYPE_PRODUCT, ITEM_TYPE_VENDOR, ITEM_TYPE_TYPE) {
            $scope.totalItems = null;
            $scope.averagePrice = null;
            $scope.items = null;
            $scope.activeProductList = 'active-tab';
            $scope.activeVendorList = '';

            // get and show all products
            showItemList('product');

            $scope.onTabChange = function (tab) {
                if (tab == 'product') {
                    $scope.activeProductList = 'active-tab';
                    $scope.activeVendorList = '';
                    dbService.getAll(ITEM_TYPE_PRODUCT, function (items) {
                        $scope.items = $scope.formatData(items);
                    });
                } else {
                    $scope.activeProductList = '';
                    $scope.activeVendorList = 'active-tab';
                    dbService.getAll(ITEM_TYPE_VENDOR, function (items) {
                        $scope.items = items;
                    });
                }
            };

            $scope.addProduct = function () {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'partials/dashboard/popup/product.html',
                    controller: 'PopupAddProductCtrl',
                    size: 'lg',
                    resolve: {} // resolve (Type: Object) - Members that will be resolved and passed to the controller as locals;
                });
                modalInstance.result.then(function (item) { // function called when modal closed
                    $log.info(item);
                    dbService.upsertItem(item, ITEM_TYPE_PRODUCT, showItemList.bind(this, ITEM_TYPE_PRODUCT));
                }, function () { // function called when modal rejected
                    $log.info('Add Product modal dismissed at: ' + new Date());
                });
            };

            $scope.editProduct = function (itemId) {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'partials/dashboard/popup/product.html',
                    controller: 'PopupEditProductCtrl',
                    size: 'lg',
                    resolve: {
                        itemId: function () {
                            return itemId;
                        }
                    }
                });
                modalInstance.result.then(function (item) { // function called when modal closed
                    dbService.upsertItem(item, ITEM_TYPE_PRODUCT, showItemList.bind(this, ITEM_TYPE_PRODUCT));
                }, function () { // function called when modal rejected
                    $log.info('Edit Product modal dismissed at: ' + new Date());
                });
            };

            $scope.deleteProduct = function (id) {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'partials/dashboard/popup/delete.html',
                    controller: 'PopupDeleteCtrl',
                    size: 'lg',
                    resolve: {
                        id: function () {
                            return id;
                        },
                        deleteType: function () {
                            return 'product';
                        }
                    }
                });
                modalInstance.result.then(function (id) { // function called when modal closed
                    dbService.deleteItem(id, ITEM_TYPE_PRODUCT, showItemList.bind(this, ITEM_TYPE_PRODUCT));
                }, function () { // function called when modal rejected
                    $log.info('Delete Product modal dismissed at: ' + new Date());
                });
            };

            $scope.addVendor = function () {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'partials/dashboard/popup/vendor.html',
                    controller: 'PopupVendorCtrl',
                    size: 'sm',
                    resolve: {
                        vendorId: function () {
                            return 0;
                        }
                    }
                });
                modalInstance.result.then(function (vendor) {
                    $log.info(vendor);
                    dbService.upsertItem(vendor, ITEM_TYPE_VENDOR, showItemList.bind(this, ITEM_TYPE_VENDOR));
                }, function () {
                    $log.info('Add Vendor modal dismissed at: ' + new Date());
                });
            };

            $scope.editVendor = function (vendorId) {
                $log.info('VendorID = ' + vendorId);
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'partials/dashboard/popup/vendor.html',
                    controller: 'PopupVendorCtrl',
                    size: 'sm',
                    resolve: {
                        vendorId: function () {
                            return vendorId;
                        }
                    }
                });
                modalInstance.result.then(function (vendor) {
                    dbService.upsertItem(vendor, ITEM_TYPE_VENDOR, showItemList.bind(this, ITEM_TYPE_VENDOR));
                }, function () {
                    $log.info('Edit Vendor modal dismissed at: ' + new Date());
                });
            };

            function showItemList(type) {
                if (type == ITEM_TYPE_PRODUCT) {
                    dbService.getAll(type, function (items) {
                        var sumPrice = 0, total = items.length;
                        angular.forEach(items, function (item) {
                            sumPrice += parseFloat(item.price);
                        });
                        $scope.totalItems = total;
                        $scope.averagePrice = sumPrice / total;
                        $scope.items = $scope.formatData(items);
                    });
                } else if (type == ITEM_TYPE_VENDOR) {
                    dbService.getAll(type, function (items) {
                        $scope.items = items;
                    });
                }
            }
        }
    ]);

    /**
     * PopupAddProduct controller
     */
    imControllers.controller('PopupAddProductCtrl', [
        '$scope',
        '$uibModalInstance',
        '$log',
        'utilService',
        'dbService',
        'ITEM_TYPE_VENDOR',
        'ITEM_TYPE_TYPE',
        function ($scope, $uibModalInstance, $log, utilService, dbService, ITEM_TYPE_VENDOR, ITEM_TYPE_TYPE) {
            $scope.vendors = null;
            $scope.types = null;
            $scope.item = {
                name: null,
                vendor_id: null,
                type_id: null,
                serial_number: null,
                price: null,
                weight: null,
                color: null,
                release_date: null,
                published: false,
                photo: 'img/product/p-img1.jpg',
                created_date: utilService.convertDate(new Date())
            };

            $scope.dateOptions = {
                formatYear: 'yy',
                maxDate: new Date(2020, 5, 22),
                minDate: new Date(2000, 1, 1),
                startingDay: 1
            };
            $scope.popup = {
                opened: false
            };
            $scope.open = function () {
                $scope.popup.opened = true;
            };

            dbService.getAll(ITEM_TYPE_VENDOR, function (vendors) {
                $scope.vendors = vendors;
            });
            dbService.getAll(ITEM_TYPE_TYPE, function (types) {
                $scope.types = types;
            });

            $scope.submitProduct = function () {
                $scope.item.release_date = utilService.convertDate($scope.item.release_date);
                $uibModalInstance.close($scope.item);
            };
            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };
        }
    ]);

    /**
     * PopupEditProduct controller
     */
    imControllers.controller('PopupEditProductCtrl', [
        '$scope',
        '$uibModalInstance',
        '$log',
        'utilService',
        'dbService',
        'itemId', // pass in a parameter
        'ITEM_TYPE_PRODUCT',
        'ITEM_TYPE_VENDOR',
        'ITEM_TYPE_TYPE',
        function ($scope, $uibModalInstance, $log, utilService, dbService, itemId, ITEM_TYPE_PRODUCT, ITEM_TYPE_VENDOR, ITEM_TYPE_TYPE) {
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
            $scope.open = function () {
                $scope.popup.opened = true;
            };

            dbService.getItem(itemId, ITEM_TYPE_PRODUCT, function (item) {
                $scope.item = item;
            });
            dbService.getAll(ITEM_TYPE_VENDOR, function (vendors) {
                $scope.vendors = vendors;
            });
            dbService.getAll(ITEM_TYPE_TYPE, function (types) {
                $scope.types = types;
            });

            $scope.submitProduct = function () {
                $scope.item.release_date = utilService.convertDate($scope.item.release_date);
                $uibModalInstance.close($scope.item);
            };
            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };
        }
    ]);

    /**
     * PopupDelete controller (common to BOTH delete product AND delete vendor)
     */
    imControllers.controller('PopupDeleteCtrl', [
        '$scope',
        '$uibModalInstance',
        '$log',
        'dbService',
        'id', // a passed-in parameter
        'deleteType', // a passed-in parameter
        function ($scope, $uibModalInstance, $log, dbService, id, deleteType) {
            $scope.id = id;
            $scope.itemType = deleteType;

            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };
            $scope.delete = function () {
                $uibModalInstance.close($scope.id);
            }
        }
    ]);

    /**
     * PopupVendor controller
     */
    imControllers.controller('PopupVendorCtrl', [
        '$scope',
        '$uibModalInstance',
        '$log',
        'dbService',
        'vendorId', // a passed-in parameter
        'ITEM_TYPE_VENDOR',
        function ($scope, $uibModalInstance, $log, dbService, vendorId, ITEM_TYPE_VENDOR) {
            $scope.vendor = {
                name: null,
                logo: 'img/logo/logo1.jpg'
            };
            if (vendorId > 0) {
                dbService.getItem(vendorId, ITEM_TYPE_VENDOR, function (vendor) {
                    $scope.vendor = vendor;
                });
            }

            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };
            $scope.submitVendor = function () {
                $uibModalInstance.close($scope.vendor);
            };
        }
    ]);

})(window, window.angular);