// platform-specific service
angular.module('app.customService', []).
    factory('customService', function($timeout) {
		// custom functions for iOS

		var createBannerView = function() {
			var am = window.plugins.AdMob;
		    am.createBannerView({
				'publisherId': 'ca-app-pub-8928397865273246/5854175810',
				'adSize': am.AD_SIZE.BANNER,
				'bannerAtTop': false
			}, function() {
				requestAd();
			}, function(){
				// fail quietly
			});
		};

		var requestAd = function() {
			window.plugins.AdMob.requestAd({
				'isTesting': false,
				'extras': {
					'color_bg': 'FFFFFF',
					'color_bg_top': 'FFFFFF',
					'color_border': 'FFFFFF',
					'color_link': '000080',
					'color_text': '808080',
					'color_url': '008000'
				},
		    },
			function() {
				showAd();
			},
	   		function () { 
				// fail quietly
			});
		};

		var showAd = function() {
			window.plugins.AdMob.showAd( 
				true, // or false
				function() {
					// yay
				},
			    function() {
					// fail quietly
				}
			);
		};

        return {
			openLink: function(link) {
				// Use in-app browser for iOS
				if (link && link.match(/^mailto:/)) {
					window.open(encodeURI(link)); 
				}
				else {
					window.open(encodeURI(link), '_blank', 'location=yes'); 
				}
			},

			trackPage: function(page) {
				$timeout(function() {
					if (typeof analytics !== "undefined") {
						analytics.trackView(page);
					}
				}, 1500);
			},

			doCustomActions: function() {
				$timeout(function() {
					createBannerView();

					if (typeof analytics !== "undefined") {
						analytics.startTrackerWithId('UA-46128370-2');
					}
				}, 1000);
			}
		}
	});


