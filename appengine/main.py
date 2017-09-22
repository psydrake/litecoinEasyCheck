"""Main.py is the top level script.

Loads the Bottle framework and mounts controllers.  Also adds a custom error
handler.
"""

from google.appengine.api import memcache, urlfetch
# import the Bottle framework
from server.lib.bottle import Bottle, request, response, template
import datetime, json, logging, StringIO, sys, urllib2
from decimal import *

# TODO: name and list your controllers here so their routes become accessible.
from server.controllers import RESOURCE_NAME_controller

import hashlib, hmac, time # for bitcoinaverage API
import config # this file contains secret API key(s), and so it is in .gitignore

BTER_LTC_BTC_URL = 'http://data.bter.com/api/1/ticker/ltc_btc'
TIMEOUT_DEADLINE = 12 # seconds

# used for BTC / (CNY, GBP, EUR, USD)
def bitcoinaverage_ticker(currency):
  timestamp = int(time.time())
  payload = '{}.{}'.format(timestamp, config.bitcoinaverage_public_key)
  hex_hash = hmac.new(config.bitcoinaverage_secret_key.encode(), msg=payload.encode(), digestmod=hashlib.sha256).hexdigest()
  signature = '{}.{}'.format(payload, hex_hash)

  url = 'https://apiv2.bitcoinaverage.com/indices/global/ticker/BTC' + currency
  headers = {'X-Signature': signature}
  return urlfetch.fetch(url, headers=headers, deadline=TIMEOUT_DEADLINE)

def boilerplate_data_dict():
  dataDict = {}
  dataDict['price_before_24h'] = str(0)
  dataDict['best_market'] = 'Using bter.com (error getting other market data)'
  dataDict['volume_first'] = str(0)
  dataDict['volume_second'] = str(0)
  return dataDict

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
  bterData = urlfetch.fetch(BTER_LTC_BTC_URL, deadline=TIMEOUT_DEADLINE)
  if (not bterData or not bterData.content or bterData.status_code != 200):
    logging.error('No content returned from ' + BTER_LTC_BTC_URL)
    return

  bterDataDict = json.loads(bterData.content)
  btc_ltc_price = Decimal(bterDataDict['last'])

  tradingData = None
  if (currency == 'BTC'):
    dataDict = boilerplate_data_dict()
    dataDict['price'] = '%.10f' % btc_ltc_price
    if (bterDataDict['vol_ltc']):
      dataDict['volume_first'] = bterDataDict['vol_ltc']
    if (bterDataDict['vol_btc']):
      dataDict['volume_second'] = bterDataDict['vol_btc']
    dataDict['latest_trade'] = str(datetime.date.today())
    tradingData = json.dumps(dataDict)

  else: # currency is one of 'CNY', 'EUR', 'GBP', 'USD'
    btc_data = bitcoinaverage_ticker(currency)
    if (not btc_data or not btc_data.content or btc_data.status_code != 200):
      logging.error('No content returned for ' + currency)
      return

    btcDataDict = json.loads(btc_data.content)
    fiat_btc_price = Decimal(btcDataDict['last'])
    fiat_ltc_price = fiat_btc_price * btc_ltc_price

    dataDict = boilerplate_data_dict()
    dataDict['price'] = str(fiat_ltc_price)
    dataDict['latest_trade'] = btcDataDict['display_timestamp']
    tradingData = json.dumps(dataDict)

  memcache.set('trading_ltc_' + currency, tradingData)
  logging.info("Stored in memcache for key trading_ltc_" + currency + ": " + tradingData)

@bottle.route('/tasks/pull-cryptocoincharts-data')
def pullCryptocoinchartsData():
    pullLTCTradingPair('BTC')
    pullLTCTradingPair('USD')
    pullLTCTradingPair('CNY')
    pullLTCTradingPair('EUR')
    pullLTCTradingPair('GBP')
    return "Done"

@bottle.error(404)
def error_404(error):
  """Return a custom 404 error."""
  return 'Sorry, Nothing at this URL.'
