'use strict';

// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('app.services', []).
    factory('utilService', function() {
        return {
            // from: http://www.xe.com/symbols.php
            currencyMap: {
                "LTC": "Ł",
                "USD": "$",
                "GBP": "£",
                "DKK": "kr",
                "CAD": "$",
                "MXN": "$",
                "SEK": "kr",
                "SGD": "$",
                "HKD": "$",
                "AUD": "$",
                "CHF": "CHF",
                "CNY": "¥",
                "NZD": "$",
                "THB": "฿",
                "EUR": "€",
                "ARS": "$",
                "NOK": "kr",
                "RUB": "руб",
                "JPY": "¥",
                "CZK": "Kč",
                "BRL": "R$",
                "PLN": "zł",
                "ZAR": "R"
            },

            currencySymbol: function(code) {
                var symbol = this.currencyMap[code];
                //console.log('code:', code, 'symbol:', symbol);
                return symbol ? symbol : '';
            },

			getCurrencyAbbrev: function(symbol) {
				if (symbol && symbol.length > 3) {
					return symbol.substr(symbol.length - 3);
				}
				else {
					return '';
				}
			},

			getPriceCompareClass: function(price1, price2) {
				if (!price1 || !price2) {
					return 'priceUnknown';
				}
				else if (price1 > price2) {
					return 'priceUp';
				}
				else if (price1 < price2) {
					return 'priceDown';
				}
				else {
					return 'priceSame';
				}
			},

			getAppVersion: function() {
				return '1.0.1'; // version
			}
        }
    }).
	factory('settingsService', function() {
		return {
			store: null,

			setStore: function(theStore) {
				this.store = theStore;
			},

            getCurrency: function() {
                var currency = 'USD';
                if (this.store && this.store.get('currency')) {
                    currency = this.store.get('currency');
                }
                return currency;
            },

            setCurrency: function(currency) {
                if (currency && this.store) {
                    this.store.set('currency', currency);
                }
            },

            getBestMarket: function() {
                var bestMarket = '';
                if (this.store && this.store.get('best_market')) {
                    bestMarket = this.store.get('best_market');
                }
                return bestMarket;
            },

            setBestMarket: function(bestMarket) {
                if (bestMarket && this.store) {
                    this.store.set('best_market', bestMarket);
                }
            },

            getLatestTrade: function() {
                var latestTrade = '';
                if (this.store && this.store.get('latest_trade')) {
                    latestTrade = this.store.get('latest_trade');
                }
                return latestTrade;
            },

            setLatestTrade: function(latestTrade) {
                if (latestTrade && this.store) {
                    this.store.set('latest_trade', latestTrade);
                }
            },

            // get a number value by key - defaults to zero if not found in local storage
            getNumValue: function(key) {
                var value = 0;
                if (this.store && this.store.get(key)) {
                    value = Number(this.store.get(key));
                }
                return value;
            },

            // set a number value by key
            setNumValue: function(key, value) {
                if (this.store) {
                    this.store.set(key, value);
                }
            },

            symbols: ['CNY', 'EUR', 'USD']
        }
    }).
    factory('cryptocoinchartsAPIService', function($http, utilService) {
        var cccAPI = {};

		// For CryptoCoinCharts API documentation, see: http://www.cryptocoincharts.info/v2/tools/api
        cccAPI.getLTCTrading = function(currency) {
			var url = 'https://litecoineasycheck.appspot.com/api/trading-ltc/';

            if (currency) {
		        url = url + currency;
            }

            return {
                success: function(fn) {
					$http.jsonp(url + '?callback=JSON_CALLBACK').success(function(data, status, headers, config) {
						fn(data);
					});
                }
            };
        }

        return cccAPI;
  });
