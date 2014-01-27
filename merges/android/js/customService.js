// platform-specific service
angular.module('app.customService', []).
    factory('customService', function($timeout) {
        return {
			openLink: function(link) {
				// Android specific - open links using native browser
				navigator.app.loadUrl(link, { openExternal: true });
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
					if (typeof analytics !== "undefined") {
						analytics.startTrackerWithId('UA-47455659-1');
					}
				}, 1000);

				// Note: AdMob handled by com.google.ads.* in litecoinEasyCheck.java
			}
		}
	});


