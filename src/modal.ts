import * as ko from 'knockout';
import * as $ from "jquery";
import { replace } from './string';

var MODAL_ROOT_NAME = "bs-modal-root-{id}";


function _createDOMFromString(input: string) : Node {
    var node = document.createElement('div');
    node.innerHTML = input;

    return node.firstChild;
}

/// common modal template
function _createBsModal() : Node {
    var template = _createDOMFromString(`<div class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title"></h4>
                    </div>
                    <div class="modal-body"></div>
                    <div class="modal-footer">
                        <!-- ko foreach: $buttons -->
                            <button type="button" class="btn" data-bind="click: $parent.ok, html: $data.html, css: $data.className">Ok</button>
                        <!-- /ko -->
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Batal</button>
                    </div>
                </div><!-- /modal-content -->
            </div><!-- /modal-dialog -->
        </div><!-- /modal -->
    `);
    return template;
}




/// alert modal template
function _createAlertModal() : Element {
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
    return template as Element;
}

type ExtractedDataFromTemplate = {className: string, title: string, body: string};
/**
 * Ambil nilai title, body
 */
function extractFromTemplate(templateId: string) : ExtractedDataFromTemplate {
    var templateName = '#' + templateId;
    var template = document.querySelector(templateId);

    if(template === null || template.hasAttribute('content') === false){
        throw `cannot extract template from ${templateName}`;
    }

    var clone = document.importNode(template['content'], true) as Element;


    /// ambil tag <modal-title> untuk judul
    let titleTag = clone.querySelector("modal-title");
    var title = "";
    if(titleTag !== null){
        title = titleTag.innerHTML;
    }

    /// ambil tag <modal-body> untuk content
    let bodyTag = clone.querySelector("modal-body");
    if(bodyTag === null){
        throw `template ${templateName} don't have <modal-body> element`;
    }
    var body = bodyTag.innerHTML;

    /// ambil className
    var className = template.className;

    return {className, title, body};
}

/**
 * Inject data binding default untuk alert/modal
 */
function applyBindings($root: Element, model: Object, resolve: Function, $button: [Object]|Object){
    var bsModal = $root.querySelector('.modal');
    model['ok'] = function (d) {
        resolve(d.value);

        /// NOTE: rollup.js is stupid...
        let m = eval("$(bsModal)") as JQuery;
        m.modal('hide');
    };
    model['$button'] = $button;

    ko.applyBindings(model, $root);
}


/// ambil div root untuk menaruh elemen bootstrap modal
function _getModalRoot(counter) : Element {
    counter = counter || 0;
    var id = MODAL_ROOT_NAME.replace("{id}", counter);
    var dom = document.getElementById(id);
    /// insert <div> ke dalam <body> bila belum ada
    if (dom === null) {
        dom = document.createElement('div');
        dom.setAttribute('id', id);
        document.body.appendChild(dom);
    } else if (dom.hasChildNodes()) {
        console.log("sudah terisi id ", id, dom.getElementsByTagName('div').length);
        return _getModalRoot(counter + 1);
    }
    return dom;
}

function alert(config, model, counter?: number) : Promise<boolean | string> {
    let promise = new Promise(function (resolve, reject) {
        /// persiapkan DOM untuk modal dialog
        let $root = _getModalRoot(counter);
        /// set modal minimal objek kosong
        model = model || {};

        let {className, title, body} = extractFromTemplate(config);

        let element = _createAlertModal();

        element.querySelector(".modal-title").innerHTML = title;
        element.querySelector('.modal-body').innerHTML = body;
        element.querySelector('.modal-dialog').className = className;

        /// persiapkan button
        let $button = { className: "btn-primary", value: true, html: "Ok" };

        $root.appendChild(element);

        applyBindings($root, model, resolve, $button);

        /// jalankan afterRender
        if (model.afterRender) {
            model.afterRender($root);
        }

        var bsModal = $root.querySelector('.modal');

        /// NOTE: rollup.js is stupid...
        var m = eval("$(bsModal)") as JQuery;
        m.modal('show');

        /// hapus modal saat dihidden
        m.on("hidden.bs.modal", function () {
            ko.cleanNode($root[0]);
            ko.removeNode($root[0]);
            m.remove();
        });
    });
    return promise;
}

/// fungsi untuk menampilkan modal bootstrap
/// ke layar secara dinamis mengembalikan objek Promise
function modal(config, model, counter) : Promise<boolean | string> {
    return new Promise(function(resolve, reject){
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
};



/// export
export { alert, modal };