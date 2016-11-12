/* gi.js 1.0.0, Knockout Helper Libraries  */
(function (exports,ko,jquery) {
'use strict';

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
function _createDOMFromString(input) {
    var node = document.createElement('div');
    node.innerHTML = input;
    return node.firstChild;
}
/// alert modal template
function _createAlertModal() {
    var template = _createDOMFromString(`<div class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h4 class="modal-title"></h4>
                    </div>
                    <div class="modal-body"></div>
                    <div class="modal-footer" data-bind="with: $button">
                        <button type="button" class="btn" data-bind="click: $root.ok, html: html, css: className">Ok</button>
                    </div>
                </div><!-- /modal-content -->
            </div><!-- /modal-dialog -->
        </div><!-- /modal -->
    `);
    return template;
}
/**
 * Ambil nilai title, body
 */
function extractFromTemplate(templateId) {
    var templateName = '#' + templateId;
    var template = document.querySelector(templateId);
    if (template === null || template.hasAttribute('content') === false) {
        throw `cannot extract template from ${templateName}`;
    }
    var clone = document.importNode(template['content'], true);
    /// ambil tag <modal-title> untuk judul
    let titleTag = clone.querySelector("modal-title");
    var title = "";
    if (titleTag !== null) {
        title = titleTag.innerHTML;
    }
    /// ambil tag <modal-body> untuk content
    let bodyTag = clone.querySelector("modal-body");
    if (bodyTag === null) {
        throw `template ${templateName} don't have <modal-body> element`;
    }
    var body = bodyTag.innerHTML;
    /// ambil className
    var className = template.className;
    return { className, title, body };
}
/**
 * Inject data binding default untuk alert/modal
 */
function applyBindings$1($root, model, resolve, $button) {
    var bsModal = $root.querySelector('.modal');
    model['ok'] = function (d) {
        resolve(d.value);
        /// NOTE: rollup.js is stupid...
        let m = eval("$(bsModal)");
        m.modal('hide');
    };
    model['$button'] = $button;
    ko.applyBindings(model, $root);
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
        document.body.appendChild(dom);
    }
    else if (dom.hasChildNodes()) {
        console.log("sudah terisi id ", id, dom.getElementsByTagName('div').length);
        return _getModalRoot(counter + 1);
    }
    return dom;
}
function alert(config, model, counter) {
    let promise = new Promise(function (resolve, reject) {
        try{
            /// persiapkan DOM untuk modal dialog
            let $root = _getModalRoot(counter);
            /// set modal minimal objek kosong
            model = model || {};
            let { className, title, body } = extractFromTemplate(config);
            let element = _createAlertModal();
            element.querySelector(".modal-title").innerHTML = title;
            element.querySelector('.modal-body').innerHTML = body;
            element.querySelector('.modal-dialog').className = className;
            /// persiapkan button
            let $button = { className: "btn-primary", value: true, html: "Ok" };
            $root.appendChild(element);
            applyBindings$1($root, model, resolve, $button);
            /// jalankan afterRender
            if (model.afterRender) {
                model.afterRender($root);
            }
            var bsModal = $root.querySelector('.modal');
            /// NOTE: rollup.js is stupid...
            var m = eval("$(bsModal)");
            m.modal('show');
            /// hapus modal saat dihidden
            m.on("hidden.bs.modal", function () {
                ko.cleanNode($root[0]);
                ko.removeNode($root[0]);
                m.remove();
            });
        }catch(e){
            reject(e);
        }
    });
    return promise;
}
/// fungsi untuk menampilkan modal bootstrap
/// ke layar secara dinamis mengembalikan objek Promise
function modal(config, model, counter) {
    return new Promise(function (resolve, reject) {
        resolve(true);
    });
    // var promise = new Promise(function (resolve, reject) {
    //     /// persiapkan DOM untuk modal dialog
    //     var $root = _getModalRoot(counter);
    //     var element = _createBsModal();
    //     /// set modal minimal objek kosong
    //     model = model || {};
    //     /// reset binding yang ada di DOM sebelum menghapus data
    //     //        ko.cleanNode($root[0]);
    //     /// insert template
    //     /// sekarang berasumsi config === string
    //     var template = document.querySelector('#' + config);
    //     var clone = document.importNode(template['content'], true);
    //     /// ambil tag <modal-title> untuk judul
    //     var title = $(clone).find('modal-title').html();
    //     /// persiapkan button
    //     var $buttons = [];
    //     var okElements = $(clone).find('modal-ok');
    //     okElements.each(function (i, okElement) {
    //         var btnConfig = { className: "btn-primary" };
    //         /// ambil kelas bila diperlukan
    //         if (okElement.hasAttribute('class')) {
    //             var okClass = okElement.attributes['class'].value;
    //             btnConfig.className = okClass;
    //         }
    //         /// ambil tag <modal-ok> untuk tulisan button OK
    //         var okLabel = okElement.innerHTML;
    //         btnConfig['html'] = okLabel;
    //         /// value
    //         var value = true;
    //         if (okElement.hasAttribute('value')) {
    //             value = okElement.attributes['value'].value;
    //         }
    //         btnConfig['value'] = value;
    //         $buttons.push(btnConfig);
    //     });
    //     /// tambahkan button default bila tidak ada
    //     if ($buttons.length === 0) {
    //         $buttons.push({ className: "btn-primary", value: true, html: "Ok" });
    //     }
    //     /// ambil tag <modal-body> untuk content
    //     var body = $(clone).find('modal-body').html();
    //     element.find('.modal-title').html(title);
    //     element.find('.modal-body').html(body);
    //     /// set class untuk modal-dialog bila ada
    //     element.find('.modal-dialog').addClass(template.className);
    //     $root.html(element);
    //     var bsModal = $root.find('.modal');
    //     model.ok = function (d) {
    //         resolve(d.value);
    //         bsModal.modal('hide');
    //     };
    //     model.$buttons = $buttons;
    //     ko.applyBindings(model, $root[0]);
    //     /// jalankan afterRender
    //     if (model.afterRender) {
    //         model.afterRender($root);
    //     }
    //     bsModal.modal('show');
    //     /// hapus modal saat dihidden
    //     bsModal.on("hidden.bs.modal", function () {
    //         ko.cleanNode($root[0]);
    //         ko.removeNode($root[0]);
    //         bsModal.remove();
    //     });
    // });
    // return promise;
}

/// Default function to run when request fail.
/// Override this function to change behavior
/// default action is show error dialog
function onRequestFail(response) {
    console.log("Error:", response);
}
/// helper function to send http request.
/// automaticly register function app.onRequestFail to run
/// when request return other than response code 200.
function sendJSONRequest(type, url, data) {
    return jquery.ajax({
        url: url,
        type: type,
        data: data !== undefined ? JSON.stringify(data) : null,
        contentType: "application/json"
    }).fail(onRequestFail);
}
/// various helper function for sendJSONRequest
const getJSON = (url, data) => sendJSONRequest('GET', url, data);
const postJSON = (url, data) => sendJSONRequest('POST', url, data);
const deleteJSON = (url, data) => sendJSONRequest('DELETE', url, data);
const putJSON = (url, data) => sendJSONRequest('PUT', url, data);

function setup(data) {
    urlConfig.baseUrl = data.baseUrl;
}

exports.setup = setup;
exports.replace = replace;
exports.url = url;
exports.alert = alert;
exports.modal = modal;
exports.onRequestFail = onRequestFail;
exports.sendJSONRequest = sendJSONRequest;
exports.getJSON = getJSON;
exports.postJSON = postJSON;
exports.deleteJSON = deleteJSON;
exports.putJSON = putJSON;

}((this.gi = this.gi || {}),ko,$));
//# sourceMappingURL=gi.js.map
