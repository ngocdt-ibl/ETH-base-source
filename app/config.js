/* eslint-disable */
// ---------------------------------------------------------------------------------------------
// config.js
// ---------------------------------------------------------------------------------------------

// ---------------------------------------------------------------------------------------------
var config = {};

config.buildNumber = 10;

// ------------------------------------------------------------------
// networks
// ------------------------------------------------------------------
config.network = 'testnet'; // livenet OR testnet

config.testnet = config.network === 'testnet';

// ------------------------------------------------------------------
// coins
// ------------------------------------------------------------------
config.ethereum = 'ethereum' + config.network;

config.supportCoinsOrder = [config.ethereum];

config.ethGroup = 'ETH';

config.supportCoins = {};

config.supportCoins[config.ethereum] = {
  name: config.ethereum,
  network: 'ETH',
  unit: 'wei',
  rate: 1000000000000000000,
  fractionSize: 6,
  group: config.ethGroup
};

config.settingsUrl = config.testnet ? 'https://randao-wallet.firebaseio.com/testnet-settings.json' : 'https://randao-wallet.firebaseio.com/settings.json';

// ------------------------------------------------------------------
// SERVERS
// ------------------------------------------------------------------
config.etherscanServer = config.testnet ? 'https://rinkeby.etherscan.io' : 'http://api.etherscan.io'; // API server from etherscan
// config.etherscanServer = config.testnet ? 'https://kovan.etherscan.io' : 'http://api.etherscan.io'; // API server from etherscan

config.quantaServer = config.testnet ? 'http://172.104.59.203:3000' : 'http://172.104.59.203:3000'; // Randao & KYC API server. Rinkeby testnet
config.quantaServer = config.testnet ? 'http://172.104.39.41:3000' : 'http://172.104.39.41:3000'; // Randao & KYC API server. Private net

config.randaoSocketServer = config.testnet ? 'http://172.104.59.203:4001' : 'http://172.104.59.203:4001'; // Randao & KYC Socket server. Rinkeby testnet
config.randaoSocketServer = config.testnet ? 'http://172.104.39.41:4001' : 'http://172.104.39.41:4001'; // Randao & KYC Socket server. Private net

config.altaServer = config.testnet ? 'http://blocktest.altaapps.io' : 'https://block.altaapps.io';  // API server from altaapps

// ------------------------------------------------------------------
// server enable for some general API
// ------------------------------------------------------------------
config.enableEtherscan = false;  // when set this value by false, all API URL from etherscan will NOT be added to config, so that there will NOT have any request to etherscan. Beside this, general socket for balance and transaction that connect to etherscan also will NOT be initialized.

config.enableQuanta = true;  // when set this value by false, all API URL from quanta will NOT be added to config, so that there will NOT have any request to quanta. Beside this, general socket for balance and transaction that connect to quanta also will NOT be initialized.

// ------------------------------------------------------------------
// API from etherscan
// ------------------------------------------------------------------
const ethAPI = {
  // General
  getBalanceUrl: '/api?module=account&action=balance&address={address}&tag=latest',
  getNonceUrl: '/api?module=proxy&action=eth_getTransactionCount&address={address}&tag=latest',
  getGasPriceUrl: '/api?module=proxy&action=eth_gasPrice',
  sendRawTxUrl: '/api?module=proxy&action=eth_sendRawTransaction&hex={hex}',
  getTransactionsUrl: '/api?module=account&action=txlist&address={address}&startblock=0&endblock=99999999&page={page}&offset={limit}&sort=desc',
  checkSmartContractUrl: '/api?module=proxy&action=eth_getCode&address={address}&tag=latest',
};
config.buildEthAPI = (serverUrl) => {
  if (!serverUrl) return;
  config.etherscanServer = serverUrl;
  config.ethAPI = concatHost(serverUrl, ethAPI, config.enableEtherscan);
}
config.buildEthAPI(config.etherscanServer);
// ------------------------------------------------------------------

