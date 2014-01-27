# Litecoin Easy Check

## About
Web / mobile app for easily checking Litecoin prices. Includes Python back end running in Google App Engine that caches data from the CryptoCoinCharts API.

## Technical
Litecoin Easy Check consists of two parts:
* A pure HTML / CSS / JavaScript front end built with the [AngularJS](http://angularjs.org/) JavaScript framework.
* A [Google App Engine](https://developers.google.com/appengine/) back end, written in [Python](http://www.python.org/), that caches data from the [cryptocoincharts.info](http://www.cryptocoincharts.info/) API.

The front end communicates with the back end via [JSONP](http://en.wikipedia.org/wiki/JSONP) calls. The backend polls cryptocoincharts.info every 10 minutes, and it stores this data in [memcache](https://developers.google.com/appengine/docs/python/memcache/) for all subsequent client requests, in order to reduce load on the CryptoCoinCharts server.

## Install On Your Phone / Tablet
* [Litecoin Easy Check for Android](https://play.google.com/store/apps/details?id=net.edrake.litecoineasycheck)

## Use As A Web App
* [Litecoin Easy Check in the Chrome Web Store](https://chrome.google.com/webstore/detail/litecoin-easy-check/eijmjnlmmgmpighmhdmjinnkicpdepcl)
* [Litecoin Easy Check as a Web Site](http://d2y538ab9a8vah.cloudfront.net/main.html)

## Author
Drake Emko - drakee (a) gmail.com
* [@DrakeEmko](https://twitter.com/DrakeEmko)
* [Wolfgirl Band](http://wolfgirl.bandcamp.com/)
