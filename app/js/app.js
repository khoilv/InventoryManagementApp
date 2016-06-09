'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ngRoute',
    'indexedDB',
    'ui.bootstrap'
]).
config(['$locationProvider', '$routeProvider', '$indexedDBProvider', function($locationProvider, $routeProvider, $indexedDBProvider) {
    $locationProvider.hashPrefix('!');

    $routeProvider.otherwise({redirectTo: '/view1'});

    $indexedDBProvider
        .connection('myIndexedDB')
        .upgradeDatabase(1, function (event, db, tx) {
            var objStore = db.createObjectStore('product', {keyPath: 'id'});
            objStore.createIndex();
        });
}]);
