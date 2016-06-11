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
            $scope.items = null;
            
            // get all products
            dbService.getAll(OBJECT_STORE_NAME_PRODUCT, function (data) {
                $scope.items = data;
            })
        }
    ]);

})(window, window.angular);