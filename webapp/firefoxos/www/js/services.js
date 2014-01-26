'use strict';

// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('app.services', []).
    factory('utilService', function() {
        return {
            // This will parse a delimited string into an array of
            // arrays. The default delimiter is the comma, but this
            // can be overriden in the second argument.
            csvToArray: function(strData, strDelimiter) {
                // Check to see if the delimiter is defined. If not,
                // then default to comma.
                strDelimiter = (strDelimiter || ",");
                // Create a regular expression to parse the CSV values.
                var objPattern = new RegExp(
                    (
                        // Delimiters.
                        "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
                            // Quoted fields.
                            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
                            // Standard fields.
                            "([^\"\\" + strDelimiter + "\\r\\n]*))"
                        ),
                    "gi"
                );
                // Create an array to hold our data. Give the array
                // a default empty first row.
                var arrData = [[]];
                // Create an array to hold our individual pattern
                // matching groups.
                var arrMatches = null;
                // Keep looping over the regular expression matches
                // until we can no longer find a match.
                while (arrMatches = objPattern.exec( strData )){
                    // Get the delimiter that was found.
                    var strMatchedDelimiter = arrMatches[ 1 ];
                    // Check to see if the given delimiter has a length
                    // (is not the start of string) and if it matches
                    // field delimiter. If id does not, then we know
                    // that this delimiter is a row delimiter.
                    if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)){
                        // Since we have reached a new row of data,
                        // add an empty row to our data array.
                        arrData.push( [] );
                    }
                    // Now that we have our delimiter out of the way,
                    // let's check to see which kind of value we
                    // captured (quoted or unquoted).
                    if (arrMatches[ 2 ]){
                        // We found a quoted value. When we capture
                        // this value, unescape any double quotes.
                        var strMatchedValue = arrMatches[ 2 ].replace(
                            new RegExp( "\"\"", "g" ),
                            "\""
                        );
                    } else {
                        // We found a non-quoted value.
                        var strMatchedValue = arrMatches[ 3 ];
                    }
                    // Now that we have our value string, let's add
                    // it to the data array.
                    arrData[ arrData.length - 1 ].push( strMatchedValue );
                }
                // Return the parsed data.
                return( arrData );
            },

            // from: http://www.xe.com/symbols.php
            currencyMap: {
                "USD": "$",
                "ILS": "₪",
                "GBP": "£",
                "DKK": "kr",
                "CAD": "$",
                "MXN": "$",
                //"XRP": "$",
                "SEK": "kr",
                "SGD": "$",
                "HKD": "$",
                "AUD": "$",
                "CHF": "CHF",
                "CNY": "¥",
                //"LTC": "$",
                "NZD": "$",
                "THB": "฿",
                "EUR": "€",
                //"SLL": "$",
                "ARS": "$",
                "NOK": "kr",
                "RUB": "руб",
                //"INR": "$",
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
				return '1.5.7'; // version
			}
        }
    }).
	factory('settingsService', function() {
		return {
			store: null,

			setStore: function(theStore) {
				this.store = theStore;
			},

			getPreferredMarket: function() {
				var preferredMarket = 'mtgoxUSD';
				if (this.store && this.store.get('preferredMarket')) {
					preferredMarket = this.store.get('preferredMarket');
				}
				return preferredMarket;
			},

			setPreferredMarket: function(preferredMarket) {
				//$cookies.preferredMarket = preferredMarket;
				if (preferredMarket && this.store) {
					this.store.set('preferredMarket', preferredMarket);
				}
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

            weightedPrices: {},

            markets: [],

            symbols: new Array() // list of all available market symbols
        }
    }).
    factory('bitcoinchartsAPIService', function($http, utilService) {
        var bccAPI = {};

		// For bitcoincharts API documentation, see: http://bitcoincharts.com/about/markets-api/
		//
        // Bitcoincharts offers weighted prices for several currencies.
        // You can use this to price goods and services in Bitcoins.
        // This will yield much lower fluctuations than using a single market's latest price.
        // http://api.bitcoincharts.com/v1/weighted_prices.json
		//
		// {"NZD": {"24h": "1318.71", "7d": "1232.72", "30d": "714.22"}, "GBP": {"24h": "649.61", "7d": "670.24", "30d": "382.66"}, ...}

        // You can access general market data. This will return an array with elements for each market.
        // http://api.bitcoincharts.com/v1/markets.json
		//
        // [{"volume": 4.855583920000, "latest_trade": 1385510680, "bid": 5200.000000000000, "high": 5468.253968250000, "currency": "CNY",
        //    "currency_volume": 25837.585663292542, "ask": 5468.253970000000, "close": 5468.253968250000, "avg": 5321.210813980235357563339159,
        //    "symbol": "anxhkCNY", "low": 5156.985544060000}, ...]

        // Trade data is available as CSV, delayed by approx. 15 minutes. It will return the 2000 most recent trades.
        // http://api.bitcoincharts.com/v1/trades.csv?symbol=mtgoxUSD
		//
        // "1385076902,771.461540000000,0.011109990000\n1385076903,771.461540000000,0.011109990000\n1385076903,771.463190000000,0.299999990000\n.."

        bccAPI.getWeightedPrices = function(currency) {
			var url = 'https://bitcoineasycheck.appspot.com/api/weighted-prices/';

            if (currency) {
		        url = url + currency;
            }

            return {
                success: function(fn) {
					$http.jsonp(url + '?callback=JSON_CALLBACK').success(function(data, status, headers, config) {
						//console.log('services.getWeightedPrices:', data);
						fn(data);
					});
                }
            };
        }

        bccAPI.getMarkets = function(symbol) {
			var url = 'https://bitcoineasycheck.appspot.com/api/markets/';

			if (symbol) {
				url = url + symbol;
			}

            return {
                success: function(fn) {
					$http.jsonp(url + '?callback=JSON_CALLBACK').success(function(data, status, headers, config) {
						//console.log('services.getMarkets:', data);
						fn(data);
					});
                }
            };
        }

        bccAPI.getTradesBySymbol = function(symbol) {
			var url = 'https://bitcoineasycheck.appspot.com/api/trades/' + symbol;

            return {
                success: function(fn) {
					$http.jsonp(url + '?callback=JSON_CALLBACK').success(function(data, status, headers, config) {
						//console.log('services.getTradesBySymbol:', data);
						var theData = [];
						data.forEach(function(entry) {
							//console.log(entry);
							theData.push([ Number(entry[0]) * 1000, entry[1], entry[2] ]);
						});
						//console.log(theData);
						fn(theData);
					});
                }
            };
        }

        return bccAPI;
  });
