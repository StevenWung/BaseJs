(function (_w, _d) {
    'use strict';
    _w._ = function (d) {
        if ((new RegExp(/#/g)).test(d)) {
            //id
            return _d.getElementById(d.replace('#')) || null;
        } else if ((new RegExp(/@/g)).test(d)) {
            //tag
            return _d.getElementsByTagName(d.replace('@')) || null;
        } else if ((new RegExp(/$/g)).test(d)) {
            //class
            return _d.getElementsByTagName(d.replace('$')) || null;
        } else {
            return _d.getElementsByTagName(d) || null;
        }
    };
    _w._log = function (d) {
        console.log(d);
    };
    var Voi = Voi || {};
    Voi = function () {

    };
    Voi.Http = (function () {
        function Http(options) {
        }

        Http.prototype = {
            request: function (method, url, data, callback, failure) {
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (this.readyState === 4 && this.status === 200) {
                        var resp = this.responseText;
                        if (callback !== undefined) {
                            if (typeof resp === 'object') {
                                callback(resp);
                            } else {
                                callback(JSON.parse(resp));
                            }
                        }

                    } else {
                        if (failure !== undefined)
                            failure(this.responseText);
                    }
                };
                var httpMethod = method.toLowerCase() === 'POST' ? 'POST' : 'GET';
                xhttp.open(httpMethod, url, true);
                xhttp.send();
            }
        };
        return Http;
    })();

    Voi.Ajax = (function () {
        function Ajax(options) {
            this.http = new Voi.Http();
            this.options = options || {};
            if (!options['url'])
                throw("Url must be set!");

        }

        Ajax.prototype = {
            get: function (param) {
                this.http.request('GET', this.options['url'], null, this.options['callback'] || function () {
                    });
            },
            post: function (url, data) {
                this.http.request('POST', this.options['url'], data, this.options['callback'] || function () {
                    });
            }
        };
        return Ajax;
    })();
    Voi.AjaxRender = (function () {
        function AjaxRender(options) {
            this.parser = new DOMParser();
            this.ajax = new Voi.Ajax(options);
            this.options = options;
        }

        AjaxRender.prototype = {
            render: function () {
                var $this = this;
                var respSchema = this.options['schema'] || 'result';
                this.ajax.options.callback = function (resp) {
                    var r = resp;
                    respSchema.split('.').forEach(function (t) {
                        r = r[t];
                    });
                    if (!r || !Array.isArray(r)) {
                        //
                    }
                    var dom = $this.options.element.children[0], doms = [], layer = 1;
                    var html = dom.outerHTML, output = '';
                    var reg = new RegExp('{{([a-z|A-Z|0-9|-|_]+)}}', 'ig');
                    var res = html.match(reg);
                    r.forEach(function (rr) {
                        var fn = _w[$this.options['beforeeach']];
                        if(typeof fn === 'function') {
                            rr = fn(r, rr);
                        }

                        var tmp = html, ele, child;
                        tmp = tmp.replace(/{{layer}}/g, layer);
                        res.forEach(function (rss) {
                            var v = rr[rss.replace(/{|}/g, '')];
                            if(v)
                                tmp = tmp.replace(rss, v);
                        });
                        ele = $this.parser.parseFromString(tmp, "text/html");
                        child = ele.documentElement.querySelector('body').firstChild;
                        child.setAttribute('layer', layer++)
                        doms.push(child);
                    });
                    doms.forEach(function (t) {
                        dom.parentNode.appendChild(t);
                    });
                    dom.style.display = 'none';
                };
                this.ajax.get()
            }
        };
        return AjaxRender;
    })();


    Voi.Iterator = (function (_d) {
        function Iterator(voi, ele) {
            this.voi = voi;
            this.ele = ele;
        }
        Iterator.prototype.init = function () {
            var datasource = this.ele.getAttribute('datasource');
            var datamethod = this.ele.getAttribute('method');
            var schema = this.ele.getAttribute('schema');
            var beforeeach = this.ele.getAttribute('beforeeach');
            var jr = new Voi.AjaxRender({
                element: this.ele,
                url: datasource,
                method: datamethod,
                schema: schema,
                beforeeach: beforeeach
            });
            jr.render();
        };
        return Iterator;
    })(_d);

    Voi.prototype = {
        render: function (__) {
            if (!__.isvoi)return;
            var iterators = __.body.getElementsByTagName('iterator');
            _log(iterators);
            Array.from(iterators).forEach(function (t) {
                (new Voi.Iterator(__, t)).init();
            });
        },
        init: function () {
            var __ = this;
            __.body = _('body')[0];
            __.isvoi = __.body.hasAttribute('voi');
            __.render(__);
        },

    };
    var v = new Voi();
    v.init();
    _log(v);
})(window, document);