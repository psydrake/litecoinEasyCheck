'use strict';

angular.module('app.controllers', []).
    controller('homeController', function($scope, $rootScope, $log, cryptocoinchartsAPIService, utilService, settingsService, customService) {
		$scope.getPriceCompareClass = function(price1, price2) {
			//$log.info('price compare:', price1, price2);
			return utilService.getPriceCompareClass(price1, price2);
		}

        $scope.currency = settingsService.getValue('currency');
        $scope.latest_trade = settingsService.getNumValue('latest_trade'); // GMT date of the latest trade in database
        $scope.price_before_24h = settingsService.getNumValue('price_before_24h'); // last traded price 24 hours before
        $scope.price = settingsService.getNumValue('price'); // last traded price of best market
        $scope.best_market = settingsService.getValue('best_market'); // market with the most volume for this trading pair
        $scope.volume = settingsService.getNumValue('volume'); // trading volume expressed as the selected currency
        $scope.volume_ltc = settingsService.getNumValue('volume_ltc'); // trading volume expressed as LTC
        $scope.price_btc = settingsService.getNumValue('price_btc'); // price of LTC in BTC
		// if BTC is selected as currency, show user's preferred fiat currency too
		$scope.currency_non_btc = settingsService.getValue('currency_non_btc'); 
		$scope.price_non_btc = settingsService.getNumValue('price_non_btc');

        $scope.loadData = function() {
			if ($scope.currency !== 'BTC') { // selected currency is not BTC, so we'll show the BTC price of LTC too
				cryptocoinchartsAPIService.getLTCTrading('BTC').success(function (response) {
					if (response) {
						settingsService.setNumValue('price_btc', response.price);
						$scope.price_btc = settingsService.getNumValue('price_btc');
					}
					else {
						$log.warn('Warning: No trading data returned for BTC :', response);
					}
				});
			}
			else { // selected currency is BTC, so show price in user's preferred fiat currency too
				cryptocoinchartsAPIService.getLTCTrading($scope.currency_non_btc).success(function (response) {
					if (response) {
						settingsService.setNumValue('price_non_btc', response.price);
						$scope.price_non_btc = settingsService.getNumValue('price_non_btc');
					}
					else {
						$log.warn('Warning: No trading data returned for', $scope.currency_non_btc, ':', response);
					}
				});
			}

            cryptocoinchartsAPIService.getLTCTrading($scope.currency).success(function (response) {
				if (response) {
					var latestTradeStr = response.latest_trade.replace(/\-/g, '/') + ' GMT';

                    settingsService.setNumValue('latest_trade', Date.parse(latestTradeStr));
                    $scope.latest_trade = settingsService.getNumValue('latest_trade');

                    settingsService.setNumValue('price_before_24h', response.price_before_24h);
                    $scope.price_before_24h = settingsService.getNumValue('price_before_24h');

                    settingsService.setNumValue('price', response.price);
                    $scope.price = settingsService.getNumValue('price');

                    settingsService.setValue('best_market', response.best_market);
                    $scope.best_market = settingsService.getValue('best_market');

                    settingsService.setNumValue('volume', response.volume_second);
                    $scope.volume = settingsService.getNumValue('volume');

                    settingsService.setNumValue('volume_ltc', response.volume_first);
                    $scope.volume_ltc = settingsService.getNumValue('volume_ltc');
				}
				else {
					$log.warn('Warning: No trading data returned for', $scope.currency, ':', response);
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
		$scope.selectedCurrency = settingsService.getValue('currency');

		$scope.$watch('selectedCurrency', function() {
			settingsService.setValue('currency', $scope.selectedCurrency);
			$log.info('Set selected currency to', settingsService.getValue('currency'));

			// set user's preferred non-BTC currency, for secondary display, for when user selects BTC as currency
			if ($scope.selectedCurrency !== 'BTC') { 
				settingsService.setValue('currency_non_btc', $scope.selectedCurrency);
			}
		});

		$scope.symbols = settingsService.symbols;

		customService.trackPage('/settings');
    }).
    controller('aboutController', function($scope, utilService, customService) {
		$scope.version = utilService.getAppVersion();

		customService.trackPage('/about');
    });



