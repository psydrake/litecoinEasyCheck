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

TRADING_PAIR_URL = 'http://www.cryptocoincharts.info/v2/api/tradingPair/'
# backup URLs:
TRADING_PAIR_URL_USD_BACKUP = 'https://coinbase.com/api/v1/prices/buy' 
BTER_LTC_BTC_URL = 'http://data.bter.com/api/1/ticker/ltc_btc'
BTCAVERAGE_URL = 'https://api.bitcoinaverage.com/ticker/' # for BTC / (CNY, EUR, GBP, AUD)

TIMEOUT_DEADLINE = 12 # seconds

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
    data = None
    useBackupUrl = False
    url = TRADING_PAIR_URL + 'LTC_' + currency

    try:
        data = urllib2.urlopen(url)
        if (not data or not data.content or data.status_code != 200):
            logging.warn('No content returned from ' + url)
            useBackupUrl = True
    except:
        logging.warn('Error retrieving ' + url)
        useBackupUrl = True

    if (useBackupUrl):
        logging.warn('Now trying ' + BTER_LTC_BTC_URL)
        dataBtc = None
        try:
            dataBtc = urlfetch.fetch(BTER_LTC_BTC_URL, deadline=TIMEOUT_DEADLINE)
            if (not dataBtc or not dataBtc.content or dataBtc.status_code != 200):
                logging.error('No content returned from ' + BTER_LTC_BTC_URL)
                return
        except:
            logging.error('Error retrieving ' + BTER_LTC_BTC_URL)
            return

        if (currency == 'BTC'):
            data = dataBtc
        else:
            backupUrl = ''
            if (currency == 'USD'):
                backupUrl = TRADING_PAIR_URL_USD_BACKUP
            elif (currency in ['CNY', 'EUR', 'GBP', 'AUD']):
                backupUrl = BTCAVERAGE_URL + currency + '/'
            else:
                logger.error('Cannot get trading pair for ' + currency1 + ' / ' + currency2)
                return

            logging.warn('Now trying ' + backupUrl)
            dataCurrency = urlfetch.fetch(backupUrl, deadline=TIMEOUT_DEADLINE)

            # LTC -> BTC -> FIAT
            dataBtcDict = json.loads(dataBtc.content)
            logging.info('dataBtcDict: ' + str(dataBtcDict))
            dataCurrencyDict = json.loads(dataCurrency.content)
            if (currency == 'USD'):
                dataCurrencyDict['last'] = dataCurrencyDict['subtotal']['amount']
            logging.info('dataCurrencyDict: ' + str(dataCurrencyDict))
            
            price = Decimal(dataBtcDict['last']) * Decimal(dataCurrencyDict['last'])
            logging.info('price: ' + str(price))

            tradingData = "{'price': " + str(price) + ", 'latest_trade': '" + str(datetime.date.today()) + "', 'price_before_24h': 0, 'best_market': 'Using bter.com (error getting other market data)', 'volume_first': 0, 'volume_second': 0}"
            memcache.set('trading_ltc_' + currency, tradingData)
            logging.info("Stored in memcache for key trading_ltc_" + currency + ", starting with: " + tradingData[0:20])
            #logging.info("Stored in memcache for key trading_ltc_" + currency + ": " + tradingData)
            return

    dataDict = json.loads(data.content)
    if (useBackupUrl and currency == 'BTC'): # we are using bter for this backup data
        if (dataDict['last'] and 'price' not in dataDict):
            dataDict['price'] = dataDict['last']
        if (dataDict['vol_ltc']):
            dataDict['volume_first'] = dataDict['vol_ltc']
        if (dataDict['vol_btc']):
            dataDict['volume_second'] = dataDict['vol_btc']
        dataDict['latest_trade'] = str(datetime.date.today())
        dataDict['price_before_24h'] = 0
        dataDict['best_market'] = 'Using bter.com (error getting other market data)'

    logging.info('dataDict: ' + str(dataDict))
    tradingData = json.dumps(dataDict)

    memcache.set('trading_ltc_' + currency, tradingData)
    logging.info("Stored in memcache for key trading_ltc_" + currency + ", starting with: " + tradingData[0:20])
    #logging.info("Stored in memcache for key trading_ltc_" + currency + ": " + tradingData)

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
