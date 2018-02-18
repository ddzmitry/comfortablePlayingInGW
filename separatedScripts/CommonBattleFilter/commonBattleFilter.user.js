// ==UserScript==
// @name            CommonBattleFilter
// @namespace       https://github.com/MyRequiem/comfortablePlayingInGW
// @description     Фильтр общих боев по уровню бойцов
// @id              comfortablePlayingInGW@MyRequiem
// @updateURL       https://raw.githubusercontent.com/MyRequiem/comfortablePlayingInGW/master/separatedScripts/CommonBattleFilter/commonBattleFilter.meta.js
// @downloadURL     https://raw.githubusercontent.com/MyRequiem/comfortablePlayingInGW/master/separatedScripts/CommonBattleFilter/commonBattleFilter.user.js
// @include         http://www.ganjawars.ru/wargroup.php?war=armed*
// @grant           none
// @license         MIT
// @version         1.00-180218
// @author          MyRequiem [http://www.ganjawars.ru/info.php?id=2095458]
// ==/UserScript==

/*global unsafeWindow */
/*jslint browser: true, maxlen: 80, vars: true, plusplus: true, nomen: true */

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
         * @property loc
         * @type {String}
         */
        this.loc = this.root.location.href;
        /**
         * @property st
         * @type {Object}
         */
        this.st = this.root.localStorage;
        /**
         * @property STORAGENAME
         * @type {String}
         */
        this.STORAGENAME = 'commonBattleFilter';
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
         * @method getData
         * @return  {Array}
         */
        getData: function () {
            var stData = this.st.getItem(this.STORAGENAME);

            if (!stData) {
                var data = [0, 0, 1, 1];
                this.setData(data);
                return data;
            }

            return stData.split('|');
        },

        /**
         * @method setData
         * @param   {Array} data
         */
        setData: function (data) {
            this.st.setItem(this.STORAGENAME, data.join('|'));
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
     * @class CommonBattleFilter
     * @constructor
     */
    var CommonBattleFilter = function () {
        /**
         * @property battleTable
         * @type {Object|null}
         */
        this.battleTable = null;

        /**
         * @method getLvl
         * @param   {Object}    row
         * @param   {String}    color
         * @return  {int}
         */
        this.getLvl = function (row, color) {
            return +row.querySelector('font[color="' + color + '"]').innerHTML.
                split('-')[1];
        };

        /**
         * @method sortBattleTable
         */
        this.sortBattleTable = function () {
            var stData = general.getData(),
                row,
                i;

            for (i = 1; i < this.battleTable.rows.length; i++) {
                row = this.battleTable.rows[i];
                row.style.display = '';

                stData[0] = +stData[0];
                if (stData[0] && this.getLvl(row, 'red') > stData[0]) {
                    row.style.display = 'none';
                }

                stData[1] = +stData[1];
                if (stData[1] && this.getLvl(row, 'blue') > stData[1]) {
                    row.style.display = 'none';
                }

                if (stData[2] && !/<s>именные<\/s>/.test(row.innerHTML)) {
                    row.style.display = 'none';
                }

                if (stData[3] && !/по мощности/.test(row.innerHTML)) {
                    row.style.display = 'none';
                }
            }
        };

        /**
         * @method getSelect
         * @param   {String}    id
         * @return  {String}
         */
        this.getSelect = function (id) {
            return '<select id="' + id + '" style="margin-right: 3px;">' +
                '<option value="0">Любой&nbsp;</option>' +
                '<option value="5">5</option>' +
                '<option value="6">6</option>' +
                '<option value="7">7</option>' +
                '<option value="8">8</option>' +
                '<option value="9">9</option>' +
                '<option value="10">10</option>' +
                '<option value="11">11</option>' +
                '<option value="12">12</option>' +
                '<option value="13">13</option>' +
                '<option value="14">14</option>' +
                '<option value="15">15</option>' +
                '<option value="16">16</option>' +
                '<option value="17">17</option>' +
                '<option value="18">18</option>' +
                '<option value="19">19</option>' +
                '<option value="20">20</option>' +
                '<option value="21">21</option>' +
                '<option value="22">22</option>' +
                '<option value="23">23</option>' +
                '<option value="24">24</option>' +
                '<option value="25">25</option>' +
                '<option value="26">26</option>' +
                '<option value="27">27</option>' +
                '<option value="28">28</option>' +
                '<option value="29">29</option>' +
                '<option value="30">30</option>' +
                '<option value="31">31</option>' +
                '<option value="32">32</option>' +
                '<option value="33">33</option>' +
                '<option value="34">34</option>' +
                '<option value="35">35</option>' +
                '<option value="36">36</option>' +
                '<option value="37">37</option>' +
                '<option value="38">38</option>' +
                '<option value="39">39</option>' +
                '<option value="40">40</option>' +
                '<option value="41">41</option>' +
                '<option value="42">42</option>' +
                '<option value="43">43</option>' +
                '<option value="44">44</option>' +
                '<option value="45">45</option>' +
                '<option value="46">46</option>' +
                '<option value="47">47</option>' +
                '<option value="48">48</option>' +
                '<option value="49">49</option>' +
                '<option value="50">50</option>' +
                '</select>';
        };

        /**
         * @method init
         */
        this.init = function () {
            // форма создания заявки
            if (/&form=\d+/.test(general.loc)) {
                return;
            }

            // основная таблица общих заявок
            this.battleTable = general.doc.querySelector('table[border="0"]' +
                '[cellpadding="5"][cellspacing="1"][style="padding-left:10px;' +
                'padding-right:10px;"]');

            // нет общих заявок или таблица вообще не найдена
            if (!this.battleTable || this.battleTable.rows.length === 1) {
                return;
            }

            // заявка на бой отклонена
            if (/Заявка на бой отклонена/i.test(general.doc.body.innerHTML)) {
                general.root.location.href = '/wargroup.php?war=armed';
            }

            // уже в заявке
            if (/Вы заявлены на бой/i.test(general.doc.body.innerHTML)) {
                return;
            }

            // интерфейс
            var span = general.doc.createElement('span');
            span.setAttribute('style', 'margin-left: 10px;');
            span.innerHTML = 'Максимальные уровни: ' +
                this.getSelect('blevel1') +
                this.getSelect('blevel2') +
                'без именных:<input type="checkbox" id="personalchk" /> ' +
                'по мощности:<input type="checkbox" id="powerchk" />';
            general.$('updatetimer2').parentNode.parentNode.appendChild(span);

            /* localStorage:
             * 0,1  - уровни
             * 2    - без именных
             * 3    - по  мощности
             */
            var stData = general.getData(),
                _this = this;

            // уровни
            var blevel1 = general.$('blevel1');
            blevel1.value = stData[0];
            blevel1.addEventListener('change', function () {
                var data = general.getData();
                data[0] = blevel1.value;
                general.setData(data);
                _this.sortBattleTable();
            }, false);

            var blevel2 = general.$('blevel2');
            blevel2.value = stData[1];
            blevel2.addEventListener('change', function () {
                var data = general.getData();
                data[1] = blevel2.value;
                general.setData(data);
                _this.sortBattleTable();
            }, false);

            // чекбоксы
            var personal = general.$('personalchk');
            personal.checked = !!stData[2];
            personal.addEventListener('click', function () {
                personal.checked = !!personal.checked;
                var data = general.getData();
                data[2] = personal.checked ? 1 : '';
                general.setData(data);
                _this.sortBattleTable();
            }, false);

            var power = general.$('powerchk');
            power.checked = !!stData[3];
            power.addEventListener('click', function () {
                power.checked = !!power.checked;
                var data = general.getData();
                data[3] = power.checked ? 1 : '';
                general.setData(data);
                _this.sortBattleTable();
            }, false);

            this.sortBattleTable();
        };
    };

    new CommonBattleFilter().init();

}());