// ------------------------------------------------------------------
// API from quanta
// ------------------------------------------------------------------
const quantaAPI = {
  // General
  getBalanceUrl: '/api/addr/{address}/balance',
  getNonceUrl: '/api/addr/{address}/totalTxSent/pending',
  getGasPriceUrl: '/api/contract/web3/getPrice',
  sendRawTxUrl: '/api/tx/send', // POST, data: txHex
  getTransactionsUrl: '/api/addr/{address}/txs/{skip}/{limit}',
  checkSmartContractUrl: '/api/contract/web3/getCode/{address}',
};
//
const quantaAPIMustHave = {
  // RANDAO
  getRandaoInfo: '/api/randao/getRandaoInfo',
  getLatestRandaoInfo: '/api/randao/getLatestRandaoInfo',

  // KYC
  kycLevel: '/api/kyc/level/{address}',
};
//
config.buildQuantaAPI = (serverUrl) => {
  if (!serverUrl) return;
  config.quantaServer = serverUrl;
  const objApi = concatHost(serverUrl, quantaAPI, config.enableQuanta);
  config.quantaAPI = merge(objApi, concatHost(serverUrl, quantaAPIMustHave));
}
config.buildQuantaAPI(config.quantaServer);
// ------------------------------------------------------------------

// ------------------------------------------------------------------
// API from altaapps
// ------------------------------------------------------------------

config.autoReveal = true;

config.gasPrice = 20000000000;
config.randaoGasLimit = 300000;

config.randaoContractAddress = '0x91d8713cdd30e619d7a08de2f7afc771542726a8';  // testnet (Rinkerby)
config.randaoContractAddress = '0xfab90a2a2275842566666d19d972a95b54f2b23f';  // private net

// ------------------------------------------------------------------
// API from altaapps
// ------------------------------------------------------------------
config.altaAPI = {
  // General
  getFiatRateUrl: '/api/get_exchange_rate',
  getPriceRateUrl: '/api/get_price',
};
config.altaAPI = concatHost(config.altaServer, config.altaAPI);

// ------------------------------------------------------------------
// wallet
// ------------------------------------------------------------------
config.defaultPassword = 'RandaoWallet@cardano-labo.com';

config.defaultOptions = {
  currency: 'USD',
  language: 'en'
}

config.supportLanguages = ['en', 'jp', 'cn', 'vi'];
config.supportCurrencies = ['USD', 'JPY', 'CNY', 'VND'];

config.fiats = [
  { code: 'USD', name: 'USD', sign: '$', fractionSize: 2 },
  { code: 'JPY', name: 'JPY', sign: '¥', fractionSize: 0 },
  { code: 'VND', name: 'VND', sign: '₫', fractionSize: 0 },
  { code: 'CNY', name: 'CNY', sign: '¥', fractionSize: 0 }
];

config.languages = [
  { code: 'en', name: 'English' },
  { code: 'jp', name: '日本語' },
  { code: 'vn', name: 'Tiếng Việt' },
  { code: 'cn', name: '中文' },
];

/* NOTES for usage of config.saveDbInsideInstalledDir: 
*   - On Windows and MacOS, data may be deleted when user install app while the previous version of app is not uninstalled before.
*   - On Linux and MacOS, we need to run app as Admin permission, so that the app can create the files to store data.
*   - We should only turn this option on (set it by true) when we want to run multiple app on the same computer without install it, but run it from the built source.
*/
config.saveDbInsideInstalledDir = true;

// ------------------------------------------------------------------

// ---------------------------------------------------------------------------------------------
function concatHost(host, obj, enabled) {
  if (typeof enabled === "boolean" && enabled === false) {
    return {};
  }
  var retObj = {};
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      retObj[key] = host + obj[key];
    }
  }
  return retObj;
}
function merge(src, dst) {
  for (var key in dst) {
    if (dst.hasOwnProperty(key)) {
      src[key] = dst[key];
    }
  }
  return src;
}
// ---------------------------------------------------------------------------------------------



// ========================================================
// Disable console.* on production
// ========================================================
function disableConsole() {
  if (typeof console !== 'undefined') {

    for (var i in console) {
      if (console.hasOwnProperty(i) && typeof console[i] === 'function') {
        // Override function so that it will do nothing
        (function (fn) {
          console[fn] = function () { }
        })(i);
      }
    }
  }
}

// ---------------------------------------------------------------------------------------------
if (typeof process.env.NODE_ENV !== "undefined" && process.env.NODE_ENV == 'development') {
  // debug mode
}
else {
  // production mode
  disableConsole();
}
// ---------------------------------------------------------------------------------------------


//
export default config;
