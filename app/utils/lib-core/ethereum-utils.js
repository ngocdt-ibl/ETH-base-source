/* eslint-disable */

import config from '../../config';
import CustomError from '../../utils/error';
import Utils from '../../utils/utils';
import Request, { GET_REQUEST, POST_REQUEST, RESOLVE_FIRST_SUCCESS, RESOLVE_ALL_COMPLETE } from '../../utils/Request';
var Units = require('ethereumjs-units');

const ETHERSCAN_SUCCESS_FIELD = "status";
const ETHERSCAN_SUCCESS_STATUS = "1";

const QUANTA_SUCCESS_FIELD = "state";
const QUANTA_SUCCESS_STATUS = "success";

export default class EthereumUtil {

    constructor() {

    }

    convertWeiToEth(wei) {
        if (!isNaN(parseFloat(wei))) {
            return parseFloat(Utils.convert(wei, 'wei', 'eth'));
        } else {
            return null;
        }
    }

    /**
     * Get balance
     * @param {string} address
     * @return {Promise} balanceInWei
     */
    getBalance(address) {
        //
        return new Promise(function (resolve, reject) {
            //
            var arrUrls = [];
            if (typeof config.ethAPI.getBalanceUrl !== "undefined") {
                arrUrls.push({
                    url: config.ethAPI.getBalanceUrl.replace('{address}', address),
                });
            }
            if (typeof config.quantaAPI.getBalanceUrl !== "undefined") {
                arrUrls.push({
                    url: config.quantaAPI.getBalanceUrl.replace('{address}', address),
                });
            }
            //
            Request.parallel(arrUrls, RESOLVE_FIRST_SUCCESS, (cbRs) => {
                // Do NOT resolve or reject anything from here unless you know exactly what you want from this
                console.info('EthereumUtil => getBalance => callback: ', cbRs);
            }).then((response) => {
                console.info('EthereumUtil => getBalance => response: ', response);
                if (response.success && typeof response.result.result === "string" && response.result.result.length > 0) {
                    var balanceInWei = parseFloat(response.result.result);
                    if (!isNaN(balanceInWei)) {
                        return resolve(balanceInWei);
                    }
                }
                return reject(response);
            }).catch((error) => {
                console.error('EthereumUtil => getBalance => error: ', error);
                return reject(error);
            });
            //
        });
        //
    }

    /**
     * Get Transaction Count to set to nonce for create new rawTx
     * @param {string} address
     * @return {Promise} nonce (uint)
     */
    getNonce(address) {
        //
        return new Promise(function (resolve, reject) {
            //
            var arrUrls = [];
            if (typeof config.ethAPI.getNonceUrl !== "undefined") {
                arrUrls.push({
                    url: config.ethAPI.getNonceUrl.replace('{address}', address),
                });
            }
            if (typeof config.quantaAPI.getNonceUrl !== "undefined") {
                arrUrls.push({
                    url: config.quantaAPI.getNonceUrl.replace('{address}', address),
                });
            }
            //
            Request.parallel(arrUrls, RESOLVE_FIRST_SUCCESS, (cbRs) => {
                // Do NOT resolve or reject anything from here unless you know exactly what you want from this
                console.info('EthereumUtil => getNonce => callback: ', cbRs);
            }).then((response) => {
                console.info('EthereumUtil => getNonce => response: ', response);
                if (response.success && typeof response.result.result !== "undefined") {
                    var rawNonce = response.result.result;
                    var nonce = (typeof rawNonce === "string" && rawNonce.slice(0, 2) === '0x' && rawNonce.length > 2 ? parseInt(rawNonce, 16) : parseInt(rawNonce));
                    if (!isNaN(nonce)) {
                        return resolve(nonce);
                    }
                }
                return reject(response);
            }).catch((error) => {
                console.error('EthereumUtil => getNonce => error: ', error);
                return reject(error);
            });
            //
        });
        //
    }

