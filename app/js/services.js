'use strict';

(function (window, angular) {

    var imServices = angular.module('imServices', []);

    imServices.factory('utilService', [function () {
        var convertDate = function (strDate) {
            return new Date(strDate).getTime(); // new Date(strDate).getTime() / 1000;
        };

        var formatDate = function (timestamp) {
            var options = {year: 'numeric', month: 'numeric', day: 'numeric'};
            var d = new Date(timestamp * 1000);
            return d.toLocaleDateString('en-US', options);
        };

        return {
            convertDate: convertDate,
            formatDate: formatDate
        }
    }]);

    imServices.factory('dbService', [
        '$indexedDB',
        'utilService',
        'OBJECT_STORE_NAME_PRODUCT',
        'OBJECT_STORE_NAME_VENDOR',
        'OBJECT_STORE_NAME_TYPE',
        function ($indexedDB, utilService, OBJECT_STORE_NAME_PRODUCT, OBJECT_STORE_NAME_VENDOR, OBJECT_STORE_NAME_TYPE) {
            var initDb = function () {
                // initialize types
                var types = [
                    {"id": 1, "name": "Phone"},
                    {"id": 2, "name": "Tablet"},
                    {"id": 3, "name": "Laptop"}
                ];
                $indexedDB.openStore(OBJECT_STORE_NAME_TYPE, function (store) {
                    store.clear().then(function () {
                    });
                    store.insert(types).then(function (e) {
                    });
                });

                // initialize vendors
                var vendors = [
                    {"id": 1, "name": "HP", "logo": "img/logo/logo1.jpg"},
                    {"id": 2, "name": "Dell", "logo": "img/logo/logo2.jpg"},
                    {"id": 3, "name": "Sony", "logo": "img/logo/logo3.jpg"},
                    {"id": 4, "name": "Apple", "logo": "img/logo/logo4.jpg"},
                    {"id": 5, "name": "Magic", "logo": "img/logo/logo5.jpg"}
                ];
                $indexedDB.openStore(OBJECT_STORE_NAME_VENDOR, function (store) {
                    store.clear().then(function () {
                    });
                    store.insert(vendors).then(function (e) {
                    });
                });

                // initialize products
                var products = [
                    {
                        "name": "Laptop HP Envy 10",
                        "vendor_id": 1,
                        "type_id": 1,
                        "serial_number": "123456",
                        "price": "18",
                        "weight": "200",
                        "color": "Black",
                        "release_date": utilService.convertDate('06/10/2016'),
                        "published": true,
                        "photo": "img/product/p-img1.jpg",
                        "created_date": utilService.convertDate('06/10/2016')
                    },
                    {
                        "name": "Laptop Dell Inspiration 6",
                        "vendor_id": 2,
                        "type_id": 1,
                        "serial_number": "123456",
                        "price": "30",
                        "weight": "200",
                        "color": "White",
                        "release_date": utilService.convertDate('06/12/2016'),
                        "published": false,
                        "photo": "img/product/p-img2.jpg",
                        "created_date": utilService.convertDate('06/06/2016')
                    },
                    {
                        "name": "Laptop HP Envy 11",
                        "vendor_id": 3,
                        "type_id": 2,
                        "serial_number": "123456",
                        "price": "95",
                        "weight": "200",
                        "color": "White",
                        "release_date": utilService.convertDate('06/08/2016'),
                        "published": true,
                        "photo": "img/product/p-img3.jpg",
                        "created_date": utilService.convertDate('06/11/2016')
                    },
                    {
                        "name": "Laptop HP Envy 8",
                        "vendor_id": 4,
                        "type_id": 2,
                        "serial_number": "123456",
                        "price": "52",
                        "weight": "200",
                        "color": "Black",
                        "release_date": utilService.convertDate('05/28/2016'),
                        "published": true,
                        "photo": "img/product/p-img4.jpg",
                        "created_date": utilService.convertDate('06/08/2016')
                    },
                    {
                        "name": "Laptop HP Envy 9",
                        "vendor_id": 5,
                        "type_id": 3,
                        "serial_number": "123456",
                        "price": "18",
                        "weight": "200",
                        "color": "Black",
                        "release_date": utilService.convertDate('06/01/2016'),
                        "published": true,
                        "photo": "img/product/p-img4.jpg",
                        "created_date": utilService.convertDate('06/09/2016')
                    },
                    {
                        "name": "Laptop HP Envy 7",
                        "vendor_id": 1,
                        "type_id": 3,
                        "serial_number": "123456",
                        "price": "27.25",
                        "weight": "200",
                        "color": "Black",
                        "release_date": utilService.convertDate('05/30/2016'),
                        "published": true,
                        "photo": "img/product/p-img4.jpg",
                        "created_date": utilService.convertDate('06/07/2016')
                    }
                ];
                $indexedDB.openStore(OBJECT_STORE_NAME_PRODUCT, function (store) {
                    store.clear().then(function () {
                    });
                    store.insert(products).then(function (e) {
                    });
                });
            };

            var getAllPublishedItems = function (callback) {
                $indexedDB.openStore(OBJECT_STORE_NAME_PRODUCT, function (store) {
                    store.getAll().then(function (items) {
                        var data = [];
                        if (Array.isArray(items) && items.length > 0) {
                            angular.forEach(items, function (item) {
                                if (item.published == true) data.push(item);
                            });
                            if (typeof callback === 'function') {
                                callback(data);
                            }
                        }
                    });
                });
            };

            var searchPublishedItems = function (searchValue, callback) {
                $indexedDB.openStore(OBJECT_STORE_NAME_PRODUCT, function (store) {
                    store.getAll().then(function (items) {
                        var data = [], searchKey = null;
                        angular.forEach(items, function (item) {
                            if (item.published == true) {
                                searchKey = item.name + ' ' + item.color + ' ' + item.price;
                                if (searchKey.toLowerCase().search(searchValue.toLowerCase()) != -1) {
                                    data.push(item);
                                }
                            }
                        });
                        if (typeof callback === 'function') {
                            callback(data);
                        }
                    });
                });
            };

            var getLatestPublishedItems = function (callback) {
                $indexedDB.openStore(OBJECT_STORE_NAME_PRODUCT, function (store) {
                    var find = store.query().$index("release_date_idx").$desc(false);
                    store.findWhere(find).then(function (e) {
                        var data = [];
                        if (Array.isArray(e) && e.length > 0) {
                            angular.forEach(e, function (item) {
                                if (item.published == true) data.push(item);
                            });
                            if (data.length > 5) data = data.slice(0, 5);
                            if (typeof callback === 'function') callback(data);
                        }
                    });
                });
            };

            var getItem = function (id, type, callback) {
                $indexedDB.openStore(type, function (store) {
                    store.find(id).then(function (e) {
                        if (typeof callback === 'function') {
                            callback(e);
                        }
                    });
                });
            };

            // EITHER Update OR Insert an item into store
            var upsertItem = function (item, type, callback) {
                $indexedDB.openStore(type, function (store) {
                    store.upsert(item).then(function (e) {
                        if (typeof callback === 'function') {
                            callback();
                        }
                    });
                });
            };

            var deleteItem = function (itemId, type, callback) {
                $indexedDB.openStore(type, function (store) {
                    store.delete(itemId).then(function () {
                        if (typeof callback === 'function') {
                            callback();
                        }
                    })
                });
            };

            var getAll = function (type, callback) {
                $indexedDB.openStore(type, function (store) {
                    store.getAll().then(function (items) {
                        if (typeof callback === 'function') {
                            callback(items);
                        }
                    });
                });
            };

            var getVendor = function (id, object) {
                $indexedDB.openStore(OBJECT_STORE_NAME_VENDOR, function (store) {
                    store.find(id).then(function (e) {
                        object.vendor_logo = e.logo;
                        object.vendor_name = e.name;
                    });
                });
            };

            var getType = function (id, object) {
                $indexedDB.openStore(OBJECT_STORE_NAME_TYPE, function (store) {
                    store.find(id).then(function (e) {
                        object.type_name = e.name;
                    });
                });
            };

            return {
                initDb: initDb,
                getAllPublishedItems: getAllPublishedItems,
                searchPublishedItems: searchPublishedItems,
                getLatestPublishedItems: getLatestPublishedItems,
                getItem: getItem,
                upsertItem: upsertItem,
                deleteItem: deleteItem,
                getAll: getAll,
                getVendor: getVendor,
                getType: getType
            }
        }
    ]);

})(window, window.angular);