import * as ko from 'knockout';
import * as $ from "jquery";
import { replace } from './string';

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
    } else if ($(dom).find('<div>').length !== 0) {
        console.log("sudah terisi id ", id, dom.getElementsByTagName('div').length);
        return _getModalRoot(counter + 1);
    }
    return $(dom);
}
/// fungsi untuk menampilkan modal bootstrap
/// ke layar secara dinamis mengembalikan objek Promise
export function modal(config, model, counter) {
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
};
