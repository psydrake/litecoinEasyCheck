'use strict';

angular.module('app.controllers', []).
    controller('homeController', function($scope, $rootScope, $log, bitcoinchartsAPIService, utilService, settingsService, customService) {
        $scope.symbol = settingsService.getPreferredMarket();
        $scope.currency = settingsService.getCurrency();
        $scope.latest_trade = settingsService.getNumValue('latest_trade'); // unix time of latest trade
        $scope.low = settingsService.getNumValue('low'); // lowest trade during day
        $scope.high = settingsService.getNumValue('high'); // highest trade during day
        $scope.volume = settingsService.getNumValue('volume'); // total trade volume of day in BTC
        $scope.currency_volume = settingsService.getNumValue('currency_volume'); // total trade volume of day in currency
        $scope.close = settingsService.getNumValue('close'); // latest trade
        $scope.previous_close = settingsService.getNumValue('previous_close'); // latest trade of previous day
        $scope.avg24h = settingsService.getNumValue('avg24h');

        $scope.currencySymbol = function(currency) {
            return utilService.currencySymbol(currency);
        }

        $scope.loadData = function() {
            bitcoinchartsAPIService.getMarkets($scope.symbol).success(function (response) {
				if (response && response[0]) {
	                var market = response[0];
                    settingsService.setCurrency(market.currency);
                    $scope.currency = settingsService.getCurrency();

                    settingsService.setNumValue('latest_trade', Number(market.latest_trade) * 1000); // unix time of latest trade
                    $scope.latest_trade = settingsService.getNumValue('latest_trade');

                    settingsService.setNumValue('low', market.low); // lowest trade during day
                    $scope.low = settingsService.getNumValue('low');

                    settingsService.setNumValue('high', market.high); // highest trade during day
                    $scope.high = settingsService.getNumValue('high');

                    settingsService.setNumValue('volume', market.volume);
                    $scope.volume = settingsService.getNumValue('volume');

                    settingsService.setNumValue('currency_volume', market.currency_volume); // total trade volume of day in currency
                    $scope.currency_volume = settingsService.getNumValue('currency_volume');

                    settingsService.setNumValue('close', market.close); // latest trade
                    $scope.close = settingsService.getNumValue('close');

					// previous_close doesn't ever seem to get populated
                    settingsService.setNumValue('previous_close', market.previous_close); // latest trade of previous day
                    $scope.previous_close = settingsService.getNumValue('previous_close');

                    bitcoinchartsAPIService.getWeightedPrices([$scope.currency]).success(function (response) {
                        if (response && response[$scope.currency]) {
                            settingsService.setNumValue('avg24h', response[$scope.currency]['24h']);
                            $scope.avg24h = settingsService.getNumValue('avg24h');
						}
						else {
							$log.warn('Warning: No weighted prices data returned from bitcoinchartsAPIService.getWeightedPrices(' + $scope.currency + ')', response);	
						}

						// set css class for closing price
						if (!$scope.close || !$scope.avg24h) {
							$scope.closePriceClass = 'priceUnknown';
						}
						else if ($scope.close > $scope.avg24h) {
							$scope.closePriceClass = 'priceUp';
						}
						else if ($scope.close < $scope.avg24h) {
							$scope.closePriceClass = 'priceDown';
						}
						else {
							$scope.closePriceClass = 'priceSame';
						}
					});
				}
				else {
					$log.warn('Warning: No market data returned from bitcoinchartsAPIService.getMarkets(' + $scope.symbol + ')', response);
				}
            });
        }

        $scope.$on('bitcoinchartsAPIService.refresh', function(event, path) {
            if (path === '/home') {
                $scope.loadData();
            }
        });

        $rootScope.loadData();

		customService.trackPage('/home');
    }).
	controller('weightedController', function($scope, $rootScope, $log, bitcoinchartsAPIService, settingsService, utilService, customService) {
        $scope.weightedPrices = settingsService.weightedPrices;
        $scope.timestamp = settingsService.getNumValue('timestamp');
		$scope.preferredCurrencyAbbrev = utilService.getCurrencyAbbrev(settingsService.getPreferredMarket());

        $scope.currencySymbol = function(currency) {
            return utilService.currencySymbol(currency);
        }

		$scope.get24hClass = function(val24h, val7d) {
			return utilService.getPriceCompareClass(val24h, val7d);
		}

        $scope.loadData = function() {
            bitcoinchartsAPIService.getWeightedPrices().success(function (response) {
				if (response && response.timestamp) {
                    settingsService.setNumValue('timestamp', Number(response['timestamp']) * 1000);
                    $scope.timestamp = settingsService.getNumValue('timestamp');

                    settingsService.weightedPrices = response;
                    delete settingsService.weightedPrices['timestamp'];
	                $scope.weightedPrices = settingsService.weightedPrices;
				}
				else {
					$log.warn('Warning: No weighted prices data returned from bitcoinchartsAPIService.getWeightedPrices()', response);
				}
            });
        }

        $scope.$on('bitcoinchartsAPIService.refresh', function(event, path) {
            if (path === '/weighted') {
                $scope.loadData();
            }
        });

        $rootScope.loadData();

		customService.trackPage('/weighted');
    }).
    controller('marketsController', function($scope, $rootScope, $log, bitcoinchartsAPIService, utilService, customService, settingsService) {
        $scope.markets = settingsService.markets;

        $scope.currencySymbol = function(currency) {
            return utilService.currencySymbol(currency);
        }

		$scope.getClosePriceClass = function(closePrice, avgPrice) {
			return utilService.getPriceCompareClass(closePrice, avgPrice);
		}

		$scope.loadData = function() {
			bitcoinchartsAPIService.getMarkets().success(function (response) {
				if (response && response.length > 0) {
					settingsService.markets = response;
					settingsService.markets.forEach(function(entry) {
						entry.latest_trade = Number(entry.latest_trade) * 1000;
					});

                    $scope.markets = settingsService.markets;
				}
				else {
					$log.warn('Warning: No markets data returned from bitcoinchartsAPIService.getMarkets()', response);
				}
			});
		}

        $scope.$on('bitcoinchartsAPIService.refresh', function(event, path) {
            if (path === '/markets') {
                $scope.loadData();
            }
        });

        $rootScope.loadData();

		customService.trackPage('/markets');
    }).
    controller('tradesBySymbolController', function($scope, $rootScope, $routeParams, $log, bitcoinchartsAPIService, customService) {
        $scope.symbol = $routeParams.id;
        $scope.tradesBySymbol = [[]];

		$scope.loadData = function() {
	        bitcoinchartsAPIService.getTradesBySymbol($scope.symbol).success(function (response) {
				if (response && response.length > 0) {
		            $scope.tradesBySymbol = response;
				}
				else {
					$log.warn('Warning: No trade data returned from bitcoinchartsAPIService.getTradesBySymbol(' + $scope.symbol + ')', response);					
				}
			});
		}

        $scope.$on('bitcoinchartsAPIService.refresh', function(event, path) {
            if (path && path.substring(0,7) === '/trades') {
                $scope.loadData();
            }
        });

        $rootScope.loadData();

		customService.trackPage('/trades');
    }).
    controller('settingsController', function($scope, $rootScope, $log, bitcoinchartsAPIService, settingsService, customService) {
		$scope.preferredMarket = settingsService.getPreferredMarket();

		$scope.$watch('preferredMarket', function() {
			// save preferredMarket any time user changes it in settings
			settingsService.setPreferredMarket($scope.preferredMarket);
			$log.info('Set preferred market to', settingsService.getPreferredMarket());
		});

		$scope.symbols = settingsService.symbols;

		$scope.loadData = function() {
			bitcoinchartsAPIService.getMarkets().success(function (response) {
				if (response && response.length > 0) {
                    settingsService.symbols = new Array();
					response.forEach(function(entry) {
                        settingsService.symbols.push(entry.symbol);
					});
					settingsService.symbols.sort();

                    $scope.symbols = settingsService.symbols;
				}
				else {
					$log.warn('Warning: No markets data returned from bitcoinchartsAPIService.getMarkets()', response);
				}
			});
		}

        $scope.$on('bitcoinchartsAPIService.refresh', function(event, path) {
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



