'use strict';

// Declare app level module which depends on filters, and services
var app = angular.module('app', [
        'app.controllers',
        'app.services',
        'app.customService',
        'ngRoute',
		//'ngCookies',
        'ui.bootstrap'
    ]).
	config(['$routeProvider', function($routeProvider) {
		$routeProvider.
            when("/home", {templateUrl: "partials/home.html", controller: "homeController"}).
            when("/weighted", {templateUrl: "partials/weighted.html", controller: "weightedController"}).
            when("/markets", {templateUrl: "partials/markets.html", controller: "marketsController"}).
            when("/trades/:id", {templateUrl: "partials/tradesBySymbol.html", controller: "tradesBySymbolController"}).
            when("/settings", {templateUrl: "partials/settings.html", controller: "settingsController"}).
            when("/about", {templateUrl: "partials/about.html", controller: "aboutController"}).
			otherwise({redirectTo: "/home"});
}]);

app.run(function($rootScope, $location, $timeout, $log, settingsService, customService) {
	settingsService.setStore(new Persist.Store('Bitcoin Easy Check'));

	$rootScope.loadingClass = '';

    $rootScope.getClass = function(path) {
		//$log.debug('path: '+ path + ', $location.path(): ' + $location.path());
        if ($location.path().substr(0, path.length) === path) {
            return "active";
        }
        else {
            return "";
        }
    };

	$rootScope.openLink = customService.openLink;

    $rootScope.loadData = function() {
		$rootScope.loadingClass = 'fa-spin';
        $log.info('loadData! ' + $location.path());
        $rootScope.$broadcast('bitcoinchartsAPIService.refresh', $location.path());
		$timeout(function() {
				$rootScope.loadingClass = ''; // stop spinner
			}, 2000);
    };

	// reload the page every 10 minutes
	$timeout(function() {
		document.location.reload(true);
	}, 600000);

	customService.doCustomActions(); // perform platform-specific javascript

});
