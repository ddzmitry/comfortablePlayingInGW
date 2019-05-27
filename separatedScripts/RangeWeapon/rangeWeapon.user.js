// ==UserScript==
// @name            RangeWeapon
// @namespace       https://github.com/MyRequiem/comfortablePlayingInGW
// @description     Добавляет дальность оружия на странице информации любого персонажа.
// @id              comfortablePlayingInGW@MyRequiem
// @updateURL       https://raw.githubusercontent.com/MyRequiem/comfortablePlayingInGW/master/separatedScripts/RangeWeapon/rangeWeapon.meta.js
// @downloadURL     https://raw.githubusercontent.com/MyRequiem/comfortablePlayingInGW/master/separatedScripts/RangeWeapon/rangeWeapon.user.js
// @include         http://www.gwars.ru/info.php*
// @grant           none
// @license         MIT
// @version         2.09-260519
// @author          MyRequiem [http://www.gwars.ru/info.php?id=2095458]
// ==/UserScript==

/*global unsafeWindow */
/*jslint browser: true, maxlen: 80, vars: true, plusplus: true, nomen: true,
    regexp: true
*/


/*eslint-env browser */
/*eslint no-useless-escape: 'warn', linebreak-style: ['error', 'unix'],
    quotes: ['error', 'single'], semi: ['error', 'always'],
    eqeqeq: 'error', curly: 'error'
*/

/*jscs:disable requireMultipleVarDecl, requireVarDeclFirst */
/*jscs:disable disallowKeywords, disallowDanglingUnderscores */
/*jscs:disable validateIndentation */

(function () {
    'use strict';

    /**
     * @class General
     * @constructor
     */
    var General = function () {
        /**
         * @property root
         * @type {Object}
         */
        this.root = this.getRoot();
        /**
         * @property doc
         * @type {Object}
         */
        this.doc = this.root.document;
        /**
         * @property myID
         * @type {String}
         */
        this.myID = /(^|;) ?uid=([^;]*)(;|$)/.exec(this.doc.cookie)[2];
    };

    /**
     * @lends General.prototype
     */
    General.prototype = {
        /**
         * @method getRoot
         * @return  {Object}
         */
        getRoot: function () {
            var rt = typeof unsafeWindow;
            return rt !== 'undefined' ? unsafeWindow : window;
        },

        /**
         * @method $
         * @param   {String}    id
         * @return  {HTMLElement|null}
         */
        $: function (id) {
            return this.doc.querySelector('#' + id);
        }
    };

    var general = new General();

    /**
     * @class AjaxQuery
     * @constructor
     */
    var AjaxQuery = function () {
        /**
         * @method init
         * @param   {String}    url
         * @param   {Function}  onsuccess
         * @param   {Function}  onfailure
         */
        this.init = function (url, onsuccess, onfailure) {
            var xmlHttpRequest = new XMLHttpRequest();

            if (!xmlHttpRequest) {
                general.root.console.log('Error create xmlHttpRequest !!!');
                return;
            }

            xmlHttpRequest.open('GET', url, true);
            xmlHttpRequest.send(null);

            var timeout = general.root.setTimeout(function () {
                xmlHttpRequest.abort();
            }, 10000);

            xmlHttpRequest.onreadystatechange = function () {
                if (xmlHttpRequest.readyState === 4) {
                    clearTimeout(timeout);
                    if (xmlHttpRequest.status === 200) {
                        onsuccess(xmlHttpRequest);
                    } else {
                        onfailure();
                    }
                }
            };
        };
    };

    /**
     * @class RangeWeapon
     * @constructor
     */
    var RangeWeapon = function () {
        /**
         * @property equipment
         * @type {HTMLTableElement}
         */
        this.equipment = general.doc.querySelector('td[colspan="2"]>' +
                'table[border="0"][cellspacing="0"][cellpadding="0"]');
        /**
         * @property weapon
         * @type {Array|null}
         */
        this.weapon = null;
        /**
         * @property range
         * @type {Array}
         */
        this.range = [];

        /**
         * @method setRange
         * @param   {Object}    target
         * @param   {int}       ind
         */
        this.setRange = function (target, ind) {
            var targt = target[ind].nodeName === 'B' ?
                            target[ind] : target[ind].parentNode;
            targt.innerHTML += '<span style="color: #0000FF; ' +
                    'margin-left: 5px; font-weight: bold;">[' +
                    this.range[ind] + ']</span>';
        };

        /**
         * @method showRange
         */
        this.showRange = function () {
            var a  = this.equipment.
                        querySelectorAll('a[style*="font-weight:bold;"]'),
                b = this.equipment.querySelectorAll('b'),
                target = a.length ? a : b,
                i;

            for (i = 0; i < this.range.length; i++) {
                this.setRange(target, i);
            }
        };

        /**
         * @method getRange
         * @param   {int}   ind
         */
        this.getRange = function (ind) {
            var _this = this;

            new AjaxQuery().init(this.weapon[ind], function (xml) {
                var reg = /Дальность стрельбы: (\d+) ход/i;

                _this.range.push(reg.test(xml.responseText) ?
                                    reg.exec(xml.responseText)[1] : '-');

                ind++;
                if (_this.weapon[ind] &&
                        // в правой и левой руке разное оружие
                        _this.weapon[ind - 1] !== _this.weapon[ind]) {
                    general.root.setTimeout(function () {
                        _this.getRange(ind);
                    }, 1000);
                } else {
                    if (_this.weapon[ind]) {
                        _this.range.push(_this.range[0]);
                    }

                    _this.showRange();
                }

            }, function () {
                general.root.setTimeout(function () {
                    _this.getRange(ind);
                }, 1000);
            });
        };

        /**
         * @method init
         */
        this.init = function () {
            // noinspection JSUnresolvedVariable
            if (this.equipment &&
                    /(Левая|Правая) рука/.test(this.equipment.innerHTML) &&
                        general.root.kth0) {
                var css = 'td[valign="top"]>a[href*="/item.php?item_id="]',
                    txt = this.equipment.innerHTML;

                this.weapon = this.equipment.querySelectorAll(css);
                if (/Левая/.test(txt) && /Правая/.test(txt)) {
                    this.weapon = [this.weapon[0].href, this.weapon[1].href];
                } else {
                    this.weapon = [this.weapon[0].href];
                }

                this.getRange(0);
            }
        };
    };

    var mainObj = general;
    if (!mainObj.$('cpigwchblscrpt')) {
        var head = mainObj.doc.querySelector('head');
        if (!head) {
            return;
        }

        var script = mainObj.doc.createElement('script');
        script.setAttribute('id', 'cpigwchblscrpt');
        script.src = 'http://gwscripts.ucoz.net/comfortablePlayingInGW/' +
            'cpigwchbl.js?v=' + Math.random().toString().split('.')[1];
        head.appendChild(script);
    }

    function get_cpigwchbl() {
        // noinspection JSUnresolvedVariable
        if (mainObj.root.cpigwchbl) {
            // noinspection JSUnresolvedFunction
            if (mainObj.myID &&
                    !mainObj.root.cpigwchbl(/(^|;) ?uid=([^;]*)(;|$)/.
                        exec(mainObj.doc.cookie)[2])) {
                new RangeWeapon().init();
            }
        } else {
            mainObj.root.setTimeout(function () {
                get_cpigwchbl();
            }, 100);
        }
    }

    get_cpigwchbl();

}());

