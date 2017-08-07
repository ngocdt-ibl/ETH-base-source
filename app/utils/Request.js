// ---------------------------------------------------------------------------------------------
// Request.js
// ---------------------------------------------------------------------------------------------

import Utils from './utils';
import CustomError from './error';

// define constant for request method: GET or POST
export const GET_REQUEST = 'GET_REQUEST';
export const POST_REQUEST = 'POST_REQUEST';

// define constant for resolve type, only use for Request.series or Request.parallel
export const RESOLVE_FIRST_SUCCESS = 'RESOLVE_FIRST_SUCCESS';   // for example, when call Request.series, only resolve when the first request completed successfully
export const RESOLVE_ALL_COMPLETE = 'RESOLVE_ALL_COMPLETE'; // for example, when call Request.series or Request.parallel, only resolve when all request completed, no matter the request succeed of failed

// public class
// request library: each function will return a promise
export default class Request {
    //
    /**
    * Send asynchronously GET request.
    * @param {string} strUrl
    * @return {promise} 
    */
    static get(strUrl) {
        return get(strUrl);
    }

    /**
    * Send asynchronously POST request.
    * @param {string} strUrl
    * @param {object} objData
    * @return {promise} 
    */
    static post(strUrl, objData) {
        return post(strUrl, objData);
    }

    /**
    * Send series requests asynchronously.
    * @param {array} arrUrls    // array of object. Example: arrUrls = [{method: 'POST_REQUEST', url: 'string url 1', data: {k1: v1, k2: v2}, accept: function(result) { return result.a == result.b; }}, {method: 'GET_REQUEST', url: 'string url 2'}, ....]
    * @property {string} arrUrls.method (optional, default: GET_REQUEST)    // can be GET_REQUEST or POST_REQUEST
    * @property {string} arrUrls.url                                        // URL to send request
    * @property {object} arrUrls.data (optional)                            // POST data
    * @property {function} arrUrls.accept (optional)                        // function that take the current result of successfully request as input and must be return true or false, if return true, will resolve current result. This function only be applied when resolveType = RESOLVE_FIRST_SUCCESS
    * @param {string} resolveType (optional, default: RESOLVE_FIRST_SUCCESS)   // can be RESOLVE_FIRST_SUCCESS or RESOLVE_ALL_COMPLETE
    * @param {function} callback (optional)    // by default, when we call function with resolveType = RESOLVE_ALL_COMPLETE, script will execute all requests and then resolve only once. If we need to process result when each request complete, this case we should use callback function
    * @return {promise} 
    */
    static series(arrUrls, resolveType = RESOLVE_FIRST_SUCCESS, callback = () => { }) {
        var iRequest = new Internal();
        return iRequest.series(arrUrls, resolveType, callback);
    }

    /**
    * Send parallel requests asynchronously.
    * @param {array} arrUrls    // array of object. Example: arrUrls = [{method: 'POST_REQUEST', url: 'string url 1', data: {k1: v1, k2: v2}}, {method: 'GET_REQUEST', url: 'string url 2'}, ....]
    * @property {string} arrUrls.method (optional, default: GET_REQUEST)    // can be GET_REQUEST or POST_REQUEST
    * @property {string} arrUrls.url                                        // URL to send request
    * @property {object} arrUrls.data (optional)                            // POST data
    * @property {function} arrUrls.accept (optional)                        // function that take the current result of successfully request as input and must be return true or false, if return true, will resolve current result. This function only be applied when resolveType = RESOLVE_FIRST_SUCCESS
    * @param {string} resolveType (optional, default: RESOLVE_ALL_COMPLETE)   // can be RESOLVE_FIRST_SUCCESS or RESOLVE_ALL_COMPLETE
    * @param {function} callback (optional)    // by default, when we call function with resolveType = RESOLVE_ALL_COMPLETE, script will execute all requests and then resolve only once. If we need to process result when each request complete, this case we should use callback function
    * @return {promise} 
    */
    static parallel(arrUrls, resolveType = RESOLVE_ALL_COMPLETE, callback = () => { }) {
        var iRequest = new Internal();
        return iRequest.parallel(arrUrls, resolveType, callback);
    }
    //
}   // End of Request class