    /**
     * Check address smart contract
     * @param {string} address
     * @return {Promise} isSmartContract (bool)
     */
    checkSmartContractAddress(address) {
        //
        return new Promise(function (resolve, reject) {
            //
            const accept = (response) => {
                if (response.success && typeof response.result.result === "string" && response.result.result.length > 2) {
                    return true;
                }
                return false;
            }
            //
            var arrUrls = [];
            if (typeof config.ethAPI.checkSmartContractUrl !== "undefined") {
                arrUrls.push({
                    url: config.ethAPI.checkSmartContractUrl.replace('{address}', address),
                    accept,
                });
            }
            if (typeof config.quantaAPI.checkSmartContractUrl !== "undefined") {
                arrUrls.push({
                    url: config.quantaAPI.checkSmartContractUrl.replace('{address}', address),
                    accept,
                });
            }
            //
            Request.parallel(arrUrls, RESOLVE_FIRST_SUCCESS, (cbRs) => {
                // Do NOT resolve or reject anything from here unless you know exactly what you want from this
                console.info('EthereumUtil => checkSmartContractAddress => callback: ', cbRs);
            }).then((response) => {
                console.info('EthereumUtil => checkSmartContractAddress => response: ', response);
                return resolve(accept(response));
            }).catch((error) => {
                console.error('EthereumUtil => checkSmartContractAddress => error: ', error);
                return resolve(false);
            });
            //
        });
        //
    }

    /**
     * Get gasPrice
     * @return {Promise} gasPrice (uint)
     */
    getGasPrice() {
        //
        return new Promise(function (resolve, reject) {
            //
            const DEFAULT_GAS_PRICE = 20000000000;
            //
            var arrUrls = [];
            if (typeof config.ethAPI.getGasPriceUrl !== "undefined") {
                arrUrls.push({
                    url: config.ethAPI.getGasPriceUrl,
                });
            }
            if (typeof config.quantaAPI.getGasPriceUrl !== "undefined") {
                arrUrls.push({
                    url: config.quantaAPI.getGasPriceUrl,
                });
            }
            //
            Request.parallel(arrUrls, RESOLVE_FIRST_SUCCESS, (cbRs) => {
                // Do NOT resolve or reject anything from here unless you know exactly what you want from this
                console.info('EthereumUtil => getGasPrice => callback: ', cbRs);
            }).then((response) => {
                console.info('EthereumUtil => getGasPrice => response: ', response);
                if (response.success && typeof response.result.result !== "undefined") {
                    var rawGasPrice = response.result.result;
                    var gasPrice = (typeof rawGasPrice === "string" && rawGasPrice.slice(0, 2) === '0x' && rawGasPrice.length > 2 ? parseInt(rawGasPrice, 16) : parseInt(rawGasPrice));
                    if (!isNaN(gasPrice)) {
                        return resolve(gasPrice);
                    }
                }
                return resolve(DEFAULT_GAS_PRICE);
            }).catch((error) => {
                console.error('EthereumUtil => getGasPrice => error: ', error);
                return resolve(DEFAULT_GAS_PRICE);
            });
            //
        });
        //
    }

    /**
     * Send Raw Transaction to etherscan
     * @param {string} rawTx                    // raw transaction hex
     * @return {Promise} transaction hash       // transaction id
     */
    sendRawTx(rawTx) {
        //
        return new Promise(function (resolve, reject) {
            //
            var arrUrls = [];
            if (typeof config.ethAPI.sendRawTxUrl !== "undefined") {
                arrUrls.push({
                    url: config.ethAPI.sendRawTxUrl.replace('{hex}', rawTx),
                });
            }
            if (typeof config.quantaAPI.sendRawTxUrl !== "undefined") {
                arrUrls.push({
                    method: POST_REQUEST,
                    url: config.quantaAPI.sendRawTxUrl,
                    data: {
                        txHex: rawTx
                    },
                });
            }
            //
            Request.parallel(arrUrls, RESOLVE_FIRST_SUCCESS, (cbRs) => {
                // Do NOT resolve or reject anything from here unless you know exactly what you want from this
                console.info('EthereumUtil => sendRawTx => callback: ', cbRs);
            }).then((response) => {
                console.info('EthereumUtil => sendRawTx => response: ', response);
                if (response.success) {
                    if (typeof response.result.result === "string" && response.result.result.slice(0, 2) === '0x' && response.result.result.length > 2) {
                        console.log('WalletAPI.sendRawTransaction - send - DONE with result: ', response.result.result);
                        return resolve(response.result.result);
                    }
                    if (typeof response.result.error !== "undefined" && typeof response.result.error.code !== "undefined" && response.result.error.code == -32000) {
                        return reject(new CustomError('balance_not_enough', 'not nough balance'));
                    }
                }
                return reject(response);
            }).catch((error) => {
                console.error('EthereumUtil => sendRawTx => error: ', error);
                return reject(error);
            });
            //
        });
        //
    }

