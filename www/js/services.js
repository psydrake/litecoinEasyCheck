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
				return '1.2.6'; // version
			}
        }
    }).
	factory('settingsService', function() {
		return {
			store: null, // store is the Persist.js local storage store

			setStore: function(theStore) {
				this.store = theStore;
			},

            getValue: function(key) {
				var value = '';
				if (key === 'currency' || key ==='currency_non_btc') {
					value = 'USD'; // default - this is overwritten by what is in store
				}
                if (this.store && this.store.get(key)) {
                    value = this.store.get(key);
                }
                return value;
            },

            setValue: function(key, value) {
                if (key && this.store) {
                    this.store.set(key, value);
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

            symbols: ['BTC', 'CNY', 'EUR', 'USD']
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
