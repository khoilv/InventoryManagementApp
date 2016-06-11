'use strict';

(function (window, angular) {

    var imServices = angular.module('imServices', []);

    imServices.factory('dbService', [
        '$indexedDB',
        'OBJECT_STORE_NAME_PRODUCT',
        'OBJECT_STORE_NAME_VENDOR',
        'OBJECT_STORE_NAME_TYPE',
        function ($indexedDB, OBJECT_STORE_NAME_PRODUCT, OBJECT_STORE_NAME_VENDOR, OBJECT_STORE_NAME_TYPE) {
            var initDb = function () {
                var addToTypes = [{"name": "Phone"}, {"name": "Tablet"}, {"name": "Laptop"}];
                $indexedDB.openStore(OBJECT_STORE_NAME_TYPE, function (store) {
                    store.clear().then(function () {});
                    store.insert(addToTypes).then(function (e) {});
                });
            };

            var getAll = function (type, callback) {
                $indexedDB.openStore(type, function (store) {
                    store.getAll().then(function (data) {
                        if (typeof callback === 'function') {
                            callback(data);
                        }
                    });
                });
            };

            return {
                initDb: initDb,
                getAll: getAll
            }
        }
    ]);

})(window, window.angular);