'use strict';

(function (window, angular) {

    var imControllers = angular.module('imControllers', []);

    imControllers.controller('appCtrl', [
        '$scope',
        '$indexedDB',
        function ($scope, $indexedDB) {
            var initDb = function () {
                var addToTypes = [{"name": "Phone"}, {"name": "Tablet"}, {"name": "Laptop"}];
                $indexedDB.openStore('type', function (store) {
                    store.clear().then(function () {});
                    store.insert(addToTypes).then(function (e) {});
                    store.getAll().then(function (types) {
                        console.log(types);
                    });
                });
            };
            
            initDb();
        }
    ]);

})(window, window.angular);