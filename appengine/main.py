"""Main.py is the top level script.

Loads the Bottle framework and mounts controllers.  Also adds a custom error
handler.
"""

from google.appengine.api import memcache
# import the Bottle framework
from server.lib.bottle import Bottle, request, response, template
import json, logging, StringIO, urllib2

# TODO: name and list your controllers here so their routes become accessible.
from server.controllers import RESOURCE_NAME_controller

TRADING_PAIR_URL = 'http://www.cryptocoincharts.info/v2/api/tradingPair/'

# Run the Bottle wsgi application. We don't need to call run() since our
# application is embedded within an App Engine WSGI application server.
bottle = Bottle()

# Mount a new instance of bottle for each controller and URL prefix.
# TODO: Change 'RESOURCE_NAME' and add new controller references
bottle.mount("/RESOURCE_NAME", RESOURCE_NAME_controller.bottle)

@bottle.route('/')
def home():
  """Return project name at application root URL"""
  return "Litecoin Easy Check"

@bottle.route('/api/trading-ltc')
@bottle.route('/api/trading-ltc/')
@bottle.route('/api/trading-ltc/<currency:re:[A-Z][A-Z][A-Z]>')
def tradingLTC(currency=''):
    response.content_type = 'application/json; charset=utf-8'

    mReturn = memcache.get('trading_ltc_' + currency)
    if (not mReturn):
        logging.warn("No data found in memcache for trading_ltc_" + currency)
        mReturn = '{}'

    query = request.query.decode()
    if (len(query) > 0):
        mReturn = query['callback'] + '(' + mReturn + ')'

    logging.info("Returning data for trading_ltc_" + currency + ", starting with: " + mReturn[0:100])
    return mReturn

def pullLTCTradingPair(currency='USD'):
    data = urllib2.urlopen(TRADING_PAIR_URL + 'LTC_' + currency)
    dataDict = json.load(data)

    tradingData = json.dumps(dataDict)
    memcache.set('trading_ltc_' + currency, tradingData)
    logging.info("Stored in memcache for key trading_ltc_" + currency + ", starting with: " + tradingData[0:20])

@bottle.route('/tasks/pull-cryptocoincharts-data')
def pullCryptocoinchartsData():
    pullLTCTradingPair('BTC')
    pullLTCTradingPair('CNY')
    pullLTCTradingPair('EUR')
    pullLTCTradingPair('USD')
    return "Done"

@bottle.error(404)
def error_404(error):
  """Return a custom 404 error."""
  return 'Sorry, Nothing at this URL.'
