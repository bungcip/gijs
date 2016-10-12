(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('knockout'), require('jquery')) :
    typeof define === 'function' && define.amd ? define('gi', ['exports', 'knockout', 'jquery'], factory) :
    (factory((global.gi = global.gi || {}),global.ko,global.$));
}(this, (function (exports,ko,$) { 'use strict';

/**
 * String Replacer
 * Helper function to create simple template string
 * Example:
 *
 * gi.replace("hello {name}", {
 *   name: 'jane'
 * })
 *
 */
function replace(str, dict) {
    for (var key in dict) {
        str = str.replace("{" + key + "}", ko.unwrap(dict[key]));
    }
    return str;
}

/// URL management
let urlConfig = {
    baseUrl: ""
};
function url(value, data) {
    let result = urlConfig.baseUrl + value;
    if (data === null) {
        return result;
    }
    let param = data;
    return replace(result, param);
}

var MODAL_ROOT_NAME = "bs-modal-root-{id}";
/// menampilkan dialog bootstrap dari sebuah template
function _createBsModal() {
    var bsTemplate = $('<div class="modal fade" tabindex="-1" role="dialog" aria-hidden="true"><div class="modal-dialog"><div class="modal-content">' +
        '<div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title"></h4></div>' +
        '<div class="modal-body"></div>' +
        '<div class="modal-footer">' +
        '  <!-- ko foreach: $buttons -->' +
        '    <button type="button" class="btn" data-bind="click: $parent.ok, html: $data.html, css: $data.className">Ok</button>' +
        '  <!-- /ko -->' +
        '<button type="button" class="btn btn-secondary" data-dismiss="modal">Batal</button>' +
        '</div>' +
        '</div></div></div>');
    return bsTemplate;
}
/// ambil div root untuk menaruh elemen bootstrap modal
function _getModalRoot(counter) {
    counter = counter || 0;
    var id = MODAL_ROOT_NAME.replace("{id}", counter);
    var dom = document.getElementById(id);
    /// insert <div> ke dalam <body> bila belum ada
    if (dom === null) {
        dom = document.createElement('div');
        dom.setAttribute('id', id);
        $("body").append(dom);
    }
    else if ($(dom).find('<div>').length !== 0) {
        console.log("sudah terisi id ", id, dom.getElementsByTagName('div').length);
        return _getModalRoot(counter + 1);
    }
    return $(dom);
}
/// fungsi untuk menampilkan modal bootstrap
/// ke layar secara dinamis mengembalikan objek Promise
function modal(config, model, counter) {
    var promise = new Promise(function (resolve, reject) {
        /// persiapkan DOM untuk modal dialog
        var $root = _getModalRoot(counter);
        var element = _createBsModal();
        /// set modal minimal objek kosong
        model = model || {};
        /// reset binding yang ada di DOM sebelum menghapus data
        //        ko.cleanNode($root[0]);
        /// insert template
        /// sekarang berasumsi config === string
        var template = document.querySelector('#' + config);
        var clone = document.importNode(template['content'], true);
        /// ambil tag <modal-title> untuk judul
        var title = $(clone).find('modal-title').html();
        /// persiapkan button
        var $buttons = [];
        var okElements = $(clone).find('modal-ok');
        okElements.each(function (i, okElement) {
            var btnConfig = { className: "btn-primary" };
            /// ambil kelas bila diperlukan
            if (okElement.hasAttribute('class')) {
                var okClass = okElement.attributes['class'].value;
                btnConfig.className = okClass;
            }
            /// ambil tag <modal-ok> untuk tulisan button OK
            var okLabel = okElement.innerHTML;
            btnConfig['html'] = okLabel;
            /// value
            var value = true;
            if (okElement.hasAttribute('value')) {
                value = okElement.attributes['value'].value;
            }
            btnConfig['value'] = value;
            $buttons.push(btnConfig);
        });
        /// tambahkan button default bila tidak ada
        if ($buttons.length === 0) {
            $buttons.push({ className: "btn-primary", value: true, html: "Ok" });
        }
        /// ambil tag <modal-body> untuk content
        var body = $(clone).find('modal-body').html();
        element.find('.modal-title').html(title);
        element.find('.modal-body').html(body);
        /// set class untuk modal-dialog bila ada
        element.find('.modal-dialog').addClass(template.className);
        $root.html(element);
        var bsModal = $root.find('.modal');
        model.ok = function (d) {
            resolve(d.value);
            bsModal.modal('hide');
        };
        model.$buttons = $buttons;
        ko.applyBindings(model, $root[0]);
        /// jalankan afterRender
        if (model.afterRender) {
            model.afterRender($root);
        }
        bsModal.modal('show');
        /// hapus modal saat dihidden
        bsModal.on("hidden.bs.modal", function () {
            ko.cleanNode($root[0]);
            ko.removeNode($root[0]);
            bsModal.remove();
        });
    });
    return promise;
}
;

/// Default function to run when request fail.
/// Override this function to change behavior
/// default action is show error dialog
function onRequestFail(response) {
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
function sendJSONRequest(type, url, data) {
    return $.ajax({
        url: url,
        type: type,
        data: data !== undefined ? JSON.stringify(data) : null,
        contentType: "application/json"
    }).fail(onRequestFail);
}
/// various helper function for sendJSONRequest
let getJSON = (url, data) => sendJSONRequest('GET', url, data);
let postJSON = (url, data) => sendJSONRequest('POST', url, data);
let deleteJSON = (url, data) => sendJSONRequest('DELETE', url, data);
let putJSON = (url, data) => sendJSONRequest('PUT', url, data);

function setup(data) {
    urlConfig.baseUrl = data.baseUrl;
}

exports.setup = setup;
exports.replace = replace;
exports.url = url;
exports.modal = modal;
exports.onRequestFail = onRequestFail;
exports.sendJSONRequest = sendJSONRequest;
exports.getJSON = getJSON;
exports.postJSON = postJSON;
exports.deleteJSON = deleteJSON;
exports.putJSON = putJSON;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=gi.umd.js.map