// Private function
/**
* Send asynchronously GET request.
* @param {string} strUrl
* @return {promise} 
*/
function get(strUrl) {
    return new Promise(function (resolve, reject) {
        fetch(strUrl).then((response) => response.json()).then((jsonResponse) => {
            return resolve(jsonResponse);
        }).catch((error) => {
            return reject(error);
        });
    });
}

// Private function
/**
* Send asynchronously POST request.
* @param {string} strUrl
* @param {object} objData
* @return {promise} 
*/
function post(strUrl, objData) {
    return new Promise(function (resolve, reject) {
        fetch(strUrl, {
            method: 'POST',
            headers: {
                "Content-type": "application/json",
            },
            body: JSON.stringify(objData),
        }).then((response) => response.json()).then((jsonResponse) => {
            return resolve(jsonResponse);
        }).catch((error) => {
            return reject(error);
        });
    });
}

const doRequest = (obj) => {
    if (typeof obj.method !== "undefined" && obj.method == POST_REQUEST) {
        return post(obj.url || null, obj.data || {});
    }
    return get(obj.url || null);
};

// Private class
class Internal {
    //
    constructor() {

    }

    /**
    * Send series requests asynchronously.
    * @param {array} arrUrls    // array of object. Example: arrUrls = [{method: 'POST_REQUEST', url: 'string url 1', data: {k1: v1, k2: v2}, accept: function(result) { return result.a == result.b; }}, {method: 'GET_REQUEST', url: 'string url 2'}, ....]
    * @property {string} arrUrls.method (optional, default: GET_REQUEST)    // can be GET_REQUEST or POST_REQUEST
    * @property {string} arrUrls.url                                        // URL to send request
    * @property {object} arrUrls.data (optional)                            // POST data
    * @property {function} arrUrls.accept (optional)                        // function that take the current result of successfully request as input and must be return true or false, if return true, will resolve current result. This function only be applied when resolveType = RESOLVE_FIRST_SUCCESS
    * @param {string} resolveType (optional, default: RESOLVE_FIRST_SUCCESS)   // can be RESOLVE_FIRST_SUCCESS or RESOLVE_ALL_COMPLETE
    * @param {function} callback (optional)    // by default, when we call function with resolveType = RESOLVE_ALL_COMPLETE, script will execute all requests and then resolve only once. If we need to process result when each request complete, this case we should use callback function
    * @return {promise} 
    */
    series(arrUrls, resolveType = RESOLVE_FIRST_SUCCESS, callback = () => { }) {
        const fName = 'Request.series';
        var self = this;
        return new Promise(function (resolve, reject) {
            //
            if (!Utils.isNotEmptyArray(arrUrls)) {
                return reject(new CustomError('INVALID_INPUT', 'Require an not empty array of objects'));
            }
            //
            var retRs = [];
            var index = 0;
            //
            const applyResult = (data, sResolve, sReject) => {
                //
                try {
                    //
                    var item = arrUrls[index];
                    //
                    if (data.success) {
                        if (typeof item.accept === "function") {
                            if (item.accept(data)) {
                                // TODO
                            }
                            else {
                                // force to be error
                                data.success = false;
                                data.error = new CustomError('USER_REJECT', 'This is an error that has been generated because user reject the result.');
                            }
                        }
                    }
                    //
                    retRs[index] = data;
                    callback(data);
                    index++;
                    if (resolveType === RESOLVE_ALL_COMPLETE) {
                        if (retRs.length == arrUrls.length) {
                            return sResolve(retRs);
                        }
                        return doSeries().then(sResolve).catch(sReject);
                    }
                    else {
                        if (data.success) {
                            return sResolve(data);
                        }
                        return doSeries().then(sResolve).catch(sReject);
                    }
                    //
                }
                catch (ex) {
                    data.success = false;
                    data.error = ex;
                    retRs[index] = data;
                    callback(data);
                    index++;
                    return doSeries().then(sResolve).catch(sReject);
                }
                //
            };
            //
            const doSeries = () => {
                //
                return new Promise(function (sResolve, sReject) {
                    if (index < arrUrls.length) {
                        //
                        var item = arrUrls[index];
                        //
                        console.log('========================== %s => url %s: %s ===============================', fName, index, item.url);
                        //
                        return doRequest(item).then((result) => {
                            applyResult({ index, success: true, result }, sResolve, sReject);
                        }).catch((error) => {
                            applyResult({ index, success: false, error }, sResolve, sReject);
                        });
                        //
                    }
                    return sReject(retRs);
                });
                //
            };
            //
            return doSeries().then(resolve).catch(reject);
        });
    }

