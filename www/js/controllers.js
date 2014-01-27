'use strict';

angular.module('app.controllers', []).
    controller('homeController', function($scope, $rootScope, $log, cryptocoinchartsAPIService, utilService, settingsService, customService) {
		$scope.getPriceCompareClass = function(price1, price2) {
			//$log.info('price compare:', price1, price2);
			return utilService.getPriceCompareClass(price1, price2);
		}

        $scope.currency = settingsService.getCurrency();
        $scope.latest_trade = settingsService.getNumValue('latest_trade'); // GMT date of the latest trade in database
        $scope.price_before_24h = settingsService.getNumValue('price_before_24h'); // last traded price 24 hours before
        $scope.price = settingsService.getNumValue('price'); // last traded price of best market
        $scope.best_market = settingsService.getBestMarket(); // market with the most volume for this trading pair
        $scope.volume = settingsService.getNumValue('volume'); // trading volume expressed as LTC

        $scope.loadData = function() {
            cryptocoinchartsAPIService.getLTCTrading('BTC').success(function (response) {
				if (response) {
					//$log.info('BTC response:', response);

                    settingsService.setNumValue('price_btc', response.price);
                    $scope.price_btc = settingsService.getNumValue('price_btc');
				}
				else {
					$log.warn('Warning: No trading data returned from cryptocoinchartsAPIService.getLTCTrading(BTC)', response);
				}
			});

            cryptocoinchartsAPIService.getLTCTrading($scope.currency).success(function (response) {
				if (response) {
					//$log.info($scope.currency, 'response:', response);

                    settingsService.setNumValue('latest_trade', Date.parse(response.latest_trade + ' GMT'));
                    $scope.latest_trade = settingsService.getNumValue('latest_trade');

                    settingsService.setNumValue('price_before_24h', response.price_before_24h);
                    $scope.price_before_24h = settingsService.getNumValue('price_before_24h');

                    settingsService.setNumValue('price', response.price);
                    $scope.price = settingsService.getNumValue('price');

                    settingsService.setBestMarket(response.best_market);
                    $scope.best_market = settingsService.getBestMarket();

                    settingsService.setNumValue('volume', response.volume_second);
                    $scope.volume = settingsService.getNumValue('volume');

                    settingsService.setNumValue('volume_ltc', response.volume_first);
                    $scope.volume_ltc = settingsService.getNumValue('volume_ltc');

                    settingsService.setNumValue('volume_btc', response.volume_btc);
                    $scope.volume_btc = settingsService.getNumValue('volume_btc');
				}
				else {
					$log.warn('Warning: No trading data returned from cryptocoinchartsAPIService.getLTCTrading(' + $scope.currency + ')', response);
				}
            });
        }

        $scope.$on('cryptocoinchartsAPIService.refresh', function(event, path) {
            if (path && path === '/home') {
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

		customService.trackPage('/settings');
    }).
    controller('aboutController', function($scope, utilService, customService) {
		$scope.version = utilService.getAppVersion();

		customService.trackPage('/about');
    });



