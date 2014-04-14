'use strict';

// Declare app level module which depends on filters, and services
var app = angular.module('app', [
        'app.controllers',
        'app.services',
        'app.customService',
        'ngRoute',
		'ngTouch',
        'ui.bootstrap'
    ]).
	config(['$routeProvider', function($routeProvider) {
		$routeProvider.
            when("/home", {templateUrl: "partials/home.html", controller: "homeController"}).
            when("/settings", {templateUrl: "partials/settings.html", controller: "settingsController"}).
            when("/about", {templateUrl: "partials/about.html", controller: "aboutController"}).
			otherwise({redirectTo: "/home"});
}]);

app.run(function($rootScope, $location, $timeout, $log, settingsService, customService, utilService) {
	settingsService.setStore(new Persist.Store('Litecoin Easy Check'));

	$rootScope.loadingClass = '';

    $rootScope.getClass = function(path) {
        if ($location.path().substr(0, path.length) === path) {
            return "active";
        }
        else {
            return "";
        }
    };

	$rootScope.openLink = customService.openLink;

	$rootScope.goto = function(pageName) {
		$location.path('/' + pageName);
	}

	$rootScope.currencySymbol = function(currency) {
		return utilService.currencySymbol(currency);
	}

    $rootScope.loadData = function() {
		$rootScope.loadingClass = 'fa-spin';
        $log.info('loadData! ' + $location.path());
        $rootScope.$broadcast('cryptocoinchartsAPIService.refresh', $location.path());
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
