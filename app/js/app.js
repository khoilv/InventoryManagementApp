'use strict';

(function (window, angular) {

    // Declare app level module which depends on views, and components
    var imApp = angular.module('imApp', [
        'ngRoute',
        'indexedDB',
        'ui.bootstrap',
        'imControllers'
    ]);

    // application's constants
    imApp.constant('OBJECT_STORE_NAME_PRODUCT', 'product');
    imApp.constant('OBJECT_STORE_NAME_VENDOR', 'vendor');
    imApp.constant('OBJECT_STORE_NAME_TYPE', 'type');

    imApp.config([
        '$locationProvider',
        '$routeProvider',
        '$indexedDBProvider',
        function($locationProvider, $routeProvider, $indexedDBProvider) {
            $locationProvider.hashPrefix('!');

            $routeProvider.otherwise({redirectTo: '/'});

            $indexedDBProvider
                .connection('myIndexedDB')
                .upgradeDatabase(1, function (event, db, tx) {

                    // product
                    if (!db.objectStoreNames.contains("product")) {
                        var productObjStore = db.createObjectStore('product', {keyPath: 'id', autoIncrement: true});
                        productObjStore.createIndex('name_idx', 'name', {unique: false});
                        productObjStore.createIndex('vendor_id_idx', 'vendor_id', {unique: false});
                        productObjStore.createIndex('type_id_idx', 'type_id', {unique: false});
                        productObjStore.createIndex('serial_number_idx', 'serial_number', {unique: false});
                        productObjStore.createIndex('price_idx', 'price', {unique: false});
                        productObjStore.createIndex('weight_idx', 'weight', {unique: false});
                        productObjStore.createIndex('color_idx', 'color', {unique: false});
                        productObjStore.createIndex('release_date_idx', 'release_date', {unique: false});
                        productObjStore.createIndex('published_idx', 'published', {unique: false});
                        productObjStore.createIndex('photo_idx', 'photo', {unique: false});
                        productObjStore.createIndex('created_date_idx', 'created_date', {unique: false});
                    }

                    // vendor
                    if (!db.objectStoreNames.contains("vendor")) {
                        var vendorObjStore = db.createObjectStore('vendor', {keyPath: 'id', autoIncrement: true});
                        vendorObjStore.createIndex('name_idx', 'name', {unique: true});
                        vendorObjStore.createIndex('logo_idx', 'logo', {unique: false});
                    }

                    // type
                    if (!db.objectStoreNames.contains("type")) {
                        var typeObjStore = db.createObjectStore('type', {keyPath: 'id', autoIncrement: true});
                        typeObjStore.createIndex('name_idx', 'name', {unique: true});
                    }
                });
        }
    ]);

})(window, window.angular);