    /**
     * get transactions lists
     * @param {string} address
     * * @param {number} page   // start from 1
     * * @param {number} limit
     * @return {Promise} array of transactions
     */
    getTransactions(address, page, limit, useEthAPI = true) {
        //
        return new Promise(function (resolve, reject) {
            //
            page = page > 0 ? page : 1;
            //
            var parseResult = (arr) => {
                if (Utils.isNotEmptyArray(arr)) {
                    for (var i = 0; i < arr.length; i++) {
                        arr[i].timeStamp = arr[i].timeStamp || arr[i].timestamp;
                        arr[i].hash = arr[i].hash || arr[i].transactionHash;
                        if (typeof arr[i]._id !== "undefined" && arr[i]._id) {
                            delete arr[i]._id;
                        }
                    }
                }
                return arr;
            }
            //
            var arrUrls = [];
            if (!useEthAPI) {
                if (typeof config.quantaAPI.getTransactionsUrl !== "undefined") {
                    arrUrls.push({
                        url: config.quantaAPI.getTransactionsUrl.replace('{address}', address).replace('{skip}', (page - 1) * limit).replace('{limit}', limit),
                    });
                }
            }
            else {
                if (typeof config.ethAPI.getTransactionsUrl !== "undefined") {
                    arrUrls.push({
                        url: config.ethAPI.getTransactionsUrl.replace('{address}', address).replace('{page}', page).replace('{limit}', limit),
                    });
                }
            }
            if (arrUrls.length === 0) {
                return resolve([]);
            }
            //
            Request.parallel(arrUrls, RESOLVE_FIRST_SUCCESS, (cbRs) => {
                // Do NOT resolve or reject anything from here unless you know exactly what you want from this
                console.info('EthereumUtil => getTransactions => callback: ', cbRs);
            }).then((response) => {
                console.info('EthereumUtil => getTransactions => response: ', response);
                if (response.success && typeof response.result.result !== "undefined" && response.result.result.constructor === Array) {
                    return resolve(parseResult(response.result.result));
                }
                return reject(response);
            }).catch((error) => {
                console.error('EthereumUtil => getTransactions => error: ', error);
                return reject(error);
            });
            //
        });
        //
    }

    getFiatRate() {
        let url = config.altaAPI.getFiatRateUrl;

        return fetch(url)
            .then((response) => response.json())
            .then((responseJson) => {
                return new Promise(function (resolve, reject) {
                    if (typeof responseJson !== 'object' || responseJson == {}) {
                        reject('INVALID_RETURN_DATA');
                    } else {
                        resolve(responseJson);
                    }
                });
            });
    }

    getPriceRate() {
        let url = config.altaAPI.getPriceRateUrl;

        return fetch(url)
            .then((response) => response.json())
            .then((responseJson) => {
                return new Promise(function (resolve, reject) {
                    if (typeof responseJson !== 'object' || !responseJson.ethereum || !responseJson.bitcoin) {
                        reject('INVALID_RETURN_DATA');
                    } else {
                        resolve(responseJson);
                    }
                });
            });
    }
}
