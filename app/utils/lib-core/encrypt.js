var SHA512 = require("crypto-js/sha512");
var CryptoJS = require("crypto-js");
export default class Encrypt {

    encryptString(string, password) {
        return CryptoJS.AES.encrypt(string, SHA512(password).toString()).toString();
    };

    decryptString(encryptedStr, password) {
        var bytes = CryptoJS.AES.decrypt(encryptedStr, SHA512(password).toString());
        try {
            return bytes.toString(CryptoJS.enc.Utf8);
        } catch (e) {
            return "";
        }
    };

    sha512(password) {
        return SHA512(password).toString();
    };
}
