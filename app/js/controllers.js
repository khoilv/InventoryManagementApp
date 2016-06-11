'use strict';

(function (window, angular) {

    var imControllers = angular.module('imControllers', []);

    imControllers.controller('appCtrl', [
        '$scope',
        'dbService',
        'OBJECT_STORE_NAME_PRODUCT',
        'OBJECT_STORE_NAME_VENDOR',
        'OBJECT_STORE_NAME_TYPE',
        function ($scope, dbService, OBJECT_STORE_NAME_PRODUCT, OBJECT_STORE_NAME_VENDOR, OBJECT_STORE_NAME_TYPE) {
            dbService.initDb();
            dbService.getAll(OBJECT_STORE_NAME_TYPE, function (data) {
                console.log(data);
            });
        }
    ]);

})(window, window.angular);