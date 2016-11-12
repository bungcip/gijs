import {ajax} from 'jquery';

/// Default function to run when request fail.
/// Override this function to change behavior
/// default action is show error dialog
export function onRequestFail(response: any) {
    console.log("Error:", response);
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
export const getJSON = (url, data) => sendJSONRequest('GET', url, data);
export const postJSON = (url, data) => sendJSONRequest('POST', url, data);
export const deleteJSON = (url, data) => sendJSONRequest('DELETE', url, data);
export const putJSON = (url, data) => sendJSONRequest('PUT', url, data);
