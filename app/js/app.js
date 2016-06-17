'use strict';

(function (window, angular) {

    // Declare app level module which depends on views, and components
    var imApp = angular.module('imApp', [
        'ngRoute',
        'indexedDB',
        'ui.bootstrap',
        'imControllers',
        'imServices',
        'imFilters',
        'imDirectives'
    ]);

    // application's constants
    imApp.constant('ITEM_TYPE_PRODUCT', 'product');
    imApp.constant('ITEM_TYPE_VENDOR', 'vendor');
    imApp.constant('ITEM_TYPE_TYPE', 'type');
    imApp.constant('ORDER_BY_NONE', 0);
    imApp.constant('ORDER_BY_ASC', 1);
    imApp.constant('ORDER_BY_DESC', 2);

    imApp.config([
        '$locationProvider',
        '$routeProvider',
        '$indexedDBProvider',
        function($locationProvider, $routeProvider, $indexedDBProvider) {
            $locationProvider.hashPrefix('!');
            //$locationProvider.html5Mode(false).hashPrefix('!');

            $routeProvider
                .when('/', {
                    templateUrl: 'partials/home/main.html',
                    controller: 'homeCtrl'
                })
                .when('/home', {
                    templateUrl: 'partials/home/main.html',
                    controller: 'homeCtrl'
                })
                .when('/dashboard', {
                    templateUrl: 'partials/dashboard/main.html',
                    controller: 'dashboardCtrl'
                })
                .otherwise({redirectTo: '/'});

            $indexedDBProvider
                .connection('myIndexedDB')
                .upgradeDatabase(1, function (event, db, tx) {

                    var objStore = null;

                    // vendor
                    if (!db.objectStoreNames.contains("vendor")) {
                        objStore = db.createObjectStore('vendor', {keyPath: 'id', autoIncrement: true});
                        objStore.createIndex('name_idx', 'name', {unique: true});
                        objStore.createIndex('logo_idx', 'logo', {unique: false});
                    }

                    // type
                    if (!db.objectStoreNames.contains("type")) {
                        objStore = db.createObjectStore('type', {keyPath: 'id', autoIncrement: true});
                        objStore.createIndex('name_idx', 'name', {unique: true});
                    }

                    // product
                    if (!db.objectStoreNames.contains("product")) {
                        objStore = db.createObjectStore('product', {keyPath: 'id', autoIncrement: true});
                        objStore.createIndex('name_idx', 'name', {unique: false});
                        objStore.createIndex('vendor_id_idx', 'vendor_id', {unique: false});
                        objStore.createIndex('type_id_idx', 'type_id', {unique: false});
                        objStore.createIndex('serial_number_idx', 'serial_number', {unique: false});
                        objStore.createIndex('price_idx', 'price', {unique: false});
                        objStore.createIndex('weight_idx', 'weight', {unique: false});
                        objStore.createIndex('color_idx', 'color', {unique: false});
                        objStore.createIndex('release_date_idx', 'release_date', {unique: false});
                        objStore.createIndex('published_idx', 'published', {unique: false});
                        objStore.createIndex('photo_idx', 'photo', {unique: false});
                        objStore.createIndex('created_date_idx', 'created_date', {unique: false});
                    }
                });
        }
    ]);

})(window, window.angular);