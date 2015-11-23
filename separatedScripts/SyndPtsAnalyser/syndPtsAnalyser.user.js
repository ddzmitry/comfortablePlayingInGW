// ==UserScript==
// @name            SyndPtsAnalyser
// @namespace       https://github.com/MyRequiem/comfortablePlayingInGW
// @description     Анализ расхода PTS синдиката. Сортировка данных по купленным гранатам, чипам, выданным званиям и знакам, общему количеству PTS.
// @id              comfortablePlayingInGW@MyRequiem
// @updateURL       https://raw.githubusercontent.com/MyRequiem/comfortablePlayingInGW/master/separatedScripts/SyndPtsAnalyser/syndPtsAnalyser.meta.js
// @downloadURL     https://raw.githubusercontent.com/MyRequiem/comfortablePlayingInGW/master/separatedScripts/SyndPtsAnalyser/syndPtsAnalyser.user.js
// @include         http://www.ganjawars.ru/syndicate.php?id=*
// @grant           none
// @license         MIT
// @version         2.02-151015
// @author          MyRequiem [http://www.ganjawars.ru/info.php?id=2095458]
// ==/UserScript==

/*global unsafeWindow: true */

/*jslint
    browser: true, passfail: true, vars: true, nomen: true, regexp: true
    devel: true, plusplus: true, continue: true
*/

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
         * @property imgPath
         * @type {String}
         */
        this.imgPath = 'http://gwscripts.ucoz.net/comfortablePlayingInGW/imgs/';
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
     * @class SetPoints
     * @constructor
     */
    var SetPoints = function () {
        /**
         * @method init
         * @param   {String|int}    num
         * @param   {String}        separator
         * @param   {Boolean}       flagSign
         * @return  {String}
         */
        this.init = function (num, separator, flagSign) {
            var x = +num,
                sign = (x > 0 && flagSign) ? '+' : '',
                i;

            if (isNaN(x)) {
                return 'NaN';
            }

            x = x.toString().split('').reverse();
            for (i = 2; i < x.length; i += 3) {
                if (x[i] === '-' || !x[i + 1] || x[i + 1] === '-') {
                    break;
                }

                x[i] = separator + x[i];
            }

            return sign + x.reverse().join('');
        };
    };

    /**
     * @class GetTimestamp
     * @constructor
     */
    var GetTimestamp = function () {
        /**
         * @method init
         * @param   {String}    val
         * @return  {int}
         */
        this.init = function (val) {
            var date = /(\d\d)\.(\d\d)\.(\d\d)/.exec(val);

            if (!date) {
                return 0;
            }

            var d = +date[1],
                m = +date[2],
                y = +date[3];

            if (!d || d > 31 || !m || m > 12 || !y || y < 9 || y > 20) {
                return 0;
            }

            return new Date(2000 + y, m - 1, d).getTime();
        };
    };

    /**
     * @class GetStrDateNow
     * @constructor
     */
    var GetStrDateNow = function () {
        /**
         * @method init
         * @return  {String}
         */
        this.init = function () {
            var date = new Date(),
                month = date.getMonth() + 1,
                day = date.getDate();

            return (day < 10 ? '0' + day : day) +  '.' +
                        (month < 10 ? '0' + month : month) + '.' +
                            (/20(\d+)/.exec(date.getFullYear().toString())[1]);
        };
    };

    /**
     * @class SyndPtsAnalyser
     * @constructor
     */
    var SyndPtsAnalyser = function () {
        /**
         * @property syndId
         * @type {String}
         */
        this.syndId = /\?id=(\d+)/.exec(general.loc)[1];
        /**
         * @property tm
         * @type {int}
         */
        this.tm = 700;
        /**
         * @property mainTable
         * @type {Element}
         */
        this.mainTable = general.doc.querySelector('center+br+table');
        /**
         * @property lastDate
         * @type {String}
         */
        this.lastDate = '';
        /**
         * @property pers
         * @type {Array|null}
         */
        this.pers = null;
        /**
         * @property from
         * @type {int}
         */
        this.from = 0;
        /**
         * @property to
         * @type {int}
         */
        this.to = 0;
        /**
         * @property summ
         * @type {Array|null}
         */
        this.summ = null;
        /**
         * @property all
         * @type {int}
         */
        this.all = 0;
        /**
         * @property control
         * @type {int}
         */
        this.control = 0;
        /**
         * @property imgPath
         * @type {String}
         */
        this.imgPath = general.imgPath + 'SyndPtsAnalyser/';

        /**
         * @method getLastDate
         * @param   {String}    url
         */
        this.getLastDate = function (url) {
            var _url = url || 'http://www.ganjawars.ru/syndicate.log.php?id=' +
                    this.syndId + '&ptslog=1&page_id=100500',
                _this = this;

            new AjaxQuery().init(_url, function (xml) {
                var spanContent = general.doc.createElement('span');
                spanContent.innerHTML = xml.responseText;

                var counter = general.$('analizePTSCounter');
                if (!url) {
                    general.root.setTimeout(function () {
                        counter.innerHTML = '2/1';
                        _this.getLastDate(spanContent.
                            querySelector('br+center>b>a:last-child').href);
                    }, _this.tm);
                } else {
                    counter.innerHTML = '2/2';
                    var fonts = spanContent.
                            querySelectorAll('nobr>font[color="green"]');
                    _this.lastDate = /\d+.\d+.\d+/.
                            exec(fonts[fonts.length - 1].innerHTML)[0];

                    var inpFrom = general.$('inpDateFrom');
                    inpFrom.value = _this.lastDate;
                    inpFrom.disabled = false;
                    general.$('inpDateTo').disabled = false;
                    general.$('goPTS').disabled = false;
                    general.$('ptsPreloader').style.display = 'none';
                }
            }, function () {
                var preloader = general.$('ptsPreloader');
                preloader.style.display = 'none';
                preloader.parentNode.innerHTML += '<br><span style="color: ' +
                    '#FF0000;">Ошибка ответа сервера...</span>';
            });
        };

        /**
         * @method enterPress
         * @param   {Object}    e
         */
        this.enterPress = function (e) {
            var ev = e || general.root.event;
            if (ev.keyCode === 13) {
                general.$('goPTS').click();
            }
        };

        /**
         * @method showRezult
         * @param   {String}    id
         */
        this.showRezult = function (id) {
            this.mainTable.removeAttribute('class');
            this.mainTable.setAttribute('style', 'border-collapse: ' +
                    'collapse; background: #D0EED0;');

            var str = '<tr style="font-weight: bold;"><td class="wb1">' +
                    'Персонаж</td><td class="wb1"><img id="gren" ' +
                    'style="cursor: pointer; margin: 2px;" src="' +
                    this.imgPath + 'gren.png" title="Покупка гранат" ' +
                    'alt="Гранаты"></td><td class="wb1"><img id="chip" ' +
                    'style="cursor: pointer; margin: 2px;" src="' +
                    this.imgPath + 'chip.png" title="Покупка чипов" ' +
                    'alt="Чипы"></td><td class="wb1"><img id="rank" ' +
                    'style="cursor: pointer; margin: 2px;" src="' +
                    this.imgPath + 'rank.png" title="Выдача званий" ' +
                    'alt="Звания"></td><td class="wb1"><img id="sign" ' +
                    'style="cursor: pointer; margin: 2px;" ' +
                    'src="http://images.ganjawars.ru/img/synds/' + this.syndId +
                    '.gif" title="Выдача знаков" alt="Знаки"></td>' +
                    '<td class="wb1"><span id="all" style="color: #008000; ' +
                    'cursor: pointer;">Всего</span></td></tr>',
                setPoints = new SetPoints().init;

            var i;
            for (i = 0; i < this.pers.length; i++) {
                str += '<tr><td class="wb2"><a target="_blank" ' +
                    'href="http://www.ganjawars.ru/search.php?key=' +
                    this.pers[i].name + '" style="text-decoration: none; ' +
                    'font-weight: bold; color: #004400;">' +
                    this.pers[i].name + '</td><td class="wb1">' +
                    setPoints(this.pers[i].gren, '\'', false) +
                    '</td><td class="wb1">' +
                    setPoints(this.pers[i].chip, '\'', false) + '</td>' +
                    '<td class="wb1">' +
                    setPoints(this.pers[i].rank, '\'', false) + '</td>' +
                    '<td class="wb1">' +
                    setPoints(this.pers[i].sign, '\'', false) + '</td>' +
                    '<td class="wb1" style="color: #008000;">' +
                    setPoints(this.pers[i].all, '\'', false) + '</td></tr>';
            }

            str += '<tr style="font-weight: bold;"><td class="wb1" ' +
                'style="color: #0000FF;">Всего</td><td class="wb1" ' +
                'style="color: #0000FF;">' +
                setPoints(this.summ[0], '\'', false) + '</td>' +
                '<td class="wb1" style="color: #0000FF;">' +
                setPoints(this.summ[1], '\'', false) +
                '</td><td class="wb1" style="color: #0000FF;">' +
                setPoints(this.summ[2], '\'', false) +
                '</td><td class="wb1" style="color: #0000FF;">' +
                setPoints(this.summ[3], '\'', false) +
                '</td><td class="wb1" style="color: #FF0000;">' +
                setPoints(this.all, '\'', false) +
                '</td></tr><tr><td class="wb1" colspan="6"><b>Начислено за ' +
                'контроль</b>: <span style="color: #FF0000;">' +
                new SetPoints().init(this.control, '\'', false) +
                '</span> <b>PTS</b></td></tr>';
            this.mainTable.innerHTML = str;

            var titleSort = general.$(id);
            titleSort.parentNode.style.background = '#A0EEA0';

            general.$('gren').
                addEventListener('click', this.titleClick('gren'), false);
            general.$('chip').
                addEventListener('click', this.titleClick('chip'), false);
            general.$('rank').
                addEventListener('click', this.titleClick('rank'), false);
            general.$('sign').
                addEventListener('click', this.titleClick('sign'), false);
            general.$('all').
                addEventListener('click', this.titleClick('all'), false);
        };

        /**
         * @method titleClick
         * @param   {String}    id
         */
        this.titleClick = function (id) {
            var _this = this;
            return function () {
                _this.sortPers(id);
            };
        };

        /**
         * @method sortPers
         * @param   {String}    prop
         */
        this.sortPers = function (prop) {
            this.pers.sort(function (a, b) {
                var ret;

                if (a[prop] < b[prop]) {
                    ret = 1;
                } else if (a[prop] > b[prop]) {
                    ret = -1;
                } else {
                    ret = 0;
                }

                return ret;
            });

            this.showRezult(prop);
        };

        /**
         * @method addData
         * @param   {Object}    pers
         * @param   {String}    prop
         * @param   {int}       val
         */
        this.addData = function (pers, prop, val) {
            pers[prop] += val;
            pers.all += val;

            var ind;
            switch (prop) {
            case 'gren':
                ind = 0;
                break;
            case 'chip':
                ind = 1;
                break;
            case 'rank':
                ind = 2;
                break;
            case 'sign':
                ind = 3;
                break;
            default:
                break;
            }

            this.summ[ind] += val;
            this.all += val;
        };

        /**
         * @method parsePTSProtocols
         * @param   {int}   ind
         */
        this.parsePTSProtocols = function (ind) {
            general.$('analizePTSCounter').innerHTML = ind;
            var url = 'http://www.ganjawars.ru/syndicate.log.php?id=' +
                    this.syndId + '&ptslog=1&page_id=' + ind,
                _this = this;

            new AjaxQuery().init(url, function (xml) {
                var spanContent = general.doc.createElement('span');
                spanContent.innerHTML = xml.responseText;

                var lines = spanContent.
                        querySelectorAll('nobr>font[color="green"]');

                if (!lines.length) {
                    _this.sortPers('all');
                    return;
                }

                var getTimestamp = new GetTimestamp().init,
                    pers,
                    time,
                    rez,
                    str,
                    i;

                for (i = 0; i < lines.length; i++) {
                    time = getTimestamp(lines[i].innerHTML);
                    if (time > _this.to) {
                        continue;
                    }

                    if (time < _this.from) {
                        _this.sortPers('all');
                        return;
                    }

                    str = lines[i].parentNode.nextElementSibling.innerHTML;

                    rez = /(.*) купил.* за (\d+) PTS/.exec(str);
                    if (rez) {
                        pers = _this.getPers(rez[1]);
                        _this.addData(pers, /чип/i.test(str) ? 'chip' : 'gren',
                            +rez[2]);
                        continue;
                    }

                    rez = /выдал значок персонажу (.*) \((\d+) PTS/.exec(str);
                    if (rez) {
                        pers = _this.getPers(rez[1]);
                        _this.addData(pers, 'sign', +rez[2]);
                        continue;
                    }

                    rez = /Продлено звание для (.*) за (\d+) PTS/.exec(str);
                    if (rez) {
                        pers = _this.getPers(rez[1]);
                        _this.addData(pers, 'rank', +rez[2]);
                        continue;
                    }

                    rez = /выдал звание .* персонажу (.*) \((\d+) PT/.exec(str);
                    if (rez) {
                        pers = _this.getPers(rez[1]);
                        _this.addData(pers, 'rank', +rez[2]);
                        continue;
                    }

                    rez = /Начислено \$.* и (\d+) PTS за контроль/.exec(str);
                    if (rez) {
                        _this.control += +rez[1];
                    }
                }

                general.root.setTimeout(function () {
                    ind++;
                    _this.parsePTSProtocols(ind);
                }, _this.tm);
            }, function () {
                general.root.setTimeout(function () {
                    _this.parsePTSProtocols(ind);
                }, _this.tm);
            });
        };

        /**
         * @method getPers
         * @param   {String}    nik
         * @return  {Object}
         */
        this.getPers = function (nik) {
            var i;
            for (i = 0; i < this.pers.length; i++) {
                if (this.pers[i].name === nik) {
                    return this.pers[i];
                }
            }

            var pers = {name: nik, gren: 0, chip: 0, sign: 0, rank: 0, all: 0};
            this.pers.push(pers);

            return pers;
        };

        /**
         * @method init
         */
        this.init = function () {
            var target = general.doc.
                    querySelector('td[colspan="3"]>a[href*="&ptslog=1"]').
                        parentNode;

            //css-ботва
            var style = general.doc.createElement('style');
            style.innerHTML = '.wb1 {text-align:center; padding-left:3px; ' +
                'border: 1px #339933 solid;} .wb2 {padding-left:3px; ' +
                'padding-right:3px; border: 1px #339933 solid;}';
            general.doc.querySelector('head').appendChild(style);

            if (target.lastElementChild.nodeName === 'BR') {
                target.removeChild(target.lastElementChild);
            }

            var butShowPTSAnalizePanel = general.doc.createElement('a');
            butShowPTSAnalizePanel.innerHTML = 'Анализ PTS';
            butShowPTSAnalizePanel.setAttribute('style', 'cursor: pointer');
            target.appendChild(general.doc.createTextNode(' | '));
            target.appendChild(butShowPTSAnalizePanel);

            var _this = this;
            butShowPTSAnalizePanel.addEventListener('click', function () {
                if (general.$('inpDateFrom')) {
                    return;
                }

                _this.mainTable.setAttribute('class', 'wb');
                _this.mainTable.removeAttribute('style');

                var getStrDateNow = new GetStrDateNow().init;
                _this.mainTable.innerHTML = '<tr><td>' +
                    'Введите даты в формате дд.мм.гг<br>' +
                    'с: <input id="inpDateFrom" type="text" maxlength="8" ' +
                    'value="" style="width: 70px;" disabled> до: ' +
                    '<input id="inpDateTo" type="text" maxlength="8" value="' +
                    getStrDateNow()  + '" style="width: 70px;" disabled> ' +
                    '<input type="button" id="goPTS" value=">>" disabled>' +
                    '<span id="ptsPreloader" style="margin-left: 10px;">' +
                    '<img src="' + general.imgPath + 'preloader.gif" />' +
                    '<span id="analizePTSCounter" style="color: #0000FF; ' +
                    'margin-left: 10px;">2/0</span></span></td></tr>';

                _this.getLastDate('');

                general.$('inpDateFrom').
                    addEventListener('keypress', _this.enterPress, false);
                general.$('inpDateTo').
                    addEventListener('keypress', _this.enterPress, false);

                var getTimestamp = new GetTimestamp().init;
                general.$('goPTS').addEventListener('click', function () {
                    _this.from = getTimestamp(general.$('inpDateFrom').value);
                    _this.to = getTimestamp(general.$('inpDateTo').value);

                    var dateStrNow = getStrDateNow();
                    if (!_this.from || !_this.to ||
                            _this.from < getTimestamp(_this.lastDate) ||
                                _this.to > getTimestamp(dateStrNow) ||
                                    _this.from > _this.to) {
                        alert('Не верно введена дата !!!\n' +
                            'Первая запись в протоколе: ' + _this.lastDate +
                            '\nСегодня: ' + dateStrNow);
                        return;
                    }

                    general.$('ptsPreloader').style.display = '';
                    general.$('inpDateFrom').disabled = true;
                    general.$('inpDateTo').disabled = true;
                    general.$('goPTS').disabled = true;

                    _this.pers = [];
                    // гранаты, чипы, звания, знаки
                    _this.summ = [0, 0, 0, 0, 0];
                    _this.all = 0;
                    _this.control = 0;
                    _this.parsePTSProtocols(0);
                }, false);
            }, false);
        };
    };

    new SyndPtsAnalyser().init();

}());
