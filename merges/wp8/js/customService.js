// platform-specific service
angular.module('app.customService', []).
    factory('customService', function($timeout) {
        return {
			openLink: function(link) {
				// Use in-app browser for WP8
				if (link && link.match(/^mailto:/)) {
					window.open(encodeURI(link)); 
				}
				else {
					window.open(encodeURI(link), '_blank', 'location=yes'); 
				}
			},

			trackPage: function(page) {
			    // NOOP - google analytics handled by SDK and EasyTracker
			},

			doCustomActions: function() {
				// NOOP - admob handled in MainPage.xaml and MainPage.xaml.cs
			}
		}
	});
