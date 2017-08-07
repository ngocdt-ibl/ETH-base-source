var Bip39 = require('bip39');
var HDKey = require('ethereumjs-wallet/hdkey');
var Wallet = require('ethereumjs-wallet');
var Transaction = require('ethereumjs-tx');
var Units = require('ethereumjs-units');
var Util = require('ethereumjs-util');
var Abi = require('ethereumjs-abi');
import Utils from '../../utils/utils'

export default class Ethereum {
    constructor() {
        // Properties
        this.title = 'Ethereum';
        this.unitText = 'ETH';
        this.balance = 0;
        this.balanceFiat = 0;
        this.color = '#62688f';
        this._wallet = null;
    }

    /**
     * Restore wallet from seed
     * @param {string} passphrase
     * @param {string} path
     * @param {integer} child
     * @return {object} Wallet object
     */
    restoreWalletFromSeed(passphrase, path, child) {
        var masterSeed = Bip39.mnemonicToSeed(passphrase);
        this._wallet = HDKey.fromMasterSeed(masterSeed).derivePath(path || "m/44'/60'/0'/0").deriveChild(child || 0).getWallet();
    }

    /**
     * Create wallet from seed
     * @return {object} Wallet object
     */
    createWalletFromSeed() {
        var mnemonic = this.generateMnemonic();
        var masterSeed = Bip39.mnemonicToSeed(mnemonic);
        this._wallet = HDKey.fromMasterSeed(masterSeed).derivePath("m/44'/60'/0'/0").deriveChild(0).getWallet();
        return mnemonic;
    }

    /**
     * Create normal transaction
     *
     * @example
     *  var txParams = {
     *      from: "0x9c729ef4cec1b1bdffaa281c2ff76b48fdcb874c",
     *      to: "0xfd2921b8b8f0dccf65d4b0793c3a2e5c127f3e86",
     *      value: 12,
     *      nonce: 1,
     *      gasPrice: 100000
     *  };
     */
    createRawNormalTx(txParams) {
        var transaction = new Transaction();

        var defaultGasLimit = 22000;
        var defaultGasPrice = 20000000000;

        var gasLimit = parseInt(txParams.gasLimit);
        var gasPrice = parseInt(txParams.gasPrice);

        if(isNaN(gasLimit) || gasLimit < defaultGasLimit ) {
            gasLimit = defaultGasLimit;
        }

        if(isNaN(gasPrice) || gasPrice < defaultGasPrice ) {
            gasPrice = defaultGasPrice;
        }

        // console.log('transaction', transaction.from);
        // transaction.from = txParams.from;
        transaction.to = txParams.to;
        transaction.gasLimit = gasLimit;     // in wei
        transaction.gasPrice = gasPrice;     // in wei
        transaction.nonce = txParams.nonce;
        transaction.value = txParams.value; // in wei

        var privateKey = txParams.privateKey;
        privateKey = new Buffer(privateKey, 'hex');

        transaction.sign(new Buffer(privateKey), "hex");
        return "0x" + transaction.serialize().toString("hex");
    }

    /**
     * Create smart contract transaction
     *
     * @example
     *  var txParams = {
     *      from: "0x9c729ef4cec1b1bdffaa281c2ff76b48fdcb874c",
     *      to: "0xfd2921b8b8f0dccf65d4b0793c3a2e5c127f3e86",
     *      value: 12,
     *      nonce: 1,
     *      gasPrice: 100000,
     *      nameFunc: 'send',
     *      typeParams: [],
     *      paramsFuncs: []
     *  };
     */
    createRawSmartContractTx(txParams, inputData) {
        var transaction = new Transaction();

        var defaultGasLimit = 300000;
        var defaultGasPrice = 20000000000;

        var gasLimit = parseInt(txParams.gasLimit);
        var gasPrice = parseInt(txParams.gasPrice);

        if(isNaN(gasLimit) || gasLimit < defaultGasLimit ) {
            gasLimit = defaultGasLimit;
        }

        if(isNaN(gasPrice) || gasPrice < defaultGasPrice ) {
            gasPrice = defaultGasPrice;
        }

        // transaction.from = txParams.from;
        transaction.to = txParams.to;
        transaction.gasLimit = gasLimit;     // in wei
        transaction.gasPrice = gasPrice;     // in wei
        transaction.nonce = txParams.nonce;
        transaction.value = txParams.value;  // in wei

        if(inputData) {
          transaction.data = inputData;
        }
        else {
          var data = (txParams.nameFunc) ? this.getFunctionSmartContract(txParams.nameFunc, txParams.typeParams, txParams.paramsFuncs) : '';
          transaction.data = '0x' + data;
        }

        var privateKey = txParams.privateKey;
        privateKey = new Buffer(privateKey, 'hex');

        transaction.sign(new Buffer(privateKey), "hex");
        return "0x" + transaction.serialize().toString("hex");
    }

    /**
     * Get function smart contract
     * @Param {string} nameFunction (ex: 'nameFunction')
     * @Param {arrayString} typeParams (ex: [ 'bytes', 'bool', 'uint256[]' ])
     * @Param {array} Params (ex: [ 'bytes', 'bool', 'uint256[]' ], [ 'dave', true, [ 1, 2, 3 ] ])
     * @return {string} method id
     */
    getFunctionSmartContract(nameFunction, typeParams, Params) {
        return Abi.methodID(nameFunction, typeParams).toString('hex') + Abi.rawEncode(typeParams, Params).toString('hex');
    }

    /**
     * Generate passphrase
     * @return {string} 12 words passphrase
     */
    generateMnemonic() {
        return Bip39.generateMnemonic();
    }

    /**
     * Validate seed
     * @param passphrase {string}
     * @return {boolean}
     */
    validateSeed(passphrase) {
        return Bip39.validateMnemonic(passphrase);
    }

    /**
     * Validate & convert privateKey to address
     * @param {Buffer} privateKey
     * @param {string}
     */
    privateToAddress(privateKey) {
        if (Util.isValidPrivate(Buffer.from(privateKey, 'hex'), false)) {
            return '0x' + Util.privateToAddress(Buffer.from(privateKey, 'hex')).toString('hex');
        }
        return '';
    }

    /**
     * Validate ethereum address
     * @param {string} address
     * @param {boolean}
     */
    validateAddress(address) {
        return Util.isValidAddress(address.toLowerCase());
    }

    /**
     * Open V1 wallet
     * @param {string} strJson Input v1 mist wallet key file
     * @param {string} password Password
     * @return {object} Wallet object
     */
    fromV1(strJson, password) {
        this._wallet = Wallet.fromV1(strJson, password);
        return this._wallet;
    }

    /**
     * Open V3 wallet
     * @param {string} strJson Input v3 mist wallet key file
     * @param {string} password Password
     * @return {object} Wallet object
     */
    fromV3(strJson, password) {
        this._wallet = Wallet.fromV3(strJson, password);
        return this._wallet;
    }

    /**
     * Export to V3 wallet
     * @param {string} password
     * @return {string}
     */
    toV3(password) {
        if(this._wallet !== null) {
          return this._wallet.toV3String(password);
        }
        return '';
    }

    getPrivateKey() {
      if(this._wallet !== null) {
        return this._wallet.getPrivateKey();
      }
      return [];
    }

    getPrivateKeyString() {
      if(this._wallet !== null) {
        return this._wallet.getPrivateKeyString();
      }
      return '';
    }

    getAddress() {
      if(this._wallet !== null) {
        return this._wallet.getAddress();
      }
      return [];
    }

    getAddressString() {
      if(this._wallet !== null) {
        return this._wallet.getAddressString();
      }
      return '';
    }
}
