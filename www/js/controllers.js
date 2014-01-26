'use strict';

angular.module('app.controllers', []).
    controller('homeController', function($scope, $rootScope, $log, cryptocoinchartsAPIService, utilService, settingsService, customService) {
		$scope.getPriceCompareClass = function(price1, price2) {
			$log.info('price compare:', price1, price2);
			return utilService.getPriceCompareClass(price1, price2);
		}

        $scope.currency = settingsService.getCurrency();
        $scope.latest_trade = settingsService.getLatestTrade(); // GMT date of the latest trade in database
        $scope.price_before_24h = settingsService.getNumValue('price_before_24h'); // last traded price 24 hours before
        $scope.price = settingsService.getNumValue('price'); // last traded price of best market
        $scope.best_market = settingsService.getBestMarket(); // market with the most volume for this trading pair
        $scope.volume = settingsService.getNumValue('volume'); // trading volume expressed as LTC

        $scope.loadData = function() {
            cryptocoinchartsAPIService.getLTCTrading($scope.currency).success(function (trading) {
				if (trading) {
					$log.info('trading:', trading);

                    settingsService.setCurrency(trading.currency);
                    $scope.currency = settingsService.getCurrency();

                    settingsService.setLatestTrade(trading.latest_trade);
                    $scope.latest_trade = settingsService.getLatestTrade();

                    settingsService.setNumValue('price_before_24h', trading.price_before_24h);
                    $scope.price_before_24h = settingsService.getNumValue('price_before_24h');

                    settingsService.setNumValue('price', trading.price);
                    $scope.price = settingsService.getNumValue('price');

                    settingsService.setBestMarket(trading.best_market);
                    $scope.best_market = settingsService.getBestMarket();

                    settingsService.setNumValue('volume_ltc', trading.volume_first);
                    $scope.volume_ltc = settingsService.getNumValue('volume_ltc');
				}
				else {
					$log.warn('Warning: No trading data returned from cryptocoinchartsAPIService.getLTCTrading(' + $scope.currency + ')', response);
				}
            });
        }

        $scope.$on('cryptocoinchartsAPIService.refresh', function(event, path) {
            if (path === '/home') {
                $scope.loadData();
            }
        });

        $rootScope.loadData();

		customService.trackPage('/home');
    }).
    controller('settingsController', function($scope, $rootScope, $log, settingsService, customService) {
		$scope.selectedCurrency = settingsService.getCurrency();

		$scope.$watch('selectedCurrency', function() {
			settingsService.setCurrency($scope.selectedCurrency);
			$log.info('Set selected currency to', settingsService.getCurrency());
		});

		$scope.symbols = settingsService.symbols;

        $scope.$on('cryptocoinchartsAPIService.refresh', function(event, path) {
            if (path && path.substring(0,9) === '/settings') {
                $scope.loadData();
            }
        });

        $rootScope.loadData();

		customService.trackPage('/settings');
    }).
    controller('aboutController', function($scope, utilService, customService) {
		$scope.version = utilService.getAppVersion();

		customService.trackPage('/about');
    });