    /**
    * Send parallel requests asynchronously.
    * @param {array} arrUrls    // array of object. Example: arrUrls = [{method: 'POST_REQUEST', url: 'string url 1', data: {k1: v1, k2: v2}}, {method: 'GET_REQUEST', url: 'string url 2'}, ....]
    * @property {string} arrUrls.method (optional, default: GET_REQUEST)    // can be GET_REQUEST or POST_REQUEST
    * @property {string} arrUrls.url                                        // URL to send request
    * @property {object} arrUrls.data (optional)                            // POST data
    * @property {function} arrUrls.accept (optional)                        // function that take the current result of successfully request as input and must be return true or false, if return true, will resolve current result. This function only be applied when resolveType = RESOLVE_FIRST_SUCCESS
    * @param {string} resolveType (optional, default: RESOLVE_ALL_COMPLETE)   // can be RESOLVE_FIRST_SUCCESS or RESOLVE_ALL_COMPLETE
    * @param {function} callback (optional)    // by default, when we call function with resolveType = RESOLVE_ALL_COMPLETE, script will execute all requests and then resolve only once. If we need to process result when each request complete, this case we should use callback function
    * @return {promise} 
    */
    parallel(arrUrls, resolveType = RESOLVE_ALL_COMPLETE, callback = () => { }) {
        const fName = 'Request.parallel';
        var self = this;
        return new Promise(function (resolve, reject) {
            //
            if (!Utils.isNotEmptyArray(arrUrls)) {
                return reject(new CustomError('INVALID_INPUT', 'Require an not empty array of objects'));
            }
            //
            var counter = 0;
            var retRs = [];
            //
            const applyResult = (data) => {
                //
                counter++;
                //
                var index = data.index;
                //
                var item = arrUrls[index];
                //
                if (data.success) {
                    if (typeof item.accept === "function") {
                        if (item.accept(data)) {
                            // TODO
                        }
                        else {
                            // force to be error
                            data.success = false;
                            data.error = new CustomError('USER_REJECT', 'This is an error that has been generated because user reject the result.');
                        }
                    }
                }
                //
                retRs[index] = data;
                callback(data);
                if (resolveType === RESOLVE_ALL_COMPLETE) {
                    if (counter == arrUrls.length) {
                        return resolve(retRs);
                    }
                }
                else {
                    if (data.success) {
                        return resolve(data);
                    }
                    if (counter == arrUrls.length) {
                        // when go though all urls but do not have any request success
                        return reject(retRs);
                    }
                }

            }
            //
            for (var i = 0; i < arrUrls.length; i++) {
                retRs[i] = null;
                ((index) => {
                    //
                    var item = arrUrls[index];
                    //
                    console.log('========================== %s => url %s: %s ===============================', fName, index, item.url);
                    //
                    return doRequest(item).then((result) => {
                        applyResult({ index, success: true, result });
                    }).catch((error) => {
                        applyResult({ index, success: false, error: error });
                    });
                    //
                })(i);
            }
            //
        });
    }
    //
}   // End of Internal class
// ---------------------------------------------------------------------------------------------
// End of Request.js file
// ---------------------------------------------------------------------------------------------
