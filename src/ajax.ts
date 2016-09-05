import {ajax} from 'jquery';

/// Default function to run when request fail.
/// Override this function to change behavior
/// default action is show error dialog
export function onRequestFail(response: {}) {
    // try {
    //     var jsonData = JSON.parse(response.responseText);
    // }
    // catch (e) {
    //     var jsonData = { message: response.responseText };
    // }
    //        console.log(jsonData);
    //
    //        var modelView = {
    //            bodyTemplate: 'modal-request-fail',
    //            titleLabel: 'Request Gagal',
    //            okLabel: 'OK'
    //        };
    //        _.extend(modelView, jsonData);
    //        exports.modal(modelView);
}


/// helper function to send http request.
/// automaticly register function app.onRequestFail to run
/// when request return other than response code 200.
export function sendJSONRequest(type, url, data) {
    return ajax({
        url: url,
        type: type,
        data: data !== undefined ? JSON.stringify(data) : null,
        contentType: "application/json"
    }).fail(onRequestFail);
}

/// various helper function for sendJSONRequest
export let getJSON = (url, data) => sendJSONRequest('GET', url, data);
export let postJSON = (url, data) => sendJSONRequest('POST', url, data);
export let deleteJSON = (url, data) => sendJSONRequest('DELETE', url, data);
export let putJSON = (url, data) => sendJSONRequest('PUT', url, data);
